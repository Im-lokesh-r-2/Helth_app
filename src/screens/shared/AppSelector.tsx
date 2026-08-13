import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';

export function AppSelector() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Icon name="stethoscope" size={26} className="text-white" />
        </div>
        <span className="text-2xl font-extrabold text-primary">MediCare+</span>
      </div>

      <h1 className="text-4xl font-extrabold text-ink leading-[1.15] mb-2">
        Your health,<br />one tap away
      </h1>
      <p className="text-ink-secondary text-[15px] leading-relaxed mb-10">
        Book doctors, order medicines, call ambulances,<br />and manage your healthcare — all in one app.
      </p>

      <div className="space-y-4">
        <button
          onClick={() => navigate('/patient/login')}
          className="w-full bg-white rounded-2xl p-5 border-2 border-surface-dark active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-50 flex items-center justify-center shrink-0">
              <Icon name="heart" size={28} className="text-primary" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink text-lg leading-tight">Patient App</p>
              <p className="text-sm text-ink-muted mt-0.5">Book consultations, track health & more</p>
            </div>
            <Icon name="chevron-right" size={22} className="text-ink-light shrink-0" />
          </div>
        </button>

        <button
          onClick={() => navigate('/provider/login')}
          className="w-full bg-white rounded-2xl p-5 border-2 border-surface-dark active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-secondary-50 flex items-center justify-center shrink-0">
              <Icon name="stethoscope" size={28} className="text-secondary" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink text-lg leading-tight">Provider Portal</p>
              <p className="text-sm text-ink-muted mt-0.5">For doctors & ambulance drivers</p>
            </div>
            <Icon name="chevron-right" size={22} className="text-ink-light shrink-0" />
          </div>
        </button>

        <button
          onClick={() => navigate('/admin/login')}
          className="w-full bg-white rounded-2xl p-5 border-2 border-surface-dark active:scale-[0.98] transition-transform text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center shrink-0">
              <Icon name="shield-check" size={28} className="text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-extrabold text-ink text-lg leading-tight">Admin Dashboard</p>
              <p className="text-sm text-ink-muted mt-0.5">Approve providers & oversee operations</p>
            </div>
            <Icon name="chevron-right" size={22} className="text-ink-light shrink-0" />
          </div>
        </button>
      </div>

      <div className="flex items-center justify-center gap-1.5 mt-auto pt-8 text-xs text-ink-light">
        <Icon name="shield-check" size={14} className="text-success" />
        HIPAA-compliant secure platform
      </div>
    </div>
  );
}
