import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { AmbulanceRequest } from '@/lib/types';

export function AmbulanceScreen() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [online, setOnline] = useState(false);
  const [activeTrip, setActiveTrip] = useState<string | null>(null);
  const [requests, setRequests] = useState<AmbulanceRequest[]>([]);
  const [tripsToday, setTripsToday] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const load = async () => {
      const { data } = await supabase.from('ambulance_requests').select('*').order('created_at', { ascending: false });
      const all = (data as AmbulanceRequest[]) ?? [];
      setRequests(all.filter((r) => r.status === 'online' || r.status === 'enroute' || r.status === 'arrived' || r.status === 'transporting'));
      const { count } = await supabase.from('ambulance_requests').select('*', { count: 'exact', head: true }).eq('driver_id', profile.id).eq('status', 'completed');
      setTripsToday(count ?? 0);
    };
    load();
    const channel = supabase.channel('ambulance').on('postgres_changes', { event: '*', schema: 'public', table: 'ambulance_requests' }, () => load()).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [profile]);

  const acceptRequest = async (id: string) => {
    if (!profile) return;
    await supabase.from('ambulance_requests').update({ driver_id: profile.id, status: 'enroute' }).eq('id', id);
    setActiveTrip(id);
  };

  const completeTrip = async () => {
    if (!activeTrip) return;
    await supabase.from('ambulance_requests').update({ status: 'completed' }).eq('id', activeTrip);
    setActiveTrip(null);
    setOnline(false);
  };

  const activeReq = requests.find((r) => r.id === activeTrip);

  return (
    <div className="screen-container">
      <div className="px-5 pt-4 pb-3 bg-white flex items-center gap-3">
        <div className="w-11 h-11 rounded-xl bg-error-50 flex items-center justify-center"><Icon name="ambulance" size={24} className="text-error" /></div>
        <div className="flex-1"><h2 className="font-bold text-ink text-[15px]">Ambulance Mode</h2><p className="text-xs text-ink-muted">Driver: {profile?.full_name || ''}</p></div>
        <button onClick={() => navigate('/provider/ambulance/login')} className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center"><Icon name="log-out" size={18} className="text-ink" /></button>
      </div>

      <div className="px-5 pt-4">
        <div className={cn('rounded-2xl p-5 transition-colors', online ? 'bg-success-50 border-2 border-success-200' : 'bg-white border-2 border-surface-dark')}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center transition-colors', online ? 'bg-success' : 'bg-surface-light')}>
                <Icon name="power" size={24} className={online ? 'text-white' : 'text-ink-muted'} />
              </div>
              <div>
                <p className="font-extrabold text-ink">{online ? 'You are Online' : 'You are Offline'}</p>
                <p className="text-xs text-ink-muted">{online ? 'Receiving emergency requests' : 'Tap to start receiving requests'}</p>
              </div>
            </div>
            <button onClick={() => setOnline(!online)} className={cn('w-14 h-8 rounded-full transition-colors relative', online ? 'bg-success' : 'bg-surface-dark')}>
              <span className={cn('absolute top-1 w-6 h-6 rounded-full bg-white shadow transition-all', online ? 'left-7' : 'left-1')} />
            </button>
          </div>
          {online && (
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl p-3 text-center"><p className="text-2xl font-extrabold text-success">{tripsToday}</p><p className="text-xs text-ink-muted">Trips today</p></div>
              <div className="bg-white rounded-xl p-3 text-center"><p className="text-2xl font-extrabold text-primary">4.8{'\u2605'}</p><p className="text-xs text-ink-muted">Rating</p></div>
            </div>
          )}
        </div>
      </div>

      {online && !activeTrip && (
        <div className="px-5 pt-5">
          <h3 className="section-title mb-3">Incoming Requests</h3>
          <div className="space-y-3">
            {requests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-3"><Icon name="ambulance" size={28} className="text-ink-light" /></div>
                <p className="font-bold text-ink">No requests right now</p>
                <p className="text-sm text-ink-muted mt-1">You'll see emergency requests here.</p>
              </div>
            ) : (
              requests.map((r) => (
                <div key={r.id} className="card p-4 border-l-4 border-l-error">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-surface-light flex items-center justify-center"><Icon name="user" size={22} className="text-ink-light" /></div>
                    <div className="flex-1 min-w-0"><p className="font-bold text-ink truncate">{r.patient_name}</p><p className="text-xs text-error font-semibold">{r.emergency_type}</p></div>
                    <div className="text-right"><p className="font-extrabold text-primary text-sm">{r.eta || 'TBD'}</p><p className="text-xs text-ink-muted">{r.distance}</p></div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-3 pt-3 border-t border-surface-light"><Icon name="map-pin" size={14} className="text-ink-muted shrink-0" /><p className="text-xs text-ink-secondary flex-1 truncate">{r.pickup_address}</p></div>
                  <div className="flex gap-2.5 mt-3">
                    <button className="w-11 h-11 rounded-xl bg-surface-light flex items-center justify-center shrink-0"><Icon name="phone" size={18} className="text-ink" /></button>
                    <button onClick={() => acceptRequest(r.id)} className="flex-1 btn-primary text-sm flex items-center justify-center gap-1.5"><Icon name="navigation" size={16} />Accept & Navigate</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTrip && activeReq && (
        <div className="px-5 pt-5">
          <div className="card overflow-hidden">
            <div className="bg-primary p-4 text-white"><p className="text-xs text-white/70 mb-1">Active Trip</p><p className="font-extrabold text-lg">{activeReq.patient_name}</p><p className="text-sm text-white/80">{activeReq.emergency_type}</p></div>
            <div className="h-40 bg-surface-light flex items-center justify-center relative">
              <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'linear-gradient(#0A84FF20 1px, transparent 1px), linear-gradient(90deg, #0A84FF20 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
              <div className="text-center"><Icon name="navigation" size={40} className="text-primary mx-auto mb-2" /><p className="text-sm font-semibold text-ink">Navigating to pickup</p><p className="text-xs text-ink-muted">ETA: {activeReq.eta || 'TBD'}</p></div>
            </div>
          </div>
          <div className="card p-4 mt-4"><div className="flex items-center gap-2 mb-2"><Icon name="map-pin" size={16} className="text-primary" /><p className="font-semibold text-sm text-ink">Pickup Location</p></div><p className="text-sm text-ink-secondary">{activeReq.pickup_address}</p></div>
          <button onClick={completeTrip} className="btn-primary w-full mt-4 flex items-center justify-center gap-2"><Icon name="circle-check" size={18} />Mark as Complete</button>
        </div>
      )}

      {!online && (
        <div className="flex flex-col items-center justify-center pt-20 px-6 text-center">
          <div className="w-20 h-20 rounded-2xl bg-surface-light flex items-center justify-center mb-4"><Icon name="ambulance" size={36} className="text-ink-light" /></div>
          <p className="font-bold text-ink">You are offline</p>
          <p className="text-sm text-ink-muted mt-1">Go online to start receiving emergency requests.</p>
        </div>
      )}

      <div className="h-24" />
    </div>
  );
}
