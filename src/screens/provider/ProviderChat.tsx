import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Icon } from '@/components/Icon';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import type { ChatMessage, Profile } from '@/lib/types';

export function ProviderChat() {
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
    const channel = supabase.channel('provider-chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
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
        <div className="flex-1 min-w-0"><p className="font-bold text-ink text-sm truncate">{otherUser?.full_name || 'Patient'}</p><span className="flex items-center gap-1 text-xs text-success"><span className="w-1.5 h-1.5 rounded-full bg-success" />Online</span></div>
        <button className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center"><Icon name="phone" size={18} className="text-primary" /></button>
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
        <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send()} placeholder="Type a reply..." className="flex-1 bg-surface-light rounded-full px-4 py-2.5 text-sm outline-none" />
        <button onClick={send} className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0 active:scale-90 transition-transform"><Icon name="send" size={18} className="text-white" /></button>
      </div>
    </div>
  );
}
