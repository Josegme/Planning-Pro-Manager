// M1 — Gestión de Eventos
// EventosPage (dashboard multi-evento) + EventoDetailOverview

function EventoCover({ evento, className = '', tall = false }) {
  // Decorative gradient cover using cover_hue
  const h = evento.cover_hue;
  return (
    <div
      className={cn('relative overflow-hidden rounded-md', tall ? 'h-32' : 'h-20', className)}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 70% 65%) 0%, hsl(${(h + 30) % 360} 70% 50%) 100%)`,
      }}
    >
      <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 200 80" preserveAspectRatio="none">
        <circle cx="20" cy="60" r="40" fill="white" />
        <circle cx="180" cy="20" r="50" fill="white" />
      </svg>
      <div className="absolute top-2 right-2">
        <Badge variant={DATA.EVENT_STATUS_VARIANT[evento.status]} className="bg-white/90 backdrop-blur">
          <span className="inline-block w-1.5 h-1.5 rounded-full" style={{
            background: evento.status === 'activo' ? '#10b981' : evento.status === 'planificacion' ? '#f59e0b' : '#94a3b8'
          }} />
          {DATA.EVENT_STATUS_LABEL[evento.status]}
        </Badge>
      </div>
    </div>
  );
}

function EventoCard({ evento, stats, onClick }) {
  const monthLabel = new Date(evento.date).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase();
  const dayLabel = new Date(evento.date).getDate();
  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md group" onClick={onClick}>
      <EventoCover evento={evento} />
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="text-center shrink-0">
            <div className="text-[10px] font-semibold text-muted-foreground tracking-wider">{monthLabel}</div>
            <div className="text-2xl font-semibold leading-none mt-0.5">{dayLabel}</div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px]">{DATA.TIPO_EVENTO_LABEL[evento.type]}</Badge>
            </div>
            <h3 className="font-semibold text-base mt-1.5 truncate">{evento.name}</h3>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
              <Icon name="mapPin" size={12} />
              <span className="truncate">{evento.venue_name}, {evento.location}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Icon name="clock" size={12} />
              {evento.time} hs
            </div>
          </div>
        </div>

        {stats && (
          <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-border">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Capacidad</div>
              <div className="font-semibold mt-0.5">{stats.confirmados} <span className="text-xs text-muted-foreground font-normal">/ {evento.capacity}</span></div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Confirmados</div>
              <div className="font-semibold mt-0.5">{Math.round(stats.confirmadosPct)}%</div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{evento.status === 'activo' ? 'Check-in' : 'Días'}</div>
              <div className="font-semibold mt-0.5">{evento.status === 'activo' ? `${stats.checkin}` : stats.diasLabel}</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EventosPage({ goto, getStats }) {
  const grouped = useMemo(() => {
    const order = { activo: 0, planificacion: 1, finalizado: 2 };
    return [...DATA.EVENTOS].sort((a, b) => {
      if (a.status !== b.status) return order[a.status] - order[b.status];
      return new Date(a.date) - new Date(b.date);
    });
  }, []);
  const [filter, setFilter] = useState('todos');
  const filtered = grouped.filter(e => filter === 'todos' || e.status === filter);

  const counts = {
    todos: DATA.EVENTOS.length,
    activo: DATA.EVENTOS.filter(e => e.status === 'activo').length,
    planificacion: DATA.EVENTOS.filter(e => e.status === 'planificacion').length,
    finalizado: DATA.EVENTOS.filter(e => e.status === 'finalizado').length,
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <SectionHeader title="Mis eventos" description="Todos los eventos de tu organización">
        <Button variant="outline" size="sm">
          <Icon name="download" size={14} /> Importar
        </Button>
        <Button size="sm">
          <Icon name="plus" size={14} /> Nuevo evento
        </Button>
      </SectionHeader>

      <div className="flex items-center gap-3 mb-6">
        <Tabs
          value={filter}
          onChange={setFilter}
          items={[
            { value: 'todos', label: 'Todos', count: counts.todos },
            { value: 'activo', label: 'Activos', count: counts.activo },
            { value: 'planificacion', label: 'Planificación', count: counts.planificacion },
            { value: 'finalizado', label: 'Finalizados', count: counts.finalizado },
          ]}
        />
        <div className="ml-auto relative w-72">
          <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Buscar evento, salón..." className="pl-9" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map(ev => (
          <EventoCard key={ev.id} evento={ev} stats={getStats(ev)} onClick={() => goto('evento', { id: ev.id })} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Evento overview tab ---------- */
function OverviewMetric({ label, value, icon, color = 'primary', sub }) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-muted-foreground font-medium">{label}</span>
          <div className={cn('h-8 w-8 rounded-md flex items-center justify-center',
            color === 'primary' && 'bg-blue-50 text-blue-600',
            color === 'success' && 'bg-emerald-50 text-emerald-600',
            color === 'warning' && 'bg-amber-50 text-amber-600',
            color === 'danger' && 'bg-rose-50 text-rose-600',
          )}>
            <Icon name={icon} size={16} />
          </div>
        </div>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function EventoOverview({ evento, stats, onModuleJump }) {
  const daysToEvent = useMemo(() => {
    const d = new Date(evento.date);
    const today = new Date('2026-05-13');
    return Math.ceil((d - today) / 86400000);
  }, [evento]);

  const restriccionesAgg = useMemo(() => {
    const agg = {};
    for (const inv of DATA.INVITADOS) {
      if (inv.status !== 'confirmado') continue;
      for (const r of inv.dietary_restrictions) agg[r] = (agg[r] || 0) + 1;
    }
    return agg;
  }, []);

  const progressItems = [
    { label: 'Invitados confirmados', value: stats.confirmadosPct, color: 'bg-blue-500' },
    { label: 'Mesas asignadas', value: 92, color: 'bg-violet-500' },
    { label: 'Servicios contratados', value: 100, color: 'bg-emerald-500' },
    { label: 'Pagos al día', value: 68, color: 'bg-amber-500' },
    { label: 'Plano del salón', value: 100, color: 'bg-sky-500' },
    { label: 'Comanda definida', value: 80, color: 'bg-rose-500' },
  ];

  return (
    <div className="space-y-6">
      {/* Top hero */}
      <Card className="overflow-hidden">
        <div className="relative h-32" style={{ background: `linear-gradient(135deg, hsl(${evento.cover_hue} 70% 60%) 0%, hsl(${(evento.cover_hue+30)%360} 65% 45%) 100%)` }}>
          <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 200" preserveAspectRatio="none">
            <circle cx="100" cy="180" r="80" fill="white" />
            <circle cx="700" cy="40" r="100" fill="white" />
            <circle cx="400" cy="100" r="40" fill="white" />
          </svg>
        </div>
        <CardContent className="p-6 -mt-12 relative">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            <div className="bg-white shadow-md rounded-lg p-3 inline-flex items-center gap-3 border border-border">
              <div className="text-center px-2">
                <div className="text-[10px] font-semibold text-muted-foreground tracking-wider">
                  {new Date(evento.date).toLocaleDateString('es-AR', { month: 'short' }).replace('.', '').toUpperCase()}
                </div>
                <div className="text-3xl font-semibold leading-none mt-0.5">{new Date(evento.date).getDate()}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(evento.date).getFullYear()}</div>
              </div>
              <div className="border-l border-border h-12" />
              <div>
                <div className="font-mono text-2xl font-semibold">{evento.time}</div>
                <div className="text-xs text-muted-foreground">Hora de inicio</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant={DATA.EVENT_STATUS_VARIANT[evento.status]}>
                  <span className="inline-block w-1.5 h-1.5 rounded-full" style={{
                    background: evento.status === 'activo' ? '#10b981' : evento.status === 'planificacion' ? '#f59e0b' : '#94a3b8'
                  }} />
                  {DATA.EVENT_STATUS_LABEL[evento.status]}
                </Badge>
                <Badge variant="outline">{DATA.TIPO_EVENTO_LABEL[evento.type]}</Badge>
                {daysToEvent > 0 && <span className="text-sm text-muted-foreground">en <strong className="text-foreground">{daysToEvent} días</strong></span>}
                {daysToEvent === 0 && <span className="text-sm text-emerald-600 font-medium">¡Hoy es el día!</span>}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight">{evento.name}</h1>
              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                <Icon name="mapPin" size={14} />
                {evento.venue_name} · {evento.location}
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm"><Icon name="edit" size={14} /> Editar</Button>
              <Button size="sm"><Icon name="zap" size={14} /> Activar evento</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewMetric label="Confirmados" value={`${stats.confirmados}/${evento.capacity}`} icon="users" color="primary"
          sub={`${Math.round(stats.confirmadosPct)}% de la capacidad`} />
        <OverviewMetric label="Pendientes" value={stats.pendientes} icon="clock" color="warning"
          sub="por confirmar asistencia" />
        <OverviewMetric label="Mesas" value="22" icon="table" color="success"
          sub={`${stats.mesasAsignadasPct}% asignadas`} />
        <OverviewMetric label="Presupuesto" value={formatMoney(8650000)} icon="dollar" color="danger"
          sub={`${formatMoney(6565000)} pagados`} />
      </div>

      {/* Progress + Restricciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Progreso de planificación</CardTitle>
            <CardDescription>Estado de cada módulo del evento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {progressItems.map(p => (
              <div key={p.label}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span>{p.label}</span>
                  <span className="font-medium tabular-nums">{Math.round(p.value)}%</span>
                </div>
                <Progress value={p.value} barClass={p.color} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Restricciones dietarias</CardTitle>
            <CardDescription>De los {stats.confirmados} confirmados</CardDescription>
          </CardHeader>
          <CardContent>
            {Object.keys(restriccionesAgg).length === 0 && <Empty icon="utensils" title="Sin restricciones" />}
            <div className="space-y-2.5">
              {Object.entries(restriccionesAgg).sort((a,b) => b[1]-a[1]).map(([key, count]) => (
                <div key={key} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-blue-500" />
                    {DATA.RESTRICCION_LABEL[key]}
                  </div>
                  <span className="font-mono font-medium">{count}</span>
                </div>
              ))}
            </div>
            <Button variant="link" size="sm" className="p-0 h-auto mt-4 text-xs" onClick={() => onModuleJump('comanda')}>
              Ver en comanda <Icon name="arrowRight" size={12} />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Compartir link RSVP', icon: 'link', mod: 'rsvp' },
          { label: 'Ver lista de invitados', icon: 'users', mod: 'invitados' },
          { label: 'Ver plano del salón', icon: 'map', mod: 'plano' },
          { label: 'Configurar comanda', icon: 'chef', mod: 'comanda' },
        ].map(a => (
          <Card key={a.label} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => onModuleJump(a.mod)}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className="h-9 w-9 rounded-md bg-slate-100 flex items-center justify-center"><Icon name={a.icon} size={16} /></div>
              <div className="flex-1 text-sm font-medium">{a.label}</div>
              <Icon name="chevronRight" size={14} className="text-muted-foreground" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { EventosPage, EventoOverview, EventoCard });
