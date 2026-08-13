import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';

export function ProviderRoleSelect() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Icon name="stethoscope" size={26} className="text-white" />
        </div>
        <div>
          <span className="text-2xl font-extrabold text-primary block leading-none">MediCare+</span>
          <span className="text-xs text-ink-muted font-semibold">Provider</span>
        </div>
      </div>

      <h1 className="text-4xl font-extrabold text-ink leading-[1.15] mb-2">
        Choose your<br />role
      </h1>
      <p className="text-ink-secondary text-[15px] leading-relaxed mb-8">
        Sign in as a doctor or an ambulance<br />driver to access your workspace.
      </p>

      <div className="space-y-4">
        {/* Doctor card */}
        <button
          onClick={() => navigate('/provider/login')}
          className="w-full bg-white rounded-2xl p-5 border-2 border-surface-dark active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <Icon name="stethoscope" size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink text-lg leading-tight">Doctor Portal</p>
              <p className="text-sm text-ink-muted mt-0.5">Manage appointments, patients & prescriptions</p>
            </div>
            <Icon name="chevron-right" size={22} className="text-ink-light shrink-0" />
          </div>
        </button>

        {/* Ambulance card */}
        <button
          onClick={() => navigate('/provider/ambulance/login')}
          className="w-full bg-white rounded-2xl p-5 border-2 border-surface-dark active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-error-50 flex items-center justify-center shrink-0">
              <Icon name="ambulance" size={28} className="text-error" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink text-lg leading-tight">Ambulance Driver</p>
              <p className="text-sm text-ink-muted mt-0.5">Receive emergency calls & navigate trips</p>
            </div>
            <Icon name="chevron-right" size={22} className="text-ink-light shrink-0" />
          </div>
        </button>
      </div>

      <p className="text-center mt-8 text-sm text-ink-secondary">
        Are you a patient?{' '}
        <button onClick={() => navigate('/')} className="font-bold text-primary">
          Patient Login
        </button>
      </p>

      <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-ink-light">
        <Icon name="shield-check" size={14} className="text-success" />
        HIPAA-compliant secure portal
      </div>
    </div>
  );
}
