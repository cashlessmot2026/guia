import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Clock, Heart, Lightbulb, MapPin, Navigation, Plus, Search, Share2 } from 'lucide-react';
import { useApp } from '../context.js';
import { back, go } from '../lib/router.js';
import { directionsUrl, sized } from '../lib/geo.js';
import { EmptyState, PageHeader, Rating } from '../components/ui.jsx';

const normalize = (text) => String(text || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export function Explore({ query }) {
  const { catalog, publicBusinesses } = useApp();
  const [q, setQ] = useState(query.get('q') || '');
  const [cat, setCat] = useState(query.get('cat') || 'todo');
  const inputRef = useRef(null);
  useEffect(() => { setQ(query.get('q') || ''); setCat(query.get('cat') || 'todo'); }, [query.toString()]);

  const term = normalize(q.trim());
  const match = (text) => !term || normalize(text).includes(term);
  const places = catalog.places.filter((p) => (cat === 'todo' || p.categoryId === cat) && match(`${p.name} ${p.tagline} ${p.description} ${p.area} ${p.group}`));
  const businesses = publicBusinesses.filter((b) => (cat === 'todo' || b.categoryId === cat) && match(`${b.name} ${b.category} ${b.tagline} ${b.description}`));
  const current = catalog.categories.find((c) => c.id === cat);

  return (
    <div className="screen">
      <PageHeader title={current ? current.name : 'Explorar'} />
      <div className="pad">
        <label className="search-pill on-light">
          <Search size={20} />
          <input ref={inputRef} value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar lugares, actividades..." aria-label="Buscar" />
        </label>
      </div>
      <div className="pills">
        <button className={cat === 'todo' ? 'selected' : ''} onClick={() => setCat('todo')}>Todo</button>
        {catalog.categories.map((c) => <button key={c.id} className={cat === c.id ? 'selected' : ''} onClick={() => setCat(c.id)}>{c.emoji} {c.name}</button>)}
      </div>

      {businesses.length > 0 && <>
        <h3 className="block-title pad-x">Negocios aliados</h3>
        <div className="row-list">{businesses.map((b) => (
          <button key={b.id} className="row-card" onClick={() => go(`negocio/${b.id}`)}>
            <img src={sized(b.image, 240)} alt="" loading="lazy" />
            <div><b>{b.name}</b><small>{b.category}</small><Rating value={b.rating} /></div>
          </button>
        ))}</div>
      </>}

      {places.length > 0 && <h3 className="block-title pad-x">Lugares</h3>}
      <div className="row-list">{places.map((p) => <PlaceRow key={p.id} place={p} />)}</div>
      {!places.length && !businesses.length && <EmptyState emoji="🔎" title="Sin resultados" text="Prueba con otra palabra o categoría." />}
    </div>
  );
}

function PlaceRow({ place }) {
  const { addStop } = useApp();
  return (
    <div className="row-card">
      <button className="row-main" onClick={() => go(`lugar/${place.id}`)}>
        <img src={sized(place.image, 240)} alt="" loading="lazy" />
        <div><b>{place.name}</b><small>{place.emoji} {place.group} · {place.area}</small><Rating value={place.rating} /></div>
      </button>
      <button className="btn-round soft" onClick={() => addStop(place.id)} aria-label={`Agregar ${place.name} a mi ruta`}><Plus size={20} /></button>
    </div>
  );
}

export function PlaceDetail({ id }) {
  const { placesById, publicBusinesses, isFavorite, toggleFavorite, addStop, notify } = useApp();
  const place = placesById[id];
  if (!place) return <div className="screen"><PageHeader title="Lugar" /><EmptyState emoji="📍" title="Lugar no encontrado" text="Puede que ya no esté disponible." action="Explorar" onAction={() => go('explorar')} /></div>;
  const fav = isFavorite(`p:${place.id}`);
  const related = publicBusinesses.filter((b) => b.categoryId === place.categoryId).slice(0, 3);
  const share = async () => {
    const data = { title: place.name, text: `${place.name} — ${place.tagline || 'San Andrés'}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(data.url); notify('Enlace copiado'); }
    } catch { /* cancelado */ }
  };
  return (
    <div className="screen detail with-cta">
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.2), rgba(0,0,0,0) 30%, rgba(0,20,60,.45)), url(${sized(place.image, 1000)})` }}>
        <div className="gallery-overlay">
          <button className="icon-btn glass" onClick={() => back('explorar')} aria-label="Volver"><ArrowLeft size={22} /></button>
          <button className={`icon-btn glass ${fav ? 'is-fav' : ''}`} onClick={() => toggleFavorite(`p:${place.id}`)} aria-label="Favorito"><Heart size={22} fill={fav ? '#ff3b5c' : 'none'} /></button>
        </div>
        <span className="badge badge-white hero-badge">{place.emoji} {place.group}</span>
      </div>
      <div className="detail-body">
        <h1 className="detail-title">{place.name}</h1>
        <p className="detail-sub">{place.tagline}</p>
        <div className="meta-row"><Rating value={place.rating} /><span><MapPin size={16} /> {place.area}</span><span><Clock size={16} /> {place.duration}</span></div>
        <div className="action-row three">
          <a className="action" href={directionsUrl(place)} target="_blank" rel="noopener noreferrer"><span className="action-icon blue"><Navigation size={24} /></span>Cómo llegar</a>
          <button className="action" onClick={() => addStop(place.id)}><span className="action-icon blue"><Plus size={24} /></span>A mi ruta</button>
          <button className="action" onClick={share}><span className="action-icon blue"><Share2 size={24} /></span>Compartir</button>
        </div>
        <h3 className="block-title">Descripción</h3>
        <p className="detail-text">{place.description}</p>
        <div className="tip-card"><Lightbulb size={22} /><div><b>Consejo de tu guía</b><p>{place.tip}</p></div></div>
        {related.length > 0 && <>
          <h3 className="block-title">Aliados recomendados</h3>
          <div className="row-list flush">{related.map((b) => (
            <button key={b.id} className="row-card" onClick={() => go(`negocio/${b.id}`)}>
              <img src={sized(b.image, 240)} alt="" loading="lazy" />
              <div><b>{b.name}</b><small>{b.tagline}</small></div>
            </button>
          ))}</div>
        </>}
      </div>
      <div className="cta-bar"><button className="btn btn-primary full big" onClick={() => addStop(place.id)}><Plus size={20} /> Agregar a mi ruta</button></div>
    </div>
  );
}

export function Favorites() {
  const { favorites, placesById, catalog, toggleFavorite } = useApp();
  const items = favorites.map((key) => {
    const [type, id] = [key.slice(0, 1), key.slice(2)];
    const item = type === 'p' ? placesById[id] : catalog.businesses.find((b) => b.id === id && b.active);
    return item ? { key, type, item } : null;
  }).filter(Boolean);
  return (
    <div className="screen">
      <PageHeader title="Mis Favoritos" />
      {!items.length && <EmptyState emoji="❤️" title="Aún no tienes favoritos" text="Toca el corazón en un lugar o negocio para guardarlo aquí." action="Explorar" onAction={() => go('explorar')} />}
      <div className="row-list">{items.map(({ key, type, item }) => (
        <div key={key} className="row-card">
          <button className="row-main" onClick={() => go(`${type === 'p' ? 'lugar' : 'negocio'}/${item.id}`)}>
            <img src={sized(item.image, 240)} alt="" loading="lazy" />
            <div><b>{item.name}</b><small>{item.tagline || item.area}</small><Rating value={item.rating} /></div>
          </button>
          <button className="btn-round soft fav" onClick={() => toggleFavorite(key)} aria-label="Quitar de favoritos"><Heart size={19} fill="#ff3b5c" stroke="#ff3b5c" /></button>
        </div>
      ))}</div>
    </div>
  );
}

export function Reservations() {
  const { reservations } = useApp();
  return (
    <div className="screen">
      <PageHeader title="Mis Reservas" />
      {!reservations.length && <EmptyState emoji="📅" title="Sin reservas todavía" text="Reserva tours, mesas y experiencias con nuestros aliados." action="Ver aliados" onAction={() => go('negocios')} />}
      <div className="row-list">{reservations.map((r) => (
        <button key={r.id} className="row-card reservation" onClick={() => go(`negocio/${r.businessId}`)}>
          <span className="res-date"><b>{r.date?.slice(8, 10)}</b><small>{r.date ? new Date(`${r.date}T12:00:00`).toLocaleDateString('es-CO', { month: 'short' }) : ''}</small></span>
          <div><b>{r.businessName}</b><small>{r.people} persona(s) · {r.name}</small><em className={`status ${r.status === 'Enviada' ? 'ok' : 'warn'}`}>{r.status}</em></div>
        </button>
      ))}</div>
    </div>
  );
}
