import { supabase } from './supabase.js';
import { STORAGE_BUCKET } from '../config.js';
import { uid } from './store.js';
import * as seed from '../data/seed.js';

const num = (value) => (value == null || value === '' ? null : Number(value));

const mapCategory = (r) => ({ id: r.id, name: r.name, emoji: r.emoji, tone: r.tone, sortOrder: r.sort_order });
const mapPlace = (r) => ({
  id: r.id, name: r.name, categoryId: r.category_id, group: r.group_name, emoji: r.emoji, area: r.area,
  duration: r.duration, image: r.image_url, tagline: r.tagline, description: r.description, tip: r.tip,
  lat: num(r.lat), lng: num(r.lng), rating: num(r.rating), featured: r.featured, sortOrder: r.sort_order,
});
const mapItinerary = (r, stops) => ({
  id: r.id, title: r.title, subtitle: r.subtitle, badge: r.badge, badgeIcon: r.badge_icon, color: r.color,
  duration: r.duration, image: r.image_url, rating: num(r.rating), description: r.description, sortOrder: r.sort_order,
  stops: stops.filter((s) => s.itinerary_id === r.id).sort((a, b) => a.position - b.position).map((s) => s.place_id),
});
export const mapBusiness = (r) => ({
  id: r.id, name: r.name, categoryId: r.category_id, category: r.category, tagline: r.tagline, description: r.description,
  level: r.level, priority: r.priority, active: r.active, image: r.image_url, gallery: r.gallery || [],
  phone: r.phone, whatsapp: r.whatsapp, website: r.website, address: r.address, lat: num(r.lat), lng: num(r.lng),
  rating: num(r.rating), reviewsCount: r.reviews_count, ctaLabel: r.cta_label,
});
const businessRow = (b) => ({
  name: b.name?.trim(), category_id: b.categoryId || null, category: b.category || null, tagline: b.tagline || null,
  description: b.description || null, level: b.level || 'Normal', priority: Number(b.priority) || 100, active: !!b.active,
  image_url: b.image || null, gallery: (b.gallery || []).filter(Boolean), phone: b.phone || null, whatsapp: b.whatsapp || null,
  website: b.website || null, address: b.address || null, lat: num(b.lat), lng: num(b.lng), rating: num(b.rating),
  reviews_count: b.reviewsCount === '' || b.reviewsCount == null ? null : Number(b.reviewsCount), cta_label: b.ctaLabel || 'Reservar Ahora',
});

export function fallbackCatalog() {
  return {
    categories: seed.CATEGORIES, places: seed.PLACES, itineraries: seed.ITINERARIES,
    businesses: seed.BUSINESSES, settings: seed.SETTINGS, source: 'local',
  };
}

export async function fetchCatalog() {
  const results = await Promise.all([
    supabase.from('categories').select('*').eq('active', true).order('sort_order'),
    supabase.from('places').select('*').eq('active', true).order('sort_order'),
    supabase.from('itineraries').select('*').eq('active', true).order('sort_order'),
    supabase.from('itinerary_stops').select('*').order('position'),
    supabase.from('businesses').select('*').order('priority').order('created_at'),
    supabase.from('app_settings').select('*'),
  ]);
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
  const [cats, places, its, stops, biz, settings] = results.map((r) => r.data || []);
  if (!places.length && !biz.length) throw new Error('La base de datos está vacía: ejecuta supabase/schema.sql');
  return {
    categories: cats.map(mapCategory),
    places: places.map(mapPlace),
    itineraries: its.map((r) => mapItinerary(r, stops)),
    businesses: biz.map(mapBusiness),
    settings: { ...seed.SETTINGS, ...Object.fromEntries(settings.map((s) => [s.key, s.value])) },
    source: 'supabase',
  };
}

export function subscribeCatalog(onChange) {
  let timer;
  const debounced = () => { clearTimeout(timer); timer = setTimeout(onChange, 400); };
  const channel = supabase
    .channel('catalogo')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'businesses' }, debounced)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'app_settings' }, debounced)
    .subscribe();
  return () => { clearTimeout(timer); supabase.removeChannel(channel); };
}

// ---------- Visitantes ----------
const tracked = new Set();
export function trackEvent(businessId, event) {
  if (!businessId) return;
  const key = `${businessId}:${event}`;
  if (event === 'view' && tracked.has(key)) return;
  tracked.add(key);
  supabase.from('business_events').insert({ business_id: businessId, event }).then(() => {}, () => {});
}

export async function createReservation(data) {
  const id = uid();
  const { error } = await supabase.from('reservations').insert({
    id, business_id: data.businessId, customer_name: data.name, phone: data.phone,
    reservation_date: data.date || null, people: Number(data.people) || 1, notes: data.notes || null,
  });
  if (error) throw error;
  trackEvent(data.businessId, 'reserve');
  return id;
}

// ---------- Administración ----------
export async function checkIsAdmin() {
  const { data, error } = await supabase.rpc('is_admin');
  if (error) return false;
  return data === true;
}

export async function saveBusiness(business) {
  const row = businessRow(business);
  if (!row.name) throw new Error('El nombre es obligatorio');
  const query = business.id
    ? supabase.from('businesses').update(row).eq('id', business.id).select().single()
    : supabase.from('businesses').insert(row).select().single();
  const { data, error } = await query;
  if (error) throw error;
  return mapBusiness(data);
}

export async function deleteBusiness(id) {
  const { error } = await supabase.from('businesses').delete().eq('id', id);
  if (error) throw error;
}

export async function reorderBusinesses(ids) {
  const results = await Promise.all(ids.map((id, index) => supabase.from('businesses').update({ priority: (index + 1) * 10 }).eq('id', id)));
  const failed = results.find((r) => r.error);
  if (failed) throw failed.error;
}

export async function setSetting(key, value) {
  const { error } = await supabase.from('app_settings').upsert({ key, value });
  if (error) throw error;
}

export async function uploadImage(file) {
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `negocios/${uid()}.${ext}`;
  const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
  if (error) throw error;
  return supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function fetchStats(days = 30) {
  const since = new Date(Date.now() - days * 86400000).toISOString();
  const { data, error } = await supabase.from('business_events').select('business_id,event,created_at').gte('created_at', since).limit(10000);
  if (error) throw error;
  return data || [];
}

export async function fetchReservations() {
  const { data, error } = await supabase.from('reservations').select('*').order('created_at', { ascending: false }).limit(200);
  if (error) throw error;
  return data || [];
}

export async function updateReservationStatus(id, status) {
  const { error } = await supabase.from('reservations').update({ status }).eq('id', id);
  if (error) throw error;
}
