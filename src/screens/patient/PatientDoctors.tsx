import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ScreenHeader, StatusBadge, EmptyState } from '@/components/ui';
import { Icon } from '@/components/Icon';
import { cn, formatINR } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Doctor, ConsultationType } from '@/lib/types';

const specialtyChips = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedics'];

const timeSlots = [
  '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '4:00 PM', '4:30 PM', '5:00 PM', '5:30 PM',
  '6:00 PM', '6:30 PM', '7:00 PM', '7:30 PM',
];

export function PatientDoctors() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
      setDoctors((data as Doctor[]) ?? []);
      setLoading(false);
    })();
  }, []);

  const filtered = filter === 'All' ? doctors : doctors.filter((d) => d.specialty === filter);

  return (
    <div className="screen-container">
      <ScreenHeader title="Find Doctors" subtitle={`${filtered.length} doctors available`} onBack={() => navigate('/patient/home')} />
      <div className="px-5 pt-3">
        <div className="bg-white rounded-2xl border border-surface-dark shadow-soft h-12 flex items-center px-3.5 gap-2.5">
          <Icon name="search" size={20} className="text-ink-light" />
          <input placeholder="Search by name, specialty..." className="flex-1 bg-transparent text-sm outline-none" />
          <Icon name="filter" size={18} className="text-primary" />
        </div>
      </div>
      <div className="flex gap-2 px-5 pt-3 overflow-x-auto no-scrollbar">
        {specialtyChips.map((c) => (
          <button key={c} onClick={() => setFilter(c)} className={cn('chip shrink-0', filter === c ? 'bg-primary text-white' : 'bg-white text-ink-secondary border border-surface-dark')}>{c}</button>
        ))}
      </div>
      <div className="px-5 pt-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-12"><Icon name="loader" size={28} className="text-primary animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <EmptyState icon="stethoscope" title="No doctors found" subtitle="Try a different specialty or check back later." />
        ) : (
          filtered.map((d) => (
            <button key={d.id} onClick={() => navigate(`/patient/doctor/${d.id}`)} className="card p-3.5 flex gap-3 w-full text-left active:scale-[0.98] transition-transform">
              <div className="w-20 h-20 rounded-xl bg-surface-light flex items-center justify-center shrink-0 overflow-hidden">
                <Icon name="user" size={32} className="text-ink-light" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-[15px] text-ink truncate">{d.specialty}</p>
                <p className="text-[11px] text-ink-muted truncate">{d.qualifications || d.specialty}</p>
                <div className="flex items-center gap-1 mt-1.5">
                  <Icon name="star" size={13} className="text-warning fill-warning" />
                  <span className="text-xs font-bold text-ink">{d.rating.toFixed(1)}</span>
                  <span className="text-[11px] text-ink-muted">({d.review_count})</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Icon name="map-pin" size={11} className="text-ink-muted" />
                  <p className="text-[11px] text-ink-muted truncate">{d.hospital}</p>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <StatusBadge status={d.status === 'online' ? 'available-today' : d.status} compact />
                  <span className="text-[15px] font-extrabold text-primary">{formatINR(d.fee)}</span>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
      <div className="h-24" />
    </div>
  );
}

export function PatientDoctorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [tab, setTab] = useState<'about' | 'reviews'>('about');

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
      setDoctor(data as Doctor | null);
    })();
  }, [id]);

  if (!doctor) return <div className="screen-container"><div className="flex justify-center py-12"><Icon name="loader" size={28} className="text-primary animate-spin" /></div></div>;

  return (
    <div className="screen-container">
      <ScreenHeader title="Doctor Profile" onBack={() => navigate(-1)} rightAction={<button className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center"><Icon name="share" size={18} className="text-ink" /></button>} />
      <div className="px-5 pt-2">
        <div className="card p-5 flex flex-col items-center text-center">
          <div className="w-24 h-24 rounded-full bg-surface-light flex items-center justify-center ring-2 ring-primary-200 ring-offset-2">
            <Icon name="user" size={40} className="text-ink-light" />
          </div>
          <h2 className="font-extrabold text-lg text-ink mt-3">{doctor.specialty}</h2>
          <p className="text-sm text-primary font-semibold">{doctor.qualifications}</p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1">
              <Icon name="star" size={15} className="text-warning fill-warning" />
              <span className="text-sm font-bold text-ink">{doctor.rating.toFixed(1)}</span>
              <span className="text-xs text-ink-muted">({doctor.review_count})</span>
            </div>
            <div className="w-px h-4 bg-surface-dark" />
            <div className="flex items-center gap-1">
              <Icon name="clock" size={15} className="text-ink-muted" />
              <span className="text-sm font-bold text-ink">{doctor.experience}y</span>
            </div>
          </div>
          <div className="mt-3"><StatusBadge status={doctor.status === 'online' ? 'available-today' : doctor.status} /></div>
        </div>
      </div>

      <div className="px-5 pt-4 grid grid-cols-3 gap-3">
        <InfoTile icon="building" label="Hospital" value={doctor.hospital.split(',')[0] || 'N/A'} />
        <InfoTile icon="wallet" label="Fee" value={formatINR(doctor.fee)} />
        <InfoTile icon="clock" label="Next Slot" value={doctor.next_slot || 'Today'} />
      </div>

      <div className="px-5 pt-5">
        <div className="flex gap-1 bg-surface-light rounded-xl p-1">
          {(['about', 'reviews'] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)} className={cn('flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all', tab === t ? 'bg-white text-primary shadow-soft' : 'text-ink-muted')}>{t}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-4">
        {tab === 'about' ? (
          <div className="card p-4 space-y-4">
            <p className="text-sm text-ink-secondary leading-relaxed">{doctor.about || 'No description available yet.'}</p>
            <div>
              <p className="text-xs font-bold text-ink-muted uppercase tracking-wide mb-2">Languages</p>
              <div className="flex gap-2 flex-wrap">
                {(doctor.languages.length ? doctor.languages : ['English']).map((l) => (
                  <span key={l} className="chip bg-surface-light text-ink-secondary"><Icon name="languages" size={13} />{l}</span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState icon="star" title="No reviews yet" subtitle="Reviews will appear after consultations." />
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-20">
        <div className="flex items-center gap-3 max-w-md mx-auto">
          <div>
            <p className="text-xs text-ink-muted">Consultation Fee</p>
            <p className="text-xl font-extrabold text-primary">{formatINR(doctor.fee)}</p>
          </div>
          <button onClick={() => navigate(`/patient/booking/${doctor.id}`)} className="btn-primary flex-1">Book Appointment</button>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="card p-3 text-center">
      <div className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center mx-auto mb-1.5">
        <Icon name={icon} size={18} className="text-primary" />
      </div>
      <p className="text-[10px] text-ink-muted">{label}</p>
      <p className="text-xs font-bold text-ink truncate">{value}</p>
    </div>
  );
}

export function PatientBooking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [type, setType] = useState<ConsultationType>('video');
  const [slot, setSlot] = useState('');
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('doctors').select('*').eq('id', id).maybeSingle();
      setDoctor(data as Doctor | null);
    })();
  }, [id]);

  const handleConfirm = async () => {
    if (!slot || !doctor || !profile) return;
    setBooking(true);
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
    await supabase.from('appointments').insert({
      patient_id: profile.id,
      doctor_id: doctor.id,
      date: dateStr,
      time: slot,
      type,
      status: 'upcoming',
      fee: doctor.fee,
      reason,
    });
    setBooking(false);
    setConfirmed(true);
    setTimeout(() => navigate('/patient/appointments'), 1500);
  };

  if (confirmed) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-6 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-success-100 flex items-center justify-center mb-5">
          <Icon name="circle-check" size={44} className="text-success" />
        </div>
        <h2 className="text-xl font-extrabold text-ink mb-1">Booking Confirmed!</h2>
        <p className="text-sm text-ink-muted text-center">Your appointment has been confirmed for {slot}.</p>
      </div>
    );
  }

  if (!doctor) return <div className="screen-container"><div className="flex justify-center py-12"><Icon name="loader" size={28} className="text-primary animate-spin" /></div></div>;

  return (
    <div className="screen-container">
      <ScreenHeader title="Book Appointment" onBack={() => navigate(-1)} />
      <div className="px-5 pt-2">
        <div className="card p-3.5 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-surface-light flex items-center justify-center">
            <Icon name="user" size={26} className="text-ink-light" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-ink">{doctor.specialty}</p>
            <p className="text-xs text-primary font-semibold">{doctor.qualifications}</p>
            <p className="text-xs text-ink-muted truncate">{doctor.hospital}</p>
          </div>
        </div>
      </div>

      <div className="px-5 pt-5">
        <p className="font-bold text-ink mb-3">Consultation Type</p>
        <div className="grid grid-cols-3 gap-3">
          {([['video', 'video', 'Video Call'], ['clinic', 'building', 'In Clinic'], ['home', 'house', 'Home Visit']] as const).map(([t, icon, label]) => (
            <button key={t} onClick={() => setType(t)} className={cn('rounded-xl p-3 border-2 text-center transition-all', type === t ? 'border-primary bg-primary-50' : 'border-surface-dark bg-white')}>
              <Icon name={icon} size={22} className={type === t ? 'text-primary' : 'text-ink-muted'} />
              <p className={cn('text-[11px] font-semibold mt-1.5', type === t ? 'text-primary' : 'text-ink-secondary')}>{label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <p className="font-bold text-ink mb-3">Select Time Slot</p>
        <div className="grid grid-cols-3 gap-2.5">
          {timeSlots.map((s) => (
            <button key={s} onClick={() => setSlot(s)} className={cn('rounded-xl py-2.5 text-sm font-semibold border-2 transition-all', slot === s ? 'border-primary bg-primary text-white' : 'border-surface-dark bg-white text-ink-secondary')}>{s}</button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="card p-4">
          <label className="font-semibold text-sm text-ink block mb-2">Reason for Visit (optional)</label>
          <input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Fever and body ache" className="input-field" />
        </div>
      </div>

      <div className="px-5 pt-5">
        <div className="card p-4 space-y-2">
          <Row label="Consultation Fee" value={formatINR(doctor.fee)} />
          <Row label="Platform Fee" value={formatINR(20)} />
          <div className="h-px bg-surface-dark" />
          <Row label="Total" value={formatINR(doctor.fee + 20)} bold />
        </div>
      </div>

      <div className="h-32" />
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-5 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-20">
        <button onClick={handleConfirm} disabled={!slot || booking} className="btn-primary w-full max-w-md mx-auto flex items-center justify-center gap-2">
          {booking ? <Icon name="loader" size={18} className="animate-spin" /> : <><Icon name="check" size={18} />Confirm Booking · {formatINR(doctor.fee + 20)}</>}
        </button>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={cn('text-sm', bold ? 'font-bold text-ink' : 'text-ink-muted')}>{label}</span>
      <span className={cn('text-sm', bold ? 'font-extrabold text-primary text-base' : 'font-semibold text-ink')}>{value}</span>
    </div>
  );
}
