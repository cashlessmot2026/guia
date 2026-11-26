-- =====================================================================
--  San Andrés Explorer — Esquema de base de datos para Supabase
--  Cómo usarlo: Supabase → SQL Editor → New query → pega TODO el archivo → Run.
--  Es idempotente: puedes ejecutarlo más de una vez sin duplicar datos.
-- =====================================================================


-- ---------------------------------------------------------------------
-- 1. Administradores
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Marca de tiempo de actualización
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- 2. Catálogo turístico
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id         text primary key,
  name       text not null,
  emoji      text,
  tone       text default 'blue',
  sort_order int  not null default 100,
  active     boolean not null default true
);

create table if not exists public.places (
  id          text primary key,
  name        text not null,
  category_id text references public.categories (id) on update cascade on delete set null,
  group_name  text,
  emoji       text,
  area        text,
  duration    text,
  image_url   text,
  tagline     text,
  description text,
  tip         text,
  lat         double precision,
  lng         double precision,
  rating      numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  featured    boolean not null default false,
  sort_order  int not null default 100,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.itineraries (
  id          text primary key,
  title       text not null,
  subtitle    text,
  badge       text,
  badge_icon  text,
  color       text default 'blue',
  duration    text,
  description text,
  image_url   text,
  rating      numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  sort_order  int not null default 100,
  active      boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.itinerary_stops (
  itinerary_id text not null references public.itineraries (id) on update cascade on delete cascade,
  position     int  not null,
  place_id     text not null references public.places (id) on update cascade on delete cascade,
  primary key (itinerary_id, position)
);

-- ---------------------------------------------------------------------
-- 3. Negocios aliados (gestionados desde el Panel Admin)
-- ---------------------------------------------------------------------
create table if not exists public.businesses (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category_id   text references public.categories (id) on update cascade on delete set null,
  category      text,
  tagline       text,
  description   text,
  level         text not null default 'Normal' check (level in ('Premium', 'Prioritario', 'Normal', 'Básico')),
  priority      int  not null default 100,
  active        boolean not null default true,
  image_url     text,
  gallery       text[] not null default '{}',
  phone         text,
  whatsapp      text,
  website       text,
  address       text,
  lat           double precision,
  lng           double precision,
  rating        numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  reviews_count int check (reviews_count is null or reviews_count >= 0),
  cta_label     text default 'Reservar Ahora',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index if not exists businesses_priority_idx on public.businesses (active, priority);

-- ---------------------------------------------------------------------
-- 4. Reservas y estadísticas
-- ---------------------------------------------------------------------
create table if not exists public.reservations (
  id               uuid primary key default gen_random_uuid(),
  business_id      uuid not null references public.businesses (id) on delete cascade,
  customer_name    text not null check (char_length(customer_name) between 1 and 80),
  phone            text not null check (char_length(phone) between 5 and 25),
  reservation_date date,
  people           int not null default 1 check (people between 1 and 50),
  notes            text check (notes is null or char_length(notes) <= 300),
  status           text not null default 'pendiente' check (status in ('pendiente', 'confirmada', 'cancelada')),
  created_at       timestamptz not null default now()
);
create index if not exists reservations_business_idx on public.reservations (business_id, created_at desc);

create table if not exists public.business_events (
  id          bigint generated always as identity primary key,
  business_id uuid not null references public.businesses (id) on delete cascade,
  event       text not null check (event in ('view', 'call', 'whatsapp', 'directions', 'web', 'reserve')),
  created_at  timestamptz not null default now()
);
create index if not exists business_events_created_idx on public.business_events (created_at desc);

-- ---------------------------------------------------------------------
-- 5. Configuración de la app
-- ---------------------------------------------------------------------
create table if not exists public.app_settings (
  key        text primary key,
  value      jsonb not null,
  updated_at timestamptz not null default now()
);

-- Triggers updated_at
drop trigger if exists places_touch on public.places;
create trigger places_touch before update on public.places for each row execute function public.touch_updated_at();
drop trigger if exists itineraries_touch on public.itineraries;
create trigger itineraries_touch before update on public.itineraries for each row execute function public.touch_updated_at();
drop trigger if exists businesses_touch on public.businesses;
create trigger businesses_touch before update on public.businesses for each row execute function public.touch_updated_at();
drop trigger if exists settings_touch on public.app_settings;
create trigger settings_touch before update on public.app_settings for each row execute function public.touch_updated_at();

-- ---------------------------------------------------------------------
-- 6. Seguridad (Row Level Security)
--    Turistas (anon): leen el catálogo publicado, crean reservas y eventos.
--    Administradores: control total.
-- ---------------------------------------------------------------------
alter table public.admins          enable row level security;
alter table public.categories      enable row level security;
alter table public.places          enable row level security;
alter table public.itineraries     enable row level security;
alter table public.itinerary_stops enable row level security;
alter table public.businesses      enable row level security;
alter table public.reservations    enable row level security;
alter table public.business_events enable row level security;
alter table public.app_settings    enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.places, public.itineraries, public.itinerary_stops, public.businesses, public.app_settings to anon, authenticated;
grant insert on public.reservations, public.business_events to anon, authenticated;
grant select, insert, update, delete on public.categories, public.places, public.itineraries, public.itinerary_stops,
  public.businesses, public.reservations, public.business_events, public.app_settings, public.admins to authenticated;

-- admins
drop policy if exists "admins: ver propio registro" on public.admins;
create policy "admins: ver propio registro" on public.admins for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admins: gestionar" on public.admins;
create policy "admins: gestionar" on public.admins for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- catálogo público
drop policy if exists "categorias: lectura" on public.categories;
create policy "categorias: lectura" on public.categories for select using (active or public.is_admin());
drop policy if exists "categorias: admin" on public.categories;
create policy "categorias: admin" on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "lugares: lectura" on public.places;
create policy "lugares: lectura" on public.places for select using (active or public.is_admin());
drop policy if exists "lugares: admin" on public.places;
create policy "lugares: admin" on public.places for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "itinerarios: lectura" on public.itineraries;
create policy "itinerarios: lectura" on public.itineraries for select using (active or public.is_admin());
drop policy if exists "itinerarios: admin" on public.itineraries;
create policy "itinerarios: admin" on public.itineraries for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "paradas: lectura" on public.itinerary_stops;
create policy "paradas: lectura" on public.itinerary_stops for select using (true);
drop policy if exists "paradas: admin" on public.itinerary_stops;
create policy "paradas: admin" on public.itinerary_stops for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "negocios: lectura" on public.businesses;
create policy "negocios: lectura" on public.businesses for select using (active or public.is_admin());
drop policy if exists "negocios: admin" on public.businesses;
create policy "negocios: admin" on public.businesses for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists "ajustes: lectura" on public.app_settings;
create policy "ajustes: lectura" on public.app_settings for select using (true);
drop policy if exists "ajustes: admin" on public.app_settings;
create policy "ajustes: admin" on public.app_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- reservas: cualquiera puede solicitar (solo como pendiente y en negocios publicados); solo admin las ve.
drop policy if exists "reservas: crear" on public.reservations;
create policy "reservas: crear" on public.reservations for insert to anon, authenticated
  with check (status = 'pendiente' and exists (select 1 from public.businesses b where b.id = business_id and b.active));
drop policy if exists "reservas: admin" on public.reservations;
create policy "reservas: admin" on public.reservations for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- eventos de estadísticas: cualquiera registra; solo admin consulta.
drop policy if exists "eventos: crear" on public.business_events;
create policy "eventos: crear" on public.business_events for insert to anon, authenticated
  with check (exists (select 1 from public.businesses b where b.id = business_id and b.active));
drop policy if exists "eventos: admin" on public.business_events;
create policy "eventos: admin" on public.business_events for select to authenticated using (public.is_admin());

-- ---------------------------------------------------------------------
-- 7. Almacenamiento de imágenes (bucket público "imagenes")
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('imagenes', 'imagenes', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'])
on conflict (id) do update set public = true, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagenes: lectura publica" on storage.objects;
create policy "imagenes: lectura publica" on storage.objects for select using (bucket_id = 'imagenes');
drop policy if exists "imagenes: admin sube" on storage.objects;
create policy "imagenes: admin sube" on storage.objects for insert to authenticated with check (bucket_id = 'imagenes' and public.is_admin());
drop policy if exists "imagenes: admin edita" on storage.objects;
create policy "imagenes: admin edita" on storage.objects for update to authenticated using (bucket_id = 'imagenes' and public.is_admin());
drop policy if exists "imagenes: admin borra" on storage.objects;
create policy "imagenes: admin borra" on storage.objects for delete to authenticated using (bucket_id = 'imagenes' and public.is_admin());

-- ---------------------------------------------------------------------
-- 8. Tiempo real: los cambios del Panel Admin se reflejan al instante en la app
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'businesses') then
    alter publication supabase_realtime add table public.businesses;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'app_settings') then
    alter publication supabase_realtime add table public.app_settings;
  end if;
exception when undefined_object then
  raise notice 'Publicación supabase_realtime no encontrada; se omite el tiempo real.';
end;
$$;

-- ---------------------------------------------------------------------
-- 9. Datos iniciales (no sobrescriben cambios hechos después)
--    Los negocios son EJEMPLOS: edítalos o reemplázalos desde el Panel Admin.
-- ---------------------------------------------------------------------
insert into public.categories (id, name, emoji, tone, sort_order) values
  ('playa', 'Playas', '🌴', 'mint', 1),
  ('mar', 'Snorkel y Buceo', '🤿', 'sky', 2),
  ('cultura', 'Cultura y Tradición', '🪘', 'sand', 3),
  ('gastronomia', 'Gastronomía', '🍽️', 'coral', 4),
  ('compras', 'Compras', '🛍️', 'lavender', 5),
  ('tours', 'Tours', '🚤', 'blue', 6),
  ('naturaleza', 'Naturaleza', '🦎', 'mint', 7)
on conflict (id) do nothing;

insert into public.places (id, name, category_id, group_name, emoji, area, duration, image_url, tagline, description, tip, lat, lng, rating, featured, sort_order) values
  ('johnny', 'Johnny Cay', 'playa', 'Cayos', '🏝️', 'Cayo al norte', 'Medio día', 'https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1000&q=80', 'Paraíso en el Caribe', 'Un cayo de arena blanca, palmeras y aguas cristalinas. Es una visita clásica para disfrutar del paisaje caribeño.', 'Se llega en lancha desde el sector de Spratt Bight. Confirma salidas, condiciones del mar y horarios con operadores autorizados.', 12.6005, -81.6905, 4.9, true, 1),
  ('acuario', 'El Acuario', 'mar', 'Cayos', '🐠', 'Este de la isla', '2–3 horas', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80', 'Aguas cristalinas y peces', 'Banco de arena de aguas poco profundas y transparentes, conocido por la observación de peces y el snorkel.', 'Usa chaleco cuando corresponda, no pises ni toques los corales y sigue las indicaciones de los operadores.', 12.556, -81.677, 4.8, true, 2),
  ('spratt', 'Spratt Bight', 'playa', 'Playas', '🏖️', 'Centro', '1–2 horas', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80', 'La playa del centro', 'La playa principal del centro: arena blanca, mar de tonos turquesa y fácil acceso a restaurantes y comercios.', 'Llega temprano para disfrutarla con más tranquilidad y lleva agua, gorra y protector solar.', 12.5847, -81.699, 4.7, true, 3),
  ('westview', 'West View / La Piscinita', 'mar', 'Snorkel', '🤿', 'Costa oeste', '1–2 horas', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1000&q=80', 'Piscina natural de corales', 'Piscina natural entre formaciones coralinas, popular para observar peces y practicar snorkel desde la orilla.', 'Entra solo por los accesos habilitados. No te lances si no conoces la profundidad.', 12.535, -81.727, 4.7, true, 4),
  ('haynes', 'Haynes Cay', 'mar', 'Cayos', '🪸', 'Junto al Acuario', '1 hora', 'https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?auto=format&fit=crop&w=1000&q=80', 'Cayo natural y tranquilo', 'Cayo vecino al Acuario, de ambiente natural y rocoso. Suele incluirse en el mismo paseo en lancha.', 'Consulta el estado del mar y lleva calzado acuático adecuado.', 12.559, -81.674, 4.6, false, 5),
  ('rocky', 'Rocky Cay', 'playa', 'Playas', '🪨', 'San Luis', '1–2 horas', 'https://images.unsplash.com/photo-1535262412227-85541e910204?auto=format&fit=crop&w=1000&q=80', 'Cayo frente a San Luis', 'Cayo rocoso frente a la playa de San Luis. El paso por el agua depende de la marea y las condiciones del mar.', 'No intentes cruzar si la corriente, profundidad o marea no son seguras. Pregunta a personal local.', 12.553, -81.695, 4.6, false, 6),
  ('sanluis', 'Playas de San Luis', 'playa', 'Playas', '🌴', 'Costa este', '1–2 horas', 'https://images.unsplash.com/photo-1515238152791-8216bfdf89a7?auto=format&fit=crop&w=1000&q=80', 'Ambiente local y tranquilo', 'Sector costero de ambiente local, con playas como Cocoplum y Sound Bay.', 'Ideal para hacer una pausa, comer algo y conocer una zona menos centrada en el turismo del norte.', 12.545, -81.702, 4.6, false, 7),
  ('bengues', 'Bengues Beach', 'playa', 'Playas', '🏝️', 'San Andrés', '1 hora', 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80', 'Playa para descubrir', 'Playa incluida en la lista de lugares naturales para explorar en la isla.', 'Confirma el acceso y las condiciones locales antes de desplazarte.', null, null, null, false, 8),
  ('hoyo', 'Hoyo Soplador', 'naturaleza', 'Naturaleza', '🌊', 'Extremo sur', '30–45 min', 'https://images.unsplash.com/photo-1566024287286-457247b70310?auto=format&fit=crop&w=1000&q=80', 'Géiser natural del mar', 'Formación natural donde el oleaje puede impulsar aire y agua por cavidades de roca coralina.', 'El efecto depende del oleaje. Mantén distancia del borde y respeta las zonas restringidas.', 12.484, -81.731, 4.5, false, 9),
  ('oldpoint', 'Manglar Old Point', 'naturaleza', 'Naturaleza', '🛶', 'Bahía Hooker', '1–2 horas', 'https://images.unsplash.com/photo-1586348943529-beaae6c28db9?auto=format&fit=crop&w=1000&q=80', 'Kayak entre manglares', 'Ecosistema de manglar para apreciar aves y vida silvestre. Puede haber recorridos guiados y actividades de bajo impacto.', 'Mantén silencio, no alimentes a los animales y evita dejar residuos.', 12.569, -81.705, 4.6, false, 10),
  ('bigpond', 'Big Pond (La Laguna)', 'naturaleza', 'Naturaleza', '🦎', 'Interior de la isla', '45–60 min', 'https://images.unsplash.com/photo-1583244685026-d8519b5e3d21?auto=format&fit=crop&w=1000&q=80', 'Laguna de agua dulce', 'Laguna de agua dulce rodeada de vegetación, asociada a observación de naturaleza y paisaje interior.', 'Consulta el acceso antes de ir y observa la fauna desde una distancia prudente.', 12.546, -81.718, 4.4, false, 11),
  ('church', 'Primera Iglesia Bautista', 'cultura', 'Historia y cultura', '⛪', 'La Loma', '45–60 min', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1000&q=80', 'Patrimonio raizal', 'Templo histórico de la comunidad bautista raizal en La Loma, vinculado a la historia protestante y educativa de la isla.', 'Visita con respeto si hay culto o actividades comunitarias. Confirma previamente horarios y acceso al campanario.', 12.556, -81.717, 4.7, false, 12),
  ('loma', 'La Loma (The Hill)', 'cultura', 'Historia y cultura', '🏘️', 'Centro–interior', '1 hora', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80', 'Barrio tradicional isleño', 'Barrio tradicional donde puedes reconocer arquitectura caribeña, memoria comunitaria e identidad raizal.', 'Recorre con respeto, pide permiso antes de fotografiar personas o viviendas y considera un guía local.', 12.5545, -81.7155, 4.5, false, 13),
  ('casamuseo', 'Casa Museo Isleña', 'cultura', 'Historia y cultura', '🏠', 'Circunvalar, km 5', '45–60 min', 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?auto=format&fit=crop&w=1000&q=80', 'La vida isleña tradicional', 'Espacio para acercarse a la vivienda tradicional, objetos cotidianos y costumbres de las familias isleñas.', 'Confirma horarios de apertura y disponibilidad de actividades culturales antes de desplazarte.', 12.544, -81.7035, 4.5, false, 14),
  ('morgan', 'Cueva de Morgan', 'cultura', 'Historia y cultura', '🏴‍☠️', 'Costa oeste', '45–60 min', 'https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?auto=format&fit=crop&w=1000&q=80', 'Leyendas de corsarios', 'Lugar turístico asociado a relatos y leyendas sobre corsarios y tesoros en el archipiélago.', 'Distingue la tradición oral de los hechos documentados: la historia del tesoro pertenece principalmente a la leyenda local.', 12.537, -81.724, 4.3, false, 15),
  ('fairtables', 'Fair Tables', 'gastronomia', 'Gastronomía raizal', '🥟', 'San Luis', '30–60 min', 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80', 'Cocina casera raizal', 'Mesas de cocina casera donde matronas y familias ofrecen preparaciones tradicionales como crab patty, fish balls y pan de coco.', 'La oferta cambia según el día. Lleva efectivo y pregunta por ingredientes si tienes alergias.', 12.541, -81.7015, 4.7, false, 16),
  ('misslydia', 'Restaurante Miss Lydia', 'gastronomia', 'Gastronomía raizal', '🍲', 'San Luis', '1–1.5 horas', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80', 'Rondón y sopa de cangrejo', 'Referente de cocina raizal casera. Entre los platos mencionados están rondón, sopa de cangrejo, pescado y caracol.', 'La información disponible indica actividad principalmente los fines de semana al almuerzo; confirma antes de ir.', 12.5395, -81.7022, 4.8, false, 17),
  ('missjanice', 'Miss Janice Place', 'gastronomia', 'Gastronomía raizal', '🐟', 'San Luis', '1–1.5 horas', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=1000&q=80', 'Pescados y mariscos', 'Restaurante isleño de ambiente familiar, con pescados y preparaciones tradicionales de mariscos.', 'Pregunta por la pesca y los platos disponibles del día.', 12.5425, -81.701, 4.6, false, 18),
  ('bohios', 'Restaurante Los Bohíos', 'gastronomia', 'Gastronomía raizal', '🍽️', 'San Andrés', '1 hora', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80', 'Comida isleña informal', 'Opción informal asociada a comida isleña y preparaciones de mariscos.', 'Confirma ubicación exacta, horario y menú antes de desplazarte.', null, null, null, false, 19),
  ('fisherman', 'Pescadero Fisherman Place', 'gastronomia', 'Gastronomía raizal', '🐠', 'Centro / muelle', '1 hora', 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?auto=format&fit=crop&w=1000&q=80', 'Pescado fresco del día', 'Comedor sencillo mencionado por su pescado, ceviches, fish balls y arroz con coco.', 'Consulta la disponibilidad de pescado fresco y los precios del día.', 12.5852, -81.6975, 4.6, false, 20),
  ('disertando', 'Disertando Place', 'gastronomia', 'Gastronomía raizal', '🦀', 'El Cove', '1 hora', 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1000&q=80', 'Mariscos en El Cove', 'Lugar de cocina casera y mariscos, en el sector de pescadores de El Cove.', 'Verifica días de atención y reserva o confirma disponibilidad antes de salir.', 12.5345, -81.728, 4.5, false, 21)
on conflict (id) do nothing;

insert into public.itineraries (id, title, subtitle, badge, badge_icon, color, duration, description, image_url, rating, sort_order) values
  ('esencial', 'Esencial San Andrés', 'Una primera mirada a la isla', 'Más Popular', '⭐', 'blue', '1 día', 'Combina el cayo más famoso, la playa del centro, la cultura raizal de La Loma y el snorkel de West View.', 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1000&q=80', 4.9, 1),
  ('snorkel', 'Snorkel y Naturaleza', 'Cayos, arrecifes y manglares', 'Aventura Total', '🏊', 'violet', '1 día', 'Agrupa los mejores puntos para ver vida marina y naturaleza. La operación en lancha depende del estado del mar.', 'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1000&q=80', 4.8, 2),
  ('familia', 'Plan Familiar Perfecto', 'Aguas tranquilas y buena comida', 'En Familia', '👨‍👩‍👧', 'green', '1 día', 'Playas de aguas calmadas, un paseo al Acuario y cocina casera raizal para todos.', 'https://images.unsplash.com/photo-1535262412227-85541e910204?auto=format&fit=crop&w=1000&q=80', 4.8, 3),
  ('cultura', 'Raíces e Historia Raizal', 'La identidad de la isla', 'Cultural', '🪘', 'orange', 'Medio día', 'Un paseo por la memoria, la arquitectura, la tradición y las leyendas locales.', 'https://images.unsplash.com/photo-1438032005730-c779502df39b?auto=format&fit=crop&w=1000&q=80', 4.7, 4),
  ('sabores', 'Sabores Raizales', 'Cocina isleña de verdad', 'Gastronomía', '🍲', 'pink', 'Medio día', 'Descubre preparaciones caseras y cocina local. Ajusta las paradas según horarios reales.', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80', 4.8, 5),
  ('vuelta', 'Vuelta a la Isla', 'La circunvalar a tu ritmo', 'En Carretera', '🛺', 'teal', '1 día', 'Ruta terrestre con paradas naturales y culturales. Se recomienda salir temprano.', 'https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?auto=format&fit=crop&w=1000&q=80', 4.7, 6)
on conflict (id) do nothing;

insert into public.itinerary_stops (itinerary_id, position, place_id) values
  ('esencial', 1, 'spratt'),
  ('esencial', 2, 'johnny'),
  ('esencial', 3, 'loma'),
  ('esencial', 4, 'sanluis'),
  ('esencial', 5, 'westview'),
  ('snorkel', 1, 'acuario'),
  ('snorkel', 2, 'haynes'),
  ('snorkel', 3, 'westview'),
  ('snorkel', 4, 'hoyo'),
  ('snorkel', 5, 'oldpoint'),
  ('snorkel', 6, 'bigpond'),
  ('familia', 1, 'spratt'),
  ('familia', 2, 'acuario'),
  ('familia', 3, 'rocky'),
  ('familia', 4, 'sanluis'),
  ('familia', 5, 'fairtables'),
  ('cultura', 1, 'loma'),
  ('cultura', 2, 'church'),
  ('cultura', 3, 'casamuseo'),
  ('cultura', 4, 'morgan'),
  ('sabores', 1, 'fairtables'),
  ('sabores', 2, 'misslydia'),
  ('sabores', 3, 'missjanice'),
  ('sabores', 4, 'fisherman'),
  ('vuelta', 1, 'oldpoint'),
  ('vuelta', 2, 'bigpond'),
  ('vuelta', 3, 'loma'),
  ('vuelta', 4, 'sanluis'),
  ('vuelta', 5, 'rocky'),
  ('vuelta', 6, 'westview'),
  ('vuelta', 7, 'hoyo')
on conflict do nothing;

insert into public.businesses (id, name, category_id, category, tagline, description, level, priority, active, image_url, gallery, address, lat, lng, rating, reviews_count, cta_label) values
  ('6f1c2a10-0001-4a5b-9c01-000000000001', 'Scuba San Andrés', 'mar', 'Tours de Buceo y Snorkel', 'Tours de Buceo y Snorkel con los mejores guías', 'Vive una experiencia única explorando los arrecifes de San Andrés con nuestros guías expertos.', 'Prioritario', 10, true, 'https://images.unsplash.com/photo-1544551763-8dd44758c2dd?auto=format&fit=crop&w=1000&q=80', array['https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1544551763-92ab472cad5d?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1583212292454-1fe6229603b7?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1000&q=80']::text[], 'San Andrés Islas', 12.5835, -81.7005, 4.9, 1250, 'Reservar Tour'),
  ('6f1c2a10-0002-4a5b-9c01-000000000002', 'Restaurante El Isleño', 'gastronomia', 'Restaurante caribeño', 'Sabor caribeño en el corazón de la isla', 'Cocina isleña con pescado fresco, mariscos y recetas tradicionales del Caribe.', 'Prioritario', 20, true, 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80', array['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1000&q=80']::text[], 'Centro, San Andrés', 12.582, -81.701, 4.8, 860, 'Reservar Mesa'),
  ('6f1c2a10-0003-4a5b-9c01-000000000003', 'Souvenirs Coral', 'compras', 'Compras y artesanías', 'Llévate un recuerdo hecho en la isla', 'Artesanías locales, productos de coco y recuerdos elaborados por emprendedores isleños.', 'Normal', 30, true, 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80', array['https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1000&q=80']::text[], 'Centro, San Andrés', 12.5838, -81.7022, 4.6, 320, 'Contactar'),
  ('6f1c2a10-0004-4a5b-9c01-000000000004', 'Tours Siete Colores', 'tours', 'Paseos en lancha', 'Recorre los cayos del mar de los siete colores', 'Paseos en lancha a Johnny Cay, El Acuario y Haynes Cay con operadores autorizados.', 'Normal', 40, true, 'https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1000&q=80', array['https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1506929562872-bb421503ef21?auto=format&fit=crop&w=1000&q=80', 'https://images.unsplash.com/photo-1505881502353-a1986add3762?auto=format&fit=crop&w=1000&q=80']::text[], 'Muelle, San Andrés', 12.5843, -81.6968, 4.7, 410, 'Reservar Tour')
on conflict (id) do nothing;

insert into public.app_settings (key, value) values
  ('priority_enabled', 'true'::jsonb)
on conflict (key) do nothing;

-- =====================================================================
--  10. CREAR TU USUARIO ADMINISTRADOR
--  a) Supabase → Authentication → Users → "Add user" → crea tu correo y contraseña
--     (marca "Auto Confirm User").
--  b) Ejecuta esta línea cambiando el correo:
--
--     insert into public.admins (user_id)
--     select id from auth.users where email = 'tu-correo@ejemplo.com'
--     on conflict do nothing;
--
--  c) En la app: menú ☰ → "Acceso administrador" (o abre #/admin).
-- =====================================================================
