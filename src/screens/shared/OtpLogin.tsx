import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface OtpLoginProps {
  appType: 'patient' | 'provider';
  accent?: 'primary' | 'secondary';
  title: string;
  subtitle: string;
  homeRoute: string;
}

export function OtpLogin({ appType, accent = 'primary', title, subtitle, homeRoute }: OtpLoginProps) {
  const navigate = useNavigate();
  const { signInWithPhone, verifyOtp, refreshProfile } = useAuth();
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showName, setShowName] = useState(false);

  const accentBg = accent === 'secondary' ? 'bg-secondary' : 'bg-primary';
  const accentBgLight = accent === 'secondary' ? 'bg-secondary-50' : 'bg-primary-50';
  const accentText = accent === 'secondary' ? 'text-secondary' : 'text-primary';

  const fullPhone = `+91${phone}`;

  const handleSendOtp = async () => {
    setError(null);
    if (phone.length !== 10) return;
    setLoading(true);
    const { error } = await signInWithPhone(fullPhone);
    setLoading(false);
    if (error) { setError(error); return; }
    setStep('otp');
  };

  const handleVerify = async () => {
    setError(null);
    if (otp.length !== 6) return;
    setLoading(true);
    const { error } = await verifyOtp(fullPhone, otp);
    if (error) { setError(error); setLoading(false); return; }

    await refreshProfile();
    const { data: userSession } = await supabase.auth.getSession();
    const uid = userSession.session?.user.id;
    if (!uid) { setLoading(false); return; }

    const { data: existing } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
    const prof = existing as Profile | null;

    if (!prof) {
      const { data: userData } = await supabase.auth.getUser();
      const meta = userData.user?.user_metadata || {};
      const inferredRole = appType === 'provider' ? (meta.role || 'doctor') : 'patient';
      await supabase.from('profiles').upsert({
        id: uid,
        phone,
        full_name: name || meta.full_name || '',
        role: inferredRole,
        is_approved: inferredRole === 'patient',
      });
      await refreshProfile();
    }

    setLoading(false);
    if (appType === 'provider') {
      const { data: p } = await supabase.from('profiles').select('role, is_approved').eq('id', uid).maybeSingle();
      const rp = p as Profile | null;
      if (!rp || !rp.is_approved) { navigate('/provider/pending', { replace: true }); return; }
      if (rp.role === 'ambulance') { navigate('/provider/ambulance', { replace: true }); return; }
      navigate('/provider/dashboard', { replace: true }); return;
    }
    navigate(homeRoute, { replace: true });
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-10">
        <button onClick={() => navigate('/select')} className="w-10 h-10 rounded-xl bg-surface-light flex items-center justify-center">
          <Icon name="arrow-left" size={20} className="text-ink" />
        </button>
        <div className={`w-12 h-12 rounded-xl ${accentBg} flex items-center justify-center`}>
          <Icon name={appType === 'provider' ? 'stethoscope' : 'heart'} size={26} className="text-white" />
        </div>
      </div>

      <h1 className="text-4xl font-extrabold text-ink leading-[1.15] mb-2 whitespace-pre-line">
        {title}
      </h1>
      <p className="text-ink-secondary text-[15px] leading-relaxed mb-8 whitespace-pre-line">
        {subtitle}
      </p>

      {error && <div className="chip bg-error-50 text-error mb-4">{error}</div>}

      {step === 'phone' ? (
        <>
          {showName && (
            <div className="mb-4">
              <label className="font-semibold text-sm text-ink mb-2 block">Full Name (optional)</label>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter your name" className="input-field" />
            </div>
          )}

          <label className="font-semibold text-sm text-ink mb-2 block">Phone Number</label>
          <div className="relative mb-3">
            <div className={`absolute left-2 top-1/2 -translate-y-1/2 ${accentBgLight} rounded-lg px-3 py-2 text-sm font-semibold ${accentText}`}>
              {'\uD83C\uDDEE\uD83C\uDDF3 +91'}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              className="input-field pl-[100px]"
              onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
            />
          </div>
          <button onClick={() => setShowName(!showName)} className="text-xs text-ink-muted mb-4">
            {showName ? 'Hide name field' : '+ Add name (first time?)'}
          </button>
          <button onClick={handleSendOtp} disabled={loading || phone.length !== 10} className={`btn-primary w-full flex items-center justify-center gap-2 ${accent === 'secondary' ? 'bg-secondary hover:bg-secondary-600' : ''}`}>
            {loading ? <Icon name="loader" size={20} className="animate-spin" /> : <>Send OTP <Icon name="arrow-right" size={18} /></>}
          </button>
        </>
      ) : (
        <>
          <label className="font-semibold text-sm text-ink mb-2 block">Enter OTP</label>
          <p className="text-xs text-ink-muted mb-4">Sent to +91 {phone}. Enter the 6-digit code.</p>
          <input
            type="tel"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="------"
            className="input-field text-center text-2xl tracking-[0.5em] mb-6"
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            autoFocus
          />
          <button onClick={handleVerify} disabled={loading || otp.length !== 6} className={`btn-primary w-full flex items-center justify-center gap-2 ${accent === 'secondary' ? 'bg-secondary hover:bg-secondary-600' : ''}`}>
            {loading ? <Icon name="loader" size={20} className="animate-spin" /> : <>Verify & Continue <Icon name="arrow-right" size={18} /></>}
          </button>
          <button onClick={() => setStep('phone')} className="text-center mt-4 text-sm text-ink-secondary">
            <Icon name="arrow-left" size={14} className="inline mr-1" />Change number
          </button>
        </>
      )}

      <div className="flex items-center justify-center gap-1.5 mt-auto pt-8 text-xs text-ink-light">
        <Icon name="shield-check" size={14} className="text-success" />
        Your data is 100% secure with us
      </div>
    </div>
  );
}
