import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function TestCloudAuthModal({isOpen,onClose}:{isOpen:boolean;onClose:()=>void}) {
 const [phone,setPhone]=useState('01000000001');const [code,setCode]=useState('');const [busy,setBusy]=useState(false);const [error,setError]=useState('');
 if(!isOpen)return null;
 return <div role="dialog" aria-modal="true" aria-label="테스트 계정 로그인" className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"><form className="w-full max-w-md bg-white rounded-3xl p-6 space-y-4" onSubmit={async event=>{event.preventDefault();if(busy||!supabase)return;setBusy(true);setError('');try{
  const {data,error}=await supabase.functions.invoke('prototype-login',{body:{phone,code}});
  if(error){const info=await error.context?.json?.().catch(()=>null);throw new Error(info?.error || '로그인에 실패했어요.');}
  const result=await supabase.auth.setSession(data);if(result.error)throw result.error;
  setCode(''); // The verified auth observer closes the modal and preserves the return route.
 }catch(e){setError(e instanceof Error?e.message:'다시 시도해 주세요.');}finally{setBusy(false);}}}>
 <h2 className="text-lg font-bold">DB 테스트 계정 로그인</h2>
 <p className="text-sm text-gray-600">공용 테스트 계정입니다. 실제 문자는 발송하지 않으며 개인정보는 입력하지 마세요. 작성한 테스트 데이터는 서버에 저장됩니다.</p>
 <label className="block text-sm">테스트 번호<select aria-label="테스트 번호" className="w-full border rounded-xl p-3 mt-1" value={phone} onChange={e=>setPhone(e.target.value)} disabled={busy}>{['01000000001','01000000002','01000000003'].map((p,i)=><option key={p} value={p}>테스트 {i+1} · {p}</option>)}</select></label>
 <label className="block text-sm">테스트 인증번호<input aria-label="테스트 인증번호" inputMode="numeric" maxLength={6} className="w-full border rounded-xl p-3 mt-1" value={code} onChange={e=>setCode(e.target.value)} disabled={busy}/></label>
 <p className="text-xs text-gray-500">인증번호: 123456 · SMS 본인인증이 아닙니다.</p>
 {error&&<p role="alert" className="text-sm text-red-600">{error}</p>}
 <button className="w-full bg-purple-600 text-white rounded-xl p-3 font-bold disabled:opacity-50" disabled={busy||code.length!==6}>{busy?'로그인 중…':'테스트 로그인'}</button>
 <button type="button" onClick={onClose} disabled={busy} className="w-full text-sm p-2">닫기</button>
 </form></div>;
}
