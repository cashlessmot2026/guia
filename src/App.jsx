import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { WifiOff } from 'lucide-react';
import { AppContext } from './context.js';
import { useRoute, go } from './lib/router.js';
import { readStore, saveStore, useLocalState } from './lib/store.js';
import { checkIsAdmin, fallbackCatalog, fetchCatalog, subscribeCatalog } from './lib/api.js';
import { supabase } from './lib/supabase.js';
import { buildAgentReply, WELCOME } from './lib/agent.js';
import { BottomNav } from './components/ui.jsx';
import { ChatAgent, Drawer, InstallHelp, Notifications } from './components/Overlays.jsx';
import Splash from './screens/Splash.jsx';
import Home from './screens/Home.jsx';
import { CustomBuilder, ItineraryDetail, Itineraries } from './screens/Itineraries.jsx';
import { BusinessDetail, Businesses } from './screens/Businesses.jsx';
import { Explore, Favorites, PlaceDetail, Reservations } from './screens/Explore.jsx';
import Trip from './screens/Trip.jsx';

const loadMap = () => import('./screens/RouteMap.jsx');
const loadAdmin = () => import('./screens/Admin.jsx');
const RouteMap = lazy(loadMap);
const Admin = lazy(loadAdmin);

const NAV_SCREENS = { inicio: 'inicio', itinerarios: 'itinerarios', viaje: 'viaje', explorar: 'inicio', negocios: 'inicio', favoritos: 'viaje', reservas: 'viaje' };
const EMPTY_TRIP = { stops: [] };

function showSplashInitially() {
  try { return !sessionStorage.getItem('sax-splash') && !window.location.hash.replace(/^#\/?/, ''); } catch { return true; }
}

export default function App() {
  const route = useRoute();
  const [catalog, setCatalog] = useState(() => readStore('sax-catalog', null) || fallbackCatalog());
  const [dbStatus, setDbStatus] = useState('cargando');
  const [online, setOnline] = useState(() => navigator.onLine);
  const [splash, setSplash] = useState(showSplashInitially);
  const [trip, setTrip] = useLocalState('sax-trip', EMPTY_TRIP);
  const [favorites, setFavorites] = useLocalState('sax-favorites', []);
  const [reservations, setReservations] = useLocalState('sax-reservations', []);
  const [profile, setProfile] = useLocalState('sax-profile', { name: 'Viajero' });
  const [offlineReady, setOfflineReady] = useLocalState('sax-offline', null);
  const [seenNotifs, setSeenNotifs] = useLocalState('sax-notifs-seen', '');
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([{ from: 'bot', text: WELCOME }]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [installHelp, setInstallHelp] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);
  const [toast, setToast] = useState('');
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userPos, setUserPos] = useState(null);

  const reload = useCallback(async () => {
    try {
      const data = await fetchCatalog();
      setCatalog(data);
      saveStore('sax-catalog', data);
      setDbStatus('ok');
    } catch (error) {
      console.warn('[Supabase] usando datos locales:', error?.message || error);
      setDbStatus('local');
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  useEffect(() => (dbStatus === 'ok' ? subscribeCatalog(reload) : undefined), [dbStatus, reload]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    let alive = true;
    if (!session) { setIsAdmin(false); return undefined; }
    checkIsAdmin().then((value) => { if (alive) { setIsAdmin(value); if (value) reload(); } });
    return () => { alive = false; };
  }, [session, reload]);

  useEffect(() => {
    const on = () => { setOnline(true); reload(); };
    const off = () => setOnline(false);
    const prompt = (event) => { event.preventDefault(); setInstallPrompt(event); };
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    window.addEventListener('beforeinstallprompt', prompt);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); window.removeEventListener('beforeinstallprompt', prompt); };
  }, [reload]);

  // Ubicación aproximada solo si el usuario ya concedió el permiso (sin preguntar al abrir).
  useEffect(() => {
    navigator.permissions?.query({ name: 'geolocation' }).then((status) => {
      if (status.state === 'granted') navigator.geolocation.getCurrentPosition((pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }), () => {});
    }).catch(() => {});
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    setChatOpen(false);
    setDrawerOpen(false);
    setNotifOpen(false);
  }, [route.key]);

  // Precarga el mapa en segundo plano para que también quede disponible sin conexión.
  useEffect(() => {
    const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 2500));
    idle(() => { loadMap().catch(() => {}); });
  }, []);

  const notify = useCallback((text) => {
    setToast(text);
    window.clearTimeout(notify.timer);
    notify.timer = window.setTimeout(() => setToast(''), 2800);
  }, []);

  const placesById = useMemo(() => Object.fromEntries(catalog.places.map((p) => [p.id, p])), [catalog.places]);
  const publicBusinesses = useMemo(() => catalog.businesses.filter((b) => b.active).sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100)), [catalog.businesses]);

  const startItinerary = (it) => {
    setTrip({ itineraryId: it.id, title: it.title, duration: it.duration, image: it.image, rating: it.rating, stops: it.stops.filter((id) => placesById[id]).map((id) => ({ id, done: false })), started: false });
    notify('Itinerario agregado a Mi Ruta');
    go('mapa');
  };
  const startCustom = (title, ids) => {
    setTrip({ itineraryId: null, title, duration: 'A tu ritmo', image: placesById[ids[0]]?.image, rating: null, stops: ids.map((id) => ({ id, done: false })), started: false });
    notify('Tu ruta personalizada está lista');
    go('mapa');
  };
  const addStop = (id) => {
    if (trip.stops.some((s) => s.id === id)) { notify('Ya está en tu ruta'); return; }
    setTrip((t) => ({ ...t, title: t.title || 'Mi ruta personalizada', duration: t.duration || 'A tu ritmo', image: t.image || placesById[id]?.image, stops: [...(t.stops || []), { id, done: false }] }));
    notify(`${placesById[id]?.name || 'Lugar'} agregado a tu ruta`);
  };
  const completeStop = (id) => {
    setTrip((t) => {
      const stops = t.stops.map((s) => (s.id === id ? { ...s, done: true } : s));
      const next = stops.find((s) => !s.done);
      const nextPlace = next && placesById[next.id];
      const message = next
        ? `¡Parada cumplida: ${placesById[id]?.name}! Bebe agua, busca sombra y reaplica protector solar. Tu siguiente destino es ${nextPlace?.name}. ${nextPlace?.tip || ''}`
        : '';
      return { ...t, stops, message, started: !!next, finishedAt: next ? null : new Date().toISOString() };
    });
  };
  const toggleFavorite = (key) => {
    setFavorites((list) => (list.includes(key) ? list.filter((k) => k !== key) : [key, ...list]));
    notify(favorites.includes(key) ? 'Quitado de favoritos' : 'Guardado en favoritos');
  };
  const addReservation = (record) => setReservations((list) => [record, ...list].slice(0, 100));
  const sendChat = (text) => {
    const reply = buildAgentReply(text, { places: catalog.places, businesses: catalog.businesses, trip });
    setChatHistory((h) => [...h, { from: 'user', text }, { from: 'bot', text: reply }].slice(-40));
  };
  const openChat = (question) => { setChatOpen(true); if (question) sendChat(question); };
  const install = async () => {
    if (!installPrompt) { setInstallHelp(true); return; }
    installPrompt.prompt();
    await installPrompt.userChoice.catch(() => {});
    setInstallPrompt(null);
  };

  const notifications = useMemo(() => {
    const items = [];
    const next = trip.stops?.find((s) => !s.done);
    if (trip.started && next) items.push({ id: `trip-${next.id}`, icon: '🧭', title: 'Recorrido en curso', text: `Tu siguiente parada es ${placesById[next.id]?.name}.`, path: 'mapa' });
    if (catalog.settings.priority_enabled) publicBusinesses.filter((b) => b.level === 'Premium' || b.level === 'Prioritario').slice(0, 3)
      .forEach((b) => items.push({ id: `biz-${b.id}`, icon: '🔥', title: b.name, text: b.tagline, path: `negocio/${b.id}` }));
    items.push({ id: 'tip-sun', icon: '🌞', title: 'Consejo de tu guía', text: 'Lleva agua, gorra y protector solar. Haz pausas a la sombra.', path: null });
    return items;
  }, [trip, placesById, publicBusinesses, catalog.settings.priority_enabled]);
  const notifSignature = notifications.map((n) => n.id).join('|');

  const ctx = {
    catalog, placesById, publicBusinesses, dbStatus, online, reload, notify,
    trip, setTrip, startItinerary, startCustom, addStop, completeStop,
    favorites, toggleFavorite, isFavorite: (key) => favorites.includes(key),
    reservations, addReservation, profile, setProfile, offlineReady, setOfflineReady, userPos,
    openChat, openDrawer: () => setDrawerOpen(true),
    openNotifications: () => { setNotifOpen(true); setSeenNotifs(notifSignature); },
    hasNotifications: seenNotifs !== notifSignature, install, session, isAdmin,
  };

  const startApp = () => {
    try { sessionStorage.setItem('sax-splash', '1'); } catch { /* sin almacenamiento */ }
    setSplash(false);
  };

  let screen;
  switch (route.name) {
    case 'itinerarios': screen = <Itineraries />; break;
    case 'itinerario': screen = <ItineraryDetail id={route.param} />; break;
    case 'crear': screen = <CustomBuilder key={route.key} fromId={route.query.get('from')} />; break;
    case 'mapa': screen = <RouteMap />; break;
    case 'viaje': screen = <Trip />; break;
    case 'negocios': screen = <Businesses />; break;
    case 'negocio': screen = <BusinessDetail key={route.param} id={route.param} />; break;
    case 'lugar': screen = <PlaceDetail id={route.param} />; break;
    case 'explorar': screen = <Explore query={route.query} />; break;
    case 'favoritos': screen = <Favorites />; break;
    case 'reservas': screen = <Reservations />; break;
    case 'admin': screen = <Admin />; break;
    default: screen = <Home />;
  }
  const navTab = NAV_SCREENS[route.name];

  return (
    <AppContext.Provider value={ctx}>
      <div className="app-frame">
        <div className={`app ${navTab ? 'has-nav' : ''}`}>
          {splash ? <Splash onStart={startApp} /> : <>
            {!online && <div className="offline-bar"><WifiOff size={15} /> Sin conexión · mostrando datos guardados</div>}
            <main key={route.name + (route.param || '')} className="screen-anim"><Suspense fallback={<div className="screen-loading"><span /></div>}>{screen}</Suspense></main>
            {navTab && <BottomNav active={navTab} />}
          </>}
          <ChatAgent open={chatOpen} history={chatHistory} onSend={sendChat} onClose={() => setChatOpen(false)} />
          <Drawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <Notifications open={notifOpen} onClose={() => setNotifOpen(false)} items={notifications} />
          <InstallHelp open={installHelp} onClose={() => setInstallHelp(false)} />
          {toast && <div className="toast" role="status">{toast}</div>}
        </div>
      </div>
    </AppContext.Provider>
  );
}
