import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader, StatusBadge, EmptyState } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { cn, formatINR } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Appointment, Prescription, LabReport, Doctor, Profile, ChatMessage } from '@/lib/types';

export function PatientAppointments() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState<(Appointment & { doctor?: Doctor })[]>([]);
  const [past, setPast] = useState<(Appointment & { doctor?: Doctor })[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data } = await supabase.from('appointments').select('*, doctor:doctors(*)').eq('patient_id', profile.id).order('created_at', { ascending: false });
      const all = (data as (Appointment & { doctor: Doctor })[]) ?? [];
      setUpcoming(all.filter((a) => a.status === 'upcoming' || a.status === 'in-progress'));
      setPast(all.filter((a) => a.status === 'completed' || a.status === 'cancelled'));
    })();
  }, [profile]);

  const list = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="screen-container">
      <ScreenHeader title="My Appointments" onBack={() => navigate('/patient/home')} />
      <div className="px-5 pt-3">
        <div className="flex gap-1 bg-surface-light rounded-xl p-1">
          {(['upcoming', 'past'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all', tab === t ? 'bg-white text-primary shadow-soft' : 'text-ink-muted')}>
              {t} ({t === 'upcoming' ? upcoming.length : past.length})
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4 space-y-3">
        {list.length === 0 ? (
          <EmptyState icon="calendar" title="No appointments" subtitle="Book a consultation to see it here." actionLabel="Find Doctors" onAction={() => navigate('/patient/doctors')} />
        ) : (
          list.map((a) => (
            <div key={a.id} className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center shrink-0">
                  <Icon name="user" size={24} className="text-ink-light" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-ink truncate">{a.doctor?.specialty || 'Doctor'}</p>
                  <p className="text-xs text-primary font-semibold">{a.doctor?.qualifications || ''}</p>
                </div>
                <StatusBadge status={a.status} compact />
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-surface-light">
                <div className="flex items-center gap-1.5"><Icon name="calendar" size={14} className="text-ink-muted" /><span className="text-xs font-medium text-ink-secondary">{a.date}</span></div>
                <div className="flex items-center gap-1.5"><Icon name="clock" size={14} className="text-ink-muted" /><span className="text-xs font-medium text-ink-secondary">{a.time}</span></div>
                <div className="flex items-center gap-1.5"><Icon name={a.type === 'video' ? 'video' : 'building'} size={14} className="text-ink-muted" /><span className="text-xs font-medium text-ink-secondary capitalize">{a.type}</span></div>
              </div>
              {a.reason && <p className="text-xs text-ink-muted mt-2">Reason: {a.reason}</p>}
              {a.status === 'upcoming' && (
                <div className="flex gap-2.5 mt-3">
                  <button className="flex-1 btn-secondary text-sm py-2.5">Reschedule</button>
                  <button className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5"><Icon name="video" size={16} />Join</button>
                </div>
              )}
              {a.status === 'completed' && (
                <div className="flex gap-2.5 mt-3">
                  <button onClick={() => navigate('/patient/prescriptions')} className="flex-1 btn-secondary text-sm py-2.5 flex items-center justify-center gap-1.5"><Icon name="file-text" size={16} />View Prescription</button>
                  <button onClick={() => navigate(`/patient/chat/${a.doctor?.user_id || ''}`)} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5"><Icon name="message-circle" size={16} />Follow Up</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
      <div className="h-24" />
    </div>
  );
}

export function PatientPrescriptions() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [selected, setSelected] = useState<string | null>(null);
  const [rxList, setRxList] = useState<(Prescription & { doctor_profile?: Profile })[]>([]);
  const [labs, setLabs] = useState<LabReport[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: rx } = await supabase.from('prescriptions').select('*, doctor_profile:profiles!fk_prescriptions_doctor_id(*)').eq('patient_id', profile.id).order('created_at', { ascending: false });
      setRxList((rx as (Prescription & { doctor_profile: Profile })[]) ?? []);
      const { data: lr } = await supabase.from('lab_reports').select('*').eq('patient_id', profile.id).order('created_at', { ascending: false });
      setLabs((lr as LabReport[]) ?? []);
    })();
  }, [profile]);

  const rx = rxList.find((p) => p.id === selected);

  if (rx) {
    const date = new Date(rx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    return (
      <div className="screen-container">
        <ScreenHeader title="Prescription" subtitle={date} onBack={() => setSelected(null)} rightAction={<button className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center"><Icon name="download" size={18} className="text-ink" /></button>} />
        <div className="px-5 pt-2 space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-3 pb-3 border-b border-surface-light">
              <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center"><Icon name="stethoscope" size={22} className="text-primary" /></div>
              <div><p className="font-bold text-ink">{rx.doctor_profile?.full_name || 'Doctor'}</p><p className="text-xs text-ink-muted">{date}</p></div>
            </div>
            <div className="pt-3"><p className="text-xs font-bold text-ink-muted uppercase mb-1">Diagnosis</p><p className="text-sm text-ink-secondary">{rx.diagnosis}</p></div>
          </div>
          <div className="card p-4">
            <p className="font-bold text-ink mb-3">Medicines</p>
            <div className="space-y-3">
              {rx.medicines.map((m, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-secondary-50 flex items-center justify-center shrink-0"><Icon name="pill" size={16} className="text-secondary" /></div>
                  <div className="flex-1"><p className="font-semibold text-sm text-ink">{m.name}</p><p className="text-xs text-ink-muted">{m.dosage} · {m.duration}</p>{m.instructions && <p className="text-xs text-ink-secondary mt-0.5">{m.instructions}</p>}</div>
                </div>
              ))}
            </div>
          </div>
          {rx.notes && <div className="card p-4"><p className="font-bold text-ink mb-2">Notes</p><p className="text-sm text-ink-secondary leading-relaxed">{rx.notes}</p></div>}
        </div>
        <div className="h-24" />
      </div>
    );
  }

  return (
    <div className="screen-container">
      <ScreenHeader title="Prescriptions" onBack={() => navigate('/patient/home')} />
      <div className="px-5 pt-2 space-y-3">
        {rxList.length === 0 ? (
          <EmptyState icon="file-text" title="No prescriptions yet" subtitle="Your prescriptions will appear here after consultations." />
        ) : (
          rxList.map((p) => {
            const date = new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
            return (
              <button key={p.id} onClick={() => setSelected(p.id)} className="card p-4 w-full text-left active:scale-[0.98] transition-transform">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center shrink-0"><Icon name="file-text" size={22} className="text-primary" /></div>
                  <div className="flex-1 min-w-0"><p className="font-bold text-ink truncate">{p.diagnosis}</p><p className="text-xs text-ink-muted">{p.doctor_profile?.full_name || 'Doctor'} · {date}</p></div>
                  <Icon name="chevron-right" size={20} className="text-ink-light" />
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-surface-light"><Icon name="pill" size={14} className="text-secondary" /><span className="text-xs text-ink-secondary">{p.medicines.length} medicines prescribed</span></div>
              </button>
            );
          })
        )}
      </div>
      <div className="px-5 pt-6">
        <h3 className="section-title mb-3">Lab Reports</h3>
        <div className="space-y-2.5">
          {labs.length === 0 ? (
            <EmptyState icon="flask-conical" title="No lab reports" subtitle="Your lab test results will appear here." />
          ) : (
            labs.map((r) => {
              const date = new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
              return (
                <div key={r.id} className="card p-3.5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning-50 flex items-center justify-center shrink-0"><Icon name="flask-conical" size={20} className="text-warning-600" /></div>
                  <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-ink truncate">{r.test_name}</p><p className="text-xs text-ink-muted">{r.lab_name} · {date}</p></div>
                  <StatusBadge status={r.status} compact />
                  {r.status === 'ready' && <button className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center"><Icon name="download" size={16} className="text-primary" /></button>}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div className="h-24" />
    </div>
  );
}

export function PatientChat() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: u } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
      setOtherUser(u as Profile | null);
    })();
  }, [id]);

  useEffect(() => {
    if (!profile || !id) return;
    (async () => {
      const { data } = await supabase.from('chat_messages').select('*').or(`sender_id.eq.${profile.id},receiver_id.eq.${profile.id}`).order('created_at', { ascending: true });
      const filtered = ((data as ChatMessage[]) ?? []).filter((m) => (m.sender_id === profile.id && m.receiver_id === id) || (m.sender_id === id && m.receiver_id === profile.id));
      setMessages(filtered);
    })();
    const channel = supabase.channel('chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
      const msg = payload.new as ChatMessage;
      if ((msg.sender_id === profile.id && msg.receiver_id === id) || (msg.sender_id === id && msg.receiver_id === profile.id)) {
        setMessages((m) => [...m, msg]);
      }
    }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile, id]);

  useEffect(() => { scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight); }, [messages]);

  const send = async () => {
    if (!input.trim() || !profile || !id) return;
    const { data } = await supabase.from('chat_messages').insert({ sender_id: profile.id, receiver_id: id, text: input }).select().single();
    if (data) setMessages((m) => [...m, data as ChatMessage]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <div className="flex items-center gap-3 px-5 py-3 bg-white border-b border-surface-dark sticky top-0 z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center shrink-0"><Icon name="arrow-left" size={20} className="text-ink" /></button>
        <div className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center"><Icon name="user" size={20} className="text-ink-light" /></div>
        <div className="flex-1 min-w-0"><p className="font-bold text-ink text-sm truncate">{otherUser?.full_name || 'Doctor'}</p><span className="flex items-center gap-1 text-xs text-success"><span className="w-1.5 h-1.5 rounded-full bg-success" />Online</span></div>
        <button className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"><Icon name="phone" size={18} className="text-primary" /></button>
        <button className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"><Icon name="video" size={18} className="text-primary" /></button>
      </div>
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
        <div className="text-center"><span className="chip bg-surface-light text-ink-muted">Today</span></div>
        {messages.map((m) => {
          const isMe = m.sender_id === profile?.id;
          const time = new Date(m.created_at).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
          return (
            <div key={m.id} className={cn('flex', isMe ? 'justify-end' : 'justify-start')}>
              <div className={cn('max-w-[75%] rounded-2xl px-3.5 py-2.5 animate-slide-up', isMe ? 'bg-primary text-white rounded-br-md' : 'bg-white text-ink rounded-bl-md shadow-soft')}>
                <p className="text-sm leading-relaxed">{m.text}</p>
                <p className={cn('text-[10px] mt-1', isMe ? 'text-white/60' : 'text-ink-light')}>{time}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="bg-white border-t border-surface-dark px-3 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))] flex items-center gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a message..." className="flex-1 bg-surface-light rounded-full px-4 py-2.5 text-sm outline-none" />
        <button onClick={send} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 active:scale-90 transition-transform"><Icon name="send" size={18} className="text-white" /></button>
      </div>
    </div>
  );
}

export function PatientProfile() {
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();

  const menuItems = [
    { icon: 'user', label: 'Personal Information', action: () => {} },
    { icon: 'calendar-check', label: 'My Appointments', action: () => navigate('/patient/appointments') },
    { icon: 'file-text', label: 'Prescriptions', action: () => navigate('/patient/prescriptions') },
    { icon: 'flask-conical', label: 'Lab Reports', action: () => navigate('/patient/prescriptions') },
    { icon: 'heart', label: 'Favorite Doctors', action: () => {} },
    { icon: 'wallet', label: 'Payment Methods', action: () => {} },
    { icon: 'shield-check', label: 'Privacy & Security', action: () => {} },
    { icon: 'settings', label: 'Settings', action: () => {} },
  ];

  return (
    <div className="screen-container">
      <ScreenHeader title="Profile" onBack={() => navigate('/patient/home')} rightAction={<button className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center"><Icon name="edit" size={18} className="text-ink" /></button>} />
      <div className="px-5 pt-2">
        <div className="card p-5 flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-surface-light flex items-center justify-center ring-2 ring-primary-200 ring-offset-2"><Icon name="user" size={36} className="text-ink-light" /></div>
          <h2 className="font-extrabold text-lg text-ink mt-3">{profile?.full_name || 'User'}</h2>
          <p className="text-sm text-ink-muted">{profile?.phone ? `+91 ${profile.phone}` : ''}</p>
          <p className="text-xs text-ink-light mt-0.5">{profile?.email || ''}</p>
          <div className="flex gap-2 mt-3">
            {profile?.age && <span className="chip bg-primary-50 text-primary"><Icon name="user" size={12} />{profile.age} yrs</span>}
            {profile?.gender && <span className="chip bg-secondary-50 text-secondary"><Icon name="user" size={12} />{profile.gender}</span>}
            {profile?.blood_group && <span className="chip bg-error-100 text-error-700"><Icon name="heart" size={12} />{profile.blood_group}</span>}
          </div>
        </div>
      </div>
      <div className="px-5 pt-4">
        <div className="card overflow-hidden">
          {menuItems.map((m, i) => (
            <button key={m.label} onClick={m.action} className={cn('w-full flex items-center gap-3 px-4 py-3.5 text-left active:bg-surface-light transition-colors', i !== menuItems.length - 1 && 'border-b border-surface-light')}>
              <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0"><Icon name={m.icon} size={18} className="text-primary" /></div>
              <span className="flex-1 font-semibold text-sm text-ink">{m.label}</span>
              <Icon name="chevron-right" size={18} className="text-ink-light" />
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 pt-4">
        <button onClick={async () => { await signOut(); navigate('/'); }} className="w-full bg-error-50 text-error font-bold rounded-xl py-3.5 flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
          <Icon name="log-out" size={18} />Logout
        </button>
      </div>
      <p className="text-center text-xs text-ink-light mt-6">MediCare+ v1.0.0</p>
      <div className="h-24" />
    </div>
  );
}
