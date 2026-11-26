// Datos de respaldo. La app los usa cuando Supabase no responde o aún no se ha
// ejecutado supabase/schema.sql. Los mismos registros se insertan en la base de datos.

const u = (id, w = 1000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=80`;

export const IMG = {
  dock: u('photo-1505881502353-a1986add3762'),
  aerialBoats: u('photo-1506929562872-bb421503ef21'),
  palmsBeach: u('photo-1519046904884-53103b34b206'),
  turquoiseTree: u('photo-1535262412227-85541e910204'),
  palmTurquoise: u('photo-1515238152791-8216bfdf89a7'),
  sunsetBeach: u('photo-1507525428034-b723cf961d3e'),
  turtle: u('photo-1437622368342-7a3d73a34c8f'),
  diver: u('photo-1544551763-8dd44758c2dd'),
  diverFish: u('photo-1544551763-92ab472cad5d'),
  diverSchool: u('photo-1544551763-46a013bb70d5'),
  coral: u('photo-1546026423-cc4642628d2b'),
  reef: u('photo-1583212292454-1fe6229603b7'),
  islet: u('photo-1559128010-7c1ad6e1b6a5'),
  rockyCoast: u('photo-1566024287286-457247b70310'),
  cove: u('photo-1510414842594-a61c69b5ae57'),
  church: u('photo-1438032005730-c779502df39b'),
  colorful: u('photo-1555881400-74d7acaacd8b'),
  lagoon: u('photo-1583244685026-d8519b5e3d21'),
  mangrove: u('photo-1586348943529-beaae6c28db9'),
  rondon: u('photo-1559847844-5315695dadae'),
  seafood: u('photo-1615141982883-c7ad0e69fd62'),
  foodTable: u('photo-1504674900247-0877df9cc836'),
  restaurant: u('photo-1414235077428-338989a2e8c0'),
  terrace: u('photo-1559339352-11d035aa65de'),
  shop: u('photo-1441986300917-64674bd600d8'),
  yacht: u('photo-1567899378494-47b22a2ae96a'),
  aerialCoast: u('photo-1505228395891-9a51e7e86bf6'),
};

export const CATEGORIES = [
  { id: 'playa', name: 'Playas', emoji: '🌴', tone: 'mint', sortOrder: 1 },
  { id: 'mar', name: 'Snorkel y Buceo', emoji: '🤿', tone: 'sky', sortOrder: 2 },
  { id: 'cultura', name: 'Cultura y Tradición', emoji: '🪘', tone: 'sand', sortOrder: 3 },
  { id: 'gastronomia', name: 'Gastronomía', emoji: '🍽️', tone: 'coral', sortOrder: 4 },
  { id: 'compras', name: 'Compras', emoji: '🛍️', tone: 'lavender', sortOrder: 5 },
  { id: 'tours', name: 'Tours', emoji: '🚤', tone: 'blue', sortOrder: 6 },
  { id: 'naturaleza', name: 'Naturaleza', emoji: '🦎', tone: 'mint', sortOrder: 7 },
];

export const PLACES = [
  { id: 'johnny', name: 'Johnny Cay', categoryId: 'playa', group: 'Cayos', emoji: '🏝️', area: 'Cayo al norte', duration: 'Medio día', image: IMG.dock, tagline: 'Paraíso en el Caribe', description: 'Un cayo de arena blanca, palmeras y aguas cristalinas. Es una visita clásica para disfrutar del paisaje caribeño.', tip: 'Se llega en lancha desde el sector de Spratt Bight. Confirma salidas, condiciones del mar y horarios con operadores autorizados.', lat: 12.6005, lng: -81.6905, rating: 4.9, featured: true, sortOrder: 1 },
  { id: 'acuario', name: 'El Acuario', categoryId: 'mar', group: 'Cayos', emoji: '🐠', area: 'Este de la isla', duration: '2–3 horas', image: IMG.aerialBoats, tagline: 'Aguas cristalinas y peces', description: 'Banco de arena de aguas poco profundas y transparentes, conocido por la observación de peces y el snorkel.', tip: 'Usa chaleco cuando corresponda, no pises ni toques los corales y sigue las indicaciones de los operadores.', lat: 12.556, lng: -81.677, rating: 4.8, featured: true, sortOrder: 2 },
  { id: 'spratt', name: 'Spratt Bight', categoryId: 'playa', group: 'Playas', emoji: '🏖️', area: 'Centro', duration: '1–2 horas', image: IMG.palmsBeach, tagline: 'La playa del centro', description: 'La playa principal del centro: arena blanca, mar de tonos turquesa y fácil acceso a restaurantes y comercios.', tip: 'Llega temprano para disfrutarla con más tranquilidad y lleva agua, gorra y protector solar.', lat: 12.5847, lng: -81.699, rating: 4.7, featured: true, sortOrder: 3 },
  { id: 'westview', name: 'West View / La Piscinita', categoryId: 'mar', group: 'Snorkel', emoji: '🤿', area: 'Costa oeste', duration: '1–2 horas', image: IMG.reef, tagline: 'Piscina natural de corales', description: 'Piscina natural entre formaciones coralinas, popular para observar peces y practicar snorkel desde la orilla.', tip: 'Entra solo por los accesos habilitados. No te lances si no conoces la profundidad.', lat: 12.535, lng: -81.727, rating: 4.7, featured: true, sortOrder: 4 },
  { id: 'haynes', name: 'Haynes Cay', categoryId: 'mar', group: 'Cayos', emoji: '🪸', area: 'Junto al Acuario', duration: '1 hora', image: IMG.islet, tagline: 'Cayo natural y tranquilo', description: 'Cayo vecino al Acuario, de ambiente natural y rocoso. Suele incluirse en el mismo paseo en lancha.', tip: 'Consulta el estado del mar y lleva calzado acuático adecuado.', lat: 12.559, lng: -81.674, rating: 4.6, featured: false, sortOrder: 5 },
  { id: 'rocky', name: 'Rocky Cay', categoryId: 'playa', group: 'Playas', emoji: '🪨', area: 'San Luis', duration: '1–2 horas', image: IMG.turquoiseTree, tagline: 'Cayo frente a San Luis', description: 'Cayo rocoso frente a la playa de San Luis. El paso por el agua depende de la marea y las condiciones del mar.', tip: 'No intentes cruzar si la corriente, profundidad o marea no son seguras. Pregunta a personal local.', lat: 12.553, lng: -81.695, rating: 4.6, featured: false, sortOrder: 6 },
  { id: 'sanluis', name: 'Playas de San Luis', categoryId: 'playa', group: 'Playas', emoji: '🌴', area: 'Costa este', duration: '1–2 horas', image: IMG.palmTurquoise, tagline: 'Ambiente local y tranquilo', description: 'Sector costero de ambiente local, con playas como Cocoplum y Sound Bay.', tip: 'Ideal para hacer una pausa, comer algo y conocer una zona menos centrada en el turismo del norte.', lat: 12.545, lng: -81.702, rating: 4.6, featured: false, sortOrder: 7 },
  { id: 'bengues', name: 'Bengues Beach', categoryId: 'playa', group: 'Playas', emoji: '🏝️', area: 'San Andrés', duration: '1 hora', image: IMG.sunsetBeach, tagline: 'Playa para descubrir', description: 'Playa incluida en la lista de lugares naturales para explorar en la isla.', tip: 'Confirma el acceso y las condiciones locales antes de desplazarte.', lat: null, lng: null, rating: null, featured: false, sortOrder: 8 },
  { id: 'hoyo', name: 'Hoyo Soplador', categoryId: 'naturaleza', group: 'Naturaleza', emoji: '🌊', area: 'Extremo sur', duration: '30–45 min', image: IMG.rockyCoast, tagline: 'Géiser natural del mar', description: 'Formación natural donde el oleaje puede impulsar aire y agua por cavidades de roca coralina.', tip: 'El efecto depende del oleaje. Mantén distancia del borde y respeta las zonas restringidas.', lat: 12.484, lng: -81.731, rating: 4.5, featured: false, sortOrder: 9 },
  { id: 'oldpoint', name: 'Manglar Old Point', categoryId: 'naturaleza', group: 'Naturaleza', emoji: '🛶', area: 'Bahía Hooker', duration: '1–2 horas', image: IMG.mangrove, tagline: 'Kayak entre manglares', description: 'Ecosistema de manglar para apreciar aves y vida silvestre. Puede haber recorridos guiados y actividades de bajo impacto.', tip: 'Mantén silencio, no alimentes a los animales y evita dejar residuos.', lat: 12.569, lng: -81.705, rating: 4.6, featured: false, sortOrder: 10 },
  { id: 'bigpond', name: 'Big Pond (La Laguna)', categoryId: 'naturaleza', group: 'Naturaleza', emoji: '🦎', area: 'Interior de la isla', duration: '45–60 min', image: IMG.lagoon, tagline: 'Laguna de agua dulce', description: 'Laguna de agua dulce rodeada de vegetación, asociada a observación de naturaleza y paisaje interior.', tip: 'Consulta el acceso antes de ir y observa la fauna desde una distancia prudente.', lat: 12.546, lng: -81.718, rating: 4.4, featured: false, sortOrder: 11 },
  { id: 'church', name: 'Primera Iglesia Bautista', categoryId: 'cultura', group: 'Historia y cultura', emoji: '⛪', area: 'La Loma', duration: '45–60 min', image: IMG.church, tagline: 'Patrimonio raizal', description: 'Templo histórico de la comunidad bautista raizal en La Loma, vinculado a la historia protestante y educativa de la isla.', tip: 'Visita con respeto si hay culto o actividades comunitarias. Confirma previamente horarios y acceso al campanario.', lat: 12.556, lng: -81.717, rating: 4.7, featured: false, sortOrder: 12 },
  { id: 'loma', name: 'La Loma (The Hill)', categoryId: 'cultura', group: 'Historia y cultura', emoji: '🏘️', area: 'Centro–interior', duration: '1 hora', image: IMG.colorful, tagline: 'Barrio tradicional isleño', description: 'Barrio tradicional donde puedes reconocer arquitectura caribeña, memoria comunitaria e identidad raizal.', tip: 'Recorre con respeto, pide permiso antes de fotografiar personas o viviendas y considera un guía local.', lat: 12.5545, lng: -81.7155, rating: 4.5, featured: false, sortOrder: 13 },
  { id: 'casamuseo', name: 'Casa Museo Isleña', categoryId: 'cultura', group: 'Historia y cultura', emoji: '🏠', area: 'Circunvalar, km 5', duration: '45–60 min', image: IMG.colorful, tagline: 'La vida isleña tradicional', description: 'Espacio para acercarse a la vivienda tradicional, objetos cotidianos y costumbres de las familias isleñas.', tip: 'Confirma horarios de apertura y disponibilidad de actividades culturales antes de desplazarte.', lat: 12.544, lng: -81.7035, rating: 4.5, featured: false, sortOrder: 14 },
  { id: 'morgan', name: 'Cueva de Morgan', categoryId: 'cultura', group: 'Historia y cultura', emoji: '🏴‍☠️', area: 'Costa oeste', duration: '45–60 min', image: IMG.cove, tagline: 'Leyendas de corsarios', description: 'Lugar turístico asociado a relatos y leyendas sobre corsarios y tesoros en el archipiélago.', tip: 'Distingue la tradición oral de los hechos documentados: la historia del tesoro pertenece principalmente a la leyenda local.', lat: 12.537, lng: -81.724, rating: 4.3, featured: false, sortOrder: 15 },
  { id: 'fairtables', name: 'Fair Tables', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🥟', area: 'San Luis', duration: '30–60 min', image: IMG.foodTable, tagline: 'Cocina casera raizal', description: 'Mesas de cocina casera donde matronas y familias ofrecen preparaciones tradicionales como crab patty, fish balls y pan de coco.', tip: 'La oferta cambia según el día. Lleva efectivo y pregunta por ingredientes si tienes alergias.', lat: 12.541, lng: -81.7015, rating: 4.7, featured: false, sortOrder: 16 },
  { id: 'misslydia', name: 'Restaurante Miss Lydia', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🍲', area: 'San Luis', duration: '1–1.5 horas', image: IMG.rondon, tagline: 'Rondón y sopa de cangrejo', description: 'Referente de cocina raizal casera. Entre los platos mencionados están rondón, sopa de cangrejo, pescado y caracol.', tip: 'La información disponible indica actividad principalmente los fines de semana al almuerzo; confirma antes de ir.', lat: 12.5395, lng: -81.7022, rating: 4.8, featured: false, sortOrder: 17 },
  { id: 'missjanice', name: 'Miss Janice Place', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🐟', area: 'San Luis', duration: '1–1.5 horas', image: IMG.seafood, tagline: 'Pescados y mariscos', description: 'Restaurante isleño de ambiente familiar, con pescados y preparaciones tradicionales de mariscos.', tip: 'Pregunta por la pesca y los platos disponibles del día.', lat: 12.5425, lng: -81.701, rating: 4.6, featured: false, sortOrder: 18 },
  { id: 'bohios', name: 'Restaurante Los Bohíos', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🍽️', area: 'San Andrés', duration: '1 hora', image: IMG.terrace, tagline: 'Comida isleña informal', description: 'Opción informal asociada a comida isleña y preparaciones de mariscos.', tip: 'Confirma ubicación exacta, horario y menú antes de desplazarte.', lat: null, lng: null, rating: null, featured: false, sortOrder: 19 },
  { id: 'fisherman', name: 'Pescadero Fisherman Place', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🐠', area: 'Centro / muelle', duration: '1 hora', image: IMG.seafood, tagline: 'Pescado fresco del día', description: 'Comedor sencillo mencionado por su pescado, ceviches, fish balls y arroz con coco.', tip: 'Consulta la disponibilidad de pescado fresco y los precios del día.', lat: 12.5852, lng: -81.6975, rating: 4.6, featured: false, sortOrder: 20 },
  { id: 'disertando', name: 'Disertando Place', categoryId: 'gastronomia', group: 'Gastronomía raizal', emoji: '🦀', area: 'El Cove', duration: '1 hora', image: IMG.restaurant, tagline: 'Mariscos en El Cove', description: 'Lugar de cocina casera y mariscos, en el sector de pescadores de El Cove.', tip: 'Verifica días de atención y reserva o confirma disponibilidad antes de salir.', lat: 12.5345, lng: -81.728, rating: 4.5, featured: false, sortOrder: 21 },
];

export const ITINERARIES = [
  { id: 'esencial', title: 'Esencial San Andrés', subtitle: 'Una primera mirada a la isla', badge: 'Más Popular', badgeIcon: '⭐', color: 'blue', duration: '1 día', image: IMG.palmsBeach, rating: 4.9, description: 'Combina el cayo más famoso, la playa del centro, la cultura raizal de La Loma y el snorkel de West View.', stops: ['spratt', 'johnny', 'loma', 'sanluis', 'westview'], sortOrder: 1 },
  { id: 'snorkel', title: 'Snorkel y Naturaleza', subtitle: 'Cayos, arrecifes y manglares', badge: 'Aventura Total', badgeIcon: '🏊', color: 'violet', duration: '1 día', image: IMG.turtle, rating: 4.8, description: 'Agrupa los mejores puntos para ver vida marina y naturaleza. La operación en lancha depende del estado del mar.', stops: ['acuario', 'haynes', 'westview', 'hoyo', 'oldpoint', 'bigpond'], sortOrder: 2 },
  { id: 'familia', title: 'Plan Familiar Perfecto', subtitle: 'Aguas tranquilas y buena comida', badge: 'En Familia', badgeIcon: '👨‍👩‍👧', color: 'green', duration: '1 día', image: IMG.turquoiseTree, rating: 4.8, description: 'Playas de aguas calmadas, un paseo al Acuario y cocina casera raizal para todos.', stops: ['spratt', 'acuario', 'rocky', 'sanluis', 'fairtables'], sortOrder: 3 },
  { id: 'cultura', title: 'Raíces e Historia Raizal', subtitle: 'La identidad de la isla', badge: 'Cultural', badgeIcon: '🪘', color: 'orange', duration: 'Medio día', image: IMG.church, rating: 4.7, description: 'Un paseo por la memoria, la arquitectura, la tradición y las leyendas locales.', stops: ['loma', 'church', 'casamuseo', 'morgan'], sortOrder: 4 },
  { id: 'sabores', title: 'Sabores Raizales', subtitle: 'Cocina isleña de verdad', badge: 'Gastronomía', badgeIcon: '🍲', color: 'pink', duration: 'Medio día', image: IMG.rondon, rating: 4.8, description: 'Descubre preparaciones caseras y cocina local. Ajusta las paradas según horarios reales.', stops: ['fairtables', 'misslydia', 'missjanice', 'fisherman'], sortOrder: 5 },
  { id: 'vuelta', title: 'Vuelta a la Isla', subtitle: 'La circunvalar a tu ritmo', badge: 'En Carretera', badgeIcon: '🛺', color: 'teal', duration: '1 día', image: IMG.aerialCoast, rating: 4.7, description: 'Ruta terrestre con paradas naturales y culturales. Se recomienda salir temprano.', stops: ['oldpoint', 'bigpond', 'loma', 'sanluis', 'rocky', 'westview', 'hoyo'], sortOrder: 6 },
];

// Negocios de ejemplo (reemplázalos por aliados reales desde el Panel Admin).
export const BUSINESSES = [
  { id: '6f1c2a10-0001-4a5b-9c01-000000000001', name: 'Scuba San Andrés', categoryId: 'mar', category: 'Tours de Buceo y Snorkel', tagline: 'Tours de Buceo y Snorkel con los mejores guías', description: 'Vive una experiencia única explorando los arrecifes de San Andrés con nuestros guías expertos.', level: 'Prioritario', priority: 10, active: true, image: IMG.diver, gallery: [IMG.turtle, IMG.diverFish, IMG.reef, IMG.diverSchool], phone: null, whatsapp: null, website: null, address: 'San Andrés Islas', lat: 12.5835, lng: -81.7005, rating: 4.9, reviewsCount: 1250, ctaLabel: 'Reservar Tour' },
  { id: '6f1c2a10-0002-4a5b-9c01-000000000002', name: 'Restaurante El Isleño', categoryId: 'gastronomia', category: 'Restaurante caribeño', tagline: 'Sabor caribeño en el corazón de la isla', description: 'Cocina isleña con pescado fresco, mariscos y recetas tradicionales del Caribe.', level: 'Prioritario', priority: 20, active: true, image: IMG.foodTable, gallery: [IMG.foodTable, IMG.rondon, IMG.terrace], phone: null, whatsapp: null, website: null, address: 'Centro, San Andrés', lat: 12.582, lng: -81.701, rating: 4.8, reviewsCount: 860, ctaLabel: 'Reservar Mesa' },
  { id: '6f1c2a10-0003-4a5b-9c01-000000000003', name: 'Souvenirs Coral', categoryId: 'compras', category: 'Compras y artesanías', tagline: 'Llévate un recuerdo hecho en la isla', description: 'Artesanías locales, productos de coco y recuerdos elaborados por emprendedores isleños.', level: 'Normal', priority: 30, active: true, image: IMG.shop, gallery: [IMG.shop], phone: null, whatsapp: null, website: null, address: 'Centro, San Andrés', lat: 12.5838, lng: -81.7022, rating: 4.6, reviewsCount: 320, ctaLabel: 'Contactar' },
  { id: '6f1c2a10-0004-4a5b-9c01-000000000004', name: 'Tours Siete Colores', categoryId: 'tours', category: 'Paseos en lancha', tagline: 'Recorre los cayos del mar de los siete colores', description: 'Paseos en lancha a Johnny Cay, El Acuario y Haynes Cay con operadores autorizados.', level: 'Normal', priority: 40, active: true, image: IMG.yacht, gallery: [IMG.yacht, IMG.aerialBoats, IMG.dock], phone: null, whatsapp: null, website: null, address: 'Muelle, San Andrés', lat: 12.5843, lng: -81.6968, rating: 4.7, reviewsCount: 410, ctaLabel: 'Reservar Tour' },
];

export const SETTINGS = { priority_enabled: true };

export const LEVELS = ['Premium', 'Prioritario', 'Normal', 'Básico'];
