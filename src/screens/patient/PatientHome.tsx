import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { Avatar, StatusBadge, EmptyState } from '@/components/ui';
import { cn, formatINR } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { Doctor } from '@/lib/types';

export const services = [
  { id: 's1', title: 'Doctor\nConsultation', icon: 'stethoscope', bgColor: '#E3F2FD' },
  { id: 's2', title: 'Labs Nearby', icon: 'flask-conical', bgColor: '#E1F5FE' },
  { id: 's3', title: 'Physiotherapy', icon: 'activity', bgColor: '#FFF8E1' },
  { id: 's4', title: 'Pharmacy', icon: 'pill', bgColor: '#FCE4EC' },
  { id: 's5', title: 'Psychotherapy', icon: 'brain', bgColor: '#EDE7F6' },
  { id: 's6', title: 'Home Care', icon: 'house', bgColor: '#E8F5E9' },
  { id: 's7', title: 'Nursing', icon: 'heart-pulse', bgColor: '#F3E5F5' },
  { id: 's8', title: 'Ambulance', icon: 'truck', bgColor: '#FFEBEE' },
];

export const specialtyChips = ['All', 'General Physician', 'Cardiologist', 'Dermatologist', 'Neurologist', 'Orthopedics'];

export function PatientHome() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [upcoming, setUpcoming] = useState<number>(0);
  const [rxCount, setRxCount] = useState<number>(0);
  const [labCount, setLabCount] = useState<number>(0);

  useEffect(() => {
    (async () => {
      const { data: docs } = await supabase.from('doctors').select('*').order('rating', { ascending: false });
      setDoctors((docs as Doctor[]) ?? []);
    })();
  }, []);

  useEffect(() => {
    if (!profile) return;
    (async () => {
      const { count: apptCount } = await supabase.from('appointments').select('*', { count: 'exact', head: true }).eq('patient_id', profile.id).eq('status', 'upcoming');
      const { count: rxC } = await supabase.from('prescriptions').select('*', { count: 'exact', head: true }).eq('patient_id', profile.id);
      const { count: labC } = await supabase.from('lab_reports').select('*', { count: 'exact', head: true }).eq('patient_id', profile.id);
      setUpcoming(apptCount ?? 0);
      setRxCount(rxC ?? 0);
      setLabCount(labC ?? 0);
    })();
  }, [profile]);

  const toggleFav = (id: string) =>
    setFavs((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <div className="screen-container">
      <div className="px-5 pt-4 pb-2 bg-surface flex items-center gap-3">
        <Avatar src={profile?.avatar_url || ''} alt="Profile" size={44} ring />
        <div className="flex-1 min-w-0">
          <h2 className="font-bold text-ink text-[15px]">Hello, {profile?.full_name || 'User'}</h2>
          <button className="flex items-center gap-0.5 text-xs text-ink-secondary font-medium">
            <Icon name="map-pin" size={13} className="text-primary" />
            {profile?.location || 'Set location'}
            <Icon name="chevron-down" size={14} />
          </button>
        </div>
        <div className="relative w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center">
          <Icon name="bell" size={22} className="text-ink" />
          <span className="absolute top-0 right-0 w-4 h-4 bg-error rounded-full text-white text-[9px] font-bold flex items-center justify-center">{upcoming}</span>
        </div>
        <button onClick={() => navigate('/patient/profile')} className="w-11 h-11 rounded-full bg-white shadow-soft flex items-center justify-center">
          <Icon name="menu" size={22} className="text-ink" />
        </button>
      </div>

      <div className="px-5 pt-3">
        <div className="bg-white rounded-2xl border border-surface-dark shadow-soft h-[52px] flex items-center px-3.5 gap-2.5">
          <Icon name="search" size={20} className="text-ink-light" />
          <input placeholder="Search doctors, services, hospitals..." className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-light outline-none" />
          <div className="w-px h-6 bg-surface-dark" />
          <Icon name="mic" size={20} className="text-primary" />
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Our Services</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {services.map((s) => (
            <button
              key={s.id}
              onClick={() => s.icon === 'stethoscope' && navigate('/patient/doctors')}
              className="rounded-2xl p-3.5 text-left active:scale-[0.97] transition-transform"
              style={{ backgroundColor: s.bgColor }}
            >
              <div className="w-9 h-9 rounded-lg bg-white/70 flex items-center justify-center mb-2">
                <Icon name={s.icon} size={20} className="text-primary" />
              </div>
              <p className="text-[13px] font-bold text-ink leading-tight whitespace-pre-line">{s.title}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="section-title">Health at a Glance</h3>
        </div>
        <div className="card p-4.5">
          <div className="grid grid-cols-3 gap-2.5 mb-3.5">
            <StatChip icon="calendar" label="Appointments" value={upcoming} color="text-primary" bg="bg-primary-50" />
            <StatChip icon="file-text" label="Prescriptions" value={rxCount} color="text-secondary" bg="bg-secondary-50" />
            <StatChip icon="flask-conical" label="Lab Reports" value={labCount} color="text-warning-600" bg="bg-warning-50" />
          </div>
          <div className="bg-surface-light rounded-xl px-3 py-2.5 flex items-center gap-3">
            <InfoPill label="Blood Group" value={profile?.blood_group || 'N/A'} color="text-error" />
            <div className="w-px h-7 bg-surface-dark" />
            <InfoPill label="Allergies" value="N/A" color="text-success" />
          </div>
        </div>
      </div>

      <div className="pt-6">
        <div className="px-5 flex items-center justify-between mb-3">
          <h3 className="section-title">Our Specialists</h3>
          <button onClick={() => navigate('/patient/doctors')} className="text-sm font-semibold text-primary">See all</button>
        </div>
        <div className="flex gap-2 px-5 overflow-x-auto no-scrollbar mb-4">
          {specialtyChips.map((c, i) => (
            <span key={c} className={cn('chip shrink-0', i === 0 ? 'bg-primary text-white' : 'bg-white text-ink-secondary border border-surface-dark')}>{c}</span>
          ))}
        </div>
        <div className="px-5 space-y-3">
          {doctors.length === 0 ? (
            <EmptyState icon="stethoscope" title="No doctors yet" subtitle="When doctors sign up, they'll appear here." actionLabel="Find Doctors" onAction={() => navigate('/patient/doctors')} />
          ) : (
            doctors.slice(0, 5).map((d) => (
              <DoctorCard key={d.id} doctor={d} fav={favs.has(d.id)} onFav={() => toggleFav(d.id)} onBook={() => navigate(`/patient/doctor/${d.id}`)} />
            ))
          )}
        </div>
      </div>

      <div className="h-24" />
    </div>
  );
}

function StatChip({ icon, label, value, color, bg }: { icon: string; label: string; value: number; color: string; bg: string }) {
  return (
    <div className={cn('rounded-xl p-2.5', bg)}>
      <Icon name={icon} size={16} className={color} />
      <p className={cn('text-xl font-extrabold mt-1.5', color)}>{value}</p>
      <p className={cn('text-[10px] font-medium', color)}>{label}</p>
    </div>
  );
}

function InfoPill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div>
      <p className="text-[10px] text-ink-muted">{label}</p>
      <p className={cn('text-sm font-bold', color)}>{value}</p>
    </div>
  );
}

interface DoctorCardProps {
  doctor: Doctor;
  fav: boolean;
  onFav: () => void;
  onBook: () => void;
}

export function DoctorCard({ doctor, fav, onFav, onBook }: DoctorCardProps) {
  return (
    <div className="card p-3.5 flex gap-3">
      <div className="w-20 h-20 rounded-xl bg-surface-light flex items-center justify-center shrink-0 overflow-hidden">
        {doctor.id ? <Icon name="user" size={32} className="text-ink-light" /> : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start gap-1">
          <p className="font-bold text-[15px] text-ink truncate flex-1">{doctor.specialty}</p>
          <button onClick={onFav} className="shrink-0">
            <Icon name="heart" size={18} className={fav ? 'text-error fill-error' : 'text-ink-light'} />
          </button>
        </div>
        <p className="text-[11px] text-ink-muted truncate">{doctor.qualifications || doctor.specialty}</p>
        <div className="flex items-center gap-1 mt-1.5">
          <Icon name="star" size={13} className="text-warning fill-warning" />
          <span className="text-xs font-bold text-ink">{doctor.rating.toFixed(1)}</span>
          <span className="text-[11px] text-ink-muted">({doctor.review_count})</span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <Icon name="map-pin" size={11} className="text-ink-muted" />
          <p className="text-[11px] text-ink-muted truncate">{doctor.hospital}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <StatusBadge status={doctor.status === 'online' ? 'available-today' : doctor.status} compact />
          <div className="flex items-center gap-2">
            <span className="text-[15px] font-extrabold text-primary">{formatINR(doctor.fee)}</span>
            <button onClick={onBook} className="bg-primary text-white text-xs font-bold rounded-lg px-3.5 py-1.5 active:scale-95 transition-transform">Book</button>
          </div>
        </div>
      </div>
    </div>
  );
}
