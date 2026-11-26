import { useEffect, useState } from 'react';
import { ArrowRight, Bell, Clock, MapPin, Menu, Search } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { sized } from '../lib/geo.js';
import { Logo, Robot } from '../components/Brand.jsx';
import { Rating, SectionTitle } from '../components/ui.jsx';
import { IMG } from '../data/seed.js';

export default function Home() {
  const { catalog, publicBusinesses, profile, openDrawer, openNotifications, hasNotifications, openChat } = useApp();
  const [query, setQuery] = useState('');
  const featured = catalog.places.filter((p) => p.featured);
  const recommended = featured.length ? featured : catalog.places.slice(0, 5);
  const promos = catalog.settings.priority_enabled ? publicBusinesses.filter((b) => b.level === 'Premium' || b.level === 'Prioritario') : [];

  const search = (event) => {
    event.preventDefault();
    go(`explorar${query.trim() ? `?q=${encodeURIComponent(query.trim())}` : ''}`);
  };

  return (
    <div className="screen home">
      <section className="home-hero" style={{ backgroundImage: `linear-gradient(180deg, rgba(255,255,255,.92) 0%, rgba(255,255,255,.35) 22%, rgba(0,0,0,0) 40%, rgba(4,40,100,.35) 100%), url(${IMG.palmsBeach})` }}>
        <header className="home-top">
          <button className="icon-btn" onClick={openDrawer} aria-label="Abrir menú"><Menu size={27} strokeWidth={2.4} /></button>
          <Logo variant="header" />
          <button className="icon-btn" onClick={openNotifications} aria-label="Notificaciones"><Bell size={25} strokeWidth={2.3} fill="currentColor" />{hasNotifications && <i className="dot" />}</button>
        </header>
        <div className="home-hero-copy">
          <h1>¡Hola {profile.name || 'Viajero'}!</h1>
          <p>¿Qué te gustaría hacer hoy?</p>
          <form className="search-pill" onSubmit={search} role="search">
            <Search size={21} strokeWidth={2.4} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar lugares, actividades..." aria-label="Buscar" />
          </form>
        </div>
      </section>

      <div className="cat-grid">
        {catalog.categories.slice(0, 6).map((c) => (
          <button key={c.id} className={`cat-tile tone-${c.tone}`} onClick={() => go(`explorar?cat=${c.id}`)}>
            <span className="cat-emoji">{c.emoji}</span>
            <b>{c.name}</b>
          </button>
        ))}
      </div>

      <SectionTitle icon="⭐" title="Recomendados para ti" action="Ver más" onAction={() => go('explorar')} />
      <div className="h-scroll">
        {recommended.map((p) => (
          <button key={p.id} className="rec-card" onClick={() => go(`lugar/${p.id}`)} style={{ backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0) 40%, rgba(0,22,60,.78)), url(${sized(p.image, 700)})` }}>
            <span className="pin-badge"><MapPin size={14} strokeWidth={2.8} /></span>
            <span className="rec-copy"><b>{p.name}</b><small>{p.tagline || p.area}</small></span>
            <Rating value={p.rating} light />
          </button>
        ))}
      </div>

      {promos.length > 0 && <>
        <SectionTitle icon="🔥" title="Negocios prioritarios" action="Ver todos" onAction={() => go('negocios')} />
        <PromoCarousel items={promos} />
      </>}

      <SectionTitle icon="🧭" title="Itinerarios para ti" action="Ver todos" onAction={() => go('itinerarios')} />
      <div className="h-scroll">
        {catalog.itineraries.map((it) => (
          <button key={it.id} className="mini-itin" onClick={() => go(`itinerario/${it.id}`)}>
            <img src={sized(it.image, 400)} alt="" loading="lazy" />
            <span className={`badge badge-${it.color}`}>{it.badgeIcon} {it.badge}</span>
            <b>{it.title}</b>
            <small><Clock size={13} /> {it.duration} • {it.stops.length} paradas</small>
          </button>
        ))}
      </div>

      <button className="help-banner" onClick={() => openChat()}>
        <div>
          <b>¿Necesitas ayuda?</b>
          <small>Pregunta a nuestro Agente Turístico</small>
          <span className="btn btn-yellow btn-sm">Chatear Ahora 💬</span>
        </div>
        <Robot className="help-robot" />
      </button>
    </div>
  );
}

export function PromoCarousel({ items }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (items.length < 2) return undefined;
    const timer = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(timer);
  }, [items.length]);
  const item = items[index % items.length];
  if (!item) return null;
  return (
    <div className="promo">
      <button className="promo-card" onClick={() => go(`negocio/${item.id}`)} style={{ backgroundImage: `linear-gradient(90deg, rgba(0,25,70,.82) 0%, rgba(0,25,70,.25) 70%), url(${sized(item.image, 800)})` }}>
        <span className="badge badge-yellow">{item.level === 'Premium' ? '👑 Premium' : '🔥 Prioritario'}</span>
        <b>{item.name}</b>
        <small>{item.tagline}</small>
        <span className="btn btn-yellow btn-sm">{item.ctaLabel || 'Reservar Ahora'} <ArrowRight size={16} /></span>
      </button>
      {items.length > 1 && <div className="dots">{items.map((b, i) => <button key={b.id} className={i === index % items.length ? 'active' : ''} onClick={() => setIndex(i)} aria-label={`Ver ${b.name}`} />)}</div>}
    </div>
  );
}
