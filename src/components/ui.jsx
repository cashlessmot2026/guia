import { useEffect } from 'react';
import { ArrowLeft, ChevronRight, Heart, House, Map, Route, Star, X } from 'lucide-react';
import { back, go } from '../lib/router.js';
import { sized } from '../lib/geo.js';

export function PageHeader({ title, onBack, right, transparent = false, dark = false }) {
  return (
    <header className={`page-header ${transparent ? 'is-transparent' : ''} ${dark ? 'is-dark' : ''}`}>
      <button className="icon-btn" onClick={onBack || (() => back(''))} aria-label="Volver"><ArrowLeft size={24} strokeWidth={2.4} /></button>
      <h1>{title}</h1>
      <div className="page-header-right">{right}</div>
    </header>
  );
}

const NAV = [
  { id: 'inicio', label: 'Inicio', Icon: House, path: '' },
  { id: 'itinerarios', label: 'Itinerarios', Icon: Route, path: 'itinerarios' },
  { id: 'mapa', label: 'Mapa', Icon: Map, path: 'mapa' },
  { id: 'viaje', label: 'Mi Viaje', Icon: Heart, path: 'viaje' },
];

export function BottomNav({ active }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación principal">
      {NAV.map(({ id, label, Icon, path }) => (
        <button key={id} className={active === id ? 'active' : ''} onClick={() => go(path)} aria-current={active === id ? 'page' : undefined}>
          <Icon size={23} strokeWidth={active === id ? 2.6 : 2} fill={active === id && id === 'viaje' ? 'currentColor' : 'none'} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}

export function Rating({ value, light = false }) {
  if (value == null) return null;
  return <span className={`rating ${light ? 'is-light' : ''}`}><Star size={14} fill="#ffc21a" stroke="#f0a500" />{Number(value).toFixed(1)}</span>;
}

export function SectionTitle({ icon, title, action, onAction }) {
  return (
    <div className="section-title">
      <h2>{icon && <span className="section-icon">{icon}</span>}{title}</h2>
      {action && <button onClick={onAction}>{action}<ChevronRight size={16} strokeWidth={2.6} /></button>}
    </div>
  );
}

export function Sheet({ open, onClose, title, children, className = '' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => event.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className={`sheet ${className}`} role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-grip" />
        {title && <div className="sheet-head"><h3>{title}</h3><button className="icon-btn soft" onClick={onClose} aria-label="Cerrar"><X size={20} /></button></div>}
        {children}
      </div>
    </div>
  );
}

export function Toggle({ on, onChange, label, disabled }) {
  return (
    <button type="button" role="switch" aria-checked={!!on} aria-label={label} disabled={disabled} className={`toggle ${on ? 'on' : ''}`} onClick={() => onChange(!on)}>
      <i />
    </button>
  );
}

export function LevelChip({ level }) {
  const map = { Premium: ['premium', '👑'], Prioritario: ['prio', '★'], Normal: ['normal', '★'], Básico: ['basic', '•'] };
  const [tone, icon] = map[level] || map.Normal;
  return <span className={`level-chip ${tone}`}>{icon} {level}</span>;
}

export function Thumb({ src, alt = '', className = '', width = 300 }) {
  return <img className={className} src={sized(src, width)} alt={alt} loading="lazy" decoding="async" />;
}

export function EmptyState({ emoji, title, text, action, onAction }) {
  return (
    <div className="empty-state">
      <span>{emoji}</span>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && <button className="btn btn-primary" onClick={onAction}>{action}<ChevronRight size={18} /></button>}
    </div>
  );
}
