import { TestCloudAuthModal } from './TestCloudAuthModal';
import { usesPrototypeAuth } from '../utils/demoMode';
import { DemoAuthModal, type DemoAuthModalProps } from './DemoAuthModal';
import { SupabaseAuthModal } from './SupabaseAuthModal';
import type { AuthState } from '../auth/session';

export function AuthModal(props: DemoAuthModalProps & { auth: AuthState; onRetry: () => void }) {
  if (!usesPrototypeAuth() && import.meta.env.VITE_AUTH_MODE === 'supabase-test') return <TestCloudAuthModal {...props} />;
  return usesPrototypeAuth() ? <DemoAuthModal {...props} /> : <SupabaseAuthModal {...props} />;
}
