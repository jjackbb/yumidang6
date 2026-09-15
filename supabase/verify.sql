-- Run inside BEGIN ... ROLLBACK. Fixtures never remain in the database.
-- Real PostgreSQL permission tests with simulated JWT claims, not end-user Auth sessions.
insert into auth.users(id) values
 ('10000000-0000-4000-8000-000000000001'),
 ('10000000-0000-4000-8000-000000000002'),
 ('10000000-0000-4000-8000-000000000003');
insert into public.profiles(id,display_name) select id,'검증 회원' from auth.users where id in
 ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003');
insert into public.private_profiles(user_id,real_name) select id,'비공개 검증 이름' from public.profiles where id in
 ('10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003');
insert into public.meetup_posts(id,author_id,category_id,title,starts_at,ends_at,recruitment_ends_at,public_location) values
 ('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','walk','RLS 검증 공고',now()+interval '1 day',now()+interval '25 hours',now()+interval '12 hours','공개 동네');
insert into public.meetup_post_locations(post_id,secret_location) values('20000000-0000-4000-8000-000000000001','비공개 만남 장소');
insert into public.join_requests(id,post_id,host_id,requester_id,message) values
 ('30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','신청'),
 ('30000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','다른 신청');
insert into public.chat_rooms(id,request_id) values('40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001');
insert into public.notifications(id,recipient_id,type,title) values('50000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','matching','나만 보는 알림');

set local role anon;
do $$ begin
 if (select count(*) from public.categories)<>12 then raise exception 'categories must be public'; end if;
 if (select count(*) from public.meetup_posts)<>1 then raise exception 'public posts missing'; end if;
 begin perform * from public.private_profiles; raise exception 'anon private access'; exception when insufficient_privilege then null; end;
 begin perform * from public.chat_messages; raise exception 'anon chat access'; exception when insufficient_privilege then null; end;
 begin truncate public.profiles cascade; raise exception 'anon truncate allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;

set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":false}',true);
do $$ declare changed integer; begin
 if (select count(*) from public.private_profiles)<>1 then raise exception 'private profile isolation'; end if;
 if (select count(*) from public.join_requests)<>1 then raise exception 'request isolation'; end if;
 if (select count(*) from public.chat_rooms)<>1 then raise exception 'member room access'; end if;
 if (select count(*) from public.meetup_post_locations)<>0 then raise exception 'unconfirmed location leaked'; end if;
 update public.profiles set bio='검증 소개' where id='10000000-0000-4000-8000-000000000002';
 get diagnostics changed=row_count; if changed<>1 then raise exception 'owner profile update failed'; end if;
 update public.profiles set bio='타인 변경' where id='10000000-0000-4000-8000-000000000001';
 get diagnostics changed=row_count; if changed<>0 then raise exception 'other profile update allowed'; end if;
 begin update public.profiles set sugar_content=999 where id='10000000-0000-4000-8000-000000000002'; raise exception 'sugar forgery'; exception when insufficient_privilege then null; end;
 begin update public.profiles set is_kyc_verified=true where id='10000000-0000-4000-8000-000000000002'; raise exception 'badge forgery'; exception when insufficient_privilege then null; end;
 begin update public.join_requests set status='accepted'; raise exception 'self acceptance allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.chat_messages(room_id,sender_id,body) values('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','사칭'); raise exception 'sender forgery'; exception when insufficient_privilege then null; end;
 begin insert into public.chat_messages(room_id,kind,body) values('40000000-0000-4000-8000-000000000001','system','가짜 시스템'); raise exception 'system forgery'; exception when insufficient_privilege then null; end;
end $$;
insert into public.chat_messages(room_id,sender_id,body) values('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','정상 메시지');
insert into public.favorite_friends(owner_id,target_id) values('10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001');
update public.notifications set read_at=now() where id='50000000-0000-4000-8000-000000000001';
reset role;

-- Manual closure alone must not reveal an address and must stop new messages.
update public.meetup_posts set status='closed',closed_reason='manual';
set local role authenticated;
do $$ begin
 if (select count(*) from public.meetup_post_locations)<>0 then raise exception 'closed post location leaked'; end if;
 if (select count(*) from public.chat_messages)<>1 then raise exception 'closed chat history lost'; end if;
 begin insert into public.chat_messages(room_id,sender_id,body) values('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','닫힌 대화 쓰기'); raise exception 'closed chat write allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;

-- The trusted server records acceptance and appointment together.
update public.join_requests set status='accepted' where id='30000000-0000-4000-8000-000000000001';
do $$ begin
 begin update public.join_requests set status='accepted' where id='30000000-0000-4000-8000-000000000002'; raise exception 'two accepted guests'; exception when unique_violation then null; end;
 begin insert into public.join_requests(post_id,host_id,requester_id,message,status) values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','10000000-0000-4000-8000-000000000002','잘못된 호스트','cancelled'); raise exception 'host FK mismatch allowed'; exception when foreign_key_violation then null; end;
 begin update public.meetup_posts set ends_at=starts_at; raise exception 'invalid time allowed'; exception when check_violation then null; end;
end $$;
insert into public.appointments(id,request_id,post_id,host_id,guest_id,starts_at,ends_at,public_location) values
 ('60000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',now()+interval '1 day',now()+interval '25 hours','공개 동네');
set local role authenticated;
do $$ begin
 if (select count(*) from public.meetup_post_locations)<>1 then raise exception 'confirmed location missing'; end if;
 begin insert into public.completion_confirmations(appointment_id,user_id) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002'); raise exception 'early completion allowed'; exception when insufficient_privilege then null; end;
end $$;
reset role;
update public.appointments set starts_at=now()-interval '2 hours',ends_at=now()-interval '1 hour';
set local role authenticated;
insert into public.completion_confirmations(appointment_id,user_id) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002');
insert into public.appointment_reviews(appointment_id,reviewer_id,reviewee_id,rating,comment) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',5,'아직 비공개');
do $$ begin
 if (select count(*) from public.appointment_reviews)<>1 then raise exception 'own review missing'; end if;
 begin update public.appointment_reviews set released_at=now(); raise exception 'client released review'; exception when insufficient_privilege then null; end;
 begin insert into public.appointment_reviews(appointment_id,reviewer_id,reviewee_id,rating) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001',5); raise exception 'duplicate review allowed'; exception when unique_violation then null; end;
end $$;

-- A third user has a request on the same post, but not this room/appointment.
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000003","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.chat_rooms)<>0 then raise exception 'outsider room leak'; end if;
 if (select count(*) from public.chat_messages)<>0 then raise exception 'outsider message leak'; end if;
 if (select count(*) from public.appointments)<>0 then raise exception 'outsider appointment leak'; end if;
 if (select count(*) from public.meetup_post_locations)<>0 then raise exception 'outsider location leak'; end if;
 if (select count(*) from public.notifications)<>0 then raise exception 'outsider notification leak'; end if;
 if (select count(*) from public.appointment_reviews)<>0 then raise exception 'outsider blind review leak'; end if;
 begin insert into public.chat_messages(room_id,sender_id,body) values('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003','침입'); raise exception 'outsider send allowed'; exception when insufficient_privilege then null; end;
 begin insert into public.completion_confirmations(appointment_id,user_id) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000003'); raise exception 'outsider completion allowed'; exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000001","role":"authenticated"}',true);
do $$ begin
 if (select count(*) from public.favorite_friends)<>0 then raise exception 'favorite recipient can discover saver'; end if;
 if (select count(*) from public.appointment_reviews)<>0 then raise exception 'peer blind review leaked'; end if;
end $$;
insert into public.completion_confirmations(appointment_id,user_id) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001');
insert into public.appointment_reviews(appointment_id,reviewer_id,reviewee_id,rating) values('60000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002',4);
reset role;
update public.appointment_reviews r set released_at=now() where (select count(*) from public.appointment_reviews r2 where r2.appointment_id=r.appointment_id)=2;
set local role anon;
do $$ begin
 if (select count(*) from public.appointment_reviews)<>2 then raise exception 'published reviews unavailable'; end if;
end $$;
reset role;
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"10000000-0000-4000-8000-000000000002","role":"authenticated","is_anonymous":true}',true);
do $$ begin
 if (select count(*) from public.private_profiles)<>0 then raise exception 'anonymous auth user can read private data'; end if;
end $$;
reset role;
select 'PASS' as result, 'RLS, column grants, FK, uniqueness, time constraints and blind review checks; rollback fixtures' as scope;
