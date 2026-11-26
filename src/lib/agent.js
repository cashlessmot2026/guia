// Agente turístico local basado en reglas: no usa APIs externas de IA.
const normalize = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export const WELCOME = '¡Hola, viajero! Soy tu guía de San Andrés. Puedo recomendarte lugares, organizar tu día y acompañarte parada por parada. ¿Qué te gustaría descubrir?';

export function buildAgentReply(message, { places = [], businesses = [], trip }) {
  const q = normalize(message);
  const stops = trip?.stops || [];
  const done = stops.filter((s) => s.done).length;

  const place = places.find((p) => {
    const name = normalize(p.name).replace(/\(.*\)/, '').trim();
    return name.length > 3 && q.includes(name.split(' / ')[0]);
  });
  if (place) return `📍 ${place.name} (${place.area}). ${place.description} Consejo: ${place.tip}`;

  const business = businesses.find((b) => b.active && q.includes(normalize(b.name)));
  if (business) return `🏝️ ${business.name}: ${business.description || business.tagline} Puedes verlo en “Negocios aliados” y reservar desde la app.`;

  if (/calor|sol\b|hidrat|agua potable|cansad|salud|mareo|deshidrat/.test(q)) return 'En la isla el sol puede sentirse intenso. Toma agua con regularidad, busca sombra, usa gorra y protector solar, y haz pausas. Si te sientes mareado o débil, detén la actividad, ve a un lugar fresco y pide ayuda local. 🌞';
  if (/comer|comida|gastr|rondon|pescado|restaurante|hambre|almuerzo|cena/.test(q)) return 'Para probar cocina local, mira Fair Tables, Miss Lydia en San Luis, Miss Janice Place o Pescadero Fisherman Place en el centro. Los horarios pueden cambiar: confirma antes de desplazarte. 🍲';
  if (/hist|cultur|raizal|iglesia|loma|morgan|museo/.test(q)) return 'Te recomiendo la ruta “Raíces e Historia Raizal”: La Loma, Primera Iglesia Bautista, Casa Museo Isleña y Cueva de Morgan. Es una buena forma de acercarte a la memoria y cultura de la isla. 🏛️';
  if (/familia|ninos|niños|hijos/.test(q)) return 'Para ir en familia te sugiero el “Plan Familiar Perfecto”: Spratt Bight, El Acuario, Rocky Cay, San Luis y Fair Tables. Aguas tranquilas y buena comida. 👨‍👩‍👧';
  if (/playa|mar|snork|buce|acuario|johnny|cayo|tortuga|coral/.test(q)) return 'Para un día de mar, combina El Acuario y Haynes Cay, o visita Johnny Cay. Para snorkel desde la orilla, West View. Los paseos en lancha dependen del estado del mar; confirma que la salida esté autorizada. 🐠';
  if (/creole|ingles|idioma|saludo|hablar con los locales/.test(q)) return 'Puedes saludar con “Hello” o “Good morning” y preguntar con respeto por la cultura raizal. En la isla se hablan español, inglés y creole sanandresano. 🌺';
  if (/musica|calypso|reggae|mento|baile|fiesta/.test(q)) return 'La música es parte de la identidad raizal. Pregunta en restaurantes y espacios comunitarios por presentaciones de calypso, reggae o mento, especialmente los fines de semana. 🎶';
  if (/posada|hosped|alojamiento|hotel|donde quedarme/.test(q)) return 'Considera una posada nativa en La Loma o San Luis para acercarte a la vida raizal y apoyar emprendimientos familiares. Verifica servicios y condiciones antes de reservar. 🏡';
  if (/artesan|souvenir|recuerdo|comprar|compras/.test(q)) return 'Busca artesanías de emprendedores locales: trabajos en coco, madera y tejidos. Comprar directamente a los artesanos apoya a la comunidad. 🛍️';
  if (/vuelta|recorrer|buggy|mulita|moto|circunvalar|carro/.test(q)) return 'La vuelta a la isla en mulita o moto permite conocer San Luis, West View y el Hoyo Soplador. Sal temprano, usa casco y nunca conduzcas después de consumir alcohol. 🛺';
  if (/lluv|llover|mal tiempo|clima/.test(q)) return 'Con lluvia, prioriza actividades culturales y gastronómicas: Casa Museo Isleña y cocina raizal. No consulto el clima en tiempo real; revisa el pronóstico local antes de salir. ☁️';
  if (/reserva|reservar|tour/.test(q)) return 'En “Negocios aliados” puedes elegir un operador y tocar “Reservar”. Tu solicitud queda registrada y el negocio te contactará para confirmar. 📅';
  if (/itiner|plan|ruta|organiza|crear|dia/.test(q)) return `¡Claro! Tengo planes de playa, aventura, historia, familia, vuelta a la isla y gastronomía. Entra a “Itinerarios” o crea tu propia ruta. ${stops.length ? `Tu ruta actual tiene ${stops.length} paradas y llevas ${done} completadas.` : ''} 🧭`;
  if (/hola|buenas|hey|buenos dias|buenas tardes|hello/.test(q)) return '¡Hola! Qué alegría acompañarte en San Andrés. ¿Prefieres playas, cultura raizal, aventura en el mar o gastronomía local? 🌴';
  if (/emergencia|ayuda urgente|policia|hospital|accidente/.test(q)) return 'Si es una emergencia, llama al 123 (línea única de emergencias en Colombia) y pide ayuda al personal local más cercano. 🚑';
  return 'Puedo ayudarte con playas, cayos, historia raizal, gastronomía, reservas y recorridos por la isla. Cuéntame cuánto tiempo tienes y qué te gustaría vivir. 🌊';
}
