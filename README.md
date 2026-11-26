# San Andrés Explorer — PWA React

Aplicación web progresiva (PWA) responsive para iPhone, Android, tablets y computadores. Incluye guía turística local basada en reglas y conocimiento integrado; no utiliza APIs externas de inteligencia artificial.

## Requisitos
- Node.js 18 o superior.
- npm.

## Ejecutar en desarrollo
```bash
npm install
npm run dev
```
Abre la dirección local que muestra Vite. Para probar la instalación PWA en el teléfono, el equipo debe estar en la misma red o puedes desplegar el proyecto en un hosting HTTPS.

## Generar versión de producción
```bash
npm run build
npm run preview
```
El resultado de producción queda en `dist/`.

## Instalar en cada dispositivo
- **iPhone:** abre la URL publicada en Safari, toca Compartir y selecciona “Añadir a pantalla de inicio”. iOS no usa el mismo aviso automático de instalación que Android.
- **Android:** abre la URL en Chrome y selecciona “Instalar aplicación” o “Añadir a pantalla principal”.
- **PC:** abre la URL en Chrome o Edge y usa el icono de instalación de la barra de direcciones o el menú del navegador.

La instalación PWA requiere servir la aplicación por HTTPS (excepto localhost). El service worker almacena la estructura básica de la aplicación para ayudar a abrirla sin conexión después de una primera visita. Las fotografías de las tarjetas se cargan desde Unsplash y requieren conexión para descargarse; la navegación real abre Google Maps.

## Funciones incluidas
- Inicio responsive con buscador, categorías, itinerarios y banners en carrusel.
- Itinerarios prediseñados: esencial, historia raizal, aventura marina, vuelta a la isla y gastronomía.
- Constructor de rutas personalizadas.
- Seguimiento de paradas con botón “Cumplido”, porcentaje de avance y guía contextual.
- Consejos de hidratación, sombra, protección solar y seguridad durante las paradas.
- Mapa esquemático de las paradas; botones que abren búsqueda o recorrido en Google Maps.
- Agente turístico local con respuestas basadas en conocimientos y reglas integrados en `src/App.jsx`.
- Panel administrador para agregar negocios, activar/desactivar banners y asignar prioridades Premium, Prioritario, Normal y Básico.
- Datos de ruta y negocios guardados en el dispositivo mediante `localStorage`.

## Alcance del agente sin API
El agente de esta versión es un asistente determinístico local: identifica temas y responde con la base turística y reglas incluidas en el código. No es un modelo generativo, no aprende automáticamente de conversaciones y no consulta clima, horarios, precios, disponibilidad ni cierres en tiempo real. Para mantener la información confiable, la aplicación pide confirmar horarios, acceso y condiciones del mar con operadores o sitios locales.

## Personalización
- Lugares, descripciones, itinerarios y respuestas del agente: `src/App.jsx`.
- Diseño responsive, animaciones y colores: `src/styles.css`.
- Configuración de instalación PWA: `public/manifest.webmanifest` y `public/sw.js`.
