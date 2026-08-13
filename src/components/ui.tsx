import { cn } from '@/lib/utils';
import { Icon } from './Icon';

interface StatusBadgeProps {
  status: string;
  compact?: boolean;
  className?: string;
}

const statusMap: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  online: { label: 'Online', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  'available-today': { label: 'Available Today', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  busy: { label: 'Busy', bg: 'bg-warning-100', text: 'text-warning-700', dot: 'bg-warning' },
  offline: { label: 'Offline', bg: 'bg-surface-dark', text: 'text-ink-secondary', dot: 'bg-ink-light' },
  upcoming: { label: 'Upcoming', bg: 'bg-primary-100', text: 'text-primary-700', dot: 'bg-primary' },
  completed: { label: 'Completed', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  cancelled: { label: 'Cancelled', bg: 'bg-error-100', text: 'text-error-700', dot: 'bg-error' },
  'in-progress': { label: 'In Progress', bg: 'bg-warning-100', text: 'text-warning-700', dot: 'bg-warning' },
  pending: { label: 'Pending', bg: 'bg-warning-100', text: 'text-warning-700', dot: 'bg-warning' },
  accepted: { label: 'Accepted', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  declined: { label: 'Declined', bg: 'bg-error-100', text: 'text-error-700', dot: 'bg-error' },
  ready: { label: 'Ready', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  enroute: { label: 'En Route', bg: 'bg-primary-100', text: 'text-primary-700', dot: 'bg-primary' },
  arrived: { label: 'Arrived', bg: 'bg-success-100', text: 'text-success-700', dot: 'bg-success' },
  transporting: { label: 'Transporting', bg: 'bg-warning-100', text: 'text-warning-700', dot: 'bg-warning' },
};

export function StatusBadge({ status, compact, className }: StatusBadgeProps) {
  const s = statusMap[status] ?? statusMap.offline;
  return (
    <span
      className={cn(
        'chip',
        s.bg,
        s.text,
        compact ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-xs',
        className,
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full', s.dot)} />
      {s.label}
    </span>
  );
}

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-in">
      <div className="w-16 h-16 rounded-2xl bg-surface-light flex items-center justify-center mb-4">
        <Icon name={icon} size={28} className="text-ink-light" />
      </div>
      <h3 className="font-bold text-ink mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-ink-muted max-w-xs">{subtitle}</p>}
      {actionLabel && (
        <button onClick={onAction} className="btn-primary mt-5 text-sm">
          {actionLabel}
        </button>
      )}
    </div>
  );
}

interface AvatarProps {
  src: string;
  alt: string;
  size?: number;
  ring?: boolean;
  className?: string;
}

export function Avatar({ src, alt, size = 44, ring, className }: AvatarProps) {
  return (
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      loading="lazy"
      className={cn(
        'rounded-full object-cover bg-surface-light',
        ring && 'ring-2 ring-primary-200 ring-offset-2',
        className,
      )}
    />
  );
}

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export function ScreenHeader({ title, subtitle, onBack, rightAction }: ScreenHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-5 pt-5 pb-3 bg-surface-card sticky top-0 z-10">
      {onBack && (
        <button
          onClick={onBack}
          className="w-10 h-10 rounded-full bg-surface-light flex items-center justify-center shrink-0 active:scale-90 transition-transform"
        >
          <Icon name="arrow-left" size={20} className="text-ink" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="font-extrabold text-lg text-ink leading-tight truncate">{title}</h1>
        {subtitle && <p className="text-xs text-ink-muted truncate">{subtitle}</p>}
      </div>
      {rightAction}
    </div>
  );
}

interface BottomNavProps {
  items: { id: string; label: string; icon: string }[];
  active: string;
  onChange: (id: string) => void;
}

export function BottomNav({ items, active, onChange }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-surface-dark px-2 pb-[env(safe-area-inset-bottom)] z-30">
      <div className="flex items-center justify-around max-w-md mx-auto">
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              className="flex flex-col items-center gap-0.5 py-2 px-3 transition-all"
            >
              <Icon
                name={item.icon}
                size={22}
                className={isActive ? 'text-primary' : 'text-ink-light'}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span
                className={cn(
                  'text-[10px] font-semibold transition-colors',
                  isActive ? 'text-primary' : 'text-ink-light',
                )}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
