-- Run only in BEGIN ... ROLLBACK. Fixtures are synthetic. Past timestamps below
-- simulate completed meetings for database policy tests, not real user meetings.
do $$
declare u uuid; v uuid; w uuid; p uuid; r uuid; room uuid; a uuid; proposal uuid; payload jsonb; result jsonb; n integer;
begin
 select id into u from auth.users where email='prototype-1@yumidang.invalid';
 select id into v from auth.users where email='prototype-2@yumidang.invalid';
 select id into w from auth.users where email='prototype-3@yumidang.invalid';
 if u is null or v is null or w is null then raise exception 'Test accounts required'; end if;
 payload:=jsonb_build_object('title','SQL rollback fixture','category','산책','startsAt',now()+interval '30 days','endsAt',now()+interval '30 days 1 hour','recruitmentEndsAt',now()+interval '29 days','publicLocation','public test','secretLocation','private test');
 result:=public.app_command(u,'create_post',payload);p:=(result->>'id')::uuid;
 perform public.app_command(u,'favorite',jsonb_build_object('targetId',v,'saved',true));
 perform public.app_command(u,'invite',jsonb_build_object('postId',p,'targetId',v));
 perform public.app_command(u,'invite',jsonb_build_object('postId',p,'targetId',v));
 if (select count(*) from public.invitations where post_id=p)<>1 then raise exception 'duplicate invitation'; end if;
 result:=public.app_command(v,'request',jsonb_build_object('postId',p,'message','test'));r:=(result->>'id')::uuid;room:=(result->>'roomId')::uuid;
 perform public.app_command(w,'request',jsonb_build_object('postId',p,'message','second test'));
 result:=public.app_command(u,'accept',jsonb_build_object('id',r));a:=(result->>'id')::uuid;
 if (select status from public.join_requests where post_id=p and requester_id=w)<>'matched_with_other' then raise exception 'other request not closed'; end if;
 if (select count(*) from public.appointments where post_id=p)<>1 then raise exception 'wrong appointment cardinality'; end if;
 perform public.app_command(u,'propose',jsonb_build_object('id',a,'startsAt',now()+interval '31 days','endsAt',now()+interval '31 days 1 hour','newLocation','changed private place'));
 select id into proposal from public.schedule_proposals where appointment_id=a;
 begin
  perform public.app_command(u,'resolve_proposal',jsonb_build_object('id',proposal,'accepted',true));
  raise exception 'self proposal accepted' using errcode='23514';
 exception when raise_exception then null; end;
 perform public.app_command(v,'resolve_proposal',jsonb_build_object('id',proposal,'accepted',true));
 if (select secret_location from public.meetup_post_locations where post_id=p)<>'changed private place' then raise exception 'proposal not applied'; end if;
 -- Synthetic time shift confined to this rollback transaction.
 update public.appointments set starts_at=now()-interval '2 hours',ends_at=now()-interval '1 hour' where id=a;
 perform public.app_command(u,'complete',jsonb_build_object('id',a));
 begin
  perform public.app_command(u,'block',jsonb_build_object('targetId',v));
  raise exception 'one-sided completion block allowed' using errcode='23514';
 exception when raise_exception then null; end;
 perform public.app_command(u,'review',jsonb_build_object('id',a,'rating',5,'comment','synthetic review'));
 if exists(select 1 from public.appointment_reviews where appointment_id=a and released_at is not null) then raise exception 'premature review publication'; end if;
 perform public.app_command(v,'complete',jsonb_build_object('id',a));
 if (select status from public.appointments where id=a)<>'completed' then raise exception 'completion summary not updated'; end if;
 perform public.app_command(v,'review',jsonb_build_object('id',a,'rating',4));
 if (select count(*) from public.appointment_reviews where appointment_id=a and released_at is not null)<>2 then raise exception 'mutual reviews not released'; end if;
 begin
  perform public.app_command(u,'review',jsonb_build_object('id',a,'rating',3));
  raise exception 'duplicate review allowed' using errcode='23514';
 exception when unique_violation then null; end;
 perform public.app_command(u,'block',jsonb_build_object('targetId',v));
 if (select status from public.appointments where id=a)<>'completed' then raise exception 'completed history changed by block'; end if;
 begin
  perform public.app_command(v,'message',jsonb_build_object('roomId',room,'text','blocked text'));
  raise exception 'blocked text allowed' using errcode='23514';
 exception when raise_exception then null; end;
 perform public.app_command(u,'unblock',jsonb_build_object('targetId',v));
 if exists(select 1 from public.user_blocks where blocker_id=u and blocked_id=v) then raise exception 'unblock failed'; end if;
 perform public.app_command(u,'profile',jsonb_build_object('sugarContent',999,'isKycVerified',true));
 if exists(select 1 from public.profiles where id=u and (sugar_content<>15 or is_kyc_verified)) then raise exception 'privilege fields changed'; end if;
 if has_function_privilege('authenticated','public.app_command(uuid,text,jsonb)','execute') or has_function_privilege('anon','public.app_command(uuid,text,jsonb)','execute') then raise exception 'RPC publicly executable'; end if;
 if has_any_column_privilege('authenticated','public.chat_messages','insert') or has_any_column_privilege('authenticated','public.appointment_reviews','insert') then raise exception 'direct write bypass'; end if;
end $$;
select 'PASS' as result, 'transaction lifecycle, proposal, completion, blind review, block, privilege checks (rollback)' as scope;
