import { useNavigate, useLocation } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';

const patientNav = [
  { id: '/patient/home', label: 'Home', icon: 'home' },
  { id: '/patient/appointments', label: 'Appts', icon: 'calendar-check' },
  { id: '/patient/prescriptions', label: 'Rx', icon: 'file-text' },
  { id: '/patient/profile', label: 'Profile', icon: 'circle-user' },
];

const doctorNav = [
  { id: '/provider/dashboard', label: 'Home', icon: 'home' },
  { id: '/provider/patients', label: 'Patients', icon: 'users' },
  { id: '/provider/prescription/new', label: 'Rx', icon: 'file-text' },
];

const ambulanceNav = [
  { id: '/provider/ambulance', label: 'Home', icon: 'ambulance' },
];

export function PatientBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-2 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {patientNav.map((item) => {
          const isActive = pathname === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} className="flex flex-col items-center gap-0.5 py-2 px-3 transition-all">
              <Icon name={item.icon} size={22} className={isActive ? 'text-primary' : 'text-ink-light'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] font-semibold', isActive ? 'text-primary' : 'text-ink-light')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function DoctorBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-2 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {doctorNav.map((item) => {
          const isActive = pathname === item.id || (item.id === '/provider/dashboard' && pathname.startsWith('/provider/prescription'));
          return (
            <button key={item.id} onClick={() => navigate(item.id)} className="flex flex-col items-center gap-0.5 py-2 px-3 transition-all">
              <Icon name={item.icon} size={22} className={isActive ? 'text-primary' : 'text-ink-light'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] font-semibold', isActive ? 'text-primary' : 'text-ink-light')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function AmbulanceBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-2 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {ambulanceNav.map((item) => {
          const isActive = pathname === item.id;
          return (
            <button key={item.id} onClick={() => navigate(item.id)} className="flex flex-col items-center gap-0.5 py-2 px-3 transition-all">
              <Icon name={item.icon} size={22} className={isActive ? 'text-error' : 'text-ink-light'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={cn('text-[10px] font-semibold', isActive ? 'text-error' : 'text-ink-light')}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
