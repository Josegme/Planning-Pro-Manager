// M8 — Checklist de Servicios del Evento

function ChecklistPage({ liveMode }) {
  // For each template, status: not-applied / pending / confirmed / problem
  const initial = useMemo(() => {
    const m = {};
    DATA.SERVICE_TEMPLATES.forEach(t => {
      // Apply ~12 services by default
      const applied = ['tpl-1','tpl-2','tpl-3','tpl-4','tpl-5','tpl-7','tpl-9','tpl-10','tpl-14','tpl-15','tpl-17','tpl-19','tpl-20'].includes(t.id);
      m[t.id] = { applied, status: 'pendiente', note: '' };
    });
    // Live mode simulates day-of: some are confirmed, one has a problem
    if (liveMode) {
      ['tpl-1','tpl-5','tpl-9','tpl-14','tpl-15','tpl-19','tpl-17'].forEach(id => { if (m[id]) m[id].status = 'confirmado'; });
      if (m['tpl-10']) { m['tpl-10'].status = 'problema'; m['tpl-10'].note = 'Falta el cable HDMI 4K. Llaman al proveedor.'; }
    }
    return m;
  }, [liveMode]);

  const [state, setState] = useState(initial);

  const byCategory = useMemo(() => {
    const g = {};
    DATA.SERVICE_TEMPLATES.forEach(t => { (g[t.category] = g[t.category] || []).push(t); });
    return g;
  }, []);

  function update(tplId, patch) {
    setState({ ...state, [tplId]: { ...state[tplId], ...patch } });
  }

  const totals = useMemo(() => {
    const applied = Object.values(state).filter(s => s.applied);
    return {
      applied: applied.length,
      confirmados: applied.filter(s => s.status === 'confirmado').length,
      problemas: applied.filter(s => s.status === 'problema').length,
      pendientes: applied.filter(s => s.status === 'pendiente').length,
    };
  }, [state]);

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <SectionHeader title="Checklist de servicios" description="Biblioteca maestra de servicios. Activa los que aplican al evento y marca el estado el dia.">
        <Button variant="outline" size="sm"><Icon name="copy" size={14} /> Aplicar plantilla</Button>
        <Button size="sm"><Icon name="plus" size={14} /> Item nuevo</Button>
      </SectionHeader>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Aplicados</div><div className="text-2xl font-semibold mt-1">{totals.applied}/{DATA.SERVICE_TEMPLATES.length}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Confirmados</div><div className="text-2xl font-semibold text-emerald-600 mt-1">{totals.confirmados}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Pendientes</div><div className="text-2xl font-semibold text-amber-600 mt-1">{totals.pendientes}</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Problemas</div><div className="text-2xl font-semibold text-rose-600 mt-1">{totals.problemas}</div></CardContent></Card>
      </div>

      <div className="space-y-4">
        {Object.entries(byCategory).map(([cat, items]) => (
          <Card key={cat}>
            <CardHeader className="py-3 px-5 border-b border-border bg-slate-50/40">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-semibold">{cat}</CardTitle>
                <Badge variant="secondary">{items.filter(t => state[t.id].applied).length} / {items.length}</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {items.map((t, idx) => {
                const s = state[t.id];
                return (
                  <div key={t.id} className={cn('flex items-center gap-3 px-5 py-3 border-b border-border last:border-0', !s.applied && 'opacity-60 bg-slate-50/30')}>
                    <Checkbox checked={s.applied} onChange={(v) => update(t.id, { applied: v })} />
                    <div className="flex-1">
                      <div className="text-sm font-medium flex items-center gap-2">
                        {t.name}
                        {t.required && <Badge variant="danger" className="text-[9px]">Requerido</Badge>}
                      </div>
                      {s.note && <div className="text-xs text-rose-600 mt-1 flex items-center gap-1"><Icon name="alert" size={11} /> {s.note}</div>}
                    </div>
                    {s.applied && (
                      <div className="flex items-center gap-1">
                        {[
                          { value: 'pendiente', label: 'Pendiente', icon: 'clock', color: 'text-slate-400' },
                          { value: 'confirmado', label: 'OK', icon: 'check', color: 'text-emerald-600' },
                          { value: 'problema', label: 'Problema', icon: 'alert', color: 'text-rose-600' },
                        ].map(opt => (
                          <button
                            key={opt.value}
                            onClick={() => update(t.id, { status: opt.value })}
                            className={cn(
                              'flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                              s.status === opt.value
                                ? opt.value === 'confirmado' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                : opt.value === 'problema' ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                                : 'text-muted-foreground hover:bg-slate-50 border border-transparent'
                            )}
                          >
                            <Icon name={opt.icon} size={11} /> {opt.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ChecklistPage });
