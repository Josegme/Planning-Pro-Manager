// M5 — Plano Visual del Salon (SVG canvas with live mesa states)

function MesaRing({ mesa, invitados, cx, cy, r, onHover }) {
  const occupied = invitados.reduce((s, i) => s + 1 + i.acompañantes_esperados, 0);
  const total = mesa.capacity;
  const checkin = invitados.filter(i => i.status === 'checkin').reduce((s, i) => s + 1 + (i.acompañantes_presentes || 0), 0);
  const confPct = Math.min(1, occupied / total);
  const checkinPct = Math.min(1, checkin / total);

  // colors
  const baseColor = occupied === 0 ? '#94a3b8' : confPct === 1 ? '#fb923c' : '#f59e0b';
  const checkinColor = '#3b82f6';

  // pie segments
  const ringR = r;
  const stroke = 7;

  return (
    <g
      onMouseEnter={() => onHover(mesa)}
      onMouseLeave={() => onHover(null)}
      className="cursor-pointer"
    >
      {/* outer ring (capacity background) */}
      <circle cx={cx} cy={cy} r={ringR} fill="white" stroke="#e2e8f0" strokeWidth={stroke} />
      {/* confirmed arc */}
      {confPct > 0 && <ArcSeg cx={cx} cy={cy} r={ringR} start={0} end={confPct * Math.PI * 2} stroke={baseColor} sw={stroke} />}
      {/* checkin arc (overlapping) */}
      {checkinPct > 0 && <ArcSeg cx={cx} cy={cy} r={ringR} start={0} end={checkinPct * Math.PI * 2} stroke={checkinColor} sw={stroke} />}
      {/* center: mesa number */}
      <circle cx={cx} cy={cy} r={ringR - stroke / 2 - 1} fill="white" />
      <text x={cx} y={cy + 4} textAnchor="middle" className="fill-slate-700 font-semibold" style={{ fontSize: r * 0.7 }}>
        {mesa.number}
      </text>
      {/* count below */}
      <text x={cx} y={cy + ringR + 12} textAnchor="middle" className="fill-slate-500" style={{ fontSize: 10 }}>
        {occupied}/{total}
      </text>
      {mesa.menu_especial && (
        <circle cx={cx + ringR * 0.65} cy={cy - ringR * 0.65} r={5} fill="#f59e0b" stroke="white" strokeWidth={1.5} />
      )}
    </g>
  );
}

function ArcSeg({ cx, cy, r, start, end, stroke, sw }) {
  if (end - start >= Math.PI * 2 - 0.001) {
    return <circle cx={cx} cy={cy} r={r} fill="none" stroke={stroke} strokeWidth={sw} />;
  }
  const a0 = start - Math.PI / 2;
  const a1 = end - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = end - start > Math.PI ? 1 : 0;
  return <path d={`M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`} fill="none" stroke={stroke} strokeWidth={sw} strokeLinecap="butt" />;
}

function StructuralEl({ el }) {
  if (el.type === 'stage') {
    return (
      <g>
        <rect x={el.x * 1000} y={el.y * 640} width={el.w * 1000} height={el.h * 640} rx={4} fill="#1e293b" />
        <text x={el.x * 1000 + el.w * 500} y={el.y * 640 + el.h * 320 + 5} textAnchor="middle" fill="white" style={{ fontSize: 11, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    );
  }
  if (el.type === 'dance') {
    return (
      <g>
        <rect x={el.x * 1000} y={el.y * 640} width={el.w * 1000} height={el.h * 640} rx={6} fill="url(#dancePattern)" stroke="#cbd5e1" strokeDasharray="4 3" strokeWidth={1.5} />
        <text x={el.x * 1000 + el.w * 500} y={el.y * 640 + el.h * 320 + 4} textAnchor="middle" fill="#475569" style={{ fontSize: 11, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    );
  }
  if (el.type === 'bar' || el.type === 'buffet') {
    const color = el.type === 'bar' ? '#7c3aed' : '#0891b2';
    return (
      <g>
        <rect x={el.x * 1000} y={el.y * 640} width={el.w * 1000} height={el.h * 640} rx={4} fill={color} fillOpacity={0.12} stroke={color} strokeWidth={1.5} />
        <text x={el.x * 1000 + el.w * 500} y={el.y * 640 + el.h * 320 + 4} textAnchor="middle" fill={color} style={{ fontSize: 10, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    );
  }
  if (el.type === 'entry') {
    return (
      <g>
        <rect x={el.x * 1000} y={el.y * 640} width={el.w * 1000} height={el.h * 640} fill="#10b981" />
        <text x={el.x * 1000 + el.w * 500 + 10} y={el.y * 640 + el.h * 320 + 4} fill="#059669" style={{ fontSize: 10, fontWeight: 600 }}>
          {el.label}
        </text>
      </g>
    );
  }
  return null;
}

function PlanoTooltip({ mesa, invitadosByMesa }) {
  const invitados = invitadosByMesa[mesa.id] || [];
  const occ = invitados.reduce((s, i) => s + 1 + i.acompañantes_esperados, 0);
  const checkin = invitados.filter(i => i.status === 'checkin').length;
  return (
    <Card className="absolute z-10 w-64 shadow-xl pointer-events-none" style={{ left: 0, top: 0, transform: 'translate(20px, 20px)' }}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="font-semibold">{mesa.name || `Mesa ${mesa.number}`}</div>
          <Badge variant="outline" className="text-[10px]">cap. {mesa.capacity}</Badge>
        </div>
        {mesa.menu_especial && <Badge variant="warning" className="mb-2 text-[10px]"><Icon name="utensils" size={10} /> Menu {mesa.menu_especial}</Badge>}
        <div className="grid grid-cols-3 gap-2 text-xs mt-2 pt-2 border-t border-border">
          <div>
            <div className="text-muted-foreground text-[10px]">Confirmados</div>
            <div className="font-mono font-semibold mt-0.5">{occ}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px]">Check-in</div>
            <div className="font-mono font-semibold mt-0.5">{checkin}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-[10px]">Ocupacion</div>
            <div className="font-mono font-semibold mt-0.5">{Math.round((occ / mesa.capacity) * 100)}%</div>
          </div>
        </div>
        {invitados.length > 0 && (
          <div className="mt-2 pt-2 border-t border-border">
            <div className="text-[10px] text-muted-foreground mb-1">INVITADOS</div>
            <div className="text-xs space-y-0.5 max-h-32 overflow-hidden">
              {invitados.slice(0, 5).map(i => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate">{i.nombre} {i.apellido}</span>
                  {i.dietary_restrictions.length > 0 && <Icon name="utensils" size={10} className="text-amber-500" />}
                </div>
              ))}
              {invitados.length > 5 && <div className="text-muted-foreground text-[10px]">+{invitados.length - 5} mas</div>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function PlanoPage({ liveCheckin }) {
  const [hover, setHover] = useState(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  // simulate live check-in: if liveCheckin is on, some confirmados become checkin
  const invitados = useMemo(() => {
    if (!liveCheckin) return DATA.INVITADOS;
    return DATA.INVITADOS.map((i, idx) => i.status === 'confirmado' && idx % 3 === 0 ? { ...i, status: 'checkin' } : i);
  }, [liveCheckin]);

  const invitadosByMesa = useMemo(() => {
    const map = {};
    DATA.MESAS.forEach(m => { map[m.id] = []; });
    invitados.forEach(inv => {
      if (inv.mesa_id) map[inv.mesa_id].push(inv);
    });
    return map;
  }, [invitados]);

  const stats = useMemo(() => {
    let conf = 0, chk = 0, cap = 0;
    DATA.MESAS.forEach(m => {
      cap += m.capacity;
      conf += (invitadosByMesa[m.id] || []).reduce((s, i) => s + 1 + i.acompañantes_esperados, 0);
      chk += (invitadosByMesa[m.id] || []).filter(i => i.status === 'checkin').length;
    });
    return { conf, chk, cap };
  }, [invitadosByMesa]);

  return (
    <div className="px-8 py-6 max-w-[1600px] mx-auto">
      <SectionHeader title="Plano del salon" description={`Estancia La Reserva · ${DATA.MESAS.length} mesas configuradas`}>
        <Button variant="outline" size="sm"><Icon name="layers" size={14} /> Cargar salon</Button>
        <Button variant="outline" size="sm"><Icon name="printer" size={14} /> Imprimir</Button>
        <Button size="sm"><Icon name="edit" size={14} /> Editar plano</Button>
      </SectionHeader>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-12 lg:col-span-9">
          <Card>
            <div className="border-b border-border px-4 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-4">
                <span className="text-muted-foreground">Estado:</span>
                <Legend color="#94a3b8" label="Sin asignar" />
                <Legend color="#f59e0b" label="Parcial" />
                <Legend color="#fb923c" label="Confirmada" />
                <Legend color="#3b82f6" label="Check-in" />
              </div>
              <div className="flex items-center gap-1 text-muted-foreground">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Tiempo real
              </div>
            </div>
            <div
              ref={containerRef}
              className="relative dotted-bg"
              style={{ aspectRatio: '1000/640' }}
              onMouseMove={(e) => {
                const rect = containerRef.current?.getBoundingClientRect();
                if (rect) setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
              }}
            >
              <svg viewBox="0 0 1000 640" className="absolute inset-0 w-full h-full">
                <defs>
                  <pattern id="dancePattern" patternUnits="userSpaceOnUse" width="20" height="20">
                    <rect width="20" height="20" fill="#f8fafc" />
                    <path d="M0 20 L20 0" stroke="#e2e8f0" strokeWidth={0.5} />
                  </pattern>
                </defs>
                {/* room outline */}
                <rect x={20} y={20} width={960} height={600} rx={12} fill="white" stroke="#cbd5e1" strokeWidth={2} />
                {/* structural */}
                {DATA.PLANO.elements.map(el => <StructuralEl key={el.id} el={el} />)}
                {/* mesas */}
                {DATA.MESAS.map(m => (
                  <MesaRing
                    key={m.id}
                    mesa={m}
                    invitados={invitadosByMesa[m.id] || []}
                    cx={m.position.x * 1000}
                    cy={m.position.y * 640}
                    r={26}
                    onHover={setHover}
                  />
                ))}
              </svg>

              {hover && (
                <div className="absolute pointer-events-none" style={{ left: mousePos.x, top: mousePos.y }}>
                  <PlanoTooltip mesa={hover} invitadosByMesa={invitadosByMesa} />
                </div>
              )}
            </div>
          </Card>
        </div>

        <div className="col-span-12 lg:col-span-3 space-y-4">
          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Resumen</CardTitle></CardHeader>
            <CardContent className="space-y-3 pt-0">
              <StatRow label="Capacidad total" value={stats.cap} />
              <StatRow label="Confirmados sentados" value={stats.conf} sub={`${Math.round((stats.conf / stats.cap) * 100)}%`} />
              <StatRow label="Check-in realizado" value={stats.chk} color="text-blue-600" />
              <StatRow label="Lugares libres" value={stats.cap - stats.conf} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3"><CardTitle className="text-sm font-semibold">Biblioteca de salones</CardTitle></CardHeader>
            <CardContent className="space-y-2 pt-0">
              {[
                { name: 'Estancia La Reserva', current: true, capacity: '160-260' },
                { name: 'Salon Madero', current: false, capacity: '80-200' },
                { name: 'Finca del Sur', current: false, capacity: '100-180' },
              ].map(s => (
                <div key={s.name} className={cn(
                  'flex items-center gap-2 p-2 rounded-md border cursor-pointer',
                  s.current ? 'border-primary bg-primary/5' : 'border-border hover:bg-slate-50'
                )}>
                  <Icon name="building" size={16} className="text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium truncate">{s.name}</div>
                    <div className="text-[10px] text-muted-foreground">{s.capacity} personas</div>
                  </div>
                  {s.current && <Badge variant="default" className="text-[9px]">Actual</Badge>}
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full"><Icon name="plus" size={13} /> Guardar este salon</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }) {
  return <span className="flex items-center gap-1.5"><span className="inline-block w-2.5 h-2.5 rounded-full" style={{ background: color }} />{label}</span>;
}
function StatRow({ label, value, sub, color = 'text-foreground' }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={cn('font-semibold tabular-nums', color)}>{value}{sub && <span className="text-xs text-muted-foreground font-normal ml-1.5">({sub})</span>}</span>
    </div>
  );
}

Object.assign(window, { PlanoPage });
