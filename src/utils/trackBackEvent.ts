import { supabase } from '../lib/supabase';

interface TrackBackParams {
  uiName: string;
  actionType?: 'back' | 'close';
  durationMs?: number;
  metadata?: Record<string, any>;
}

/**
 * 특정 UI에서 뒤로가기/닫기를 눌렀을 때 Supabase에 실시간으로 이벤트를 기록합니다.
 */
export const trackBackEvent = async ({
  uiName,
  actionType = 'back',
  durationMs,
  metadata = {},
}: TrackBackParams) => {
  try {
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData?.session?.user?.id || null;

    const { error } = await supabase.from('ui_back_events').insert({
      ui_name: uiName,
      action_type: actionType,
      duration_ms: durationMs ? Math.round(durationMs) : null,
      user_id: userId,
      metadata,
    });

    if (error) {
      console.warn('[Analytics] Failed to track back event:', error.message);
    } else {
      console.log(`[Analytics] ✅ Recorded back event: ${uiName} (${actionType}, ${durationMs || 0}ms)`);
    }
  } catch (err) {
    console.warn('[Analytics] Error tracking back event:', err);
  }
};
