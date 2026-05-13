// M6 — Timeline del Evento

function timeToMinutes(t) {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
}

function TimelinePage({ liveMode }) {
  // Local state: progress simulation
  const [etapas, setEtapas] = useState(() => DATA.TIMELINE.map((e, i) => ({
    ...e,
    status: liveMode && i < 5 ? (i < 4 ? 'completada' : 'en_curso') : 'pendiente',
    hora_real: liveMode && i < 4 ? e.hora_planificada : null,
    desvio: liveMode && i < 4 ? (i === 2 ? 8 : i === 3 ? 14 : 0) : null,
  })));

  function markComplete(id) {
    setEtapas(etapas.map(e => e.id === id ? { ...e, status: 'completada', hora_real: e.hora_planificada, desvio: Math.floor(Math.random() * 20 - 5) } : e));
  }
  function startEtapa(id) {
    setEtapas(etapas.map(e => e.id === id ? { ...e, status: 'en_curso' } : e));
  }

  const completed = etapas.filter(e => e.status === 'completada').length;
  const total = etapas.length;
  const progress = (completed / total) * 100;
  const current = etapas.find(e => e.status === 'en_curso');
  const acumulado = etapas.reduce((s, e) => s + (e.desvio || 0), 0);

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <SectionHeader title="Timeline del evento" description="Programa hora a hora con seguimiento en tiempo real">
        <Button variant="outline" size="sm"><Icon name="bell" size={14} /> Notificaciones</Button>
        <Button variant="outline" size="sm"><Icon name="copy" size={14} /> Duplicar plantilla</Button>
        <Button size="sm"><Icon name="plus" size={14} /> Nueva etapa</Button>
      </SectionHeader>

      {/* Progress card */}
      <Card className="mb-6">
        <CardContent className="p-5">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div className="flex-1 min-w-[260px]">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm text-muted-foreground">Progreso del evento</span>
                <Badge variant={acumulado > 10 ? 'warning' : 'success'}>
                  {acumulado >= 0 ? '+' : ''}{acumulado} min acumulado
                </Badge>
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-semibold">{completed}<span className="text-base text-muted-foreground font-normal">/{total}</span></span>
                <span className="text-sm text-muted-foreground">etapas completadas</span>
              </div>
              <Progress value={progress} barClass="bg-emerald-500" />
            </div>
            {current && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 min-w-[260px]">
                <div className="text-xs text-blue-600 font-medium mb-1">EN CURSO AHORA</div>
                <div className="font-semibold">{current.nombre}</div>
                <div className="text-xs text-muted-foreground mt-1">Inicio: {current.hora_planificada} · Duracion {current.duracion} min</div>
                <Button size="sm" className="mt-3" onClick={() => markComplete(current.id)}>
                  <Icon name="check" size={13} /> Marcar como completada
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Timeline list */}
      <Card>
        <div className="p-5">
          {etapas.map((e, idx) => {
            const isLast = idx === etapas.length - 1;
            const statusColors = {
              completada: { dot: 'bg-emerald-500', border: 'border-emerald-200', bg: 'bg-emerald-50/40' },
              en_curso: { dot: 'bg-blue-500 ring-4 ring-blue-100', border: 'border-blue-300', bg: 'bg-blue-50/60' },
              pendiente: { dot: 'bg-slate-300', border: 'border-border', bg: '' },
            }[e.status];
            const trafficColor = e.desvio == null ? null : Math.abs(e.desvio) < 5 ? 'bg-emerald-500' : Math.abs(e.desvio) < 15 ? 'bg-amber-500' : 'bg-rose-500';
            return (
              <div key={e.id} className="relative flex gap-4 pb-5 last:pb-0">
                {!isLast && <div className="absolute left-[19px] top-8 bottom-0 w-px bg-border" />}
                <div className="relative shrink-0">
                  <div className={cn('h-10 w-10 rounded-full flex items-center justify-center font-semibold text-sm', statusColors.dot, 'text-white shadow-sm')}>
                    {e.status === 'completada' ? <Icon name="check" size={16} strokeWidth={3} /> : e.status === 'en_curso' ? <Icon name="play" size={12} /> : <span>{idx + 1}</span>}
                  </div>
                </div>
                <div className={cn('flex-1 rounded-md border p-3', statusColors.border, statusColors.bg)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-medium flex items-center gap-2">
                        {e.nombre}
                        {trafficColor && <span className={cn('inline-block w-2 h-2 rounded-full', trafficColor)} />}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-3 mt-1 font-mono">
                        <span><Icon name="clock" size={11} className="inline mr-1" />{e.hora_planificada}</span>
                        <span>{e.duracion} min</span>
                        {e.hora_real && <span className="text-foreground">Real: {e.hora_real}</span>}
                        {e.desvio != null && e.desvio !== 0 && (
                          <span className={e.desvio > 0 ? 'text-rose-600' : 'text-emerald-600'}>{e.desvio > 0 ? '+' : ''}{e.desvio} min</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {e.status === 'pendiente' && (
                        <Button size="sm" variant="outline" onClick={() => startEtapa(e.id)}>
                          <Icon name="play" size={12} /> Iniciar
                        </Button>
                      )}
                      {e.status === 'en_curso' && (
                        <Button size="sm" onClick={() => markComplete(e.id)}>
                          <Icon name="check" size={12} /> Completar
                        </Button>
                      )}
                      <Button size="icon-sm" variant="ghost"><Icon name="moreHorizontal" size={14} /></Button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

Object.assign(window, { TimelinePage });
