const label = (item) => [item.name, item.address && item.address !== 'San Andrés Islas' ? item.address : null, 'San Andrés, Colombia'].filter(Boolean).join(', ');

export function mapsUrl(item) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(label(item))}`;
}

export function directionsUrl(item) {
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(label(item))}`;
}

export function routeUrl(items) {
  const names = items.map(label);
  if (!names.length) return 'https://www.google.com/maps';
  const destination = names[names.length - 1];
  const waypoints = names.slice(0, -1).join('|');
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}${waypoints ? `&waypoints=${encodeURIComponent(waypoints)}` : ''}&travelmode=driving`;
}

export function telUrl(phone) {
  return phone ? `tel:${String(phone).replace(/[^\d+]/g, '')}` : null;
}

export function whatsappUrl(number, text = '') {
  if (!number) return null;
  const digits = String(number).replace(/\D/g, '');
  return `https://wa.me/${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
}

export function webUrl(site) {
  if (!site) return null;
  return /^https?:\/\//i.test(site) ? site : `https://${site}`;
}

export function distanceKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const rad = (deg) => (deg * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(h));
}

export function formatKm(km) {
  if (km == null) return null;
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

// Reduce el ancho de las imágenes de Unsplash para miniaturas.
export function sized(url, width) {
  if (!url || !url.includes('images.unsplash.com')) return url;
  return url.replace(/([?&])w=\d+/, `$1w=${width}`);
}

export function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
