import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Globe, Heart, Images, MapPin, MessageCircle, Navigation, Phone } from 'lucide-react';
import { useApp } from '../context.js';
import { back, go } from '../lib/router.js';
import { directionsUrl, distanceKm, formatKm, sized, telUrl, webUrl, whatsappUrl } from '../lib/geo.js';
import { createReservation, trackEvent } from '../lib/api.js';
import { EmptyState, PageHeader, Rating, Sheet } from '../components/ui.jsx';

const badgeFor = (level) => (level === 'Premium' ? '👑 Premium' : level === 'Prioritario' ? '🔥 Prioritario' : '⭐ Aliado');

export function Businesses() {
  const { publicBusinesses } = useApp();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 4500);
    return () => clearInterval(timer);
  }, []);
  return (
    <div className="screen">
      <PageHeader title="Negocios Prioritarios" />
      <p className="screen-lead strong">Disfruta más con nuestros aliados</p>
      {publicBusinesses.length === 0 && <EmptyState emoji="🏝️" title="Pronto tendremos aliados" text="Aún no hay negocios publicados." />}
      <div className="biz-list">
        {publicBusinesses.map((b, i) => <BusinessBanner key={b.id} business={b} frame={tick + i} />)}
      </div>
    </div>
  );
}

function BusinessBanner({ business, frame }) {
  const images = business.gallery?.length ? business.gallery : [business.image];
  const [manual, setManual] = useState(null);
  const current = manual ?? frame % images.length;
  const cover = current === 0 && business.image ? business.image : images[current];
  return (
    <article className="biz-banner-wrap">
      <button className="biz-banner" onClick={() => go(`negocio/${business.id}`)} style={{ backgroundImage: `linear-gradient(90deg, rgba(0,22,66,.85) 0%, rgba(0,22,66,.35) 62%, rgba(0,0,0,0)), url(${sized(cover, 900)})` }}>
        <span className="badge badge-yellow">{badgeFor(business.level)}</span>
        <b>{business.name}</b>
        <small>{business.tagline}</small>
        <span className="btn btn-yellow btn-sm">{business.ctaLabel || 'Reservar Ahora'} <ArrowRight size={16} strokeWidth={2.6} /></span>
      </button>
      {images.length > 1 && <div className="dots">{images.map((_, i) => <button key={i} className={i === current ? 'active' : ''} onClick={() => setManual(i)} aria-label={`Imagen ${i + 1}`} />)}</div>}
    </article>
  );
}

export function BusinessDetail({ id }) {
  const { catalog, isFavorite, toggleFavorite, userPos, addReservation, notify, dbStatus } = useApp();
  const business = catalog.businesses.find((b) => b.id === id);
  const [slide, setSlide] = useState(0);
  const [reserveOpen, setReserveOpen] = useState(false);
  const galleryRef = useRef(null);
  useEffect(() => { if (business) trackEvent(business.id, 'view'); }, [business?.id]);

  if (!business) return <div className="screen"><PageHeader title="Negocio" /><EmptyState emoji="🏝️" title="Negocio no encontrado" text="Puede que ya no esté disponible." action="Ver aliados" onAction={() => go('negocios')} /></div>;

  const images = [business.image, ...(business.gallery || []).filter((g) => g !== business.image)].filter(Boolean);
  const km = formatKm(distanceKm(userPos, business));
  const fav = isFavorite(`b:${business.id}`);
  const actions = [
    { key: 'call', label: 'Llamar', Icon: Phone, href: telUrl(business.phone), cls: 'blue' },
    { key: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle, href: whatsappUrl(business.whatsapp, `Hola, vi ${business.name} en San Andrés Explorer y quiero más información.`), cls: 'green' },
    { key: 'directions', label: 'Cómo llegar', Icon: Navigation, href: directionsUrl(business), cls: 'blue' },
    { key: 'web', label: 'Web', Icon: Globe, href: webUrl(business.website), cls: 'blue' },
  ];
  const onScroll = () => {
    const el = galleryRef.current;
    if (el) setSlide(Math.round(el.scrollLeft / el.clientWidth));
  };

  return (
    <div className="screen detail with-cta">
      <div className="detail-gallery">
        <div className="gallery-track" ref={galleryRef} onScroll={onScroll}>
          {images.map((src, i) => <img key={i} src={sized(src, 1000)} alt={i === 0 ? business.name : ''} />)}
        </div>
        <div className="gallery-overlay">
          <button className="icon-btn glass" onClick={() => back('negocios')} aria-label="Volver"><ArrowLeft size={22} /></button>
          <button className={`icon-btn glass ${fav ? 'is-fav' : ''}`} onClick={() => toggleFavorite(`b:${business.id}`)} aria-label="Favorito"><Heart size={22} fill={fav ? '#ff3b5c' : 'none'} /></button>
        </div>
        {business.level !== 'Normal' && business.level !== 'Básico' && <span className="badge badge-yellow hero-badge">⭐ Negocio {business.level}</span>}
        {images.length > 1 && <span className="gallery-count"><Images size={14} /> {slide + 1}/{images.length}</span>}
      </div>
      <div className="detail-body">
        <h1 className="detail-title">{business.name}</h1>
        <p className="detail-sub">{business.category}</p>
        <div className="meta-row">
          {business.rating != null && <span className="rating-line"><Rating value={business.rating} />{business.reviewsCount ? <em>({Number(business.reviewsCount).toLocaleString('es-CO')} reseñas)</em> : null}</span>}
          <span className="push"><MapPin size={16} /> {km || business.address || 'San Andrés'}</span>
        </div>
        <div className="action-row">
          {actions.map(({ key, label, Icon, href, cls }) => (
            <a key={key} className={`action ${href ? '' : 'is-disabled'}`} href={href || undefined} target={key === 'call' ? undefined : '_blank'} rel="noopener noreferrer"
              onClick={(event) => { if (!href) { event.preventDefault(); notify(`${label}: dato no disponible todavía`); } else trackEvent(business.id, key); }}>
              <span className={`action-icon ${cls}`}><Icon size={24} /></span>{label}
            </a>
          ))}
        </div>
        <h3 className="block-title">Descripción</h3>
        <p className="detail-text">{business.description || business.tagline}</p>
        {dbStatus !== 'ok' && <p className="muted small">Modo sin conexión a la base de datos: tu solicitud se guardará en este dispositivo.</p>}
      </div>
      <div className="cta-bar"><button className="btn btn-primary full big" onClick={() => setReserveOpen(true)}>{business.ctaLabel || 'Reservar'}</button></div>
      <ReserveSheet open={reserveOpen} onClose={() => setReserveOpen(false)} business={business} onDone={addReservation} notify={notify} />
    </div>
  );
}

function ReserveSheet({ open, onClose, business, onDone, notify }) {
  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({ name: '', phone: '', date: today, people: 2, notes: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setSending(true);
    let remote = true;
    let id = null;
    try { id = await createReservation({ ...form, businessId: business.id }); }
    catch { remote = false; }
    const record = { id: id || `local-${Date.now()}`, businessId: business.id, businessName: business.name, ...form, status: remote ? 'Enviada' : 'Guardada en el dispositivo', createdAt: new Date().toISOString() };
    onDone(record);
    setSending(false);
    setSent(record);
    notify(remote ? 'Solicitud de reserva enviada' : 'Reserva guardada en tu dispositivo');
  };
  const wa = sent && whatsappUrl(business.whatsapp, `Hola ${business.name}, quiero reservar para ${sent.people} persona(s) el ${sent.date}. Mi nombre es ${sent.name}.${sent.notes ? ` ${sent.notes}` : ''}`);
  const close = () => { setSent(null); onClose(); };

  return (
    <Sheet open={open} onClose={close} title={sent ? '¡Solicitud registrada!' : `Reservar en ${business.name}`}>
      {sent ? (
        <div className="reserve-done">
          <p>{sent.status === 'Enviada' ? 'El negocio recibirá tu solicitud y te contactará para confirmar.' : 'No hay conexión con la base de datos. Contacta al negocio para confirmar tu reserva.'}</p>
          {wa && <a className="btn btn-whatsapp full" href={wa} target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /> Confirmar por WhatsApp</a>}
          <button className="btn btn-light full" onClick={() => { close(); go('reservas'); }}>Ver mis reservas</button>
        </div>
      ) : (
        <form className="form" onSubmit={submit}>
          <label className="field"><span>Nombre completo</span><input required value={form.name} onChange={set('name')} autoComplete="name" maxLength={80} /></label>
          <label className="field"><span>Teléfono / WhatsApp</span><input required type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={25} /></label>
          <div className="field-row">
            <label className="field"><span>Fecha</span><input required type="date" min={today} value={form.date} onChange={set('date')} /></label>
            <label className="field"><span>Personas</span><input required type="number" min="1" max="50" value={form.people} onChange={set('people')} /></label>
          </div>
          <label className="field"><span>Comentarios (opcional)</span><textarea rows="2" value={form.notes} onChange={set('notes')} maxLength={300} /></label>
          <button className="btn btn-primary full" disabled={sending}>{sending ? 'Enviando…' : 'Enviar solicitud'}</button>
          <p className="muted small center">Tus datos se comparten solo con el negocio para gestionar la reserva.</p>
        </form>
      )}
    </Sheet>
  );
}
