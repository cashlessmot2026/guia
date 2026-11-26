import { useMemo, useState } from 'react';
import { Check, ChevronRight, Clock, MapPin, Plus, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { sized } from '../lib/geo.js';
import { EmptyState, PageHeader, Rating } from '../components/ui.jsx';

export function Itineraries() {
  const { catalog } = useApp();
  const [showFilters, setShowFilters] = useState(false);
  const [filter, setFilter] = useState('todos');
  const badges = useMemo(() => ['todos', ...new Set(catalog.itineraries.map((it) => it.badge))], [catalog.itineraries]);
  const list = filter === 'todos' ? catalog.itineraries : catalog.itineraries.filter((it) => it.badge === filter);

  return (
    <div className="screen with-fab">
      <PageHeader title="Itinerarios" right={<button className={`icon-btn ${showFilters ? 'is-on' : ''}`} onClick={() => setShowFilters(!showFilters)} aria-label="Filtrar"><SlidersHorizontal size={23} /></button>} />
      <p className="screen-lead">Planes creados para ti</p>
      {showFilters && <div className="pills">{badges.map((b) => <button key={b} className={filter === b ? 'selected' : ''} onClick={() => setFilter(b)}>{b === 'todos' ? 'Todos' : b}</button>)}</div>}
      <div className="itin-list">
        {list.map((it) => <ItineraryCard key={it.id} item={it} />)}
      </div>
      <button className="fab-pill" onClick={() => go('crear')}><Sparkles size={20} fill="#ffe27a" stroke="#ffe27a" /> Crear mi itinerario</button>
    </div>
  );
}

export function ItineraryCard({ item }) {
  return (
    <button className="itin-card" onClick={() => go(`itinerario/${item.id}`)} style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,22,62,.8)), url(${sized(item.image, 900)})` }}>
      <span className={`badge badge-${item.color}`}>{item.badgeIcon} {item.badge}</span>
      <span className="itin-copy">
        <b>{item.title}</b>
        <small><Clock size={15} strokeWidth={2.4} /> {item.duration} • {item.stops.length} paradas</small>
      </span>
      <span className="round-arrow"><ChevronRight size={22} strokeWidth={2.8} /></span>
    </button>
  );
}

export function ItineraryDetail({ id }) {
  const { catalog, placesById, startItinerary } = useApp();
  const item = catalog.itineraries.find((it) => it.id === id);
  if (!item) return <div className="screen"><PageHeader title="Itinerario" /><EmptyState emoji="🧭" title="Itinerario no encontrado" text="Puede que haya sido retirado." action="Ver itinerarios" onAction={() => go('itinerarios')} /></div>;
  const stops = item.stops.map((sid) => placesById[sid]).filter(Boolean);
  return (
    <div className="screen detail with-cta">
      <div className="detail-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,.25), rgba(0,0,0,0) 30%, rgba(0,20,60,.55)), url(${sized(item.image, 1000)})` }}>
        <PageHeader title="" transparent />
        <span className={`badge badge-${item.color} hero-badge`}>{item.badgeIcon} {item.badge}</span>
      </div>
      <div className="detail-body">
        <h1 className="detail-title">{item.title}</h1>
        <p className="detail-sub">{item.subtitle}</p>
        <div className="meta-row"><span><Clock size={16} /> {item.duration}</span><span><MapPin size={16} /> {stops.length} paradas</span><Rating value={item.rating} /></div>
        <p className="detail-text">{item.description}</p>
        <h3 className="block-title">Paradas del recorrido</h3>
        <ol className="timeline">
          {stops.map((p, index) => (
            <li key={p.id} onClick={() => go(`lugar/${p.id}`)}>
              <span className="tl-num">{index + 1}</span>
              <img src={sized(p.image, 200)} alt="" loading="lazy" />
              <div><b>{p.name}</b><small>{p.area} · {p.duration}</small></div>
              <ChevronRight size={18} className="muted-icon" />
            </li>
          ))}
        </ol>
        <button className="btn btn-light full" onClick={() => go(`crear?from=${item.id}`)}>Personalizar paradas</button>
      </div>
      <div className="cta-bar"><button className="btn btn-primary full" onClick={() => startItinerary(item)}>Elegir este itinerario <ChevronRight size={20} /></button></div>
    </div>
  );
}

export function CustomBuilder({ fromId }) {
  const { catalog, startCustom } = useApp();
  const preset = catalog.itineraries.find((it) => it.id === fromId);
  const [title, setTitle] = useState(preset ? `${preset.title} (personalizado)` : 'Mi ruta personalizada');
  const [selected, setSelected] = useState(preset ? preset.stops : []);
  const [cat, setCat] = useState('todo');
  const toggle = (id) => setSelected((list) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]));
  const places = cat === 'todo' ? catalog.places : catalog.places.filter((p) => p.categoryId === cat);
  const usedCats = catalog.categories.filter((c) => catalog.places.some((p) => p.categoryId === c.id));

  return (
    <div className="screen with-cta">
      <PageHeader title="Crear mi itinerario" />
      <div className="pad">
        <label className="field"><span>Nombre de tu ruta</span><input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={60} /></label>
        <p className="muted">Toca los lugares en el orden en que quieres visitarlos.</p>
      </div>
      <div className="pills">
        <button className={cat === 'todo' ? 'selected' : ''} onClick={() => setCat('todo')}>Todos</button>
        {usedCats.map((c) => <button key={c.id} className={cat === c.id ? 'selected' : ''} onClick={() => setCat(c.id)}>{c.emoji} {c.name}</button>)}
      </div>
      <div className="pick-list">
        {places.map((p) => {
          const order = selected.indexOf(p.id);
          return (
            <button key={p.id} className={`pick ${order >= 0 ? 'is-on' : ''}`} onClick={() => toggle(p.id)}>
              <img src={sized(p.image, 200)} alt="" loading="lazy" />
              <div><b>{p.name}</b><small>{p.group} · {p.area}</small></div>
              <span className="pick-mark">{order >= 0 ? order + 1 : <Plus size={18} />}</span>
            </button>
          );
        })}
      </div>
      <div className="cta-bar">
        <button className="btn btn-primary full" disabled={!selected.length} onClick={() => startCustom(title.trim() || 'Mi ruta personalizada', selected)}>
          <Check size={20} /> Crear ruta ({selected.length} {selected.length === 1 ? 'parada' : 'paradas'})
        </button>
      </div>
    </div>
  );
}
