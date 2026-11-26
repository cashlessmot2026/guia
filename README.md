# San Andrés Explorer — PWA

Guía turística instalable (PWA) para San Andrés Islas, hecha con React + Vite y conectada a Supabase.

**Publicada en:** https://cashlessmot2026.github.io/guia/

## Pantallas
Bienvenida · Inicio · Itinerarios · Mi Ruta (mapa satelital con recorrido parada por parada) · Negocios prioritarios · Detalle de negocio con reservas · Mi Viaje (favoritos, reservas, mapa offline, asistente) · Panel Admin.

## Configurar la base de datos (una sola vez)
1. Supabase → **SQL Editor** → pega todo `supabase/schema.sql` → **Run**.
2. **Authentication → Users → Add user**: crea tu correo y contraseña (marca *Auto Confirm User*).
3. En el SQL Editor ejecuta, con tu correo:
   ```sql
   insert into public.admins (user_id)
   select id from auth.users where email = 'tu-correo@ejemplo.com'
   on conflict do nothing;
   ```
4. En la app: menú ☰ → **Acceso administrador**.

Mientras la base de datos no esté configurada, la app funciona con los datos incluidos en `src/data/seed.js`.

## Desarrollo
```bash
npm install
npm run dev      # servidor local
npm run build    # versión de producción en dist/
```
Requiere Node.js 20.19 o superior.

## Publicación
Cada `git push` a `main` compila y publica automáticamente en GitHub Pages (`.github/workflows/deploy.yml`).
En *Settings → Pages* la fuente debe ser **GitHub Actions**. También funciona en Vercel o Netlify (detectan Vite solos).

## Dónde cambiar cosas
| Qué | Archivo |
| --- | --- |
| URL y llave de Supabase | `src/config.js` (o variables en `.env`, ver `.env.example`) |
| Datos de respaldo | `src/data/seed.js` |
| Respuestas del asistente | `src/lib/agent.js` |
| Estilos y colores | `src/styles.css` |
| Instalación / modo offline | `public/manifest.webmanifest`, `public/sw.js` |

La llave *publishable* de Supabase está pensada para ir en el navegador; la seguridad la dan las políticas RLS de `schema.sql` (los turistas solo leen y reservan; solo los administradores editan).
