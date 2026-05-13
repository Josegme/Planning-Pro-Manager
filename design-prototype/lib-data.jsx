// Mock data — Planning Pro
// Boda Pérez-García (evento principal), + 2 eventos secundarios para multi-evento view.

const NOMBRES_M = ['Mateo','Joaquín','Tomás','Lautaro','Benjamín','Santiago','Bautista','Felipe','Lucas','Ignacio','Agustín','Nicolás','Diego','Martín','Sebastián','Federico','Gonzalo','Maximiliano','Hernán','Rodrigo','Pablo','Andrés','Cristian','Damián','Esteban','Fabián','Gabriel','Hugo','Iván','Jorge','Leandro','Marcos','Nahuel','Óscar','Pedro','Rafael','Saúl','Tobías','Ulises','Víctor'];
const NOMBRES_F = ['Sofía','Catalina','Valentina','Martina','Olivia','Emma','Isabella','Lucía','Mía','Camila','Renata','Julieta','Mora','Delfina','Pilar','Antonia','Florencia','Agustina','Victoria','Bianca','Carolina','Daniela','Elena','Francisca','Gabriela','Helena','Inés','Josefina','Karla','Luna','Marina','Natalia','Paula','Romina','Silvana','Tatiana','Úrsula','Vanesa','Ximena','Yamila'];
const APELLIDOS = ['Pérez','García','Rodríguez','González','Fernández','López','Martínez','Sánchez','Romero','Sosa','Álvarez','Torres','Ruiz','Ramírez','Flores','Acosta','Benítez','Castro','Díaz','Espinoza','Gómez','Herrera','Iglesias','Jiménez','Krause','Luna','Medina','Núñez','Ojeda','Paredes','Quiroga','Rivas','Suárez','Tapia','Urquiza','Vega','Wagner','Yáñez','Zelaya'];
const GRUPOS = ['Familia Novia','Familia Novio','Amigos Novia','Amigos Novio','Trabajo','Universidad','Infancia','VIP'];
const RESTRICCIONES_OPTS = ['vegetariano','vegano','sin_tacc','sin_lactosa','kosher','halal','sin_mariscos','sin_frutos_secos'];

const RESTRICCION_LABEL = {
  vegetariano: 'Vegetariano', vegano: 'Vegano', sin_tacc: 'Sin TACC', sin_lactosa: 'Sin lactosa',
  kosher: 'Kosher', halal: 'Halal', sin_mariscos: 'Sin mariscos', sin_frutos_secos: 'Sin frutos secos',
};

function seedRand(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0xffffffff;
  };
}

const rand = seedRand(42);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];

// Generate 180 invitados
function generateInvitados() {
  const list = [];
  const usedDni = new Set();
  for (let i = 0; i < 180; i++) {
    const isMale = rand() > 0.5;
    const nombre = pick(isMale ? NOMBRES_M : NOMBRES_F);
    const apellido = pick(APELLIDOS);
    let dni;
    do { dni = String(20_000_000 + Math.floor(rand() * 30_000_000)); } while (usedDni.has(dni));
    usedDni.add(dni);
    const grupo = pick(GRUPOS);
    // Status distribution: matching wedding 7 days out
    // confirmado 56%, visto 12%, invitado 18%, pendiente 5%, rechazo 6%, checkin 0% (pre-evento)
    const r = rand();
    let status;
    if (r < 0.56) status = 'confirmado';
    else if (r < 0.68) status = 'visto';
    else if (r < 0.86) status = 'invitado';
    else if (r < 0.91) status = 'pendiente';
    else status = 'rechazo';

    // Restricciones: ~15% have some
    const restricciones = [];
    if (rand() < 0.18) restricciones.push(pick(RESTRICCIONES_OPTS));
    if (rand() < 0.03 && restricciones.length === 0) restricciones.push('sin_tacc', 'sin_lactosa');

    const acompEsperados = status === 'confirmado' && rand() < 0.3 ? (rand() < 0.7 ? 1 : 2) : 0;

    list.push({
      id: `inv-${i + 1}`,
      nombre,
      apellido,
      dni,
      email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}@${pick(['gmail.com','hotmail.com','outlook.com','yahoo.com.ar'])}`.replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u').replace(/ñ/g,'n'),
      whatsapp: `+54 9 11 ${String(Math.floor(rand() * 9000) + 1000)}-${String(Math.floor(rand() * 9000) + 1000)}`,
      grupo,
      status,
      acompañantes_esperados: acompEsperados,
      acompañantes_presentes: null,
      dietary_restrictions: restricciones,
      mesa_id: null,
      qr_used_at: null,
      checkin_at: null,
      rsvp_at: status === 'confirmado' || status === 'rechazo' ? new Date(Date.now() - rand() * 30 * 86400000).toISOString() : null,
    });
  }
  return list;
}

const INVITADOS = generateInvitados();

// 22 mesas redondas, capacidad 10. Asignar invitados confirmados.
const MESAS = [];
for (let i = 1; i <= 22; i++) {
  MESAS.push({
    id: `mesa-${i}`,
    number: i,
    name: i === 1 ? 'Mesa Principal' : i === 7 ? 'Mesa Kosher' : null,
    capacity: i === 1 ? 12 : 10,
    menu_especial: i === 7 ? 'kosher' : null,
    // position in canvas (0-1 relative)
    position: null, // set in plano
  });
}
// Assign confirmados to mesas (filling by group when possible)
(function assign() {
  const confirmados = INVITADOS.filter(i => i.status === 'confirmado');
  // group by 'grupo'
  const byGroup = {};
  for (const inv of confirmados) (byGroup[inv.grupo] = byGroup[inv.grupo] || []).push(inv);
  const mesaIds = MESAS.map(m => m.id);
  let mIdx = 0;
  let used = 0;
  const counts = Object.fromEntries(mesaIds.map(id => [id, 0]));
  for (const g of Object.keys(byGroup)) {
    for (const inv of byGroup[g]) {
      // find next mesa with capacity
      while (mIdx < mesaIds.length) {
        const mesa = MESAS.find(m => m.id === mesaIds[mIdx]);
        const occ = counts[mesa.id] + 1 + inv.acompañantes_esperados;
        if (occ <= mesa.capacity) {
          inv.mesa_id = mesa.id;
          counts[mesa.id] += 1 + inv.acompañantes_esperados;
          break;
        }
        mIdx++;
      }
      if (mIdx >= mesaIds.length) break;
    }
    // light separation between groups: move to next mesa if mostly full
    const cur = MESAS[mIdx];
    if (cur && counts[cur.id] >= cur.capacity - 2) mIdx++;
  }
})();

// Plano del salón — positions for mesas + structural elements
const PLANO = {
  width: 1000, height: 640,
  elements: [
    // structural
    { id: 'el-stage', type: 'stage', label: 'Escenario / DJ', x: 0.42, y: 0.04, w: 0.16, h: 0.07 },
    { id: 'el-dance', type: 'dance', label: 'Pista de baile', x: 0.40, y: 0.36, w: 0.20, h: 0.20 },
    { id: 'el-entry', type: 'entry', label: 'Entrada', x: 0.02, y: 0.46, w: 0.04, h: 0.10 },
    { id: 'el-bar', type: 'bar', label: 'Barra', x: 0.84, y: 0.10, w: 0.12, h: 0.06 },
    { id: 'el-buffet', type: 'buffet', label: 'Buffet de postres', x: 0.84, y: 0.80, w: 0.12, h: 0.06 },
  ],
};
// Mesas position — 22 mesas around dance floor
const mesaPositions = [
  // top row
  [0.13, 0.16], [0.25, 0.13], [0.37, 0.18], [0.50, 0.20], [0.63, 0.18], [0.75, 0.13], [0.87, 0.30],
  // left & right columns
  [0.13, 0.34], [0.13, 0.52], [0.13, 0.70],
  [0.87, 0.46], [0.87, 0.62], [0.87, 0.78],
  // bottom row
  [0.20, 0.78], [0.30, 0.85], [0.42, 0.78], [0.50, 0.90], [0.58, 0.78], [0.70, 0.85], [0.78, 0.78],
  // extras
  [0.27, 0.43], [0.72, 0.43],
];
MESAS.forEach((m, i) => { m.position = mesaPositions[i] ? { x: mesaPositions[i][0], y: mesaPositions[i][1] } : { x: 0.5, y: 0.5 }; });

// Timeline del evento
const TIMELINE = [
  { id: 'et-1', nombre: 'Recepción de invitados', hora_planificada: '20:30', duracion: 60, status: 'pendiente' },
  { id: 'et-2', nombre: 'Cóctel de bienvenida', hora_planificada: '21:00', duracion: 45, status: 'pendiente' },
  { id: 'et-3', nombre: 'Ingreso de los novios', hora_planificada: '21:45', duracion: 10, status: 'pendiente' },
  { id: 'et-4', nombre: 'Entrada fría', hora_planificada: '22:00', duracion: 30, status: 'pendiente' },
  { id: 'et-5', nombre: 'Discurso del padre', hora_planificada: '22:30', duracion: 10, status: 'pendiente' },
  { id: 'et-6', nombre: 'Plato principal', hora_planificada: '22:45', duracion: 60, status: 'pendiente' },
  { id: 'et-7', nombre: 'Vals + carnaval carioca', hora_planificada: '23:45', duracion: 30, status: 'pendiente' },
  { id: 'et-8', nombre: 'Corte de torta', hora_planificada: '00:30', duracion: 15, status: 'pendiente' },
  { id: 'et-9', nombre: 'Mesa dulce + barra de café', hora_planificada: '00:45', duracion: 60, status: 'pendiente' },
  { id: 'et-10', nombre: 'Pista libre', hora_planificada: '01:45', duracion: 180, status: 'pendiente' },
  { id: 'et-11', nombre: 'Cierre + bombones de despedida', hora_planificada: '04:30', duracion: 30, status: 'pendiente' },
];

// Servicios y proveedores
const PROVEEDORES = [
  { id: 'pr-1', name: 'Catering La Mesa Larga', phone: '+54 11 4321-9876', email: 'eventos@mesalarga.com.ar', notes: '5 años trabajando con ellos. Siempre puntuales.' },
  { id: 'pr-2', name: 'Sonido Total — DJ Ramírez', phone: '+54 11 5564-2210', email: 'djramirez@sonidototal.ar', notes: 'Excelente repertorio cumbia + latino' },
  { id: 'pr-3', name: 'Florería Camelia', phone: '+54 11 4892-1100', email: 'pedidos@camelia.com.ar', notes: '' },
  { id: 'pr-4', name: 'Fotos Mariano Vidal', phone: '+54 11 6688-7732', email: 'mariano@vidalfoto.com', notes: 'Entrega álbum en 30 días' },
  { id: 'pr-5', name: 'Seguridad Águila SRL', phone: '+54 11 4567-1234', email: 'admin@aguila.com.ar', notes: '' },
  { id: 'pr-6', name: 'Pantallas LED Premium', phone: '+54 11 5555-9090', email: 'rental@ledpremium.ar', notes: '' },
  { id: 'pr-7', name: 'Carpas y Cubrepiso Estrella', phone: '+54 11 4422-1818', email: 'ventas@estrella.com', notes: '' },
];

const SERVICIOS = [
  { id: 'sv-1', nombre: 'Catering 200 cubiertos', provider_id: 'pr-1', costo: 4_800_000, pagado: 4_800_000, moneda: 'ARS', estado: 'pagado', checklist_status: 'pendiente' },
  { id: 'sv-2', nombre: 'DJ + sonido + luces', provider_id: 'pr-2', costo: 850_000, pagado: 425_000, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
  { id: 'sv-3', nombre: 'Decoración floral + centros de mesa', provider_id: 'pr-3', costo: 720_000, pagado: 360_000, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
  { id: 'sv-4', nombre: 'Fotografía + video', provider_id: 'pr-4', costo: 1_200_000, pagado: 600_000, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
  { id: 'sv-5', nombre: 'Seguridad 4 personas (8h)', provider_id: 'pr-5', costo: 320_000, pagado: 0, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
  { id: 'sv-6', nombre: 'Pantalla LED 4x2m', provider_id: 'pr-6', costo: 280_000, pagado: 140_000, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
  { id: 'sv-7', nombre: 'Mesa dulce + barra de café', provider_id: 'pr-1', costo: 480_000, pagado: 240_000, moneda: 'ARS', estado: 'contratado', checklist_status: 'pendiente' },
];

// Biblioteca de servicios (checklist)
const SERVICE_TEMPLATES = [
  { id: 'tpl-1', category: 'Gastronomía', name: 'Catering principal', required: true },
  { id: 'tpl-2', category: 'Gastronomía', name: 'Mesa dulce', required: false },
  { id: 'tpl-3', category: 'Gastronomía', name: 'Barra de café', required: false },
  { id: 'tpl-4', category: 'Gastronomía', name: 'Barra libre', required: true },
  { id: 'tpl-5', category: 'Entretenimiento', name: 'DJ / Sonido', required: true },
  { id: 'tpl-6', category: 'Entretenimiento', name: 'Banda en vivo', required: false },
  { id: 'tpl-7', category: 'Entretenimiento', name: 'Carnaval carioca', required: false },
  { id: 'tpl-8', category: 'Entretenimiento', name: 'Photobooth', required: false },
  { id: 'tpl-9', category: 'Técnica', name: 'Iluminación', required: true },
  { id: 'tpl-10', category: 'Técnica', name: 'Pantalla LED', required: false },
  { id: 'tpl-11', category: 'Técnica', name: 'Pista de baile', required: false },
  { id: 'tpl-12', category: 'Infraestructura', name: 'Carpa exterior', required: false },
  { id: 'tpl-13', category: 'Infraestructura', name: 'Generador eléctrico', required: false },
  { id: 'tpl-14', category: 'Servicios', name: 'Seguridad privada', required: true },
  { id: 'tpl-15', category: 'Servicios', name: 'Coordinador del salón', required: true },
  { id: 'tpl-16', category: 'Servicios', name: 'Valet parking', required: false },
  { id: 'tpl-17', category: 'Decoración', name: 'Centros de mesa', required: false },
  { id: 'tpl-18', category: 'Decoración', name: 'Arco de flores', required: false },
  { id: 'tpl-19', category: 'Registro', name: 'Fotografía', required: true },
  { id: 'tpl-20', category: 'Registro', name: 'Video', required: false },
];

// Comanda del chef
const MENU = [
  { id: 'mc-1', tipo: 'entrada_fria', nombre: 'Crudo de salmón con palta', hora_salida: '22:00', notas: 'Servir bien frío' },
  { id: 'mc-2', tipo: 'entrada_caliente', nombre: 'Ravioles de calabaza con manteca y salvia', hora_salida: '22:20', notas: '' },
  { id: 'mc-3', tipo: 'principal', nombre: 'Bife de chorizo grillado con papas rústicas', hora_salida: '22:45', notas: 'Punto: a pedido del invitado' },
  { id: 'mc-4', tipo: 'principal_veg', nombre: 'Risotto de hongos con espárragos (vegetariano)', hora_salida: '22:45', notas: 'Para los invitados marcados como vegetariano/vegano' },
  { id: 'mc-5', tipo: 'postre', nombre: 'Trío de chocolates', hora_salida: '00:00', notas: '' },
  { id: 'mc-6', tipo: 'torta', nombre: 'Torta de bodas — 3 pisos red velvet', hora_salida: '00:30', notas: 'Coordinar con sonido para corte' },
];

const MENU_TIPO_LABEL = {
  entrada_fria: 'Entrada fría',
  entrada_caliente: 'Entrada caliente',
  principal: 'Plato principal',
  principal_veg: 'Plato principal vegetariano',
  guarnicion: 'Guarnición',
  postre: 'Postre',
  torta: 'Torta',
  mesa_dulce: 'Mesa dulce',
};

// Multi-evento dashboard list
const EVENTOS = [
  {
    id: 'ev-1',
    name: 'Boda Pérez-García',
    type: 'social',
    status: 'activo',
    date: '2026-05-20',
    time: '20:30',
    venue_name: 'Estancia La Reserva',
    location: 'Pilar, Buenos Aires',
    capacity: 220,
    has_tables: true,
    cover_hue: 220,
  },
  {
    id: 'ev-2',
    name: 'All Hands Q2 — TechCo',
    type: 'corporativo',
    status: 'planificacion',
    date: '2026-06-12',
    time: '14:00',
    venue_name: 'Hotel Madero',
    location: 'Puerto Madero, CABA',
    capacity: 320,
    has_tables: false,
    cover_hue: 168,
  },
  {
    id: 'ev-3',
    name: 'Gala Aniversario Fundación Luz',
    type: 'gala',
    status: 'planificacion',
    date: '2026-08-04',
    time: '21:00',
    venue_name: 'Palacio Sans Souci',
    location: 'Victoria, San Fernando',
    capacity: 450,
    has_tables: true,
    cover_hue: 32,
  },
  {
    id: 'ev-4',
    name: 'Casamiento Lopez-Mendez',
    type: 'social',
    status: 'finalizado',
    date: '2026-03-15',
    time: '20:00',
    venue_name: 'Finca Madero',
    location: 'San Isidro',
    capacity: 160,
    has_tables: true,
    cover_hue: 308,
  },
  {
    id: 'ev-5',
    name: 'XV Catalina Martínez',
    type: 'social',
    status: 'finalizado',
    date: '2026-02-28',
    time: '22:00',
    venue_name: 'Eventos del Pilar',
    location: 'Pilar',
    capacity: 200,
    has_tables: true,
    cover_hue: 340,
  },
];

const STATUS_LABEL = {
  pendiente: 'Pendiente',
  invitado: 'Invitado',
  visto: 'Visto',
  confirmado: 'Confirmado',
  checkin: 'Check-in',
  rechazo: 'Rechazó',
};

const STATUS_VARIANT = {
  pendiente: 'muted',
  invitado: 'secondary',
  visto: 'warning',
  confirmado: 'danger',
  checkin: 'info',
  rechazo: 'muted',
};

const STATUS_COLOR = {
  pendiente: '#94a3b8',
  invitado: '#a78bfa',
  visto: '#f59e0b',
  confirmado: '#fb923c',
  checkin: '#3b82f6',
  rechazo: '#475569',
};

const EVENT_STATUS_VARIANT = {
  planificacion: 'warning',
  activo: 'success',
  finalizado: 'muted',
};

const EVENT_STATUS_LABEL = {
  planificacion: 'Planificación',
  activo: 'Activo',
  finalizado: 'Finalizado',
};

const TIPO_EVENTO_LABEL = {
  social: 'Social',
  corporativo: 'Corporativo',
  gala: 'Gala',
  conferencia: 'Conferencia',
};

window.DATA = {
  EVENTOS,
  INVITADOS,
  MESAS,
  PLANO,
  TIMELINE,
  PROVEEDORES,
  SERVICIOS,
  SERVICE_TEMPLATES,
  MENU,
  MENU_TIPO_LABEL,
  RESTRICCION_LABEL,
  RESTRICCIONES_OPTS,
  GRUPOS,
  STATUS_LABEL,
  STATUS_VARIANT,
  STATUS_COLOR,
  EVENT_STATUS_VARIANT,
  EVENT_STATUS_LABEL,
  TIPO_EVENTO_LABEL,
};
