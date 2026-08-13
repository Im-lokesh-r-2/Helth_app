import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { useAuth } from '@/lib/auth';

export function PatientLogin() {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);
    if (!email || !password) return;
    if (mode === 'signup' && (!name || !phone)) return;
    setLoading(true);
    if (mode === 'login') {
      const { error } = await signIn(email, password);
      if (error) { setError(error); setLoading(false); return; }
      navigate('/patient/home');
    } else {
      const { error } = await signUp(email, password, name, phone, 'patient');
      if (error) { setError(error); setLoading(false); return; }
      navigate('/patient/home');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col px-6 pt-16 pb-8">
      <div className="flex items-center gap-3 mb-10">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
          <Icon name="stethoscope" size={26} className="text-white" />
        </div>
        <span className="text-2xl font-extrabold text-primary">MediCare+</span>
      </div>

      <h1 className="text-4xl font-extrabold text-ink leading-[1.15] mb-2">
        {mode === 'login' ? 'Welcome\nBack!' : 'Create\nAccount'}
      </h1>
      <p className="text-ink-secondary text-[15px] leading-relaxed mb-8 whitespace-pre-line">
        {mode === 'login'
          ? 'Login to access your\nhealthcare services'
          : 'Sign up to start booking\nconsultations'}
      </p>

      {error && (
        <div className="chip bg-error-50 text-error mb-4">{error}</div>
      )}

      {mode === 'signup' && (
        <div className="mb-4">
          <label className="font-semibold text-sm text-ink mb-2 block">Full Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="input-field"
          />
        </div>
      )}

      <label className="font-semibold text-sm text-ink mb-2 block">Email</label>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@email.com"
        className="input-field mb-4"
      />

      {mode === 'signup' && (
        <div className="mb-4">
          <label className="font-semibold text-sm text-ink mb-2 block">Phone Number</label>
          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 bg-primary-50 rounded-lg px-3 py-2 text-sm font-semibold text-primary">
              {'\uD83C\uDDEE\uD83C\uDDF3 +91'}
            </div>
            <input
              type="tel"
              inputMode="numeric"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              placeholder="Enter mobile number"
              className="input-field pl-[100px]"
            />
          </div>
        </div>
      )}

      <label className="font-semibold text-sm text-ink mb-2 block">Password</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter password"
        className="input-field mb-6"
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !email || !password || (mode === 'signup' && (!name || !phone))}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {loading ? (
          <Icon name="loader" size={20} className="animate-spin" />
        ) : (
          <>
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
            <Icon name="arrow-right" size={18} />
          </>
        )}
      </button>

      <p className="text-center mt-8 text-sm text-ink-secondary">
        {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
        <button
          onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
          className="font-bold text-primary"
        >
          {mode === 'login' ? 'Sign Up' : 'Sign In'}
        </button>
      </p>

      <div className="flex items-center justify-center gap-1.5 mt-6 text-xs text-ink-light">
        <Icon name="shield-check" size={14} className="text-success" />
        Your data is 100% secure with us
      </div>
    </div>
  );
}
