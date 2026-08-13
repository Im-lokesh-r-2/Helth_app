import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScreenHeader, StatusBadge, Avatar, EmptyState } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { cn, formatINR } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Appointment, Doctor, Profile, Prescription, PrescriptionMedicine } from '@/lib/types';

export function ProviderDashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [tab, setTab] = useState<'overview' | 'requests'>('overview');
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [todayAppts, setTodayAppts] = useState<(Appointment & { patient?: Profile })[]>([]);
  const [pending, setPending] = useState<(Appointment & { patient?: Profile })[]>([]);
  const [totalPatients, setTotalPatients] = useState(0);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: doc } = await supabase.from('doctors').select('*').eq('user_id', profile.id).maybeSingle();
      setDoctor(doc as Doctor | null);
      if (doc) {
        const { data: appts } = await supabase.from('appointments').select('*, patient:profiles!fk_appointments_patient_id(*)').eq('doctor_id', doc.id).order('created_at', { ascending: false });
        const all = (appts as (Appointment & { patient: Profile })[]) ?? [];
        setTodayAppts(all.filter((a) => a.status === 'upcoming' || a.status === 'in-progress').slice(0, 5));
        setPending(all.filter((a) => a.status === 'pending'));
        const patientIds = new Set(all.map((a) => a.patient_id));
        setTotalPatients(patientIds.size);
      }
    })();
  }, [profile]);

  const handleApptStatus = async (id: string, status: 'upcoming' | 'cancelled') => {
    await supabase.from('appointments').update({ status }).eq('id', id);
    setPending((p) => p.filter((a) => a.id !== id));
  };

  const stats = [
    { icon: 'calendar-check', label: 'Today\u2019s Appointments', value: todayAppts.length, color: 'text-primary', bg: 'bg-primary-50' },
    { icon: 'users', label: 'Total Patients', value: totalPatients, color: 'text-secondary', bg: 'bg-secondary-50' },
    { icon: 'star', label: 'Rating', value: doctor?.rating.toFixed(1) ?? '5.0', color: 'text-warning-600', bg: 'bg-warning-50' },
    { icon: 'trending-up', label: 'Total Appointments', value: todayAppts.length + totalPatients, color: 'text-accent', bg: 'bg-accent-50' },
  ];

  return (
    <div className="screen-container">
      <div className="px-5 pt-4 pb-3 bg-white flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center"><Icon name="stethoscope" size={24} className="text-primary" /></div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-ink-muted">Welcome back,</p>
          <h2 className="font-bold text-ink text-[15px] truncate">{profile?.full_name || 'Doctor'}</h2>
        </div>
        <div className="relative w-11 h-11 rounded-full bg-surface-light flex items-center justify-center">
          <Icon name="bell" size={22} className="text-ink" />
          {pending.length > 0 && <span className="absolute top-0 right-0 w-4 h-4 bg-error rounded-full text-white text-[9px] font-bold flex items-center justify-center">{pending.length}</span>}
        </div>
      </div>

      <div className="px-5 pt-3">
        <div className="flex gap-1 bg-surface-light rounded-xl p-1">
          {(['overview', 'requests'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all', tab === t ? 'bg-white text-primary shadow-soft' : 'text-ink-muted')}>
              {t === 'requests' ? `Requests (${pending.length})` : 'Overview'}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' ? (
        <>
          <div className="px-5 pt-4 grid grid-cols-2 gap-3">
            {stats.map((s) => (
              <div key={s.label} className="card p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-2.5', s.bg)}><Icon name={s.icon} size={20} className={s.color} /></div>
                <p className="text-2xl font-extrabold text-ink">{s.value}</p>
                <p className="text-xs text-ink-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
          <div className="px-5 pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="section-title">Today\u2019s Schedule</h3>
              <button className="text-sm font-semibold text-primary">View all</button>
            </div>
            <div className="space-y-2.5">
              {todayAppts.length === 0 ? (
                <EmptyState icon="calendar" title="No appointments today" subtitle="Your schedule will appear here." />
              ) : (
                todayAppts.map((a) => (
                  <div key={a.id} className="card p-3.5 flex items-center gap-3">
                    <div className="text-center shrink-0 w-16"><p className="text-xs text-ink-muted">Today</p><p className="font-extrabold text-sm text-primary">{a.time}</p></div>
                    <div className="w-px h-10 bg-surface-dark" />
                    <div className="flex-1 min-w-0"><p className="font-bold text-sm text-ink truncate">{a.patient?.full_name || 'Patient'}</p><p className="text-xs text-ink-muted truncate">{a.reason || a.doctor?.specialty}</p></div>
                    <Icon name={a.type === 'video' ? 'video' : 'building'} size={18} className="text-ink-light" />
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="px-5 pt-5">
            <h3 className="section-title mb-3">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              <QuickAction icon="file-text" label="Add Rx" onClick={() => navigate('/provider/prescription/new')} />
              <QuickAction icon="users" label="Patients" onClick={() => navigate('/provider/patients')} />
              <QuickAction icon="message-circle" label="Messages" onClick={() => navigate('/provider/dashboard')} />
            </div>
          </div>
        </>
      ) : (
        <div className="px-5 pt-4 space-y-3">
          {pending.length === 0 ? (
            <EmptyState icon="circle-check" title="All caught up!" subtitle="No pending requests." />
          ) : (
            pending.map((r) => (
              <BookingRequestCard key={r.id} req={r} onAccept={() => handleApptStatus(r.id, 'upcoming')} onDecline={() => handleApptStatus(r.id, 'cancelled')} />
            ))
          )}
        </div>
      )}
      <div className="h-24" />
    </div>
  );
}

function QuickAction({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="card p-3 flex flex-col items-center gap-2 active:scale-95 transition-transform">
      <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center"><Icon name={icon} size={20} className="text-primary" /></div>
      <span className="text-xs font-semibold text-ink">{label}</span>
    </button>
  );
}

function BookingRequestCard({ req, onAccept, onDecline }: { req: Appointment & { patient?: Profile }; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center"><Icon name="user" size={22} className="text-ink-light" /></div>
        <div className="flex-1 min-w-0"><p className="font-bold text-ink truncate">{req.patient?.full_name || 'Patient'}</p><p className="text-xs text-ink-muted">{req.date} · {req.time}</p></div>
        <span className="chip bg-warning-100 text-warning-700 capitalize">{req.type}</span>
      </div>
      {req.reason && <div className="mt-3 pt-3 border-t border-surface-light"><p className="text-xs font-bold text-ink-muted uppercase mb-1">Reason</p><p className="text-sm text-ink-secondary">{req.reason}</p></div>}
      <div className="flex gap-2.5 mt-3">
        <button onClick={onDecline} className="flex-1 bg-error-50 text-error font-bold rounded-xl py-2.5 text-sm active:scale-95 transition-transform">Decline</button>
        <button onClick={onAccept} className="flex-1 btn-primary text-sm py-2.5 flex items-center justify-center gap-1.5"><Icon name="check" size={16} />Accept</button>
      </div>
    </div>
  );
}

export function ProviderPatients() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [patients, setPatients] = useState<{ id: string; name: string; lastVisit: string }[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', profile.id).maybeSingle();
      if (!doc) return;
      const { data: appts } = await supabase.from('appointments').select('patient_id, patient:profiles!fk_appointments_patient_id(full_name), created_at').eq('doctor_id', doc.id).order('created_at', { ascending: false });
      const seen = new Map<string, { id: string; name: string; lastVisit: string }>();
      (appts ?? []).forEach((a: any) => {
        if (!seen.has(a.patient_id)) {
          seen.set(a.patient_id, { id: a.patient_id, name: a.patient?.full_name || 'Patient', lastVisit: new Date(a.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) });
        }
      });
      setPatients([...seen.values()]);
    })();
  }, [profile]);

  return (
    <div className="screen-container">
      <ScreenHeader title="My Patients" subtitle={`${patients.length} patients`} onBack={() => navigate('/provider/dashboard')} />
      <div className="px-5 pt-3">
        <div className="bg-white rounded-2xl border border-surface-dark shadow-soft h-12 flex items-center px-3.5 gap-2.5"><Icon name="search" size={20} className="text-ink-light" /><input placeholder="Search patients..." className="flex-1 bg-transparent text-sm outline-none" /></div>
      </div>
      <div className="px-5 pt-4 space-y-2.5">
        {patients.length === 0 ? (
          <EmptyState icon="users" title="No patients yet" subtitle="Patients will appear here after bookings." />
        ) : (
          patients.map((p) => (
            <div key={p.id} className="card p-3.5 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center"><Icon name="user" size={24} className="text-ink-light" /></div>
              <div className="flex-1 min-w-0"><p className="font-bold text-ink truncate">{p.name}</p><p className="text-xs text-ink-muted">Last visit: {p.lastVisit}</p></div>
              <button onClick={() => navigate(`/provider/chat/${p.id}`)} className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center shrink-0"><Icon name="message-circle" size={18} className="text-primary" /></button>
            </div>
          ))
        )}
      </div>
      <div className="h-24" />
    </div>
  );
}

export function ProviderPrescription() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [meds, setMeds] = useState<PrescriptionMedicine[]>([{ name: '', dosage: '', duration: '', instructions: '' }]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState<Profile[]>([]);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { data: doc } = await supabase.from('doctors').select('id').eq('user_id', profile.id).maybeSingle();
      if (!doc) return;
      const { data: appts } = await supabase.from('appointments').select('patient_id, patient:profiles!fk_appointments_patient_id(*)').eq('doctor_id', doc.id);
      const seen = new Map<string, Profile>();
      (appts ?? []).forEach((a: any) => { if (a.patient && !seen.has(a.patient_id)) seen.set(a.patient_id, a.patient as Profile); });
      setPatients([...seen.values()]);
    })();
  }, [profile]);

  const addMed = () => setMeds([...meds, { name: '', dosage: '', duration: '', instructions: '' }]);
  const updateMed = (i: number, field: keyof PrescriptionMedicine, val: string) => { const next = [...meds]; next[i] = { ...next[i], [field]: val }; setMeds(next); };
  const removeMed = (i: number) => setMeds(meds.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    if (!profile || !patientId || !diagnosis) return;
    setSaving(true);
    await supabase.from('prescriptions').insert({ patient_id: patientId, doctor_id: profile.id, diagnosis, medicines: meds.filter((m) => m.name), notes });
    setSaving(false);
    setSaved(true);
    setTimeout(() => navigate('/provider/dashboard'), 1500);
  };

  if (saved) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-5"><Icon name="circle-check" size={44} className="text-success" /></div>
        <h2 className="text-xl font-extrabold text-ink mb-1">Prescription Saved</h2>
        <p className="text-sm text-ink-muted text-center">The patient has been notified.</p>
      </div>
    );
  }

  return (
    <div className="screen-container">
      <ScreenHeader title="New Prescription" onBack={() => navigate(-1)} />
      <div className="px-5 pt-2 space-y-4">
        <div className="card p-4">
          <label className="font-bold text-ink mb-3 block">Select Patient</label>
          {patients.length === 0 ? (
            <p className="text-sm text-ink-muted">No patients available yet.</p>
          ) : (
            <select value={patientId} onChange={(e) => setPatientId(e.target.value)} className="input-field">
              <option value="">Choose a patient...</option>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.full_name}</option>)}
            </select>
          )}
        </div>
        <div className="card p-4">
          <label className="font-semibold text-sm text-ink block mb-2">Diagnosis</label>
          <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="e.g. Viral fever with throat infection" className="input-field" />
        </div>
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3"><p className="font-bold text-ink">Medicines</p><button onClick={addMed} className="chip bg-primary-50 text-primary"><Icon name="plus" size={14} />Add</button></div>
          <div className="space-y-3">
            {meds.map((m, i) => (
              <div key={i} className="bg-surface-light rounded-xl p-3 space-y-2.5">
                <div className="flex items-center gap-2">
                  <span className="chip bg-primary text-white shrink-0">#{i + 1}</span>
                  <input value={m.name} onChange={(e) => updateMed(i, 'name', e.target.value)} placeholder="Medicine name" className="flex-1 bg-white rounded-lg px-3 py-2 text-sm outline-none border border-surface-dark" />
                  {meds.length > 1 && <button onClick={() => removeMed(i)} className="w-8 h-8 rounded-lg bg-error-50 flex items-center justify-center shrink-0"><Icon name="trash" size={16} className="text-error" /></button>}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input value={m.dosage} onChange={(e) => updateMed(i, 'dosage', e.target.value)} placeholder="Dosage (e.g. 1 tab)" className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-surface-dark" />
                  <input value={m.duration} onChange={(e) => updateMed(i, 'duration', e.target.value)} placeholder="Duration (e.g. 5 days)" className="bg-white rounded-lg px-3 py-2 text-sm outline-none border border-surface-dark" />
                </div>
                <input value={m.instructions} onChange={(e) => updateMed(i, 'instructions', e.target.value)} placeholder="Instructions (e.g. After food, twice daily)" className="w-full bg-white rounded-lg px-3 py-2 text-sm outline-none border border-surface-dark" />
              </div>
            ))}
          </div>
        </div>
        <div className="card p-4">
          <label className="font-semibold text-sm text-ink block mb-2">Notes</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Additional notes for the patient..." rows={3} className="w-full bg-white rounded-xl px-4 py-3 text-sm outline-none border border-surface-dark resize-none" />
        </div>
      </div>
      <div className="h-32" />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-20">
        <button onClick={handleSave} disabled={saving || !patientId || !diagnosis} className="btn-primary w-full max-w-md mx-auto flex items-center justify-center gap-2">
          {saving ? <Icon name="loader" size={18} className="animate-spin" /> : <><Icon name="check" size={18} />Save & Send to Patient</>}
        </button>
      </div>
    </div>
  );
}
