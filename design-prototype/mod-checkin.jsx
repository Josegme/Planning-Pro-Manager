// M10 — Check-in en Tiempo Real (recepcion view, tablet-friendly)

function CheckinPage({ liveMode }) {
  const [scanMode, setScanMode] = useState('scan'); // scan | search
  const [lastScanned, setLastScanned] = useState(null);
  const [search, setSearch] = useState('');
  const [pendingSyncs, setPendingSyncs] = useState(2);
  const [online, setOnline] = useState(true);

  // Local mutable state for who's been checked in
  const [checked, setChecked] = useState(() => {
    const m = {};
    if (liveMode) {
      // simulate ~38% confirmados already at venue
      DATA.INVITADOS.forEach((inv, idx) => {
        if (inv.status === 'confirmado' && idx % 3 === 0) m[inv.id] = { time: '20:45' };
      });
    }
    return m;
  });

  const confirmados = DATA.INVITADOS.filter(i => i.status === 'confirmado');
  const checkinCount = Object.keys(checked).length;
  const checkinPct = (checkinCount / confirmados.length) * 100;

  function doCheckin(invitadoId, acompPresentes) {
    const inv = DATA.INVITADOS.find(i => i.id === invitadoId);
    const now = new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    setChecked({ ...checked, [invitadoId]: { time: now, acompañantes: acompPresentes ?? inv.acompañantes_esperados } });
    setLastScanned({ inv, time: now, mesa: DATA.MESAS.find(m => m.id === inv.mesa_id) });
  }

  function simulateScan() {
    // pick next unchecked confirmado
    const next = confirmados.find(i => !checked[i.id]);
    if (next) doCheckin(next.id);
  }

  const searchResults = useMemo(() => {
    if (!search) return [];
    const q = search.toLowerCase();
    return DATA.INVITADOS
      .filter(i => `${i.nombre} ${i.apellido} ${i.dni}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [search]);

  // Recent activity feed
  const recentList = useMemo(() => {
    return Object.entries(checked)
      .map(([id, data]) => ({ inv: DATA.INVITADOS.find(i => i.id === id), ...data }))
      .filter(x => x.inv)
      .reverse()
      .slice(0, 8);
  }, [checked]);

  return (
    <div className="bg-slate-900 text-white min-h-full">
      {/* Status bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <Icon name="scan" size={16} />
          <span className="font-semibold">Recepcion</span>
        </div>
        <Badge variant="secondary" className="bg-slate-700 text-slate-200 border-slate-600">Boda Perez-Garcia</Badge>
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1">
            <Icon name={online ? 'wifi' : 'wifiOff'} size={14} className={online ? 'text-emerald-400' : 'text-amber-400'} />
            {online ? 'Online' : 'Offline'}
          </span>
          {pendingSyncs > 0 && <Badge variant="warning">{pendingSyncs} pendientes de sync</Badge>}
          <button onClick={() => setOnline(!online)} className="text-slate-400 hover:text-white text-[10px] underline">simular</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6 p-6 max-w-[1400px] mx-auto">
        {/* Left: scanner */}
        <div className="col-span-12 lg:col-span-7">
          {/* Toggle scan / search */}
          <div className="inline-flex bg-slate-800 rounded-md p-1 mb-4">
            <button onClick={() => setScanMode('scan')} className={cn('px-4 py-1.5 text-sm rounded font-medium', scanMode === 'scan' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white')}>
              <Icon name="qr" size={14} className="inline mr-1.5" /> Escanear QR
            </button>
            <button onClick={() => setScanMode('search')} className={cn('px-4 py-1.5 text-sm rounded font-medium', scanMode === 'search' ? 'bg-white text-slate-900' : 'text-slate-400 hover:text-white')}>
              <Icon name="search" size={14} className="inline mr-1.5" /> Buscar manual
            </button>
          </div>

          {scanMode === 'scan' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="aspect-[4/3] bg-slate-950 relative flex items-center justify-center">
                {/* Fake camera feed */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800/30 via-slate-900 to-slate-950" />
                {/* Scan frame */}
                <div className="relative w-64 h-64">
                  <div className="absolute inset-0 border-2 border-white/20 rounded-lg" />
                  <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-blue-400 rounded-tl-lg" />
                  <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-blue-400 rounded-tr-lg" />
                  <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-blue-400 rounded-bl-lg" />
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-blue-400 rounded-br-lg" />
                  <div className="absolute inset-x-0 top-1/2 h-0.5 bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
                </div>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-slate-400">
                  Apunta la camara al QR del invitado
                </div>
              </div>
              <div className="p-4 border-t border-slate-700">
                <Button className="w-full bg-white text-slate-900 hover:bg-slate-100" onClick={simulateScan}>
                  <Icon name="zap" size={14} /> Simular escaneo del siguiente invitado
                </Button>
              </div>
            </div>
          )}

          {scanMode === 'search' && (
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
              <div className="relative">
                <Icon name="search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar por nombre o DNI..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-md pl-10 pr-3 py-3 text-lg focus:outline-none focus:border-blue-400 text-white placeholder:text-slate-500"
                  autoFocus
                />
              </div>
              {searchResults.length > 0 && (
                <div className="mt-3 space-y-1">
                  {searchResults.map(inv => (
                    <button
                      key={inv.id}
                      onClick={() => { doCheckin(inv.id); setSearch(''); }}
                      className="w-full flex items-center gap-3 p-3 rounded-md hover:bg-slate-700/50 text-left disabled:opacity-50"
                      disabled={!!checked[inv.id]}
                    >
                      <Avatar name={`${inv.nombre} ${inv.apellido}`} size={36} />
                      <div className="flex-1">
                        <div className="font-medium">{inv.nombre} {inv.apellido}</div>
                        <div className="text-xs text-slate-400 font-mono">DNI {inv.dni}</div>
                      </div>
                      {checked[inv.id] ? (
                        <Badge variant="success">Ya checkeo</Badge>
                      ) : inv.status === 'confirmado' ? (
                        <span className="text-xs text-blue-400">Hacer check-in →</span>
                      ) : (
                        <Badge variant="warning">{DATA.STATUS_LABEL[inv.status]}</Badge>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {search && searchResults.length === 0 && (
                <div className="text-center text-slate-400 py-6 text-sm">No se encontro ningun invitado</div>
              )}
            </div>
          )}

          {/* Last scanned big confirmation */}
          {lastScanned && (
            <div className="mt-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Icon name="check" size={28} strokeWidth={3} />
                </div>
                <div>
                  <div className="text-xs text-emerald-100">CHECK-IN EXITOSO · {lastScanned.time}</div>
                  <div className="text-2xl font-semibold">{lastScanned.inv.nombre} {lastScanned.inv.apellido}</div>
                </div>
              </div>
              <div className="bg-white/10 rounded-md p-4 backdrop-blur">
                <div className="flex items-center gap-3">
                  <Icon name="table" size={24} />
                  <div className="flex-1">
                    <div className="text-sm text-emerald-100">Su mesa asignada</div>
                    <div className="text-3xl font-semibold">Mesa {lastScanned.mesa?.number || '—'} {lastScanned.mesa?.name && <span className="text-base text-emerald-100">· {lastScanned.mesa.name}</span>}</div>
                  </div>
                  {lastScanned.inv.acompañantes_esperados > 0 && (
                    <Badge className="bg-white/20 border-white/30 text-white">+{lastScanned.inv.acompañantes_esperados} acompañantes</Badge>
                  )}
                </div>
                {lastScanned.inv.dietary_restrictions.length > 0 && (
                  <div className="flex gap-1.5 mt-3">
                    {lastScanned.inv.dietary_restrictions.map(r => (
                      <Badge key={r} className="bg-amber-400 border-amber-300 text-amber-900">
                        <Icon name="utensils" size={11} /> {DATA.RESTRICCION_LABEL[r]}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: live metrics + activity feed */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-5">
            <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">Check-in en tiempo real</div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-semibold tabular-nums">{checkinCount}</span>
              <span className="text-slate-400">/ {confirmados.length}</span>
            </div>
            <div className="mt-3 h-2 rounded-full bg-slate-700 overflow-hidden">
              <div className="h-full bg-blue-400 transition-all" style={{ width: `${checkinPct}%` }} />
            </div>
            <div className="text-xs text-slate-400 mt-2">{Math.round(checkinPct)}% de los confirmados ya entro</div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex items-center justify-between">
              <div className="text-sm font-semibold">Ultimos ingresos</div>
              <span className="text-xs text-slate-400">{recentList.length} eventos</span>
            </div>
            <div className="divide-y divide-slate-700 max-h-[400px] overflow-y-auto">
              {recentList.length === 0 && <div className="p-6 text-center text-slate-400 text-sm">Aun no hay check-ins</div>}
              {recentList.map(({ inv, time }) => {
                const mesa = DATA.MESAS.find(m => m.id === inv.mesa_id);
                return (
                  <div key={inv.id} className="flex items-center gap-3 p-3">
                    <Avatar name={`${inv.nombre} ${inv.apellido}`} size={32} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{inv.nombre} {inv.apellido}</div>
                      <div className="text-xs text-slate-400">{mesa ? `Mesa ${mesa.number}` : 'sin mesa'} · {inv.grupo}</div>
                    </div>
                    <div className="text-xs font-mono text-slate-400">{time}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { CheckinPage });
