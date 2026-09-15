-- Yumidang baseline schema. Apply once to an empty public schema.
-- Auth identities are real auth.users UUIDs; local prototype IDs must not be imported.
-- Multi-record lifecycle writes are reserved for a future trusted server transaction.

create schema app_private;
revoke all on schema app_private from public, anon, authenticated;

create function app_private.touch_updated_at() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin new.updated_at = now(); return new; end;
$$;
revoke all on function app_private.touch_updated_at() from public, anon, authenticated;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default '유미당 회원' check (char_length(display_name) between 1 and 50),
  avatar_url text,
  bio text not null default '' check (char_length(bio) <= 300),
  neighborhood text not null default '',
  age_group text not null default '',
  hobbies text[] not null default '{}',
  traits text[] not null default '{}',
  sugar_content numeric(8,2) not null default 15,
  is_phone_verified boolean not null default false,
  is_kyc_verified boolean not null default false,
  is_pro_host boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
comment on table public.profiles is 'Public display fields only. Verification, sugar and deletion are server-managed.';

create table public.private_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  real_name text,
  birth_date date,
  gender text not null default 'undisclosed' check (gender in ('female','male','undisclosed')),
  join_route text check (join_route in ('referral','work_email')),
  referral_code text,
  work_email text,
  terms_accepted_at timestamptz,
  terms_version text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.private_profiles is 'Owner-only personal data. Login phone/email remain in auth.users; no passwords or OTPs are stored here.';

create table public.categories (
  id text primary key,
  name text not null unique,
  sort_order integer not null unique
);
insert into public.categories(id,name,sort_order) values
 ('flash','지금',1),('exhibition','전시',2),('festival','축제',3),('dining','식사',4),
 ('sports','운동',5),('travel','여행',6),('class','클래스',7),('walk','산책',8),
 ('study','스터디',9),('performance','공연',10),('shopping','쇼핑',11),('other','기타',12);

create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null check (btrim(title) <> ''),
  subtitle text not null default '',
  kind text not null check (kind in ('팝업','전시','축제','공연')),
  starts_on date not null,
  ends_on date not null,
  location text not null default '',
  description text not null default '',
  image_url text,
  source_type text not null check (source_type in ('sample','collected')),
  source_name text,
  source_url text,
  external_id text,
  fetched_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_on >= starts_on),
  unique (source_name,external_id)
);
create index events_dates_idx on public.events(starts_on,ends_on);

create table public.meetup_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id),
  category_id text not null references public.categories(id),
  event_id uuid references public.events(id),
  title text not null check (char_length(btrim(title)) between 1 and 150),
  description text not null default '',
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  recruitment_ends_at timestamptz not null,
  public_location text not null check (btrim(public_location) <> ''),
  region text not null default '',
  partner_gender text not null default 'any' check (partner_gender in ('any','female','male')),
  partner_preferences text not null default '',
  tags text[] not null default '{}',
  image_url text,
  companion_type text not null default 'free' check (companion_type in ('free','pro')),
  pro_details jsonb check (pro_details is null or jsonb_typeof(pro_details) = 'object'),
  status text not null default 'recruiting' check (status in ('recruiting','closed','expired','deleted')),
  closed_reason text check (closed_reason in ('manual','matched','cancelled')),
  revision integer not null default 1 check (revision > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (ends_at > starts_at),
  check (recruitment_ends_at <= starts_at),
  unique (id,author_id)
);
comment on table public.meetup_posts is 'Public post content only. Scheduling, revisions and closure require coordinated server writes. Capacity is structurally one host and one guest.';
create index posts_author_idx on public.meetup_posts(author_id,created_at desc);
create index posts_category_start_idx on public.meetup_posts(category_id,starts_at);
create index posts_event_idx on public.meetup_posts(event_id);
create index posts_recruiting_idx on public.meetup_posts(recruitment_ends_at,starts_at) where status='recruiting';

create table public.join_requests (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  host_id uuid not null,
  requester_id uuid not null references public.profiles(id),
  message text not null check (btrim(message) <> ''),
  status text not null default 'pending' check (status in ('pending','reconfirming','accepted','rejected','cancelled','matched_with_other','post_closed','post_expired','post_deleted','change_declined','match_cancelled')),
  public_condition_snapshot jsonb not null default '{}' check (jsonb_typeof(public_condition_snapshot)='object'),
  agreed_revision integer check (agreed_revision > 0),
  cancellation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (host_id <> requester_id),
  foreign key (post_id,host_id) references public.meetup_posts(id,author_id),
  unique(id,post_id,host_id,requester_id)
);
comment on column public.join_requests.public_condition_snapshot is 'Public conditions only; never copy secretLocation, real name, phone or birth date from the prototype snapshot.';
create index requests_host_idx on public.join_requests(host_id,created_at desc);
create index requests_requester_idx on public.join_requests(requester_id,created_at desc);
create index requests_post_host_idx on public.join_requests(post_id,host_id);
create unique index requests_one_active_per_user on public.join_requests(post_id,requester_id) where status in ('pending','reconfirming','accepted');
create unique index requests_one_accepted_per_post on public.join_requests(post_id) where status='accepted';

create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique,
  post_id uuid not null unique,
  host_id uuid not null references public.profiles(id),
  guest_id uuid not null references public.profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  public_location text not null,
  status text not null default 'confirmed' check (status in ('confirmed','completed','cancelled')),
  cancelled_by uuid references public.profiles(id),
  cancellation_reason text,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (host_id <> guest_id),
  check (ends_at > starts_at),
  check (cancelled_by is null or cancelled_by in (host_id,guest_id)),
  foreign key(request_id,post_id,host_id,guest_id) references public.join_requests(id,post_id,host_id,requester_id)
);
create index appointments_request_identity_idx on public.appointments(request_id,post_id,host_id,guest_id);
create index appointments_host_time_idx on public.appointments(host_id,starts_at);
create index appointments_guest_time_idx on public.appointments(guest_id,starts_at);
create index appointments_cancelled_by_idx on public.appointments(cancelled_by);

create table public.meetup_post_locations (
  post_id uuid primary key references public.meetup_posts(id),
  secret_location text not null check (btrim(secret_location) <> ''),
  updated_at timestamptz not null default now()
);
comment on table public.meetup_post_locations is 'Exact meeting location: author or confirmed/completed participants only. A closed post alone does not reveal it.';

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.join_requests(id),
  created_at timestamptz not null default now()
);
comment on table public.chat_rooms is 'One room per request. Membership is derived from the request; clients cannot add members. The same room remains after acceptance.';

create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.chat_rooms(id),
  sender_id uuid references public.profiles(id),
  kind text not null default 'text' check (kind in ('text','system')),
  body text not null check (btrim(body) <> ''),
  created_at timestamptz not null default now(),
  check ((kind='text' and sender_id is not null) or (kind='system' and sender_id is null))
);
create index messages_room_time_idx on public.chat_messages(room_id,created_at,id);
create index messages_sender_idx on public.chat_messages(sender_id);

create table public.schedule_proposals (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null references public.appointments(id),
  proposer_id uuid not null references public.profiles(id),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  proposed_location text not null,
  status text not null default 'pending' check (status in ('pending','accepted','rejected','cancelled')),
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (ends_at > starts_at)
);
create index proposals_appointment_idx on public.schedule_proposals(appointment_id);
create index proposals_proposer_idx on public.schedule_proposals(proposer_id);
create unique index proposals_one_pending_idx on public.schedule_proposals(appointment_id) where status='pending';

create table public.completion_confirmations (
  appointment_id uuid not null references public.appointments(id),
  user_id uuid not null references public.profiles(id),
  confirmed_at timestamptz not null default now(),
  primary key(appointment_id,user_id)
);
create index completions_user_idx on public.completion_confirmations(user_id);

create table public.appointment_reviews (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid not null,
  reviewer_id uuid not null,
  reviewee_id uuid not null references public.profiles(id),
  rating smallint not null check (rating between 1 and 5),
  positive_items text[] not null default '{}',
  negative_items text[] not null default '{}',
  comment text not null default '',
  submitted_at timestamptz not null default now(),
  released_at timestamptz,
  unique(appointment_id,reviewer_id),
  foreign key(appointment_id,reviewer_id) references public.completion_confirmations(appointment_id,user_id),
  check (reviewer_id <> reviewee_id)
);
comment on table public.appointment_reviews is 'Blind until both submit. Server publishes released_at after checking both participants; clients cannot release or edit a submitted review.';
create index reviews_reviewer_idx on public.appointment_reviews(reviewer_id);
create index reviews_reviewee_idx on public.appointment_reviews(reviewee_id,submitted_at desc);

create table public.favorite_friends (
  owner_id uuid not null references public.profiles(id),
  target_id uuid not null references public.profiles(id),
  notify_new_posts boolean not null default true,
  saved_at timestamptz not null default now(),
  primary key(owner_id,target_id),
  check(owner_id <> target_id)
);
create index favorites_target_idx on public.favorite_friends(target_id);

create table public.user_blocks (
  blocker_id uuid not null references public.profiles(id),
  blocked_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  primary key(blocker_id,blocked_id),
  check(blocker_id <> blocked_id)
);
create index blocks_blocked_idx on public.user_blocks(blocked_id);
comment on table public.user_blocks is 'Only the blocker reads this relation. Coordinated cancellation on block is a server operation.';

create table public.invitations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null,
  sender_id uuid not null,
  recipient_id uuid not null references public.profiles(id),
  status text not null default 'received' check (status in ('received','viewed','applied','post_closed','post_expired','post_deleted')),
  received_at timestamptz not null default now(),
  viewed_at timestamptz,
  foreign key(post_id,sender_id) references public.meetup_posts(id,author_id),
  unique(post_id,sender_id,recipient_id),
  check(sender_id <> recipient_id)
);
create index invitations_sender_idx on public.invitations(sender_id,received_at desc);
create index invitations_recipient_idx on public.invitations(recipient_id,received_at desc);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id),
  type text not null check (type in ('matching','event','chat','invitation','new_post','completion','review')),
  title text not null,
  description text not null default '',
  post_id uuid references public.meetup_posts(id),
  room_id uuid references public.chat_rooms(id),
  appointment_id uuid references public.appointments(id),
  invitation_id uuid references public.invitations(id),
  review_id uuid references public.appointment_reviews(id),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index notifications_recipient_time_idx on public.notifications(recipient_id,created_at desc);
create index notifications_unread_idx on public.notifications(recipient_id) where read_at is null;
create index notifications_post_idx on public.notifications(post_id);
create index notifications_room_idx on public.notifications(room_id);
create index notifications_appointment_idx on public.notifications(appointment_id);
create index notifications_invitation_idx on public.notifications(invitation_id);
create index notifications_review_idx on public.notifications(review_id);

create table public.notification_settings (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  stranger_invitations boolean not null default true,
  updated_at timestamptz not null default now()
);

create table public.user_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id),
  reported_id uuid not null references public.profiles(id),
  reason text not null check(btrim(reason) <> ''),
  details text not null default '',
  status text not null default 'received' check(status in ('received','reviewing','resolved','dismissed')),
  created_at timestamptz not null default now(),
  check(reporter_id <> reported_id)
);
create index reports_reporter_idx on public.user_reports(reporter_id,created_at desc);
create index reports_reported_idx on public.user_reports(reported_id);

-- Remove inherited privileges (including TRUNCATE), then grant only intended access.
do $$
declare t text;
begin
  foreach t in array array['profiles','private_profiles','categories','events','meetup_posts','join_requests','appointments','meetup_post_locations','chat_rooms','chat_messages','schedule_proposals','completion_confirmations','appointment_reviews','favorite_friends','user_blocks','invitations','notifications','notification_settings','user_reports'] loop
    execute format('alter table public.%I enable row level security',t);
    execute format('revoke all on table public.%I from public, anon, authenticated',t);
    execute format('grant select, insert, update, delete on table public.%I to service_role',t);
    execute format('grant select on table public.%I to authenticated',t);
    execute format('create policy require_member on public.%I as restrictive for all to authenticated using ((select auth.uid()) is not null and coalesce(((select auth.jwt())->>''is_anonymous''),''false'') <> ''true'') with check ((select auth.uid()) is not null and coalesce(((select auth.jwt())->>''is_anonymous''),''false'') <> ''true'')',t);
  end loop;
  foreach t in array array['profiles','private_profiles','events','meetup_posts','join_requests','appointments','meetup_post_locations','notification_settings'] loop
    execute format('create trigger touch_updated_at before update on public.%I for each row execute function app_private.touch_updated_at()',t);
  end loop;
end $$;

grant select on public.profiles,public.categories,public.events,public.meetup_posts,public.appointment_reviews to anon;
create policy profiles_read on public.profiles for select to anon,authenticated using(deleted_at is null or id=(select auth.uid()));
create policy categories_read on public.categories for select to anon,authenticated using(true);
create policy events_read on public.events for select to anon,authenticated using(true);
create policy posts_read on public.meetup_posts for select to anon,authenticated using(status <> 'deleted' or author_id=(select auth.uid()));
create policy private_profile_owner on public.private_profiles for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create policy profile_insert on public.profiles for insert to authenticated with check(id=(select auth.uid()));
create policy profile_update on public.profiles for update to authenticated using(id=(select auth.uid()) and deleted_at is null) with check(id=(select auth.uid()) and deleted_at is null);
grant insert(id,display_name,avatar_url,bio,neighborhood,hobbies,traits),update(display_name,avatar_url,bio,neighborhood,hobbies,traits) on public.profiles to authenticated;
grant insert(user_id,real_name,birth_date,gender,join_route,referral_code,work_email,terms_accepted_at,terms_version),update(real_name,birth_date,gender,work_email) on public.private_profiles to authenticated;

create policy request_participants on public.join_requests for select to authenticated using((select auth.uid()) in (host_id,requester_id));
create policy appointment_participants on public.appointments for select to authenticated using((select auth.uid()) in (host_id,guest_id));
create policy exact_location_participants on public.meetup_post_locations for select to authenticated using(
  exists(select 1 from public.meetup_posts p where p.id=post_id and p.author_id=(select auth.uid()))
  or exists(select 1 from public.appointments a where a.post_id=meetup_post_locations.post_id and a.status in ('confirmed','completed') and (select auth.uid()) in (a.host_id,a.guest_id))
);
create policy room_participants on public.chat_rooms for select to authenticated using(exists(select 1 from public.join_requests r where r.id=request_id and (select auth.uid()) in (r.host_id,r.requester_id)));
create policy message_participants on public.chat_messages for select to authenticated using(exists(select 1 from public.chat_rooms r where r.id=room_id));
create policy message_send on public.chat_messages for insert to authenticated with check(
 sender_id=(select auth.uid()) and kind='text' and exists(
  select 1 from public.chat_rooms c join public.join_requests r on r.id=c.request_id
  where c.id=room_id and (select auth.uid()) in (r.host_id,r.requester_id) and (
   exists(select 1 from public.appointments a where a.request_id=r.id and a.status in ('confirmed','completed'))
   or (r.status in ('pending','reconfirming') and exists(select 1 from public.meetup_posts p where p.id=r.post_id and p.status='recruiting' and p.recruitment_ends_at>now()))
  )
 )
);
grant insert(room_id,sender_id,body) on public.chat_messages to authenticated;
create policy proposal_participants on public.schedule_proposals for select to authenticated using(exists(select 1 from public.appointments a where a.id=appointment_id and (select auth.uid()) in (a.host_id,a.guest_id)));
create policy completion_participants on public.completion_confirmations for select to authenticated using(exists(select 1 from public.appointments a where a.id=appointment_id and (select auth.uid()) in (a.host_id,a.guest_id)));
create policy completion_insert on public.completion_confirmations for insert to authenticated with check(user_id=(select auth.uid()) and exists(select 1 from public.appointments a where a.id=appointment_id and a.status in ('confirmed','completed') and a.ends_at<=now() and (select auth.uid()) in (a.host_id,a.guest_id)));
grant insert(appointment_id,user_id) on public.completion_confirmations to authenticated;
create policy review_read on public.appointment_reviews for select to anon,authenticated using(released_at is not null or reviewer_id=(select auth.uid()));
create policy review_insert on public.appointment_reviews for insert to authenticated with check(reviewer_id=(select auth.uid()) and exists(select 1 from public.appointments a where a.id=appointment_id and a.ends_at<=now() and a.status in ('confirmed','completed') and ((a.host_id=reviewer_id and a.guest_id=reviewee_id) or (a.guest_id=reviewer_id and a.host_id=reviewee_id))));
grant insert(appointment_id,reviewer_id,reviewee_id,rating,positive_items,negative_items,comment) on public.appointment_reviews to authenticated;

create policy favorite_owner on public.favorite_friends for all to authenticated using(owner_id=(select auth.uid())) with check(owner_id=(select auth.uid()));
grant insert(owner_id,target_id,notify_new_posts),update(notify_new_posts),delete on public.favorite_friends to authenticated;
create policy blocks_owner_read on public.user_blocks for select to authenticated using(blocker_id=(select auth.uid()));
create policy invitation_participants on public.invitations for select to authenticated using((select auth.uid()) in (sender_id,recipient_id));
create policy notifications_owner_read on public.notifications for select to authenticated using(recipient_id=(select auth.uid()));
create policy notifications_owner_update on public.notifications for update to authenticated using(recipient_id=(select auth.uid())) with check(recipient_id=(select auth.uid()));
grant update(read_at) on public.notifications to authenticated;
create policy settings_owner on public.notification_settings for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
grant insert(user_id,stranger_invitations),update(stranger_invitations) on public.notification_settings to authenticated;
create policy reports_owner_read on public.user_reports for select to authenticated using(reporter_id=(select auth.uid()));
create policy reports_owner_insert on public.user_reports for insert to authenticated with check(reporter_id=(select auth.uid()));
grant insert(reporter_id,reported_id,reason,details) on public.user_reports to authenticated;

-- No direct client mutations for posts/requests/appointments/locations/invites/blocks/proposals.
-- Their coordinated state transitions and trusted verification values belong in a server API/RPC.
notify pgrst, 'reload schema';
