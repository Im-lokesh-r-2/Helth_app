import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/auth';

export function Splash() {
  const navigate = useNavigate();
  const { session, profile, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (session && profile) {
      if (profile.role === 'admin') navigate('/admin', { replace: true });
      else if (profile.role === 'patient') navigate('/patient/home', { replace: true });
      else if (profile.role === 'doctor' && profile.is_approved) navigate('/provider/dashboard', { replace: true });
      else if (profile.role === 'ambulance' && profile.is_approved) navigate('/provider/ambulance', { replace: true });
      else navigate('/provider/pending', { replace: true });
    } else {
      navigate('/select', { replace: true });
    }
  }, [session, profile, loading, navigate]);

  return (
    <div className="min-h-screen bg-primary flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-3xl bg-white/15 backdrop-blur flex items-center justify-center mb-4 animate-pulse-slow">
        <Icon name="stethoscope" size={44} className="text-white" />
      </div>
      <span className="text-3xl font-extrabold text-white tracking-tight">MediCare+</span>
      <div className="mt-8">
        <Icon name="loader" size={28} className="text-white/70 animate-spin" />
      </div>
    </div>
  );
}
