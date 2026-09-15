import { supabase } from '../lib/supabase';
import { conditionChanges, conditionsOf } from '../utils/postLifecycle';
import { formatMeetupRange } from '../utils/meetupLifecycle';
import { defaultDemoSettings, type PrototypeData } from '../utils/prototypeStore';
import type { CurrentUser } from '../types';

export const emptyCloudData = (): PrototypeData => ({ posts: [], requests: [], rooms: [], appointments: [], notifications: [], reviews: [], favorites: [], invitations: [], completions: [], appointmentReviews: [], notificationSettings: [], blocks: [], users: [], activeUserId: null, demo: defaultDemoSettings(), ui: { activeTab: 'home' } });
export async function command(action: string, data: Record<string, unknown> = {}) {
  if (!supabase) throw new Error('DB 연결 설정을 확인해 주세요.');
  const { data: session } = await supabase.auth.getSession();
  if (!session.session) throw new Error('로그인이 필요해요.');
  const { data: result, error } = await supabase.functions.invoke('app-command', { body: { action, data } });
  if (error) {
    const detail = await error.context?.json?.().catch(() => null);
    throw new Error(detail?.error || '서버에 저장하지 못했어요. 연결을 확인하고 다시 시도해 주세요.');
  }
  if (result?.error) throw new Error(result.error);
  return result?.result as { id?: string; roomId?: string };
}

/** Reads always use the user's JWT and RLS, never a service key. */
export async function loadCloudData(userId: string | null): Promise<PrototypeData> {
  if (!supabase) throw new Error('DB 연결 설정이 없어요.');
  const tables = ['profiles','categories','events','meetup_posts','appointment_reviews', ...(userId ? ['private_profiles','join_requests','appointments','meetup_post_locations','chat_rooms','chat_messages','schedule_proposals','completion_confirmations','favorite_friends','invitations','notifications','notification_settings','user_blocks'] : [])];
  const rows: Record<string, any[]> = {};
  // Explicit pagination avoids silently truncating a growing project at 1000 rows.
  await Promise.all(tables.map(async table => {
    const records: any[] = [];
    for (let from=0; ; from+=500) {
      const { data, error } = await supabase!.from(table).select('*').range(from,from+499);
      if (error) throw new Error('DB에서 데이터를 불러오지 못했어요. 다시 시도해 주세요.');
      records.push(...data); if (data.length<500) break;
    }
    rows[table] = records;
  }));
  return mapCloudData(rows,userId);
}
export function mapCloudData(t: Record<string, any[]>, userId: string | null): PrototypeData {
  const d=emptyCloudData();const list=(name:string)=>t[name] || [];
  const profile=(id:string)=>list('profiles').find(p=>p.id===id);
  const display=(id:string)=>profile(id)?.display_name || '회원';
  const avatar=(id:string)=>profile(id)?.avatar_url || '';
  const category=(id:string)=>list('categories').find(c=>c.id===id)?.name || '기타';
  const date=(value:string)=>new Date(value).toLocaleString('ko-KR',{timeZone:'Asia/Seoul'});
  d.users=list('profiles').map((p):CurrentUser=>{
    const mine=list('private_profiles').find(v=>v.user_id===p.id);
    return {id:p.id,isLoggedIn:true,phone:'',realName:mine?.real_name || '',maskedName:p.display_name,nickname:p.display_name,gender:mine?.gender || 'undisclosed',birthDate:mine?.birth_date || undefined,ageGroup:p.age_group,neighborhood:p.neighborhood,sugarContent:Number(p.sugar_content),isPhoneVerified:p.is_phone_verified,isKycVerified:p.is_kyc_verified,isSample:false,avatar:p.avatar_url || '',bio:p.bio,hobbies:p.hobbies,traits:p.traits,joinedAt:p.created_at.slice(0,7).replace('-','.')};
  });
  d.posts=list('meetup_posts').map(p=>({id:p.id,authorId:p.author_id,author:display(p.author_id),avatar:avatar(p.author_id),category:category(p.category_id),eventId:list('events').find(e=>e.id===p.event_id)?.external_id || p.event_id || undefined,title:p.title,description:p.description,startsAt:p.starts_at,endsAt:p.ends_at,recruitmentEndsAt:p.recruitment_ends_at,revision:p.revision,closedReason:p.closed_reason || undefined,publicLocation:p.public_location,location:p.region || p.public_location,secretLocation:list('meetup_post_locations').find(l=>l.post_id===p.id)?.secret_location,partnerGender:p.partner_gender,partnerPreferences:p.partner_preferences,tags:p.tags,imageUrl:p.image_url,time:formatMeetupRange(p.starts_at,p.ends_at),status:p.status==='recruiting' && Date.parse(p.recruitment_ends_at)<=Date.now()?'expired':p.status,currentMembers:p.closed_reason==='matched'?2:1,maxMembers:2,companionType:p.companion_type,proDetails:p.pro_details || undefined}));
  d.requests=list('join_requests').map(r=>({id:r.id,postId:r.post_id,hostId:r.host_id,postTitle:d.posts.find(p=>p.id===r.post_id)?.title || '종료된 공고',requesterId:r.requester_id,requesterName:display(r.requester_id),requesterAvatar:avatar(r.requester_id),requesterSugar:Number(profile(r.requester_id)?.sugar_content || 15),message:r.message,status:r.status,createdAt:date(r.created_at),agreedRevision:r.agreed_revision,conditionSnapshot:{...r.public_condition_snapshot,category:category(r.public_condition_snapshot.category)},reconfirmation:r.status==='reconfirming'?{revision:d.posts.find(p=>p.id===r.post_id)?.revision || 1,status:'pending',changes:conditionChanges({...r.public_condition_snapshot,category:category(r.public_condition_snapshot.category)},conditionsOf(d.posts.find(p=>p.id===r.post_id)!))}:undefined,cancellationReason:r.cancellation_reason || undefined}));
  d.appointments=list('appointments').map(a=>{
    const p=d.posts.find(p=>p.id===a.post_id);const other=a.host_id===userId?a.guest_id:a.host_id;
    return {id:a.id,postId:a.post_id,scheduledAt:a.starts_at,endsAt:a.ends_at,participantIds:[a.host_id,a.guest_id],status:({confirmed:'매칭 확정',completed:'동행 완료',cancelled:'동행 취소'}[a.status]),dDay:a.status==='completed'?'완료됨':'확정',appointmentBadge:'1:1 동행',title:p?.title || '종료된 공고',dateTime:formatMeetupRange(a.starts_at,a.ends_at),location:a.public_location,partnerName:display(other),partnerAvatar:avatar(other),partnerRating:0,partnerBio:profile(other)?.bio || '',menuRecommendation:'',addressDetail:p?.secretLocation || '',confirmedGuests:2,totalGuests:2,companionType:'free' as const,cancellation:a.cancelled_by?{actorId:a.cancelled_by,reason:a.cancellation_reason,createdAt:a.cancelled_at}:undefined};
  });
  d.rooms=list('chat_rooms').map(c=>{
    const r=list('join_requests').find(r=>r.id===c.request_id);const a=list('appointments').find(a=>a.request_id===c.request_id);
    const messages=list('chat_messages').filter(m=>m.room_id===c.id).map(m=>({id:m.id,senderId:m.sender_id || 'system',text:m.body,createdAt:m.created_at}));
    const proposals=list('schedule_proposals').filter(s=>s.appointment_id===a?.id).map(s=>({id:s.id,senderId:s.proposer_id,text:'일정·장소 변경 제안',createdAt:s.created_at,proposal:{id:s.id,proposerName:display(s.proposer_id),startsAt:s.starts_at,endsAt:s.ends_at,newDateTime:formatMeetupRange(s.starts_at,s.ends_at),newLocation:s.proposed_location,status:s.status==='cancelled'?'rejected':s.status}}));
    return {id:c.id,requestId:r?.id,postId:r?.post_id,postTitle:d.posts.find(p=>p.id===r?.post_id)?.title || '종료된 공고',appointmentId:a?.id,members:[r?.host_id,r?.requester_id].filter(Boolean).map(id=>({id,displayName:display(id),avatar:avatar(id)})),messages:[...messages,...proposals].sort((a,b)=>a.createdAt.localeCompare(b.createdAt)),draft:''};
  });
  d.notifications=list('notifications').map(n=>{const target=n.invitation_id?['invitation',n.invitation_id]:n.room_id?['room',n.room_id]:n.appointment_id?['appointment',n.appointment_id]:n.post_id?['post',n.post_id]:n.review_id?['review',n.review_id]:[];return {id:n.id,recipientId:n.recipient_id,title:n.title,description:n.description,type:n.type,time:date(n.created_at),createdAt:n.created_at,read:!!n.read_at,roomId:n.room_id || undefined,targetType:target[0],targetId:target[1]};});
  d.favorites=list('favorite_friends').map(f=>({ownerId:f.owner_id,targetId:f.target_id,savedAt:f.saved_at,notifyNewPosts:f.notify_new_posts}));
  d.invitations=list('invitations').map(i=>({id:i.id,postId:i.post_id,senderId:i.sender_id,recipientId:i.recipient_id,receivedAt:i.received_at,status:i.status,viewedAt:i.viewed_at || undefined}));
  d.completions=list('completion_confirmations').map(c=>({appointmentId:c.appointment_id,userId:c.user_id,confirmedAt:c.confirmed_at}));
  d.appointmentReviews=list('appointment_reviews').map(r=>({id:r.id,appointmentId:r.appointment_id,reviewerId:r.reviewer_id,revieweeId:r.reviewee_id,rating:r.rating,positiveItems:r.positive_items,negativeItems:r.negative_items,comment:r.comment,submittedAt:r.submitted_at,variant:'A'}));
  d.notificationSettings=list('notification_settings').map(s=>({userId:s.user_id,strangerInvitations:s.stranger_invitations}));
  d.blocks=list('user_blocks').map(b=>({blockerId:b.blocker_id,blockedId:b.blocked_id,createdAt:b.created_at}));
  d.activeUserId=userId;return d;
}
