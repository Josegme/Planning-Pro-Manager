// Planning Pro — Main app shell
// Sidebar nav + module router + tweaks panel

const MODULES = [
  { id: 'overview', label: 'Overview', icon: 'grid', category: 'general' },
  { id: 'invitados', label: 'Invitados', icon: 'users', category: 'eventos', count: 180, mid: 'M2' },
  { id: 'rsvp', label: 'RSVP y QR', icon: 'mail', category: 'eventos', mid: 'M3' },
  { id: 'mesas', label: 'Mesas', icon: 'table', category: 'eventos', mid: 'M4' },
  { id: 'plano', label: 'Plano del salon', icon: 'map', category: 'eventos', mid: 'M5' },
  { id: 'timeline', label: 'Timeline', icon: 'clock', category: 'eventos', mid: 'M6' },
  { id: 'servicios', label: 'Servicios y proveedores', icon: 'briefcase', category: 'operacion', mid: 'M7' },
  { id: 'checklist', label: 'Checklist', icon: 'list', category: 'operacion', mid: 'M8' },
  { id: 'comanda', label: 'Comanda del chef', icon: 'chef', category: 'operacion', mid: 'M9' },
  { id: 'checkin', label: 'Check-in (recepcion)', icon: 'scan', category: 'diaD', mid: 'M10' },
  { id: 'reportes', label: 'Reportes', icon: 'chart', category: 'diaD', mid: 'M11' },
];

function Sidebar({ active, onNav, evento, onEventClick }) {
  const groups = [
    { label: 'GENERAL', items: MODULES.filter(m => m.category === 'general') },
    { label: 'EVENTO', items: MODULES.filter(m => m.category === 'eventos') },
    { label: 'OPERACION', items: MODULES.filter(m => m.category === 'operacion') },
    { label: 'DIA DEL EVENTO', items: MODULES.filter(m => m.category === 'diaD') },
  ];
  return (
    <aside className="w-60 shrink-0 bg-white border-r border-border flex flex-col">
      <div className="px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold">P</div>
          <div>
            <div className="font-semibold text-sm leading-tight">Planning Pro</div>
            <div className="text-[10px] text-muted-foreground">Estudio Vidal</div>
          </div>
        </div>
      </div>

      {/* Event switcher */}
      <button onClick={onEventClick} className="mx-3 mt-3 mb-1 p-2.5 rounded-md border border-border hover:bg-slate-50 text-left">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-md shrink-0" style={{ background: `linear-gradient(135deg, hsl(${evento.cover_hue} 70% 60%), hsl(${(evento.cover_hue+30)%360} 65% 45%))` }} />
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Evento activo</div>
            <div className="text-sm font-semibold truncate">{evento.name}</div>
          </div>
          <Icon name="chevronDown" size={14} className="text-muted-foreground" />
        </div>
      </button>

      <nav className="flex-1 overflow-y-auto px-3 py-2">
        {groups.map(g => (
          <div key={g.label} className="mb-2">
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider px-2 py-1.5">{g.label}</div>
            {g.items.map(m => (
              <button
                key={m.id}
                onClick={() => onNav(m.id)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-2 py-1.5 rounded-md text-sm transition-colors text-left',
                  active === m.id ? 'bg-primary/10 text-primary font-medium' : 'text-foreground hover:bg-slate-100'
                )}
              >
                <Icon name={m.icon} size={15} />
                <span className="flex-1 truncate">{m.label}</span>
                {m.count != null && <span className="text-[10px] text-muted-foreground tabular-nums">{m.count}</span>}
                {m.mid && active !== m.id && <span className="text-[9px] text-muted-foreground/60 font-mono">{m.mid}</span>}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-2.5">
          <Avatar name="Mariano Vidal" size={32} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate">Mariano Vidal</div>
            <div className="text-[10px] text-muted-foreground truncate">organizador@vidaleventos.com</div>
          </div>
          <Icon name="settings" size={15} className="text-muted-foreground" />
        </div>
      </div>
    </aside>
  );
}

function Topbar({ active, evento, tweaks }) {
  const moduleObj = MODULES.find(m => m.id === active);
  return (
    <header className="h-14 border-b border-border bg-white px-6 flex items-center gap-4 shrink-0">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">{evento.name}</span>
        <Icon name="chevronRight" size={14} className="text-muted-foreground" />
        <span className="font-medium">{moduleObj?.label || 'Overview'}</span>
      </div>
      <div className="flex-1" />
      <div className="flex items-center gap-2">
        <div className="relative w-64">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar..." className="pl-9 h-8 text-xs" />
        </div>
        {tweaks.liveMode && (
          <Badge variant="info"><span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" /> En vivo</Badge>
        )}
        <Button variant="ghost" size="icon-sm"><Icon name="bell" size={16} /></Button>
        <Button variant="ghost" size="icon-sm"><Icon name="settings" size={16} /></Button>
      </div>
    </header>
  );
}

/* ---------- Event picker modal ---------- */
function EventPickerModal({ open, onClose, currentId, onPick, getStats }) {
  return (
    <Dialog open={open} onClose={onClose} maxW="max-w-3xl">
      <DialogHeader>
        <DialogTitle>Cambiar evento activo</DialogTitle>
      </DialogHeader>
      <DialogBody>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {DATA.EVENTOS.map(e => (
            <button
              key={e.id}
              onClick={() => { onPick(e.id); onClose(); }}
              className={cn(
                'text-left p-4 rounded-md border transition-colors',
                e.id === currentId ? 'border-primary bg-primary/5' : 'border-border hover:bg-slate-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-md shrink-0" style={{ background: `linear-gradient(135deg, hsl(${e.cover_hue} 70% 60%), hsl(${(e.cover_hue+30)%360} 65% 45%))` }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant={DATA.EVENT_STATUS_VARIANT[e.status]} className="text-[10px]">{DATA.EVENT_STATUS_LABEL[e.status]}</Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(e.date)}</span>
                  </div>
                  <div className="font-semibold truncate">{e.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{e.venue_name}</div>
                </div>
                {e.id === currentId && <Icon name="check" size={18} className="text-primary" />}
              </div>
            </button>
          ))}
        </div>
      </DialogBody>
    </Dialog>
  );
}

/* ---------- Overview = combine dashboard + active evento overview ---------- */
function OverviewPage({ evento, stats, onModuleJump, setShowPicker }) {
  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto space-y-8">
      <EventoOverview evento={evento} stats={stats} onModuleJump={onModuleJump} />
      <div>
        <SectionHeader title="Tus otros eventos" description="Vista general de todos los eventos de tu organizacion">
          <Button size="sm" variant="outline" onClick={() => setShowPicker(true)}>
            Ver todos <Icon name="arrowRight" size={14} />
          </Button>
        </SectionHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {DATA.EVENTOS.filter(e => e.id !== evento.id).slice(0, 3).map(e => (
            <EventoCard key={e.id} evento={e} stats={null} onClick={() => setShowPicker(true)} />
          ))}
        </div>
      </div>
    </div>
  );
}

function PlanningProApp() {
  const [activeMod, setActiveMod] = useState('overview');
  const [activeEventoId, setActiveEventoId] = useState('ev-1');
  const [showPicker, setShowPicker] = useState(false);

  const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
    "liveMode": false,
    "density": "comfortable",
    "showModuleIds": true
  }/*EDITMODE-END*/;
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);

  const evento = DATA.EVENTOS.find(e => e.id === activeEventoId) || DATA.EVENTOS[0];

  function getStats(ev) {
    if (ev.id !== 'ev-1') {
      // synthetic for other events
      const fake = Math.floor(ev.capacity * (ev.status === 'finalizado' ? 0.85 : ev.status === 'activo' ? 0.6 : 0.4));
      const today = new Date('2026-05-13');
      const dias = Math.ceil((new Date(ev.date) - today) / 86400000);
      return {
        confirmados: fake,
        confirmadosPct: (fake / ev.capacity) * 100,
        checkin: ev.status === 'activo' ? Math.floor(fake * 0.6) : 0,
        diasLabel: dias > 0 ? `${dias}d` : dias === 0 ? 'Hoy' : 'Pasado',
        pendientes: ev.capacity - fake,
        mesasAsignadasPct: 100,
      };
    }
    const conf = DATA.INVITADOS.filter(i => i.status === 'confirmado').length;
    const pend = DATA.INVITADOS.filter(i => i.status === 'pendiente' || i.status === 'invitado' || i.status === 'visto').length;
    const checkin = tweaks.liveMode ? Math.floor(conf * 0.38) : 0;
    return {
      confirmados: conf,
      confirmadosPct: (conf / ev.capacity) * 100,
      pendientes: pend,
      checkin,
      diasLabel: '7d',
      mesasAsignadasPct: 92,
    };
  }

  const stats = getStats(evento);

  function renderActive() {
    if (activeMod === 'overview') return <OverviewPage evento={evento} stats={stats} onModuleJump={setActiveMod} setShowPicker={setShowPicker} />;
    if (activeMod === 'invitados') return <InvitadosPage />;
    if (activeMod === 'rsvp') return <RsvpPage evento={evento} />;
    if (activeMod === 'mesas') return <MesasPage />;
    if (activeMod === 'plano') return <PlanoPage liveCheckin={tweaks.liveMode} />;
    if (activeMod === 'timeline') return <TimelinePage liveMode={tweaks.liveMode} />;
    if (activeMod === 'servicios') return <ServiciosPage />;
    if (activeMod === 'checklist') return <ChecklistPage liveMode={tweaks.liveMode} />;
    if (activeMod === 'comanda') return <ComandaPage liveMode={tweaks.liveMode} />;
    if (activeMod === 'checkin') return <CheckinPage liveMode={tweaks.liveMode} />;
    if (activeMod === 'reportes') return <ReportesPage stats={stats} />;
    return null;
  }

  return (
    <div className="h-full flex bg-slate-50">
      <Sidebar active={activeMod} onNav={setActiveMod} evento={evento} onEventClick={() => setShowPicker(true)} />
      <main className="flex-1 flex flex-col min-w-0">
        <Topbar active={activeMod} evento={evento} tweaks={tweaks} />
        <div className={cn('flex-1 overflow-y-auto', activeMod === 'checkin' && 'p-0')}>
          {renderActive()}
        </div>
      </main>

      <EventPickerModal
        open={showPicker}
        onClose={() => setShowPicker(false)}
        currentId={activeEventoId}
        onPick={setActiveEventoId}
        getStats={getStats}
      />

      <TweaksPanel title="Tweaks">
        <TweakSection label="Estado del evento">
          <TweakToggle
            label="Simular evento en vivo"
            value={tweaks.liveMode}
            onChange={(v) => setTweak('liveMode', v)}
          />
          <TweakToggle
            label="Mostrar IDs de modulo"
            value={tweaks.showModuleIds}
            onChange={(v) => setTweak('showModuleIds', v)}
          />
        </TweakSection>
        <TweakSection label="Navegacion rapida">
          <div className="text-xs text-slate-500 mb-2">Saltar directamente a un modulo:</div>
          <div className="grid grid-cols-2 gap-1.5">
            {MODULES.filter(m => m.mid).map(m => (
              <button
                key={m.id}
                onClick={() => setActiveMod(m.id)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1.5 rounded text-xs border transition-colors',
                  activeMod === m.id ? 'bg-blue-500 text-white border-blue-500' : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                )}
              >
                <Icon name={m.icon} size={12} />
                <span className="font-mono text-[10px] opacity-70">{m.mid}</span>
                <span className="truncate flex-1 text-left">{m.label}</span>
              </button>
            ))}
          </div>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<PlanningProApp />);
