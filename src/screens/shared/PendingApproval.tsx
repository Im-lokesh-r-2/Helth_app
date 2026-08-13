import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/auth';

export function PendingApproval() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 text-center">
      <div className="w-20 h-20 rounded-2xl bg-warning-50 flex items-center justify-center mb-5">
        <Icon name="clock-3" size={44} className="text-warning-600" />
      </div>
      <h2 className="text-xl font-extrabold text-ink mb-2">Awaiting Approval</h2>
      <p className="text-sm text-ink-muted max-w-xs leading-relaxed">
        Your provider account is pending admin approval. You'll get access to your dashboard once an administrator verifies and approves your account.
      </p>

      <div className="card p-4 w-full max-w-sm mt-6 text-left">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-surface-light flex items-center justify-center">
            <Icon name="user" size={22} className="text-ink-light" />
          </div>
          <div>
            <p className="font-bold text-ink text-sm">{profile?.full_name || 'Provider'}</p>
            <p className="text-xs text-ink-muted">{profile?.phone ? `+91 ${profile.phone}` : ''}</p>
          </div>
          <span className="chip bg-warning-100 text-warning-700 ml-auto">Pending</span>
        </div>
      </div>

      <button
        onClick={async () => { await signOut(); navigate('/select', { replace: true }); }}
        className="mt-8 text-sm font-bold text-error flex items-center gap-1.5"
      >
        <Icon name="log-out" size={16} />Sign Out
      </button>
    </div>
  );
}
