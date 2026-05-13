// M4 — Gestion de Mesas (drag & drop assignment)

function MesaCard({ mesa, invitados, onDrop, onDragOver, dragOver, onUnassign, onClick }) {
  const ocupados = invitados.reduce((s, i) => s + 1 + i.acompañantes_esperados, 0);
  const pct = (ocupados / mesa.capacity) * 100;
  const allCheckin = invitados.length > 0 && invitados.every(i => i.status === 'checkin');
  const status = allCheckin ? 'checkin' : ocupados === mesa.capacity ? 'full' : ocupados > 0 ? 'partial' : 'empty';
  const colors = {
    empty: { ring: 'ring-slate-200', bg: 'bg-slate-50/50', text: 'text-slate-500', bar: 'bg-slate-300' },
    partial: { ring: 'ring-amber-300', bg: 'bg-amber-50/40', text: 'text-amber-700', bar: 'bg-amber-400' },
    full: { ring: 'ring-orange-400', bg: 'bg-orange-50/40', text: 'text-orange-700', bar: 'bg-orange-500' },
    checkin: { ring: 'ring-blue-400', bg: 'bg-blue-50/40', text: 'text-blue-700', bar: 'bg-blue-500' },
  }[status];

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(mesa.id); }}
      onDragLeave={() => onDragOver(null)}
      onDrop={(e) => { e.preventDefault(); onDrop(mesa.id); }}
      className={cn(
        'rounded-md border bg-white p-3 cursor-pointer transition-all',
        dragOver === mesa.id ? 'ring-2 ring-primary border-primary' : `ring-1 ${colors.ring}`,
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className={cn('h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold', colors.bg, colors.text)}>
            {mesa.number}
          </div>
          <div>
            <div className="text-sm font-medium leading-tight">{mesa.name || `Mesa ${mesa.number}`}</div>
            <div className="text-[10px] text-muted-foreground">cap. {mesa.capacity}</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-mono font-semibold tabular-nums">{ocupados}<span className="text-muted-foreground font-normal">/{mesa.capacity}</span></div>
        </div>
      </div>

      <div className="h-1 rounded-full bg-slate-100 overflow-hidden mb-2.5">
        <div className={cn('h-full', colors.bar)} style={{ width: `${Math.min(100, pct)}%` }} />
      </div>

      {mesa.menu_especial && (
        <Badge variant="warning" className="mb-2 text-[10px]"><Icon name="utensils" size={10} /> {mesa.menu_especial}</Badge>
      )}

      <div className="space-y-1 min-h-[40px]">
        {invitados.length === 0 ? (
          <div className="text-[11px] text-muted-foreground italic text-center py-3 border border-dashed border-border rounded">
            Arrastra invitados aqui
          </div>
        ) : (
          invitados.slice(0, 4).map(inv => (
            <div key={inv.id} className="flex items-center gap-1.5 text-xs group" onClick={(e) => e.stopPropagation()}>
              <Avatar name={`${inv.nombre} ${inv.apellido}`} size={18} />
              <span className="truncate flex-1">{inv.nombre} {inv.apellido[0]}.{inv.acompañantes_esperados > 0 && ` (+${inv.acompañantes_esperados})`}</span>
              <button className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-rose-500" onClick={() => onUnassign(inv.id)}>
                <Icon name="x" size={12} />
              </button>
            </div>
          ))
        )}
        {invitados.length > 4 && (
          <div className="text-[11px] text-muted-foreground">+{invitados.length - 4} mas</div>
        )}
      </div>
    </div>
  );
}

function MesasPage() {
  // Local mutable copy so drag & drop works
  const [assigns, setAssigns] = useState(() => {
    const m = {};
    DATA.INVITADOS.forEach(i => { m[i.id] = i.mesa_id; });
    return m;
  });
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [searchUnassigned, setSearchUnassigned] = useState('');

  const invitadosByMesa = useMemo(() => {
    const map = {};
    DATA.MESAS.forEach(m => { map[m.id] = []; });
    DATA.INVITADOS.forEach(inv => {
      const mid = assigns[inv.id];
      if (mid && map[mid]) map[mid].push(inv);
    });
    return map;
  }, [assigns]);

  const unassigned = useMemo(() => {
    return DATA.INVITADOS.filter(i => !assigns[i.id] && i.status === 'confirmado')
      .filter(i => {
        if (!searchUnassigned) return true;
        const q = searchUnassigned.toLowerCase();
        return `${i.nombre} ${i.apellido}`.toLowerCase().includes(q);
      });
  }, [assigns, searchUnassigned]);

  const totalAsignados = DATA.INVITADOS.filter(i => assigns[i.id]).length;
  const totalCapacidad = DATA.MESAS.reduce((s, m) => s + m.capacity, 0);

  function handleDrop(mesaId) {
    if (!dragId) return;
    setAssigns({ ...assigns, [dragId]: mesaId });
    setDragId(null);
    setDragOver(null);
  }
  function handleUnassign(invId) {
    setAssigns({ ...assigns, [invId]: null });
  }
  function autoAssign() {
    // Simple auto: fill mesas with unassigned confirmados
    const next = { ...assigns };
    const counts = {};
    DATA.MESAS.forEach(m => {
      counts[m.id] = invitadosByMesa[m.id].reduce((s, i) => s + 1 + i.acompañantes_esperados, 0);
    });
    let mIdx = 0;
    for (const inv of unassigned) {
      const need = 1 + inv.acompañantes_esperados;
      while (mIdx < DATA.MESAS.length) {
        const m = DATA.MESAS[mIdx];
        if (counts[m.id] + need <= m.capacity) {
          next[inv.id] = m.id;
          counts[m.id] += need;
          break;
        }
        mIdx++;
      }
    }
    setAssigns(next);
  }

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      <SectionHeader title="Mesas" description={`${DATA.MESAS.length} mesas · ${totalAsignados} invitados asignados · capacidad total ${totalCapacidad}`}>
        <Button variant="outline" size="sm" onClick={autoAssign}><Icon name="sparkles" size={14} /> Asignacion automatica</Button>
        <Button variant="outline" size="sm"><Icon name="plus" size={14} /> Nueva mesa</Button>
        <Button size="sm" variant="outline"><Icon name="external" size={14} /> Ver en plano</Button>
      </SectionHeader>

      <div className="grid grid-cols-12 gap-4">
        {/* Unassigned column */}
        <div className="col-span-12 lg:col-span-3">
          <Card className="lg:sticky lg:top-6">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Sin asignar</CardTitle>
                <Badge variant="warning">{unassigned.length}</Badge>
              </div>
              <CardDescription>Arrastra a una mesa</CardDescription>
            </CardHeader>
            <CardContent className="p-3">
              <div className="relative mb-3">
                <Icon name="search" size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input value={searchUnassigned} onChange={e => setSearchUnassigned(e.target.value)} className="h-8 pl-7 text-xs" placeholder="Buscar..." />
              </div>
              <div className="space-y-1 max-h-[60vh] overflow-y-auto scrollbar-thin pr-1">
                {unassigned.length === 0 && <Empty icon="check" title="Todos asignados" />}
                {unassigned.map(inv => (
                  <div
                    key={inv.id}
                    draggable
                    onDragStart={() => setDragId(inv.id)}
                    onDragEnd={() => { setDragId(null); setDragOver(null); }}
                    className={cn(
                      'flex items-center gap-2 px-2 py-1.5 rounded-md border border-border bg-white cursor-grab active:cursor-grabbing text-xs hover:border-primary hover:bg-primary/5',
                      dragId === inv.id && 'opacity-50',
                    )}
                  >
                    <Avatar name={`${inv.nombre} ${inv.apellido}`} size={22} />
                    <div className="flex-1 truncate">
                      <div className="font-medium truncate">{inv.nombre} {inv.apellido}</div>
                      <div className="text-[10px] text-muted-foreground truncate">{inv.grupo}{inv.acompañantes_esperados > 0 && ` · +${inv.acompañantes_esperados}`}</div>
                    </div>
                    {inv.dietary_restrictions.length > 0 && <Icon name="utensils" size={11} className="text-amber-500" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mesas grid */}
        <div className="col-span-12 lg:col-span-9">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {DATA.MESAS.map(m => (
              <MesaCard
                key={m.id}
                mesa={m}
                invitados={invitadosByMesa[m.id] || []}
                onDragOver={setDragOver}
                onDrop={handleDrop}
                dragOver={dragOver}
                onUnassign={handleUnassign}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { MesasPage });
