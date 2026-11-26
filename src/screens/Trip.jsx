import { useState } from 'react';
import { ArrowRight, CalendarDays, Check, Clock, Download, Heart, MapPin, Pencil, Smartphone } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { sized } from '../lib/geo.js';
import { downloadOffline } from '../lib/offline.js';
import { Robot } from '../components/Brand.jsx';
import { PageHeader } from '../components/ui.jsx';

export default function Trip() {
  const { profile, setProfile, trip, placesById, catalog, openChat, notify, install, offlineReady, setOfflineReady } = useApp();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.name || '');
  const [progress, setProgress] = useState(null);
  const stops = trip.stops.map((s) => placesById[s.id]).filter(Boolean);
  const done = trip.stops.filter((s) => s.done).length;

  const saveName = (event) => {
    event.preventDefault();
    setProfile({ ...profile, name: name.trim() || 'Viajero' });
    setEditing(false);
  };

  const offline = async () => {
    if (progress != null) return;
    setProgress(0);
    try {
      const images = [...catalog.places.map((p) => p.image), ...catalog.itineraries.map((i) => i.image), ...catalog.businesses.flatMap((b) => [b.image, ...(b.gallery || [])])];
      await downloadOffline(images, setProgress);
      setOfflineReady(new Date().toISOString());
      notify('Mapa y fotos guardados para usar sin conexión');
    } catch (error) {
      notify(error.message || 'No se pudo descargar el mapa');
    } finally {
      setProgress(null);
    }
  };

  const initial = (profile.name || 'V').trim().charAt(0).toUpperCase();

  return (
    <div className="screen trip">
      <PageHeader title="Mi Viaje" />
      <div className="profile">
        <div className="avatar">{initial}</div>
        {editing ? (
          <form onSubmit={saveName} className="name-form">
            <input autoFocus value={name} onChange={(event) => setName(event.target.value)} maxLength={30} aria-label="Tu nombre" placeholder="Tu nombre" />
            <button className="btn-round" aria-label="Guardar nombre"><Check size={18} /></button>
          </form>
        ) : (
          <div>
            <h2>Hola, {profile.name || 'Viajero'} <button className="icon-btn tiny" onClick={() => setEditing(true)} aria-label="Editar nombre"><Pencil size={15} /></button></h2>
            <p>Tu aventura en San Andrés</p>
          </div>
        )}
      </div>

      <div className="current-route">
        <div>
          <b className="cr-label">Tu Ruta Actual</b>
          {stops.length ? <>
            <b className="cr-title">{trip.title}</b>
            <small><Clock size={14} /> {stops.length} paradas • {trip.duration || 'A tu ritmo'}{done ? ` · ${done} cumplidas` : ''}</small>
            <button className="btn btn-primary btn-sm" onClick={() => go('mapa')}>Ver mi ruta <ArrowRight size={16} /></button>
          </> : <>
            <b className="cr-title">Aún no tienes ruta</b>
            <small><MapPin size={14} /> Elige un plan para empezar</small>
            <button className="btn btn-primary btn-sm" onClick={() => go('itinerarios')}>Elegir itinerario <ArrowRight size={16} /></button>
          </>}
        </div>
        <img src={sized(trip.image || stops[0]?.image || catalog.itineraries[0]?.image, 400)} alt="" />
      </div>

      <div className="tile-grid">
        <button className="tile" onClick={() => go('favoritos')}><span className="tile-icon red"><Heart size={26} fill="#ff3b5c" stroke="#ff3b5c" /></span>Mis Favoritos</button>
        <button className="tile" onClick={() => go('reservas')}><span className="tile-icon blue"><CalendarDays size={26} /></span>Mis Reservas</button>
        <button className="tile" onClick={offline}>
          <span className="tile-icon teal"><Download size={26} /></span>
          {progress != null ? `Descargando ${progress}%` : 'Mapa Offline'}
          {offlineReady && progress == null && <small className="tile-note">Guardado ✓</small>}
        </button>
        <button className="tile" onClick={() => openChat()}><span className="tile-icon robot"><Robot className="tile-robot" /></span>Asistente IA</button>
      </div>

      <button className="help-banner" onClick={() => openChat()}>
        <div>
          <b>¿Necesitas ayuda?</b>
          <small>Pregunta a nuestro Agente Turístico</small>
          <span className="btn btn-yellow btn-sm">Chatear Ahora 💬</span>
        </div>
        <Robot className="help-robot" />
      </button>

      <button className="install-row" onClick={install}><Smartphone size={20} /> Instalar San Andrés Explorer en tu teléfono <ArrowRight size={16} /></button>
    </div>
  );
}
