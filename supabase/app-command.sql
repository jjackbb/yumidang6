-- Service-only transaction API. The Edge Function validates JWT and supplies actor.
-- SECURITY INVOKER: no privilege escalation; anon/authenticated cannot execute.
create or replace function public.app_command(p_actor uuid, p_action text, p_data jsonb default '{}') returns jsonb
language plpgsql security invoker set search_path = '' as $$
declare
 p public.meetup_posts; r public.join_requests; a public.appointments; s public.schedule_proposals;
 v_id uuid; v_other uuid; v_room uuid; v_category text; v_start timestamptz; v_end timestamptz;
 v_deadline timestamptz; v_status text; v_result jsonb := '{}'::jsonb;
begin
 if current_user not in ('service_role','postgres') then raise exception '서버 전용 요청입니다.'; end if;
 if p_actor is null or not exists(select 1 from public.profiles where id=p_actor and deleted_at is null) then raise exception '회원 정보를 확인해 주세요.'; end if;
 -- Prototype traffic is small. One transaction lock serializes lifecycle changes,
 -- including accept/block/reschedule races across different posts and accounts.
 perform pg_advisory_xact_lock(510915001);
 update public.meetup_posts set status='expired' where status='recruiting' and recruitment_ends_at<=now();
 update public.join_requests q set status='post_expired' from public.meetup_posts x where q.post_id=x.id and x.status='expired' and q.status in ('pending','reconfirming');
 update public.invitations i set status=case x.status when 'deleted' then 'post_deleted' when 'expired' then 'post_expired' else 'post_closed' end
 from public.meetup_posts x where i.post_id=x.id and x.status<>'recruiting' and i.status in ('received','viewed');
 if p_action='sync' then return v_result; end if;

 if p_action='profile' then
  if length(coalesce(p_data->>'avatar',''))>300000 then raise exception '사진을 더 작게 등록해 주세요.'; end if;
  update public.profiles set
   display_name=coalesce(nullif(p_data->>'nickname',''),display_name), avatar_url=coalesce(p_data->>'avatar',avatar_url),
   bio=coalesce(p_data->>'bio',bio),neighborhood=coalesce(p_data->>'neighborhood',neighborhood),
   hobbies=case when p_data?'hobbies' then array(select jsonb_array_elements_text(p_data->'hobbies')) else hobbies end,
   traits=case when p_data?'traits' then array(select jsonb_array_elements_text(p_data->'traits')) else traits end where id=p_actor;
  update public.private_profiles set gender=coalesce(p_data->>'gender',gender) where user_id=p_actor;
 elsif p_action in ('create_post','update_post') then
  select id into v_category from public.categories where id=p_data->>'category' or name=p_data->>'category';
  if v_category is null then raise exception '카테고리를 선택해 주세요.'; end if;
  v_start:=(p_data->>'startsAt')::timestamptz; v_end:=(p_data->>'endsAt')::timestamptz;
  v_deadline:=(p_data->>'recruitmentEndsAt')::timestamptz;
  if v_start is null or v_end is null or v_deadline is null or v_start<=now() or v_end<=v_start or v_deadline<=now() or v_deadline>v_start then raise exception '모집 마감과 약속 시간을 확인해 주세요.'; end if;
  if not exists(select 1 from public.profiles where id=p_actor and nullif(avatar_url,'') is not null and cardinality(hobbies)>0 and btrim(bio)<>'') then raise exception '프로필 사진·관심사·소개를 먼저 입력해 주세요.'; end if;
  if coalesce(p_data->>'companionType','free')<>'free' then raise exception '유료 동행은 아직 준비 중이에요.'; end if;
  if p_action='create_post' then
   v_id:=gen_random_uuid();
   insert into public.meetup_posts(id,author_id,category_id,title,description,starts_at,ends_at,recruitment_ends_at,public_location,partner_gender,partner_preferences,tags,image_url)
    values(v_id,p_actor,v_category,p_data->>'title',coalesce(p_data->>'description',''),v_start,v_end,v_deadline,p_data->>'publicLocation',coalesce(p_data->>'partnerGender','any'),coalesce(p_data->>'partnerPreferences',''),array(select jsonb_array_elements_text(coalesce(p_data->'tags','[]'))),p_data->>'imageUrl');
   insert into public.meetup_post_locations(post_id,secret_location) values(v_id,p_data->>'secretLocation');
   insert into public.notifications(recipient_id,type,title,description,post_id)
     select owner_id,'new_post','저장한 동행자의 새 공고',p_data->>'title',v_id from public.favorite_friends f where target_id=p_actor and notify_new_posts
     and not exists(select 1 from public.user_blocks b where (b.blocker_id=f.owner_id and b.blocked_id=p_actor) or (b.blocker_id=p_actor and b.blocked_id=f.owner_id));
  else
   select * into p from public.meetup_posts where id=(p_data->>'id')::uuid for update;
   if p.id is null or p.author_id<>p_actor or p.status<>'recruiting' then raise exception '모집 중인 본인 공고만 수정할 수 있어요.'; end if;
   if p.revision<>coalesce((p_data->>'revision')::int,p.revision) then raise exception '다른 곳에서 공고가 변경됐어요. 새로고침해 주세요.'; end if;
   v_id:=p.id;
   update public.meetup_posts set category_id=v_category,title=p_data->>'title',description=coalesce(p_data->>'description',''),starts_at=v_start,ends_at=v_end,recruitment_ends_at=v_deadline,public_location=p_data->>'publicLocation',partner_gender=coalesce(p_data->>'partnerGender','any'),partner_preferences=coalesce(p_data->>'partnerPreferences',''),tags=array(select jsonb_array_elements_text(coalesce(p_data->'tags','[]'))),image_url=p_data->>'imageUrl',revision=revision+1 where id=v_id;
   update public.meetup_post_locations set secret_location=p_data->>'secretLocation' where post_id=v_id;
   update public.join_requests set status='reconfirming' where post_id=v_id and status in ('pending','reconfirming');
  end if;
  v_result:=jsonb_build_object('id',v_id);
 elsif p_action in ('close_post','delete_post') then
  select * into p from public.meetup_posts where id=(p_data->>'id')::uuid for update;
  if p.id is null or p.author_id<>p_actor then raise exception '본인 공고만 변경할 수 있어요.'; end if;
  if exists(select 1 from public.appointments where post_id=p.id and status='confirmed') then raise exception '확정된 약속을 먼저 취소해 주세요.'; end if;
  v_status:=case when p_action='delete_post' then 'deleted' else 'closed' end;
  update public.meetup_posts set status=v_status,closed_reason='manual' where id=p.id;
  update public.join_requests set status=case when v_status='deleted' then 'post_deleted' else 'post_closed' end where post_id=p.id and status in ('pending','reconfirming');
  update public.invitations set status=case when v_status='deleted' then 'post_deleted' else 'post_closed' end where post_id=p.id and status in ('received','viewed');
 elsif p_action='request' then
  select * into p from public.meetup_posts where id=(p_data->>'postId')::uuid for update;
  if p.id is null or p.status<>'recruiting' or p.author_id=p_actor then raise exception '현재 신청할 수 없는 공고예요.'; end if;
  if exists(select 1 from public.user_blocks where (blocker_id=p_actor and blocked_id=p.author_id) or (blocker_id=p.author_id and blocked_id=p_actor)) then raise exception '이 회원과는 신청할 수 없어요.'; end if;
  if p.partner_gender<>'any' and not exists(select 1 from public.private_profiles where user_id=p_actor and gender=p.partner_gender) then raise exception '공고의 동행 조건을 확인해 주세요.'; end if;
  if not exists(select 1 from public.profiles where id=p_actor and nullif(avatar_url,'') is not null and cardinality(hobbies)>0 and btrim(bio)<>'') then raise exception '프로필을 먼저 완성해 주세요.'; end if;
  insert into public.join_requests(post_id,host_id,requester_id,message,agreed_revision,public_condition_snapshot)
  values(p.id,p.author_id,p_actor,p_data->>'message',p.revision,jsonb_build_object('title',p.title,'category',p.category_id,'startsAt',p.starts_at,'endsAt',p.ends_at,'publicLocation',p.public_location,'partnerGender',p.partner_gender,'partnerPreferences',p.partner_preferences,'revision',p.revision)) returning * into r;
  insert into public.chat_rooms(request_id) values(r.id) returning id into v_room;
  insert into public.chat_messages(room_id,kind,body) values(v_room,'system','동행 신청이 접수됐어요. 여기서 대화할 수 있어요.');
  insert into public.notifications(recipient_id,type,title,description,room_id) values(p.author_id,'matching','새 동행 신청',p.title,v_room);
  update public.invitations set status='applied' where post_id=p.id and recipient_id=p_actor;
  v_result:=jsonb_build_object('id',r.id,'roomId',v_room);
 elsif p_action in ('accept','reject','cancel_request','reconfirm') then
  select * into r from public.join_requests where id=(p_data->>'id')::uuid for update;
  if r.id is null or p_actor not in (r.host_id,r.requester_id) then raise exception '신청 당사자만 처리할 수 있어요.'; end if;
  select * into p from public.meetup_posts where id=r.post_id for update;
  select id into v_room from public.chat_rooms where request_id=r.id;
  if r.status not in ('pending','reconfirming') or p.status<>'recruiting' then raise exception '신청 상태가 변경됐어요. 새로고침해 주세요.'; end if;
  if p_action='reconfirm' then
   if p_actor<>r.requester_id or r.status<>'reconfirming' or (p_data->>'revision')::int<>p.revision then raise exception '변경된 최신 조건을 확인해 주세요.'; end if;
   update public.join_requests set status=case when (p_data->>'agree')::boolean then 'pending' else 'change_declined' end,agreed_revision=p.revision,
    public_condition_snapshot=jsonb_build_object('title',p.title,'category',p.category_id,'startsAt',p.starts_at,'endsAt',p.ends_at,'publicLocation',p.public_location,'partnerGender',p.partner_gender,'partnerPreferences',p.partner_preferences,'revision',p.revision) where id=r.id;
  elsif p_action='accept' then
   if p_actor<>r.host_id or r.status<>'pending' or r.agreed_revision<>p.revision then raise exception '작성자만 최신 조건에 동의한 신청을 수락할 수 있어요.'; end if;
   if exists(select 1 from public.user_blocks where (blocker_id=r.host_id and blocked_id=r.requester_id) or (blocker_id=r.requester_id and blocked_id=r.host_id)) then raise exception '차단된 회원과 확정할 수 없어요.'; end if;
   if exists(select 1 from public.appointments where status='confirmed' and (host_id in (r.host_id,r.requester_id) or guest_id in (r.host_id,r.requester_id)) and starts_at<p.ends_at and ends_at>p.starts_at) then raise exception '이미 확정된 다른 약속과 시간이 겹쳐요.'; end if;
   update public.join_requests set status='accepted' where id=r.id;
   update public.join_requests set status='matched_with_other' where post_id=p.id and id<>r.id and status in ('pending','reconfirming');
   insert into public.appointments(request_id,post_id,host_id,guest_id,starts_at,ends_at,public_location) values(r.id,p.id,r.host_id,r.requester_id,p.starts_at,p.ends_at,p.public_location) returning id into v_id;
   update public.meetup_posts set status='closed',closed_reason='matched' where id=p.id;
   update public.invitations set status='post_closed' where post_id=p.id and status in ('received','viewed');
   v_result:=jsonb_build_object('id',v_id,'roomId',v_room);
  else
   if (p_action='reject' and p_actor<>r.host_id) or (p_action='cancel_request' and p_actor<>r.requester_id) then raise exception '신청 처리 권한이 없어요.'; end if;
   update public.join_requests set status=case when p_action='reject' then 'rejected' else 'cancelled' end,cancellation_reason=p_data->>'reason' where id=r.id;
  end if;
  insert into public.chat_messages(room_id,kind,body) values(v_room,'system',case p_action when 'accept' then '동행이 확정됐어요.' when 'reconfirm' then '변경 조건 확인이 처리됐어요.' else '신청이 종료됐어요.' end);
  insert into public.notifications(recipient_id,type,title,room_id) values(case when p_actor=r.host_id then r.requester_id else r.host_id end,'matching','동행 신청 상태가 변경됐어요.',v_room);
 elsif p_action='message' then
  select q.* into r from public.join_requests q join public.chat_rooms c on c.request_id=q.id where c.id=(p_data->>'roomId')::uuid;
  if r.id is null or p_actor not in (r.host_id,r.requester_id) then raise exception '대화방 참여자가 아니에요.'; end if;
  if exists(select 1 from public.user_blocks where (blocker_id=r.host_id and blocked_id=r.requester_id) or (blocker_id=r.requester_id and blocked_id=r.host_id)) then raise exception '차단된 대화에는 메시지를 보낼 수 없어요.'; end if;
  if r.status not in ('pending','reconfirming') and not exists(select 1 from public.appointments where request_id=r.id and status in ('confirmed','completed')) then raise exception '종료된 대화에는 메시지를 보낼 수 없어요.'; end if;
  if length(p_data->>'text')>5000 then raise exception '메시지는 5000자 이내로 입력해 주세요.'; end if;
  v_room:=(p_data->>'roomId')::uuid;v_id:=coalesce((p_data->>'messageId')::uuid,gen_random_uuid());
  insert into public.chat_messages(id,room_id,sender_id,body) values(v_id,v_room,p_actor,p_data->>'text') on conflict(id) do nothing;
  if found then insert into public.notifications(recipient_id,type,title,description,room_id) values(case when p_actor=r.host_id then r.requester_id else r.host_id end,'chat','새 메시지',left(p_data->>'text',120),v_room); end if;
 elsif p_action in ('cancel_appointment','complete','review','propose','resolve_proposal') then
  if p_action='resolve_proposal' then
   select * into s from public.schedule_proposals where id=(p_data->>'id')::uuid for update;
   select * into a from public.appointments where id=s.appointment_id for update;
  else select * into a from public.appointments where id=(p_data->>'id')::uuid for update; end if;
  if a.id is null or p_actor not in (a.host_id,a.guest_id) then raise exception '약속 당사자만 처리할 수 있어요.'; end if;
  v_other:=case when p_actor=a.host_id then a.guest_id else a.host_id end;
  select id into v_room from public.chat_rooms where request_id=a.request_id;
  if p_action='cancel_appointment' then
   if a.status<>'confirmed' then raise exception '확정 상태에서만 취소할 수 있어요.'; end if;
   if btrim(coalesce(p_data->>'reason',''))='' then raise exception '취소 사유를 입력해 주세요.'; end if;
   update public.appointments set status='cancelled',cancelled_by=p_actor,cancellation_reason=p_data->>'reason',cancelled_at=now() where id=a.id;
   update public.join_requests set status='match_cancelled' where id=a.request_id;
   update public.meetup_posts set closed_reason='cancelled' where id=a.post_id;
   update public.schedule_proposals set status='cancelled',responded_at=now() where appointment_id=a.id and status='pending';
  elsif p_action in ('complete','review') then
   if a.status not in ('confirmed','completed') or a.ends_at>now() then raise exception '약속 종료 시각 이후에 처리할 수 있어요.'; end if;
   if p_action='complete' then
    insert into public.completion_confirmations(appointment_id,user_id) values(a.id,p_actor) on conflict do nothing;
    if (select count(*) from public.completion_confirmations where appointment_id=a.id)=2 then update public.appointments set status='completed' where id=a.id; end if;
   else
    if now()>=a.ends_at + interval '7 days' then raise exception '평가 작성 기간이 끝났어요.'; end if;
    if length(coalesce(p_data->>'comment',''))>1000 then raise exception '후기는 1000자 이내로 입력해 주세요.'; end if;
    if not exists(select 1 from public.completion_confirmations where appointment_id=a.id and user_id=p_actor) then raise exception '먼저 본인의 동행 완료를 확인해 주세요.'; end if;
    insert into public.appointment_reviews(appointment_id,reviewer_id,reviewee_id,rating,positive_items,negative_items,comment)
    values(a.id,p_actor,v_other,(p_data->>'rating')::smallint,array(select jsonb_array_elements_text(coalesce(p_data->'positiveItems','[]'))),array(select jsonb_array_elements_text(coalesce(p_data->'negativeItems','[]'))),coalesce(p_data->>'comment',''));
    if (select count(*) from public.appointment_reviews where appointment_id=a.id)=2 then update public.appointment_reviews set released_at=now() where appointment_id=a.id; end if;
   end if;
  else
   if a.status<>'confirmed' or a.ends_at<=now() then raise exception '진행 중인 확정 약속만 변경할 수 있어요.'; end if;
   if p_action='propose' then
    v_start:=(p_data->>'startsAt')::timestamptz;v_end:=(p_data->>'endsAt')::timestamptz;
    if v_start<=now() or v_end<=v_start then raise exception '변경할 시간을 확인해 주세요.'; end if;
    insert into public.schedule_proposals(appointment_id,proposer_id,starts_at,ends_at,proposed_location) values(a.id,p_actor,v_start,v_end,p_data->>'newLocation');
   else
    if s.status<>'pending' or s.proposer_id=p_actor then raise exception '상대방의 대기 중 제안만 응답할 수 있어요.'; end if;
    if (p_data->>'accepted')::boolean then
     if s.starts_at<=now() then raise exception '이미 지난 시간으로 변경할 수 없어요.'; end if;
     if exists(select 1 from public.appointments where id<>a.id and status='confirmed' and (host_id in (a.host_id,a.guest_id) or guest_id in (a.host_id,a.guest_id)) and starts_at<s.ends_at and ends_at>s.starts_at) then raise exception '다른 약속과 시간이 겹쳐요.'; end if;
     update public.appointments set starts_at=s.starts_at,ends_at=s.ends_at where id=a.id;
     update public.meetup_post_locations set secret_location=s.proposed_location where post_id=a.post_id;
    end if;
    update public.schedule_proposals set status=case when (p_data->>'accepted')::boolean then 'accepted' else 'rejected' end,responded_at=now() where id=s.id;
   end if;
  end if;
  insert into public.notifications(recipient_id,type,title,appointment_id) values(v_other,case when p_action='review' then 'review' when p_action='complete' then 'completion' else 'matching' end,'약속 상태가 변경됐어요.',a.id);
 elsif p_action in ('favorite','favorite_notice') then
  v_other:=(p_data->>'targetId')::uuid;
  if p_actor=v_other then raise exception '본인은 저장할 수 없어요.'; end if;
  if p_action='favorite_notice' then update public.favorite_friends set notify_new_posts=(p_data->>'enabled')::boolean where owner_id=p_actor and target_id=v_other;
  elsif (p_data->>'saved')::boolean then insert into public.favorite_friends(owner_id,target_id) values(p_actor,v_other) on conflict do nothing;
  else delete from public.favorite_friends where owner_id=p_actor and target_id=v_other; end if;
 elsif p_action='invite' then
  select * into p from public.meetup_posts where id=(p_data->>'postId')::uuid;
  v_other:=(p_data->>'targetId')::uuid;
  if p.id is null or p.author_id<>p_actor or p.status<>'recruiting' or not exists(select 1 from public.favorite_friends where owner_id=p_actor and target_id=v_other) then raise exception '저장한 동행자에게 본인의 모집 중 공고를 초대할 수 있어요.'; end if;
  if exists(select 1 from public.user_blocks where (blocker_id=p_actor and blocked_id=v_other) or (blocker_id=v_other and blocked_id=p_actor)) then raise exception '차단된 회원은 초대할 수 없어요.'; end if;
  insert into public.invitations(post_id,sender_id,recipient_id) values(p.id,p_actor,v_other) on conflict do nothing returning id into v_id;
  if v_id is not null and (coalesce((select stranger_invitations from public.notification_settings where user_id=v_other),true) or exists(select 1 from public.favorite_friends where owner_id=v_other and target_id=p_actor) or exists(select 1 from public.appointments x where x.status='completed' and ((host_id=p_actor and guest_id=v_other) or (host_id=v_other and guest_id=p_actor)))) then
   insert into public.notifications(recipient_id,type,title,description,invitation_id) values(v_other,'invitation','새 동행 초대',p.title,v_id);
  end if;
 elsif p_action='view_invitation' then
  update public.invitations set status='viewed',viewed_at=now() where id=(p_data->>'id')::uuid and recipient_id=p_actor and status='received';
  update public.notifications set read_at=now() where invitation_id=(p_data->>'id')::uuid and recipient_id=p_actor;
 elsif p_action='read_notifications' then
  update public.notifications set read_at=now() where recipient_id=p_actor and (not(p_data?'id') or id=(p_data->>'id')::uuid) and (not(p_data?'roomId') or room_id=(p_data->>'roomId')::uuid);
 elsif p_action='notification_settings' then
  insert into public.notification_settings(user_id,stranger_invitations) values(p_actor,(p_data->>'enabled')::boolean) on conflict(user_id) do update set stranger_invitations=excluded.stranger_invitations;
 elsif p_action in ('block','unblock') then
  v_other:=(p_data->>'targetId')::uuid;
  if p_actor=v_other then raise exception '본인을 차단할 수 없어요.'; end if;
  if p_action='unblock' then delete from public.user_blocks where blocker_id=p_actor and blocked_id=v_other;
  else
   if exists(select 1 from public.appointments x where x.status='confirmed' and ((x.host_id=p_actor and x.guest_id=v_other) or (x.host_id=v_other and x.guest_id=p_actor)) and (select count(*) from public.completion_confirmations c where c.appointment_id=x.id)=1) then raise exception '한쪽만 완료한 동행은 차단 처리 기준 검토 중이에요.'; end if;
   if (select count(*) from public.appointments where status='confirmed' and ((host_id=p_actor and guest_id=v_other) or (host_id=v_other and guest_id=p_actor)))>1 then raise exception '같은 상대와 확정 동행이 여러 건인 경우 처리 기준 검토 중이에요.'; end if;
   insert into public.user_blocks(blocker_id,blocked_id) values(p_actor,v_other) on conflict do nothing;
   delete from public.favorite_friends where owner_id=p_actor and target_id=v_other;
   update public.join_requests set status='cancelled',cancellation_reason='차단으로 종료' where status in ('pending','reconfirming') and ((host_id=p_actor and requester_id=v_other) or (host_id=v_other and requester_id=p_actor));
   for a in select * from public.appointments where status='confirmed' and ((host_id=p_actor and guest_id=v_other) or (host_id=v_other and guest_id=p_actor)) loop
    update public.appointments set status='cancelled',cancelled_by=p_actor,cancellation_reason='차단으로 취소',cancelled_at=now() where id=a.id;
    update public.join_requests set status='match_cancelled' where id=a.request_id;
    update public.meetup_posts set closed_reason='cancelled' where id=a.post_id;
    update public.schedule_proposals set status='cancelled',responded_at=now() where appointment_id=a.id and status='pending';
   end loop;
  end if;
 elsif p_action='report' then
  insert into public.user_reports(reporter_id,reported_id,reason,details) values(p_actor,(p_data->>'targetId')::uuid,p_data->>'reason',coalesce(p_data->>'details',''));
 else raise exception '지원하지 않는 요청입니다.';
 end if;
 return v_result;
end;
$$;
revoke all on function public.app_command(uuid,text,jsonb) from public,anon,authenticated;
grant execute on function public.app_command(uuid,text,jsonb) to service_role;

-- All writes now go through the authenticated transaction API. Remove both
-- table-level and prior column-level writes so REST cannot skip lifecycle checks.
do $$ declare t text; cols text; begin
 foreach t in array array['profiles','private_profiles','categories','events','meetup_posts','join_requests','appointments','meetup_post_locations','chat_rooms','chat_messages','schedule_proposals','completion_confirmations','appointment_reviews','favorite_friends','user_blocks','invitations','notifications','notification_settings','user_reports'] loop
  execute format('revoke insert,update,delete on public.%I from authenticated',t);
  select string_agg(quote_ident(column_name),',') into cols from information_schema.columns where table_schema='public' and table_name=t;
  execute format('revoke insert (%s),update (%s),references (%s) on public.%I from authenticated',cols,cols,cols,t);
 end loop;
end $$;
notify pgrst, 'reload schema';
