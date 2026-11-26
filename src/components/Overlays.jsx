import { useEffect, useRef, useState } from 'react';
import { CalendarDays, Compass, Crown, Download, Heart, House, Map as MapIcon, Route, Send, Share, Store, X } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { Logo, Robot } from './Brand.jsx';
import { Sheet } from './ui.jsx';

export function ChatAgent({ open, history, onSend, onClose }) {
  const [text, setText] = useState('');
  const listRef = useRef(null);
  useEffect(() => { listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' }); }, [history, open]);
  if (!open) return null;
  const submit = (event) => {
    event.preventDefault();
    if (!text.trim()) return;
    onSend(text.trim());
    setText('');
  };
  const suggestions = ['¿Qué hago en un día?', 'Playas y snorkel', 'Comida raizal', 'Plan en familia', 'Consejos para el sol'];
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet chat-sheet" role="dialog" aria-modal="true" aria-label="Asistente turístico" onClick={(event) => event.stopPropagation()}>
        <div className="chat-head">
          <Robot className="chat-robot" />
          <div><b>Asistente Turístico</b><small>Tu guía de San Andrés · en línea</small></div>
          <button className="icon-btn glass" onClick={onClose} aria-label="Cerrar"><X size={20} /></button>
        </div>
        <div className="chat-list" ref={listRef}>
          {history.map((item, index) => <div key={index} className={`bubble ${item.from}`}>{item.text}</div>)}
        </div>
        <div className="chat-suggestions">{suggestions.map((s) => <button key={s} onClick={() => onSend(s)}>{s}</button>)}</div>
        <form className="chat-compose" onSubmit={submit}>
          <input value={text} onChange={(event) => setText(event.target.value)} placeholder="Pregúntale a tu guía..." aria-label="Mensaje" />
          <button className="btn-round" aria-label="Enviar"><Send size={18} /></button>
        </form>
        <p className="chat-note">Respuestas de la guía integrada. Confirma horarios y estado del mar con operadores locales.</p>
      </div>
    </div>
  );
}

export function Drawer({ open, onClose }) {
  const { install, isAdmin } = useApp();
  if (!open) return null;
  const link = (path) => () => { onClose(); go(path); };
  const items = [
    ['Inicio', House, ''], ['Explorar lugares', Compass, 'explorar'], ['Itinerarios', Route, 'itinerarios'], ['Mi Ruta', MapIcon, 'mapa'],
    ['Negocios aliados', Store, 'negocios'], ['Mis favoritos', Heart, 'favoritos'], ['Mis reservas', CalendarDays, 'reservas'],
  ];
  return (
    <div className="drawer-backdrop" onClick={onClose}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()} aria-label="Menú">
        <div className="drawer-brand"><Logo variant="drawer" /><button className="icon-btn glass" onClick={onClose} aria-label="Cerrar menú"><X size={20} /></button></div>
        <nav>{items.map(([label, Icon, path]) => <button key={label} onClick={link(path)}><Icon size={21} />{label}</button>)}</nav>
        <div className="drawer-foot">
          <button onClick={() => { onClose(); install(); }}><Download size={20} />Instalar aplicación</button>
          <button onClick={link('admin')}><Crown size={20} />{isAdmin ? 'Panel Admin' : 'Acceso administrador'}</button>
          <small>San Andrés Explorer · v2.0</small>
        </div>
      </aside>
    </div>
  );
}

export function Notifications({ open, onClose, items }) {
  return (
    <Sheet open={open} onClose={onClose} title="Notificaciones">
      <div className="notif-list">
        {items.length === 0 && <p className="muted center">No tienes notificaciones nuevas.</p>}
        {items.map((item) => (
          <button key={item.id} className="notif" onClick={() => { onClose(); item.path != null && go(item.path); }}>
            <span className="notif-icon">{item.icon}</span>
            <div><b>{item.title}</b><small>{item.text}</small></div>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

export function InstallHelp({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Instalar la app">
      <div className="install-help">
        <div className="install-step"><b>iPhone / iPad (Safari)</b><p>Toca <Share size={15} /> Compartir y elige “Añadir a pantalla de inicio”.</p></div>
        <div className="install-step"><b>Android (Chrome)</b><p>Abre el menú ⋮ y elige “Instalar aplicación”.</p></div>
        <div className="install-step"><b>Computador (Chrome / Edge)</b><p>Usa el icono de instalación en la barra de direcciones.</p></div>
        <button className="btn btn-primary full" onClick={onClose}>Entendido</button>
      </div>
    </Sheet>
  );
}
