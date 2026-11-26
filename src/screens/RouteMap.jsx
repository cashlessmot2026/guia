import { useEffect, useRef, useState } from 'react';
import { Check, ChevronDown, ChevronUp, Clock, ExternalLink, MapPin, Navigation, RotateCcw, Send, Trophy } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { directionsUrl, distanceKm, formatKm, routeUrl, sized } from '../lib/geo.js';
import MapView from '../components/MapView.jsx';
import { PageHeader, Rating } from '../components/ui.jsx';
import { Robot } from '../components/Brand.jsx';

export default function RouteMap() {
  const { catalog, placesById, trip, setTrip, completeStop, notify } = useApp();
  const [userPos, setUserPos] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const watchRef = useRef(null);

  useEffect(() => () => { if (watchRef.current != null) navigator.geolocation?.clearWatch(watchRef.current); }, []);

  const stops = trip.stops.map((s, index) => ({ ...placesById[s.id], done: s.done, number: index + 1 })).filter((p) => p.id);
  const hasTrip = stops.length > 0;
  const next = stops.find((s) => !s.done);
  const doneCount = stops.filter((s) => s.done).length;
  const finished = hasTrip && !next;
  const itinerary = catalog.itineraries.find((it) => it.id === trip.itineraryId);
  const points = hasTrip ? stops : catalog.places.map((p) => ({ ...p, number: null }));
  const activeId = selectedId || (trip.started ? next?.id : stops[1]?.id || stops[0]?.id);
  const nextDistance = userPos && next ? formatKm(distanceKm(userPos, next)) : null;

  const locate = () => {
    if (!navigator.geolocation) { notify('Tu dispositivo no permite la ubicación'); return; }
    if (watchRef.current != null) navigator.geolocation.clearWatch(watchRef.current);
    watchRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => notify('No pudimos obtener tu ubicación. Revisa los permisos.'),
      { enableHighAccuracy: true, maximumAge: 15000, timeout: 20000 },
    );
  };

  const start = () => {
    setTrip((t) => ({ ...t, started: true, startedAt: t.startedAt || new Date().toISOString() }));
    setSelectedId(null);
    locate();
  };

  return (
    <div className="screen map-screen">
      <MapView points={points} activeId={activeId} userPos={userPos} showRoute={hasTrip} onSelect={(p) => (hasTrip ? setSelectedId(p.id) : go(`lugar/${p.id}`))} padTop={hasTrip ? 170 : 80} padBottom={trip.started ? 320 : 240} />
      <PageHeader title="Mi Ruta" transparent />

      {hasTrip && (
        <div className="route-card">
          <img src={sized(trip.image || stops[0]?.image, 240)} alt="" />
          <div>
            <b>{trip.title}</b>
            <small><Clock size={14} /> {trip.duration || 'A tu ritmo'} · <MapPin size={14} /> {stops.length} paradas</small>
            <Rating value={trip.rating ?? itinerary?.rating} />
          </div>
          <button className="btn btn-primary btn-sm" onClick={() => (itinerary ? go(`itinerario/${itinerary.id}`) : setExpanded(true))}>Ver detalles</button>
        </div>
      )}

      <button className="locate-btn" onClick={locate} aria-label="Mi ubicación"><Navigation size={22} fill="currentColor" /></button>

      <div className={`route-sheet ${expanded ? 'is-expanded' : ''}`}>
        {!hasTrip && <>
          <b className="rs-title">Aún no tienes una ruta</b>
          <p className="rs-sub">Elige un itinerario o crea el tuyo. Toca un pin para ver el lugar.</p>
          <button className="btn btn-primary full" onClick={() => go('itinerarios')}><Send size={19} /> Ver itinerarios</button>
        </>}

        {hasTrip && !trip.started && !finished && <>
          <b className="rs-title">Tu ruta está lista</b>
          <p className="rs-sub">¡Ahora solo sigue el mapa y disfruta!</p>
          <button className="btn btn-primary full big" onClick={start}><Send size={21} fill="#ffd23f" stroke="#ffd23f" /> Iniciar Recorrido</button>
        </>}

        {hasTrip && trip.started && next && <>
          <div className="rs-progress-head">
            <span>Parada {doneCount + 1} de {stops.length}</span>
            <span>{Math.round((doneCount / stops.length) * 100)}%</span>
          </div>
          <div className="progress"><i style={{ width: `${(doneCount / stops.length) * 100}%` }} /></div>
          <div className="next-stop">
            <img src={sized(next.image, 200)} alt="" />
            <div><small>SIGUIENTE PARADA{nextDistance ? ` · a ${nextDistance}` : ''}</small><b>{next.name}</b><span>{next.area} · {next.duration}</span></div>
          </div>
          {trip.message && <div className="guide-tip"><Robot className="tip-robot" /><p>{trip.message}</p></div>}
          <div className="rs-actions">
            <a className="btn btn-light" href={directionsUrl(next)} target="_blank" rel="noopener noreferrer"><Navigation size={18} /> Cómo llegar</a>
            <button className="btn btn-primary" onClick={() => { completeStop(next.id); setSelectedId(null); }}><Check size={19} /> Cumplido</button>
          </div>
        </>}

        {finished && <>
          <div className="finish"><Trophy size={34} color="#f5b400" /><div><b className="rs-title">¡Recorrido completado!</b><p className="rs-sub">Conociste {stops.length} lugares de San Andrés. Descansa e hidrátate. 🌴</p></div></div>
          <button className="btn btn-primary full" onClick={() => { setTrip({ stops: [] }); go('itinerarios'); }}><RotateCcw size={18} /> Crear otra ruta</button>
        </>}

        {hasTrip && (
          <>
            <button className="rs-toggle" onClick={() => setExpanded(!expanded)}>{expanded ? <ChevronDown size={18} /> : <ChevronUp size={18} />} {expanded ? 'Ocultar paradas' : 'Ver todas las paradas'}</button>
            {expanded && (
              <div className="rs-list">
                {stops.map((s) => (
                  <div key={s.id} className={`rs-stop ${s.done ? 'is-done' : ''}`}>
                    <span className="tl-num">{s.done ? '✓' : s.number}</span>
                    <button onClick={() => setSelectedId(s.id)}><b>{s.name}</b><small>{s.area}</small></button>
                    <a href={directionsUrl(s)} target="_blank" rel="noopener noreferrer" aria-label={`Cómo llegar a ${s.name}`}><ExternalLink size={17} /></a>
                  </div>
                ))}
                <a className="btn btn-light full" href={routeUrl(stops)} target="_blank" rel="noopener noreferrer">Abrir ruta completa en Google Maps</a>
                <button className="btn btn-ghost full" onClick={() => { if (window.confirm('¿Quieres borrar tu ruta actual?')) setTrip({ stops: [] }); }}>Borrar ruta</button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
