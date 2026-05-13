// M2 — Gestión de Invitados

function StatusDot({ status, withLabel = false }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs">
      <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ background: DATA.STATUS_COLOR[status] }} />
      {withLabel && DATA.STATUS_LABEL[status]}
    </span>
  );
}

function InvitadoStatusBadge({ status }) {
  return <Badge variant={DATA.STATUS_VARIANT[status]}>{DATA.STATUS_LABEL[status]}</Badge>;
}

function FakeQR({ seed = '1234567' }) {
  return (
    <svg width="96" height="96" viewBox="0 0 21 21" shapeRendering="crispEdges">
      {Array.from({ length: 21 }).map((_, y) =>
        Array.from({ length: 21 }).map((__, x) => {
          const corner =
            (x < 7 && y < 7) || (x > 13 && y < 7) || (x < 7 && y > 13);
          const inCornerBorder =
            (x < 7 && y < 7 && (x === 0 || x === 6 || y === 0 || y === 6 || (x > 1 && x < 5 && y > 1 && y < 5))) ||
            (x > 13 && y < 7 && (x === 14 || x === 20 || y === 0 || y === 6 || (x > 15 && x < 19 && y > 1 && y < 5))) ||
            (x < 7 && y > 13 && (x === 0 || x === 6 || y === 14 || y === 20 || (x > 1 && x < 5 && y > 15 && y < 19)));
          if (corner) {
            return inCornerBorder ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null;
          }
          const seedNum = parseInt(String(seed).slice(-4), 10) || 0;
          const v = (x * 31 + y * 17 + seedNum + (x ^ y)) % 7;
          return v < 3 ? <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#0f172a" /> : null;
        })
      )}
    </svg>
  );
}

function InvitadoDetailModal({ invitado, onClose }) {
  if (!invitado) return null;
  const mesa = DATA.MESAS.find(m => m.id === invitado.mesa_id);
  return (
    <Dialog open={!!invitado} onClose={onClose} maxW="max-w-2xl">
      <DialogHeader>
        <div className="flex items-start gap-4">
          <Avatar name={`${invitado.nombre} ${invitado.apellido}`} size={48} />
          <div className="flex-1">
            <DialogTitle>{invitado.nombre} {invitado.apellido}</DialogTitle>
            <div className="flex items-center gap-2 mt-1">
              <InvitadoStatusBadge status={invitado.status} />
              <Badge variant="outline">{invitado.grupo}</Badge>
              {invitado.acompañantes_esperados > 0 && (
                <Badge variant="secondary">+{invitado.acompañantes_esperados} acompañante{invitado.acompañantes_esperados > 1 ? 's' : ''}</Badge>
              )}
            </div>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose}><Icon name="x" size={16} /></Button>
        </div>
      </DialogHeader>
      <DialogBody className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground text-xs">DNI</Label>
            <div className="font-mono mt-0.5">{invitado.dni}</div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">WhatsApp</Label>
            <div className="font-mono mt-0.5">{invitado.whatsapp}</div>
          </div>
          <div className="col-span-2">
            <Label className="text-muted-foreground text-xs">Email</Label>
            <div className="mt-0.5">{invitado.email}</div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">Mesa asignada</Label>
            <div className="mt-0.5 font-medium">{mesa ? `Mesa ${mesa.number}${mesa.name ? ` · ${mesa.name}` : ''}` : <span className="text-muted-foreground italic">Sin asignar</span>}</div>
          </div>
          <div>
            <Label className="text-muted-foreground text-xs">RSVP confirmado</Label>
            <div className="mt-0.5">{invitado.rsvp_at ? formatDate(invitado.rsvp_at) : <span className="text-muted-foreground italic">No confirmó</span>}</div>
          </div>
        </div>

        {invitado.dietary_restrictions.length > 0 && (
          <div>
            <Label className="text-muted-foreground text-xs">Restricciones dietarias</Label>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {invitado.dietary_restrictions.map(r => (
                <Badge key={r} variant="warning">
                  <Icon name="utensils" size={11} /> {DATA.RESTRICCION_LABEL[r]}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {invitado.status === 'confirmado' && (
          <div className="bg-slate-50 rounded-lg p-4 flex gap-4 items-center">
            <div className="bg-white rounded p-2 border border-border">
              <FakeQR seed={invitado.dni} />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm">QR de check-in</div>
              <div className="text-xs text-muted-foreground mt-0.5 font-mono">EVT-1:INV-{invitado.id.slice(4)}:TOKEN-{invitado.dni.slice(-6)}…</div>
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline"><Icon name="download" size={13} /> PNG</Button>
                <Button size="sm" variant="outline"><Icon name="send" size={13} /> Reenviar</Button>
                <Button size="sm" variant="ghost"><Icon name="refresh" size={13} /> Regenerar</Button>
              </div>
            </div>
          </div>
        )}
      </DialogBody>
      <DialogFooter>
        <Button variant="outline"><Icon name="trash" size={14} /> Eliminar</Button>
        <div className="flex-1" />
        <Button variant="outline" onClick={onClose}>Cancelar</Button>
        <Button><Icon name="edit" size={14} /> Editar invitado</Button>
      </DialogFooter>
    </Dialog>
  );
}

function InvitadosPage() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterGrupo, setFilterGrupo] = useState('todos');
  const [selected, setSelected] = useState(null);
  const [page, setPage] = useState(0);
  const pageSize = 25;

  const filtered = useMemo(() => {
    return DATA.INVITADOS.filter(i => {
      if (filterStatus !== 'todos' && i.status !== filterStatus) return false;
      if (filterGrupo !== 'todos' && i.grupo !== filterGrupo) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!`${i.nombre} ${i.apellido} ${i.dni}`.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [search, filterStatus, filterGrupo]);

  const paginated = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  const counts = useMemo(() => {
    const c = { todos: DATA.INVITADOS.length };
    for (const s of ['pendiente', 'invitado', 'visto', 'confirmado', 'rechazo']) {
      c[s] = DATA.INVITADOS.filter(i => i.status === s).length;
    }
    return c;
  }, []);

  return (
    <div className="px-8 py-6 max-w-[1500px] mx-auto">
      <SectionHeader title="Invitados" description={`${DATA.INVITADOS.length} invitados · ${counts.confirmado} confirmados`}>
        <Button variant="outline" size="sm"><Icon name="upload" size={14} /> Importar Excel</Button>
        <Button variant="outline" size="sm"><Icon name="download" size={14} /> Exportar</Button>
        <Button variant="outline" size="sm"><Icon name="qr" size={14} /> Descargar todos los QR</Button>
        <Button size="sm"><Icon name="plus" size={14} /> Nuevo invitado</Button>
      </SectionHeader>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-2 mb-5">
        {[
          { value: 'todos', label: 'Todos', color: '#64748b' },
          { value: 'pendiente', label: 'Pendiente', color: DATA.STATUS_COLOR.pendiente },
          { value: 'invitado', label: 'Invitado', color: DATA.STATUS_COLOR.invitado },
          { value: 'visto', label: 'Visto', color: DATA.STATUS_COLOR.visto },
          { value: 'confirmado', label: 'Confirmado', color: DATA.STATUS_COLOR.confirmado },
          { value: 'rechazo', label: 'Rechazó', color: DATA.STATUS_COLOR.rechazo },
        ].map(s => (
          <button key={s.value} onClick={() => { setFilterStatus(s.value); setPage(0); }}
            className={cn(
              'text-left p-3 rounded-md border transition-colors',
              filterStatus === s.value ? 'border-primary bg-primary/5' : 'border-border bg-white hover:bg-slate-50'
            )}>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </div>
            <div className="text-xl font-semibold mt-1 tabular-nums">{counts[s.value]}</div>
          </button>
        ))}
      </div>

      <Card className="mb-4">
        <CardContent className="p-3 flex items-center gap-2">
          <div className="relative flex-1">
            <Icon name="search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por nombre, apellido o DNI..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} className="pl-9 border-0 shadow-none focus-visible:ring-0" />
          </div>
          <div className="h-6 w-px bg-border" />
          <Select value={filterGrupo} onChange={e => { setFilterGrupo(e.target.value); setPage(0); }} className="w-44 border-0 shadow-none">
            <option value="todos">Todos los grupos</option>
            {DATA.GRUPOS.map(g => <option key={g} value={g}>{g}</option>)}
          </Select>
          <Button variant="ghost" size="sm"><Icon name="filter" size={14} /> Más filtros</Button>
        </CardContent>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-slate-50/50 text-xs uppercase tracking-wider text-muted-foreground">
                <th className="text-left font-medium px-4 py-2.5 w-10"><Checkbox checked={false} onChange={() => {}} /></th>
                <th className="text-left font-medium px-4 py-2.5">Invitado</th>
                <th className="text-left font-medium px-4 py-2.5">DNI</th>
                <th className="text-left font-medium px-4 py-2.5">Grupo</th>
                <th className="text-left font-medium px-4 py-2.5">Estado</th>
                <th className="text-left font-medium px-4 py-2.5">Mesa</th>
                <th className="text-left font-medium px-4 py-2.5">Restricciones</th>
                <th className="text-right font-medium px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(inv => {
                const mesa = DATA.MESAS.find(m => m.id === inv.mesa_id);
                return (
                  <tr key={inv.id} className="border-b border-border last:border-0 hover:bg-slate-50/60 cursor-pointer" onClick={() => setSelected(inv)}>
                    <td className="px-4 py-2.5" onClick={e => e.stopPropagation()}><Checkbox checked={false} onChange={() => {}} /></td>
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2.5">
                        <Avatar name={`${inv.nombre} ${inv.apellido}`} size={28} />
                        <div>
                          <div className="font-medium">
                            {inv.nombre} {inv.apellido}
                            {inv.acompañantes_esperados > 0 && <span className="text-muted-foreground font-normal text-xs ml-1">(+{inv.acompañantes_esperados})</span>}
                          </div>
                          <div className="text-xs text-muted-foreground">{inv.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-muted-foreground">{inv.dni}</td>
                    <td className="px-4 py-2.5"><Badge variant="outline" className="text-[10px]">{inv.grupo}</Badge></td>
                    <td className="px-4 py-2.5"><InvitadoStatusBadge status={inv.status} /></td>
                    <td className="px-4 py-2.5 text-muted-foreground">{mesa ? `Mesa ${mesa.number}` : <span className="italic">—</span>}</td>
                    <td className="px-4 py-2.5">
                      <div className="flex gap-1 flex-wrap">
                        {inv.dietary_restrictions.slice(0, 2).map(r => (
                          <Badge key={r} variant="warning" className="text-[10px]">{DATA.RESTRICCION_LABEL[r]}</Badge>
                        ))}
                        {inv.dietary_restrictions.length > 2 && <Badge variant="secondary" className="text-[10px]">+{inv.dietary_restrictions.length - 2}</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon-sm"><Icon name="moreHorizontal" size={14} /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-border text-sm text-muted-foreground">
          <div>Mostrando <strong className="text-foreground">{filtered.length === 0 ? 0 : page * pageSize + 1}–{Math.min((page + 1) * pageSize, filtered.length)}</strong> de <strong className="text-foreground">{filtered.length}</strong></div>
          <div className="flex gap-1 items-center">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => Math.max(0, p - 1))}><Icon name="chevronLeft" size={14} /></Button>
            <div className="px-3 py-1.5 text-sm tabular-nums">{page + 1} / {totalPages}</div>
            <Button variant="outline" size="sm" disabled={page >= totalPages - 1} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}><Icon name="chevronRight" size={14} /></Button>
          </div>
        </div>
      </Card>

      <InvitadoDetailModal invitado={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

Object.assign(window, { InvitadosPage, InvitadoStatusBadge, StatusDot, FakeQR });
