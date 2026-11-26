// Conexión a Supabase. La llave "publishable" está pensada para usarse en el navegador:
// la seguridad la dan las políticas RLS definidas en supabase/schema.sql.
// Puedes sobrescribir estos valores con variables de entorno (ver .env.example).
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://bqiyybghnzjpnvkvntqg.supabase.co';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_sq-MhdfPI3kddGGZsacMGw_DzsMrHJ_';
export const STORAGE_BUCKET = 'imagenes';
export const TILE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
export const ISLAND_CENTER = [12.55, -81.71];
