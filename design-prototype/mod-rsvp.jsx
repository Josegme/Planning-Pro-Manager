// M3 — RSVP y Sistema QR (config + public form preview)

function RsvpConfigPanel({ config, setConfig, evento }) {
  const toggleReq = (key) => setConfig({ ...config, fields: { ...config.fields, [key]: { ...config.fields[key], required: !config.fields[key].required } } });
  const fieldRows = [
    { key: 'nombre', label: 'Nombre y apellido', alwaysOn: true },
    { key: 'dni', label: 'DNI / Documento' },
    { key: 'email', label: 'Email' },
    { key: 'whatsapp', label: 'WhatsApp' },
    { key: 'acomp', label: 'Cantidad de acompanantes' },
    { key: 'restr', label: 'Restricciones dietarias' },
    { key: 'msg', label: 'Mensaje para los novios' },
  ];
  return (
    <div className="space-y-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Link publico del RSVP</CardTitle>
          <CardDescription>Compartilo con tu cliente. Los invitados se registran desde este link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-2">
            <Input value="https://planningpro.app/rsvp/perez-garcia-2026" readOnly className="font-mono text-xs" />
            <Button variant="outline" size="sm"><Icon name="copy" size={14} /> Copiar</Button>
            <Button variant="outline" size="sm"><Icon name="qr" size={14} /> QR</Button>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Icon name="eye" size={12} /> 287 vistas</span>
            <span className="flex items-center gap-1"><Icon name="check" size={12} /> 142 confirmados</span>
            <span className="ml-auto">Capacidad {evento.capacity}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Mensaje de bienvenida</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div><Label className="text-xs">Titulo</Label><Input value={config.title} onChange={e => setConfig({ ...config, title: e.target.value })} /></div>
          <div><Label className="text-xs">Mensaje</Label><Textarea value={config.message} onChange={e => setConfig({ ...config, message: e.target.value })} rows={3} /></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Campos del formulario</CardTitle>
          <CardDescription>Defini cuales habilitar y cuales son obligatorios.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1">
          {fieldRows.map(row => {
            const f = config.fields[row.key] || { enabled: true, required: false };
            return (
              <div key={row.key} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                <Switch checked={f.enabled} disabled={row.alwaysOn} onChange={(v) => setConfig({ ...config, fields: { ...config.fields, [row.key]: { ...f, enabled: v } } })} />
                <div className="flex-1">
                  <div className="text-sm font-medium">{row.label}</div>
                  {row.alwaysOn && <div className="text-xs text-muted-foreground">Campo obligatorio del sistema</div>}
                </div>
                <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
                  <Checkbox checked={f.required} onChange={() => toggleReq(row.key)} />
                  Obligatorio
                </label>
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Envio automatico del QR</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <Switch checked={config.sendEmail} onChange={(v) => setConfig({ ...config, sendEmail: v })} />
            <div className="text-sm">Enviar QR por email al confirmar</div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={config.sendWhatsapp} onChange={(v) => setConfig({ ...config, sendWhatsapp: v })} />
            <div className="text-sm">Enviar QR por WhatsApp al confirmar</div>
          </div>
          <div className="flex items-center gap-3">
            <Switch checked={config.remindersOn} onChange={(v) => setConfig({ ...config, remindersOn: v })} />
            <div className="text-sm">Recordatorios automaticos (48hs y 24hs antes)</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PublicRsvpPreview({ config, evento, submitted, onSubmit }) {
  if (submitted) {
    return (
      <div className="bg-white rounded-lg border border-border shadow-sm p-8 text-center">
        <div className="bg-emerald-50 text-emerald-600 h-14 w-14 rounded-full inline-flex items-center justify-center mb-4">
          <Icon name="check" size={28} strokeWidth={2.5} />
        </div>
        <h3 className="text-xl font-semibold">Confirmacion recibida</h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto">
          Te enviamos el QR de ingreso a tu email y WhatsApp. Guardalo, lo vas a necesitar para entrar.
        </p>
        <div className="my-6 inline-flex p-3 bg-slate-50 rounded-lg border border-border">
          <FakeQR seed="9988776" />
        </div>
        <div className="text-xs text-muted-foreground font-mono">EVT-1:INV-181:TOKEN-X4M7N2</div>
        <Button variant="outline" size="sm" className="mt-6" onClick={() => onSubmit(false)}>Volver al formulario</Button>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-lg border border-border shadow-sm overflow-hidden">
      <div className="h-28 relative" style={{ background: `linear-gradient(135deg, hsl(${evento.cover_hue} 70% 60%), hsl(${(evento.cover_hue+30)%360} 65% 45%))` }}>
        <svg className="absolute inset-0 w-full h-full opacity-25" viewBox="0 0 400 100" preserveAspectRatio="none">
          <circle cx="60" cy="90" r="50" fill="white" />
          <circle cx="340" cy="20" r="60" fill="white" />
        </svg>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold">{config.title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{config.message}</p>
        <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Icon name="calendar" size={12} /> {formatDate(evento.date)} - {evento.time}</span>
          <span className="flex items-center gap-1"><Icon name="mapPin" size={12} /> {evento.venue_name}</span>
        </div>

        <div className="space-y-3 mt-6">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs">Nombre</Label><Input placeholder="Juan" /></div>
            <div><Label className="text-xs">Apellido</Label><Input placeholder="Perez" /></div>
          </div>
          {config.fields.dni?.enabled && <div><Label className="text-xs">DNI {config.fields.dni.required && <span className="text-rose-500">*</span>}</Label><Input placeholder="12345678" /></div>}
          {config.fields.email?.enabled && <div><Label className="text-xs">Email {config.fields.email.required && <span className="text-rose-500">*</span>}</Label><Input placeholder="tu@email.com" type="email" /></div>}
          {config.fields.whatsapp?.enabled && <div><Label className="text-xs">WhatsApp {config.fields.whatsapp.required && <span className="text-rose-500">*</span>}</Label><Input placeholder="+54 9 11 1234-5678" /></div>}
          {config.fields.acomp?.enabled && (
            <div>
              <Label className="text-xs">Vas con acompanantes?</Label>
              <div className="flex gap-2 mt-1.5">
                {[0,1,2,3].map(n => (
                  <button key={n} className="flex-1 h-9 rounded-md border border-border text-sm hover:border-primary hover:bg-primary/5">{n === 0 ? 'Solo' : `+${n}`}</button>
                ))}
              </div>
            </div>
          )}
          {config.fields.restr?.enabled && (
            <div>
              <Label className="text-xs">Restricciones dietarias <span className="text-muted-foreground font-normal">(opcional)</span></Label>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {['vegetariano','vegano','sin_tacc','sin_lactosa','kosher','sin_mariscos','sin_frutos_secos'].map(r => (
                  <button key={r} className="px-2.5 py-1 text-xs border border-border rounded-md hover:bg-slate-50">{DATA.RESTRICCION_LABEL[r]}</button>
                ))}
              </div>
            </div>
          )}
          {config.fields.msg?.enabled && <div><Label className="text-xs">Mensaje para los novios</Label><Textarea rows={2} placeholder="Felicidades..." /></div>}
        </div>

        <div className="flex gap-2 mt-6">
          <Button variant="outline" className="flex-1">No puedo asistir</Button>
          <Button className="flex-1" onClick={() => onSubmit(true)}>Confirmar asistencia</Button>
        </div>
        <p className="text-[11px] text-center text-muted-foreground mt-4">Al confirmar recibiras tu QR de ingreso por email y WhatsApp.</p>
      </div>
    </div>
  );
}

function RsvpPage({ evento }) {
  const [config, setConfig] = useState({
    title: 'Estas invitado a la boda de Julia y Mateo',
    message: 'Confirma tu asistencia antes del 10 de mayo. Recibiras tu QR personal para el ingreso.',
    fields: {
      nombre: { enabled: true, required: true },
      dni: { enabled: true, required: true },
      email: { enabled: true, required: true },
      whatsapp: { enabled: true, required: true },
      acomp: { enabled: true, required: false },
      restr: { enabled: true, required: false },
      msg: { enabled: true, required: false },
    },
    sendEmail: true,
    sendWhatsapp: true,
    remindersOn: true,
  });
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto">
      <SectionHeader title="Formulario RSVP" description="Configura los campos y compartí el link publico. El QR se genera automáticamente al confirmar.">
        <Button variant="outline" size="sm"><Icon name="external" size={14} /> Abrir link publico</Button>
        <Button size="sm"><Icon name="send" size={14} /> Enviar al cliente</Button>
      </SectionHeader>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <RsvpConfigPanel config={config} setConfig={setConfig} evento={evento} />
        </div>
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground">Vista previa publica</Label>
              <Badge variant="info" className="text-[10px]"><Icon name="eye" size={11} /> Live preview</Badge>
            </div>
            <PublicRsvpPreview config={config} evento={evento} submitted={submitted} onSubmit={setSubmitted} />
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { RsvpPage });
