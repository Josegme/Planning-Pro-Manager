// M11 — Reportes y Analytics

function CheckinCurve({ total = 100 }) {
  // Synthetic curve: cumulative check-ins per 15-min slot from 20:30 to 23:00
  const slots = [];
  for (let i = 0; i < 11; i++) {
    const t = 20 * 60 + 30 + i * 15;
    const hh = String(Math.floor(t / 60)).padStart(2, '0');
    const mm = String(t % 60).padStart(2, '0');
    // S-curve
    const x = (i - 5) / 2;
    const cdf = 1 / (1 + Math.exp(-x));
    slots.push({ time: `${hh}:${mm}`, cumulative: Math.round(cdf * total) });
  }
  // increments
  for (let i = slots.length - 1; i > 0; i--) {
    slots[i].count = slots[i].cumulative - slots[i - 1].cumulative;
  }
  slots[0].count = slots[0].cumulative;

  const maxCount = Math.max(...slots.map(s => s.count));
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Curva de check-in</CardTitle>
        <CardDescription>Llegadas por franja de 15 minutos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1.5 h-40">
          {slots.map(s => (
            <div key={s.time} className="flex-1 flex flex-col items-center gap-1.5 group">
              <div className="text-[10px] text-muted-foreground font-mono">{s.count > 0 ? s.count : ''}</div>
              <div
                className="w-full bg-blue-500 rounded-t group-hover:bg-blue-600 transition-colors relative"
                style={{ height: `${(s.count / maxCount) * 100}%` }}
              />
              <div className="text-[10px] text-muted-foreground font-mono">{s.time}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border text-xs">
          <div><span className="text-muted-foreground">Pico:</span> <strong>22:00 · 28 personas</strong></div>
          <div><span className="text-muted-foreground">Tiempo promedio:</span> <strong>1.8 min/persona</strong></div>
        </div>
      </CardContent>
    </Card>
  );
}

function ReportesPage({ stats }) {
  const reportCards = [
    { id: 'asist', title: 'Reporte de asistencia', desc: 'Confirmados vs presentes, acompanantes, hora de llegada.', icon: 'users' },
    { id: 'fin', title: 'Reporte financiero', desc: 'Servicios, costos, pagos, deuda por proveedor.', icon: 'dollar' },
    { id: 'mesas', title: 'Distribucion de mesas', desc: 'Ocupacion real, restricciones por mesa.', icon: 'table' },
    { id: 'tl', title: 'Cumplimiento de timeline', desc: 'Etapas planificadas vs reales, desvios.', icon: 'clock' },
    { id: 'com', title: 'Comanda servida', desc: 'Cantidades finales basadas en check-in real.', icon: 'chef' },
    { id: 'ejec', title: 'Resumen ejecutivo', desc: 'PDF auto-enviado al cerrar el evento.', icon: 'fileText' },
  ];

  const presentes = Math.floor(stats.confirmados * 0.92);
  const noShow = ((stats.confirmados - presentes) / stats.confirmados * 100).toFixed(1);

  return (
    <div className="px-8 py-6 max-w-[1400px] mx-auto">
      <SectionHeader title="Reportes y analytics" description="Documentos exportables y metricas post-evento">
        <Button variant="outline" size="sm"><Icon name="printer" size={14} /> Imprimir todo</Button>
        <Button size="sm"><Icon name="download" size={14} /> Descargar paquete (ZIP)</Button>
      </SectionHeader>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Asistencia</div><div className="text-2xl font-semibold mt-1">{presentes} / {stats.confirmados}</div><div className="text-xs text-emerald-600 mt-1">+8% vs evento anterior</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Tasa de no-show</div><div className="text-2xl font-semibold text-amber-600 mt-1">{noShow}%</div><div className="text-xs text-muted-foreground mt-1">Promedio histórico: 6.2%</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Acumulado timeline</div><div className="text-2xl font-semibold mt-1">+12 min</div><div className="text-xs text-emerald-600 mt-1">Aceptable</div></CardContent></Card>
        <Card><CardContent className="p-4"><div className="text-xs text-muted-foreground uppercase tracking-wider">Margen presupuesto</div><div className="text-2xl font-semibold text-emerald-600 mt-1">{formatMoney(180000)}</div><div className="text-xs text-muted-foreground mt-1">2.1% bajo presupuesto</div></CardContent></Card>
      </div>

      {/* Curva + restricciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-5">
        <div className="lg:col-span-2">
          <CheckinCurve total={presentes} />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comparativa de eventos</CardTitle>
            <CardDescription>Tu historico de bodas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: 'Boda Perez-Garcia', asist: 92, isThis: true },
              { name: 'Casamiento Lopez-Mendez', asist: 88 },
              { name: 'XV Catalina Martinez', asist: 95 },
              { name: 'Boda Romero-Vega', asist: 84 },
            ].map(e => (
              <div key={e.name}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className={cn('truncate', e.isThis && 'font-semibold')}>{e.name}{e.isThis && ' (este)'}</span>
                  <span className="font-mono">{e.asist}%</span>
                </div>
                <Progress value={e.asist} barClass={e.isThis ? 'bg-blue-500' : 'bg-slate-400'} />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Report cards grid */}
      <SectionHeader title="Documentos exportables" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {reportCards.map(r => (
          <Card key={r.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="h-9 w-9 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-3">
                <Icon name={r.icon} size={18} />
              </div>
              <div className="font-semibold">{r.title}</div>
              <div className="text-xs text-muted-foreground mt-1">{r.desc}</div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-border">
                <Button size="sm" variant="outline" className="flex-1"><Icon name="eye" size={12} /> Vista previa</Button>
                <Button size="sm" variant="outline"><Icon name="download" size={12} /></Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { ReportesPage });
