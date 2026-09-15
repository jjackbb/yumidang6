"""Live synthetic-account integration check. Uses public keys only; never logs sessions."""
import json, os, pathlib, urllib.request, urllib.error, datetime, uuid
settings={}
for line in pathlib.Path('.env.local').read_text().splitlines():
    if '=' in line and not line.lstrip().startswith('#'):
        key,value=line.split('=',1); settings[key.strip()]=value.strip().strip('\"\x27')
BASE=settings['VITE_SUPABASE_URL']; KEY=settings['VITE_SUPABASE_PUBLISHABLE_KEY']
assert BASE=='https://fiaxchvyywpqbwbcuzfz.supabase.co'
checks=[]; sessions=[]; created=[]
def request(path,body=None,token=None):
    headers={'apikey':KEY,'Content-Type':'application/json'}
    if token: headers['Authorization']='Bearer '+token
    req=urllib.request.Request(BASE+path,data=json.dumps(body).encode() if body is not None else None,headers=headers)
    try:
        with urllib.request.urlopen(req,timeout=40) as res: return res.status,json.load(res)
    except urllib.error.HTTPError as e:
        try: detail=json.load(e)
        except Exception: detail={}
        return e.code,detail
def check(name,condition):
    checks.append({'name':name,'pass':bool(condition)})
    if not condition: raise AssertionError(name)
def command(index,action,data={},ok=True):
    status,result=request('/functions/v1/app-command',{'action':action,'data':data},sessions[index]['access_token'])
    if ok and status!=200: raise AssertionError(action+': '+str(result))
    return status,result.get('result',result)
try:
    status,_=request('/functions/v1/prototype-login',{'phone':'01099999999','code':'123456'})
    check('unknown phone rejected',status==401)
    status,_=request('/functions/v1/prototype-login',{'phone':'01000000001','code':'000000'})
    check('incorrect code rejected',status==401)
    status,_=request('/functions/v1/app-command',{'action':'sync'})
    check('missing session rejected',status==401)
    for index in range(1,4):
        status,result=request('/functions/v1/prototype-login',{'phone':f'0100000000{index}','code':'123456'})
        if status!=200: raise AssertionError('login failed: '+str(result))
        sessions.append(result)
        status,user=request('/auth/v1/user',token=result['access_token'])
        check(f'account {index} real Auth session',status==200 and user['app_metadata'].get('prototype_account') is True and not user.get('phone'))
        result['id']=user['id']
    now=datetime.datetime.now(datetime.timezone.utc);ts=lambda days,hours:(now+datetime.timedelta(days=days,hours=hours)).isoformat()
    post={'title':'[DB 연동 검증] 산책 동행 '+uuid.uuid4().hex[:6],'category':'산책','description':'자동 검증용 예시 공고입니다.','startsAt':ts(2,0),'endsAt':ts(2,1),'recruitmentEndsAt':ts(1,0),'publicLocation':'서울숲역','secretLocation':'검증용 상세 만남 위치','partnerGender':'any','tags':['테스트'],'companionType':'free'}
    _,result=command(0,'create_post',post);postid=result['id'];created.append(postid)
    status,posts=request('/rest/v1/meetup_posts?id=eq.'+postid+'&select=id,title')
    check('post persisted and publicly readable',status==200 and len(posts)==1)
    status,_=request('/rest/v1/rpc/app_command',{'p_actor':sessions[0]['id'],'p_action':'delete_post','p_data':{'id':postid}},sessions[1]['access_token'])
    check('client cannot impersonate actor via RPC',status in (401,403,404))
    status,_=request('/rest/v1/meetup_posts',{'author_id':sessions[1]['id'],'title':'bypass'},sessions[1]['access_token'])
    check('direct REST writes denied',status in (401,403))
    status,_=command(1,'update_post',{**post,'id':postid},ok=False);check('nonowner edit denied',status==400)
    _,result=command(1,'request',{'postId':postid,'message':'테스트 신청입니다.'});rid=result['id'];room=result['roomId']
    status,rows=request('/rest/v1/meetup_post_locations?post_id=eq.'+postid,sessions and None,sessions[1]['access_token'])
    check('exact location hidden before acceptance',status==200 and rows==[])
    status,_=command(2,'accept',{'id':rid},ok=False);check('outsider accept denied',status==400)
    status,_=command(2,'message',{'roomId':room,'text':'침입'},ok=False);check('outsider message denied',status==400)
    status,rows=request('/rest/v1/chat_rooms?id=eq.'+room,token=sessions[2]['access_token']);check('outsider room read hidden',status==200 and rows==[])
    command(0,'update_post',{**post,'id':postid,'revision':1,'description':'변경된 설명'})
    status,_=command(0,'accept',{'id':rid},ok=False);check('accept blocked until reconfirmed',status==400)
    command(1,'reconfirm',{'id':rid,'revision':2,'agree':True})
    _,result=command(0,'accept',{'id':rid});aid=result['id'];check('appointment and same room created',result['roomId']==room)
    status,rows=request('/rest/v1/meetup_post_locations?post_id=eq.'+postid,token=sessions[1]['access_token']);check('participant sees exact location after acceptance',status==200 and len(rows)==1)
    status,rows=request('/rest/v1/meetup_post_locations?post_id=eq.'+postid,token=sessions[2]['access_token']);check('outsider exact location remains hidden',status==200 and rows==[])
    command(1,'message',{'roomId':room,'text':'서버 저장 검증 메시지','messageId':str(uuid.uuid4())})
    status,rows=request('/rest/v1/chat_messages?room_id=eq.'+room,token=sessions[0]['access_token']);check('other account reads saved message',status==200 and any(r['body']=='서버 저장 검증 메시지' for r in rows))
    status,_=command(1,'complete',{'id':aid},ok=False);check('early completion rejected by server time',status==400)
    command(1,'favorite',{'targetId':sessions[0]['id'],'saved':True})
    status,rows=request('/rest/v1/favorite_friends?owner_id=eq.'+sessions[1]['id'],token=sessions[0]['access_token']);check('favorite owner is private',status==200 and rows==[])
    command(1,'cancel_appointment',{'id':aid,'reason':'자동 검증 종료'})
    status,_=command(1,'message',{'roomId':room,'text':'종료 뒤 전송'},ok=False);check('cancelled room is read-only',status==400)
    command(0,'delete_post',{'id':postid})
    command(1,'favorite',{'targetId':sessions[0]['id'],'saved':False})
finally:
    evidence={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'scope':'OBSERVED_REAL Supabase Auth, Edge Functions, PostgreSQL and RLS. Synthetic shared test accounts only.','checks':checks,'fixture_posts':created}
    pathlib.Path('docs/database/evidence/cloud-api.json').write_text(json.dumps(evidence,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({'checks':len(checks),'passed':sum(c['pass'] for c in checks),'fixture_posts':created},ensure_ascii=False))
