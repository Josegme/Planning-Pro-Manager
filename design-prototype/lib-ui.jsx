// shadcn-style UI primitives.
const { useState, useEffect, useRef, useMemo, useCallback, createContext, useContext } = React;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}

/* ---------- Button ---------- */
function Button({ variant = 'default', size = 'default', className = '', children, ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50';
  const variants = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm',
    outline: 'border border-input bg-background hover:bg-slate-50 text-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    ghost: 'hover:bg-slate-100 text-foreground',
    link: 'text-primary underline-offset-4 hover:underline',
  };
  const sizes = {
    default: 'h-9 px-4 py-2',
    sm: 'h-8 px-3 text-xs',
    lg: 'h-10 px-6',
    icon: 'h-9 w-9',
    'icon-sm': 'h-8 w-8',
  };
  return (
    <button className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}

/* ---------- Card ---------- */
function Card({ className = '', children, ...props }) {
  return <div className={cn('rounded-lg border border-border bg-card text-card-foreground shadow-sm', className)} {...props}>{children}</div>;
}
function CardHeader({ className = '', children }) { return <div className={cn('flex flex-col space-y-1.5 p-6', className)}>{children}</div>; }
function CardTitle({ className = '', children }) { return <h3 className={cn('text-lg font-semibold tracking-tight', className)}>{children}</h3>; }
function CardDescription({ className = '', children }) { return <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>; }
function CardContent({ className = '', children }) { return <div className={cn('p-6 pt-0', className)}>{children}</div>; }
function CardFooter({ className = '', children }) { return <div className={cn('flex items-center p-6 pt-0', className)}>{children}</div>; }

/* ---------- Badge ---------- */
function Badge({ variant = 'default', className = '', children }) {
  const variants = {
    default: 'bg-primary/10 text-primary border-primary/20',
    secondary: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'border border-border text-foreground',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    muted: 'bg-slate-50 text-slate-500 border-slate-200',
  };
  return <span className={cn('inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs font-medium', variants[variant], className)}>{children}</span>;
}

/* ---------- Input ---------- */
function Input({ className = '', ...props }) {
  return (
    <input
      className={cn(
        'flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors',
        'placeholder:text-muted-foreground focus-visible:outline-none disabled:opacity-50',
        className
      )}
      {...props}
    />
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={cn('flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none', className)}
      {...props}
    />
  );
}

function Label({ className = '', children, ...props }) {
  return <label className={cn('text-sm font-medium leading-none', className)} {...props}>{children}</label>;
}

/* ---------- Select (native styled) ---------- */
function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={cn('flex h-9 w-full appearance-none rounded-md border border-input bg-background pl-3 pr-9 py-1 text-sm shadow-sm focus-visible:outline-none', className)}
        {...props}
      >
        {children}
      </select>
      <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground">
        <Icon name="chevronDown" size={14} />
      </div>
    </div>
  );
}

/* ---------- Avatar ---------- */
function Avatar({ name = '', size = 32, className = '', color }) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase()).join('');
  // deterministic color from name
  const hue = useMemo(() => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) % 360;
    return h;
  }, [name]);
  const bg = color || `hsl(${hue} 60% 92%)`;
  const fg = color ? '#fff' : `hsl(${hue} 60% 35%)`;
  return (
    <span
      className={cn('inline-flex items-center justify-center rounded-full font-medium', className)}
      style={{ width: size, height: size, background: bg, color: fg, fontSize: size * 0.4 }}
    >
      {initials || '?'}
    </span>
  );
}

/* ---------- Dialog ---------- */
function Dialog({ open, onClose, children, className = '', maxW = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in" onClick={onClose}>
      <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm" />
      <div
        className={cn('relative w-full bg-background rounded-lg shadow-xl border border-border max-h-[90vh] overflow-auto', maxW, className)}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
function DialogHeader({ className = '', children }) { return <div className={cn('flex flex-col space-y-1.5 p-6 border-b border-border', className)}>{children}</div>; }
function DialogTitle({ className = '', children }) { return <h2 className={cn('text-lg font-semibold', className)}>{children}</h2>; }
function DialogBody({ className = '', children }) { return <div className={cn('p-6', className)}>{children}</div>; }
function DialogFooter({ className = '', children }) { return <div className={cn('flex justify-end gap-2 p-6 border-t border-border bg-slate-50/50 rounded-b-lg', className)}>{children}</div>; }

/* ---------- Tabs ---------- */
function Tabs({ value, onChange, items, className = '' }) {
  return (
    <div className={cn('inline-flex h-9 items-center justify-center rounded-md bg-slate-100 p-1 text-muted-foreground', className)}>
      {items.map(item => (
        <button
          key={item.value}
          onClick={() => onChange(item.value)}
          className={cn(
            'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1 text-sm font-medium transition-all',
            value === item.value ? 'bg-white text-foreground shadow-sm' : 'hover:text-foreground'
          )}
        >
          {item.icon && <Icon name={item.icon} size={14} className="mr-1.5" />}
          {item.label}
          {item.count != null && <span className="ml-1.5 text-xs text-muted-foreground">{item.count}</span>}
        </button>
      ))}
    </div>
  );
}

/* ---------- Switch ---------- */
function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
        checked ? 'bg-primary' : 'bg-slate-200',
        disabled && 'opacity-50'
      )}
    >
      <span className={cn('pointer-events-none block h-4 w-4 rounded-full bg-white shadow-sm transition-transform', checked ? 'translate-x-4' : 'translate-x-0')} />
    </button>
  );
}

/* ---------- Checkbox ---------- */
function Checkbox({ checked, onChange, disabled, className = '' }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'peer h-4 w-4 shrink-0 rounded-sm border border-input shadow-sm flex items-center justify-center',
        checked ? 'bg-primary border-primary text-primary-foreground' : 'bg-background hover:border-primary/60',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {checked && <Icon name="check" size={11} strokeWidth={3} />}
    </button>
  );
}

/* ---------- Progress ---------- */
function Progress({ value = 0, className = '', barClass = 'bg-primary' }) {
  return (
    <div className={cn('h-2 w-full overflow-hidden rounded-full bg-slate-100', className)}>
      <div className={cn('h-full transition-all duration-300', barClass)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
}

/* ---------- Tooltip (simple) ---------- */
function Tooltip({ content, children, side = 'top' }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      {children}
      {open && (
        <span className={cn(
          'absolute z-50 px-2 py-1 text-xs font-medium text-white bg-slate-900 rounded shadow whitespace-nowrap pointer-events-none',
          side === 'top' && 'bottom-full mb-2 left-1/2 -translate-x-1/2',
          side === 'right' && 'left-full ml-2 top-1/2 -translate-y-1/2',
        )}>
          {content}
        </span>
      )}
    </span>
  );
}

/* ---------- Stat ---------- */
function Stat({ label, value, sub, icon, trend, className = '' }) {
  return (
    <Card className={cn('', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm text-muted-foreground">{label}</span>
          {icon && <Icon name={icon} size={16} className="text-muted-foreground" />}
        </div>
        <div className="text-2xl font-semibold tracking-tight">{value}</div>
        {sub && (
          <div className={cn('text-xs mt-1 flex items-center gap-1', trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-muted-foreground')}>
            {trend && <Icon name={trend === 'up' ? 'trendingUp' : 'trendingDown'} size={12} />}
            {sub}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ---------- Empty State ---------- */
function Empty({ icon, title, description, action, className = '' }) {
  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-12 px-6', className)}>
      {icon && <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-muted-foreground mb-4"><Icon name={icon} size={20} /></div>}
      <div className="font-semibold mb-1">{title}</div>
      {description && <div className="text-sm text-muted-foreground max-w-sm">{description}</div>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* ---------- Section header ---------- */
function SectionHeader({ title, description, children, className = '' }) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-4', className)}>
      <div>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        {description && <p className="text-sm text-muted-foreground mt-0.5">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}

/* ---------- Currency formatter ---------- */
function formatMoney(amount, currency = 'ARS') {
  const symbols = { ARS: '$', USD: 'US$', EUR: '€' };
  return `${symbols[currency] || ''} ${amount.toLocaleString('es-AR', { maximumFractionDigits: 0 })}`;
}

function formatDate(d, opts = {}) {
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric', ...opts });
}

function formatTime(d) {
  if (typeof d === 'string' && /^\d{2}:\d{2}$/.test(d)) return d;
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
}

Object.assign(window, {
  cn, Button, Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Input, Textarea, Label, Select, Avatar,
  Dialog, DialogHeader, DialogTitle, DialogBody, DialogFooter,
  Tabs, Switch, Checkbox, Progress, Tooltip, Stat, Empty, SectionHeader,
  formatMoney, formatDate, formatTime,
});
