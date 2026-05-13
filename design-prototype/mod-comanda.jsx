// M9 — Comanda del Chef

function ComandaPage({ liveMode }) {
  // Calculate quantities from invitados
  const stats = useMemo(() => {
    const confirmados = DATA.INVITADOS.filter(i => i.status === 'confirmado');
    let total = 0;
    const byRestriction = {};
    const kosherMesa = new Set();
    for (const inv of confirmados) {
      const head = 1 + inv.acompañantes_esperados;
      total += head;
      const mesa = DATA.MESAS.find(m => m.id === inv.mesa_id);
      if (mesa?.menu_especial === 'kosher') {
        kosherMesa.add(mesa.id);
      }
      for (const r of inv.dietary_restrictions) {
        byRestriction[r] = (byRestriction[r] || 0) + head;
      }
    }
    return { total, byRestriction, kosherMesas: [...kosherMesa] };
  }, []);

  const [statusByCourse, setStatusByCourse] = useState(() => {
    const s = {};
    DATA.MENU.forEach((c, i) => {
      s[c.id] = liveMode && i < 2 ? 'servido' : liveMode && i === 2 ? 'listo' : liveMode && i === 3 ? 'preparacion' : 'pendiente';
    });
    return s;
  });

  const statusOpts = [
    { value: 'pendiente', label: 'Pendiente', color: 'bg-slate-100 text-slate-600' },
    { value: 'preparacion', label: 'En preparacion', color: 'bg-amber-100 text-amber-700' },
    { value: 'listo', label: 'Listo para salir', color: 'bg-blue-100 text-blue-700' },
    { value: 'servido', label: 'Servido', color: 'bg-emerald-100 text-emerald-700' },
  ];

  const restriccionConflicts = {
    vegetariano: ['principal'],
    vegano: ['principal', 'postre'],
    sin_tacc: ['entrada_caliente', 'postre'],
    sin_lactosa: ['principal_veg', 'postre'],
    kosher: ['*'],
  };

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <SectionHeader title="Comanda del chef" description="Menu, cantidades automaticas por restriccion y mise en place">
        <Button variant="outline" size="sm"><Icon name="user" size={14} /> Asignar chef</Button>
        <Button variant="outline" size="sm"><Icon name="printer" size={14} /> Imprimir comanda</Button>
        <Button size="sm"><Icon name="plus" size={14} /> Nuevo plato</Button>
      </SectionHeader>

      {/* Auto-calculated summary */}
      <Card className="mb-5">
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            <Icon name="sparkles" size={14} className="text-primary" />
            <span className="text-sm font-medium">Cantidades calculadas automaticamente</span>
            <Badge variant="info" className="ml-auto">Desde {stats.total} comensales confirmados</Badge>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
            <QtyCard label="Estandar" value={stats.total - Object.values(stats.byRestriction).reduce((a,b) => a+b, 0)} color="bg-slate-700" />
            {Object.entries(stats.byRestriction).map(([k, v]) => (
              <QtyCard key={k} label={DATA.RESTRICCION_LABEL[k]} value={v} color="bg-amber-500" />
            ))}
          </div>
          {stats.kosherMesas.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-md p-3 flex items-start gap-2">
              <Icon name="alert" size={14} className="text-amber-700 mt-0.5" />
              <div className="text-xs text-amber-900">
                <strong>Mesa 7 — Menu kosher completo.</strong> Preparar separadamente, vajilla y utensilios independientes.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Menu courses */}
      <div className="space-y-3 mb-6">
        {DATA.MENU.map((course, idx) => {
          const status = statusByCourse[course.id];
          const statusObj = statusOpts.find(o => o.value === status);
          return (
            <Card key={course.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-center shrink-0 min-w-[60px]">
                    <div className="text-[10px] uppercase text-muted-foreground tracking-wider">Curso {idx + 1}</div>
                    <div className="font-mono font-semibold text-lg mt-0.5">{course.hora_salida}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-muted-foreground font-medium">{DATA.MENU_TIPO_LABEL[course.tipo]}</div>
                    <div className="font-semibold mt-0.5">{course.nombre}</div>
                    {course.notas && <div className="text-xs text-muted-foreground italic mt-1">"{course.notas}"</div>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {course.tipo === 'principal_veg' ? (
                        <Badge variant="warning"><Icon name="utensils" size={10} /> Vegetariano {stats.byRestriction.vegetariano || 0}</Badge>
                      ) : (
                        <Badge variant="secondary">Estandar {stats.total - (stats.byRestriction.vegetariano || 0)}</Badge>
                      )}
                      {stats.byRestriction.sin_tacc > 0 && course.tipo !== 'principal_veg' && (
                        <Badge variant="warning">Sin TACC {stats.byRestriction.sin_tacc}</Badge>
                      )}
                      {stats.kosherMesas.length > 0 && (
                        <Badge variant="warning">Kosher 10 (Mesa 7)</Badge>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    <Select value={status} onChange={e => setStatusByCourse({ ...statusByCourse, [course.id]: e.target.value })} className={cn('w-40', statusObj.color, 'border-0')}>
                      {statusOpts.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Mise en place */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mise en place — Vajilla y cristaleria</CardTitle>
          <CardDescription>Calculado para {stats.total} comensales · +10% de repuesto sugerido</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { item: 'Copas de vino tinto', qty: stats.total },
              { item: 'Copas de vino blanco', qty: stats.total },
              { item: 'Copas de champagne', qty: stats.total },
              { item: 'Vasos de agua', qty: stats.total },
              { item: 'Platos de entrada', qty: stats.total * 2 },
              { item: 'Platos principales', qty: stats.total },
              { item: 'Platos de postre', qty: stats.total },
              { item: 'Cuchillos de carne', qty: stats.total },
              { item: 'Tenedores', qty: stats.total * 2 },
              { item: 'Cucharas de postre', qty: stats.total },
              { item: 'Servilletas', qty: stats.total + 30 },
              { item: 'Cubrejarras', qty: 22 },
            ].map(x => {
              const repuesto = Math.ceil(x.qty * 0.1);
              return (
                <div key={x.item} className="border border-border rounded-md p-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{x.item}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">+ {repuesto} de repuesto</div>
                  </div>
                  <div className="font-mono font-semibold text-lg">{x.qty + repuesto}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function QtyCard({ label, value, color }) {
  return (
    <div className="bg-white rounded-md border border-border p-3 text-center">
      <div className={cn('inline-block w-1.5 h-1.5 rounded-full mb-1', color)} />
      <div className="text-2xl font-semibold font-mono tabular-nums">{value}</div>
      <div className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider">{label}</div>
    </div>
  );
}

Object.assign(window, { ComandaPage });
