// M7 — Servicios y Proveedores

function ServiciosPage() {
  const [tab, setTab] = useState('servicios');

  const totalCosto = DATA.SERVICIOS.reduce((s, x) => s + x.costo, 0);
  const totalPagado = DATA.SERVICIOS.reduce((s, x) => s + x.pagado, 0);
  const totalPendiente = totalCosto - totalPagado;

  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto">
      <SectionHeader title="Servicios y proveedores" description="Control financiero y CRM de proveedores reutilizable entre eventos">
        <Button variant="outline" size="sm"><Icon name="download" size={14} /> Exportar Excel</Button>
        <Button variant="outline" size="sm"><Icon name="printer" size={14} /> Imprimir / PDF</Button>
        <Button size="sm"><Icon name="plus" size={14} /> Nuevo servicio</Button>
      </SectionHeader>

      {/* Financial summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Total presupuesto</div>
            <div className="text-2xl font-semibold mt-1">{formatMoney(totalCosto)}</div>
            <div className="text-xs text-muted-foreground mt-1">{DATA.SERVICIOS.length} servicios</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pagado</div>
            <div className="text-2xl font-semibold text-emerald-600 mt-1">{formatMoney(totalPagado)}</div>
            <Progress value={(totalPagado / totalCosto) * 100} barClass="bg-emerald-500" className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pendiente</div>
            <div className="text-2xl font-semibold text-rose-600 mt-1">{formatMoney(totalPendiente)}</div>
            <div className="text-xs text-muted-foreground mt-1">{Math.round((totalPendiente/totalCosto)*100)}% sin pagar</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Proximos vencimientos</div>
            <div className="text-2xl font-semibold mt-1">3</div>
            <div className="text-xs text-rose-600 mt-1 flex items-center gap-1"><Icon name="alert" size={11} /> 2 esta semana</div>
          </CardContent>
        </Card>
      </div>

      <Tabs
        value={tab}
        onChange={setTab}
        className="mb-4"
        items={[
          { value: 'servicios', label: 'Servicios del evento', count: DATA.SERVICIOS.length },
          { value: 'proveedores', label: 'Proveedores (CRM)', count: DATA.PROVEEDORES.length },
        ]}
      />

      {tab === 'servicios' && (
        <Card>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-2.5">Servicio</th>
                <th className="text-left font-medium px-4 py-2.5">Proveedor</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-right font-medium px-4 py-2.5">Costo</th>
                <th className="text-right font-medium px-4 py-2.5">Pagado</th>
                <th className="text-left font-medium px-4 py-2.5 w-32">Progreso</th>
                <th className="text-right font-medium px-4 py-2.5 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {DATA.SERVICIOS.map(sv => {
                const prov = DATA.PROVEEDORES.find(p => p.id === sv.provider_id);
                const pct = (sv.pagado / sv.costo) * 100;
                const estadoVariant = sv.estado === 'pagado' ? 'success' : sv.estado === 'contratado' ? 'info' : sv.estado === 'cancelado' ? 'danger' : 'warning';
                return (
                  <tr key={sv.id} className="border-b border-border last:border-0 hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="font-medium">{sv.nombre}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{prov?.name}</td>
                    <td className="px-4 py-3"><Badge variant={estadoVariant}>{sv.estado}</Badge></td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(sv.costo)}</td>
                    <td className="px-4 py-3 text-right font-mono">{formatMoney(sv.pagado)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1"><Progress value={pct} barClass={pct === 100 ? 'bg-emerald-500' : pct > 0 ? 'bg-amber-500' : 'bg-slate-300'} /></div>
                        <span className="text-xs text-muted-foreground tabular-nums">{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right"><Button variant="ghost" size="icon-sm"><Icon name="moreHorizontal" size={14} /></Button></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}

      {tab === 'proveedores' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {DATA.PROVEEDORES.map(p => {
            const eventosCount = DATA.SERVICIOS.filter(s => s.provider_id === p.id).length;
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Avatar name={p.name} size={36} />
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold truncate">{p.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Icon name="phone" size={11} /> {p.phone}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Icon name="mail" size={11} /> {p.email}
                      </div>
                      {p.notes && <div className="text-xs italic text-muted-foreground mt-2 line-clamp-2">"{p.notes}"</div>}
                      <Badge variant="secondary" className="mt-2 text-[10px]">{eventosCount} servicio{eventosCount !== 1 ? 's' : ''} en este evento</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="border-dashed flex items-center justify-center cursor-pointer hover:bg-slate-50/50">
            <CardContent className="p-6 text-center text-muted-foreground">
              <div className="h-10 w-10 rounded-full bg-slate-100 mx-auto flex items-center justify-center mb-2">
                <Icon name="plus" size={18} />
              </div>
              <div className="text-sm font-medium">Agregar proveedor</div>
              <div className="text-xs mt-1">Disponible para todos tus eventos</div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { ServiciosPage });
