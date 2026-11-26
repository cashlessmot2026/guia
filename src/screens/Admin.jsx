import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, CalendarDays, Crown, Eye, GripVertical, LayoutDashboard, Lock, LogOut, MousePointerClick, Pencil, Plus, Search, Settings, Store, Trash2, Upload, User } from 'lucide-react';
import { useApp } from '../context.js';
import { go } from '../lib/router.js';
import { sized } from '../lib/geo.js';
import { supabase } from '../lib/supabase.js';
import { deleteBusiness, fetchReservations, fetchStats, reorderBusinesses, saveBusiness, setSetting, updateReservationStatus, uploadImage } from '../lib/api.js';
import { LEVELS } from '../data/seed.js';
import { LevelChip, Sheet, Toggle } from '../components/ui.jsx';

export default function Admin() {
  const { session, isAdmin, dbStatus } = useApp();
  if (!session) return <AdminLogin />;
  if (!isAdmin) return <NotAdmin email={session.user?.email} dbStatus={dbStatus} />;
  return <AdminPanel />;
}

function AdminLogin() {
  const { dbStatus } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setBusy(false);
    if (authError) setError(authError.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : authError.message);
  };
  return (
    <div className="screen admin-login">
      <div className="admin-login-head">
        <button className="icon-btn glass" onClick={() => go('')} aria-label="Volver"><ArrowLeft size={22} /></button>
        <Crown size={42} fill="#ffc928" stroke="#f0a500" />
        <h1>Panel Admin</h1>
        <p>Acceso para administradores de San Andrés Explorer</p>
      </div>
      <form className="form card" onSubmit={submit}>
        <label className="field"><span>Correo</span><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" /></label>
        <label className="field"><span>Contraseña</span><input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" /></label>
        {error && <p className="form-error">{error}</p>}
        <button className="btn btn-primary full" disabled={busy}><Lock size={18} /> {busy ? 'Ingresando…' : 'Ingresar'}</button>
        {dbStatus === 'local' && <p className="muted small center">La base de datos aún no responde. Ejecuta <code>supabase/schema.sql</code> en tu proyecto.</p>}
      </form>
    </div>
  );
}

function NotAdmin({ email, dbStatus }) {
  return (
    <div className="screen admin-login">
      <div className="admin-login-head">
        <Crown size={42} fill="#ffc928" stroke="#f0a500" />
        <h1>Sin permisos</h1>
        <p>La cuenta <b>{email}</b> inició sesión pero no es administradora.</p>
      </div>
      <div className="card form">
        <p className="small">Para darle acceso, ejecuta en el SQL Editor de Supabase:</p>
        <pre className="code">{`insert into public.admins (user_id)\nselect id from auth.users\nwhere email = '${email}';`}</pre>
        {dbStatus === 'local' && <p className="muted small">La base de datos aún no está configurada (falta ejecutar schema.sql).</p>}
        <button className="btn btn-light full" onClick={() => supabase.auth.signOut()}><LogOut size={18} /> Cerrar sesión</button>
        <button className="btn btn-ghost full" onClick={() => go('')}>Volver a la app</button>
      </div>
    </div>
  );
}

function AdminPanel() {
  const { catalog, reload, notify } = useApp();
  const [section, setSection] = useState('dashboard');
  const [tab, setTab] = useState('negocios');
  const [editing, setEditing] = useState(null);
  const businesses = catalog.businesses;

  const nav = [
    ['dashboard', 'Dashboard', LayoutDashboard],
    ['negocios', 'Negocios', Store],
    ['reportes', 'Reportes', BarChart3],
    ['config', 'Configuración', Settings],
  ];

  const onSaved = async (message) => {
    setEditing(null);
    await reload();
    notify(message);
  };

  return (
    <div className="screen admin">
      <header className="admin-head">
        <h1><Crown size={26} fill="#ffc928" stroke="#f0a500" /> Panel Admin</h1>
        <button className="icon-btn admin-user" onClick={() => setSection('config')} aria-label="Cuenta"><User size={22} /></button>
      </header>

      {section === 'dashboard' && <>
        <div className="seg">
          {[['negocios', 'Negocios'], ['prioridades', 'Prioridades'], ['estadisticas', 'Estadísticas']].map(([id, label]) => (
            <button key={id} className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>{label}</button>
          ))}
        </div>
        {tab === 'negocios' && <PriorityBoard businesses={businesses} onEdit={setEditing} />}
        {tab === 'prioridades' && <LevelsBoard businesses={businesses} />}
        {tab === 'estadisticas' && <Stats businesses={businesses} />}
      </>}
      {section === 'negocios' && <BusinessManager businesses={businesses} onEdit={setEditing} />}
      {section === 'reportes' && <ReservationsAdmin businesses={businesses} />}
      {section === 'config' && <AdminSettings />}

      <nav className="bottom-nav admin-nav" aria-label="Navegación administración">
        {nav.map(([id, label, Icon]) => (
          <button key={id} className={section === id ? 'active' : ''} onClick={() => setSection(id)}><Icon size={23} /><span>{label}</span></button>
        ))}
      </nav>
      <BusinessForm business={editing} onClose={() => setEditing(null)} onSaved={onSaved} />
    </div>
  );
}

function PriorityBoard({ businesses, onEdit }) {
  const { catalog, reload, notify } = useApp();
  const [order, setOrder] = useState(() => businesses.map((b) => b.id));
  const [drag, setDrag] = useState(null);
  const dragRef = useRef(null);
  const enabled = !!catalog.settings.priority_enabled;
  useEffect(() => { if (!dragRef.current) setOrder(businesses.map((b) => b.id)); }, [businesses]);
  const byId = useMemo(() => Object.fromEntries(businesses.map((b) => [b.id, b])), [businesses]);

  const onDown = (event, id) => {
    event.preventDefault();
    const row = event.currentTarget.closest('.adm-row');
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, startY: event.clientY, height: row.offsetHeight + 10, startIndex: order.indexOf(id), startOrder: order };
    setDrag({ id, dy: 0 });
  };
  const onMove = (event) => {
    const d = dragRef.current;
    if (!d) return;
    const dy = event.clientY - d.startY;
    const target = Math.max(0, Math.min(d.startOrder.length - 1, d.startIndex + Math.round(dy / d.height)));
    const next = [...d.startOrder];
    next.splice(d.startIndex, 1);
    next.splice(target, 0, d.id);
    setOrder(next);
    setDrag({ id: d.id, dy: dy - (target - d.startIndex) * d.height });
  };
  const onUp = async () => {
    const d = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!d || d.startOrder.join() === order.join()) return;
    try { await reorderBusinesses(order); await reload(); notify('Orden de prioridad actualizado'); }
    catch (error) { notify(`No se pudo guardar: ${error.message}`); setOrder(d.startOrder); }
  };
  const toggle = async (value) => {
    try { await setSetting('priority_enabled', value); await reload(); notify(value ? 'Negocios prioritarios visibles en Inicio' : 'Promoción de prioritarios pausada'); }
    catch (error) { notify(`No se pudo guardar: ${error.message}`); }
  };

  return (
    <div className="adm-body">
      <div className="adm-card switch-card">
        <span className="switch-icon">👑</span>
        <b>Gestiona la prioridad de los negocios aliados</b>
        <Toggle on={enabled} onChange={toggle} label="Mostrar negocios prioritarios" />
      </div>
      <p className="muted small pad-x">Arrastra <GripVertical size={13} /> para cambiar el orden en que aparecen en la app. Toca un negocio para editarlo.</p>
      <div className="adm-card list-card">
        {order.map((id, index) => {
          const b = byId[id];
          if (!b) return null;
          const isDragging = drag?.id === id;
          return (
            <div key={id} className={`adm-row ${isDragging ? 'is-dragging' : ''} ${b.active ? '' : 'is-off'}`} style={isDragging ? { transform: `translateY(${drag.dy}px)` } : undefined}>
              <span className={`rank ${index === 0 ? 'gold' : ''}`}>{index === 0 ? <><Crown size={13} fill="#fff" stroke="none" />1</> : index + 1}</span>
              <button className="adm-row-main" onClick={() => onEdit(b)}>
                <img src={sized(b.image, 160)} alt="" />
                <div><b>{b.name}</b><LevelChip level={b.level} />{!b.active && <em className="off-tag">Oculto</em>}</div>
              </button>
              <button className="drag-handle" aria-label={`Arrastrar ${b.name}`} onPointerDown={(event) => onDown(event, id)} onPointerMove={onMove} onPointerUp={onUp} onPointerCancel={onUp}><GripVertical size={22} /></button>
            </div>
          );
        })}
      </div>
      <button className="btn btn-primary full big" onClick={() => onEdit({})}><Plus size={22} /> Agregar Negocio</button>
    </div>
  );
}

function LevelsBoard({ businesses }) {
  const { reload, notify } = useApp();
  const update = async (b, patch) => {
    try { await saveBusiness({ ...b, ...patch }); await reload(); notify('Cambios guardados'); }
    catch (error) { notify(`No se pudo guardar: ${error.message}`); }
  };
  return (
    <div className="adm-body">
      <p className="muted small pad-x">El nivel define la insignia del negocio. Premium y Prioritario aparecen en el carrusel de Inicio.</p>
      {businesses.map((b) => (
        <div key={b.id} className="adm-card level-card">
          <div className="level-head">
            <img src={sized(b.image, 160)} alt="" />
            <b>{b.name}</b>
            <Toggle on={b.active} onChange={(value) => update(b, { active: value })} label={`Publicar ${b.name}`} />
          </div>
          <div className="level-options">
            {LEVELS.map((level) => <button key={level} className={b.level === level ? 'selected' : ''} onClick={() => b.level !== level && update(b, { level })}>{level}</button>)}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stats({ businesses }) {
  const [events, setEvents] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { fetchStats(30).then(setEvents).catch((e) => setError(e.message)); }, []);
  if (error) return <div className="adm-body"><p className="form-error">No se pudieron cargar las estadísticas: {error}</p></div>;
  if (!events) return <div className="adm-body"><p className="muted center">Cargando estadísticas…</p></div>;
  const count = (filter) => events.filter(filter).length;
  const rows = businesses.map((b) => ({
    b,
    views: count((e) => e.business_id === b.id && e.event === 'view'),
    clicks: count((e) => e.business_id === b.id && ['call', 'whatsapp', 'directions', 'web'].includes(e.event)),
    reserves: count((e) => e.business_id === b.id && e.event === 'reserve'),
  })).sort((a, z) => z.views - a.views);
  return (
    <div className="adm-body">
      <div className="kpis">
        <div className="kpi"><Eye size={20} /><b>{count((e) => e.event === 'view')}</b><small>Vistas</small></div>
        <div className="kpi"><MousePointerClick size={20} /><b>{count((e) => ['call', 'whatsapp', 'directions', 'web'].includes(e.event))}</b><small>Contactos</small></div>
        <div className="kpi"><CalendarDays size={20} /><b>{count((e) => e.event === 'reserve')}</b><small>Reservas</small></div>
      </div>
      <p className="muted small pad-x">Últimos 30 días</p>
      <div className="adm-card list-card">
        {rows.map(({ b, views, clicks, reserves }) => {
          const max = Math.max(1, rows[0]?.views || 1);
          return (
            <div key={b.id} className="stat-row">
              <div className="stat-name"><b>{b.name}</b><small>{views} vistas · {clicks} contactos · {reserves} reservas</small></div>
              <div className="bar"><i style={{ width: `${(views / max) * 100}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BusinessManager({ businesses, onEdit }) {
  const [q, setQ] = useState('');
  const list = businesses.filter((b) => b.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="adm-body">
      <label className="search-pill on-light"><Search size={20} /><input value={q} onChange={(event) => setQ(event.target.value)} placeholder="Buscar negocio" /></label>
      <div className="adm-card list-card">
        {list.map((b) => (
          <button key={b.id} className={`adm-row adm-row-main ${b.active ? '' : 'is-off'}`} onClick={() => onEdit(b)}>
            <img src={sized(b.image, 160)} alt="" />
            <div><b>{b.name}</b><small className="muted">{b.category}</small><LevelChip level={b.level} />{!b.active && <em className="off-tag">Oculto</em>}</div>
            <Pencil size={18} className="muted-icon" />
          </button>
        ))}
        {!list.length && <p className="muted center">Sin resultados</p>}
      </div>
      <button className="btn btn-primary full big" onClick={() => onEdit({})}><Plus size={22} /> Agregar Negocio</button>
    </div>
  );
}

function ReservationsAdmin({ businesses }) {
  const { notify } = useApp();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const names = Object.fromEntries(businesses.map((b) => [b.id, b.name]));
  const load = () => fetchReservations().then(setItems).catch((e) => setError(e.message));
  useEffect(() => { load(); }, []);
  const setStatus = async (id, status) => {
    try { await updateReservationStatus(id, status); setItems((list) => list.map((r) => (r.id === id ? { ...r, status } : r))); notify(`Reserva ${status}`); }
    catch (e) { notify(`No se pudo actualizar: ${e.message}`); }
  };
  return (
    <div className="adm-body">
      <h3 className="block-title">Solicitudes de reserva</h3>
      {error && <p className="form-error">{error}</p>}
      {!items && !error && <p className="muted center">Cargando…</p>}
      {items && !items.length && <p className="muted center">Aún no hay reservas.</p>}
      {items?.map((r) => (
        <div key={r.id} className="adm-card res-card">
          <div className="res-top"><b>{names[r.business_id] || 'Negocio'}</b><em className={`status ${r.status}`}>{r.status}</em></div>
          <p><b>{r.customer_name}</b> · <a href={`tel:${r.phone}`}>{r.phone}</a></p>
          <p className="muted small">{r.reservation_date} · {r.people} persona(s){r.notes ? ` · ${r.notes}` : ''}</p>
          <div className="res-actions">
            <button className="btn btn-light btn-sm" onClick={() => setStatus(r.id, 'confirmada')}>Confirmar</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setStatus(r.id, 'cancelada')}>Cancelar</button>
          </div>
        </div>
      ))}
    </div>
  );
}

function AdminSettings() {
  const { session, catalog, reload, notify } = useApp();
  const enabled = !!catalog.settings.priority_enabled;
  return (
    <div className="adm-body">
      <div className="adm-card">
        <p className="small muted">Sesión iniciada como</p>
        <b>{session?.user?.email}</b>
      </div>
      <div className="adm-card switch-card">
        <span className="switch-icon">🔥</span>
        <b>Mostrar carrusel de negocios prioritarios en Inicio</b>
        <Toggle on={enabled} onChange={async (v) => { try { await setSetting('priority_enabled', v); await reload(); } catch (e) { notify(e.message); } }} label="Carrusel de prioritarios" />
      </div>
      <button className="btn btn-light full" onClick={() => { reload(); notify('Datos actualizados'); }}>Actualizar datos</button>
      <button className="btn btn-light full" onClick={() => go('')}>Ver app como turista</button>
      <button className="btn btn-ghost full danger" onClick={async () => { await supabase.auth.signOut(); go(''); }}><LogOut size={18} /> Cerrar sesión</button>
    </div>
  );
}

const EMPTY = { name: '', categoryId: 'tours', category: '', tagline: '', description: '', level: 'Normal', priority: 100, active: true, image: '', gallery: [], phone: '', whatsapp: '', website: '', address: '', lat: '', lng: '', rating: '', reviewsCount: '', ctaLabel: 'Reservar Ahora' };

function BusinessForm({ business, onClose, onSaved }) {
  const { catalog, notify } = useApp();
  const [form, setForm] = useState(EMPTY);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  useEffect(() => {
    if (!business) return;
    const maxPriority = Math.max(0, ...catalog.businesses.map((b) => b.priority || 0));
    setForm(business.id ? { ...EMPTY, ...business, gallery: business.gallery || [] } : { ...EMPTY, priority: maxPriority + 10 });
  }, [business]);
  const set = (key) => (event) => setForm({ ...form, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value });

  const upload = async (event, target) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { notify('La imagen debe pesar menos de 5 MB'); return; }
    setUploading(true);
    try {
      const url = await uploadImage(file);
      setForm((f) => (target === 'image' ? { ...f, image: url } : { ...f, gallery: [...f.gallery, url] }));
    } catch (error) { notify(`Error al subir: ${error.message}`); }
    setUploading(false);
  };
  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try { await saveBusiness(form); await onSaved(business?.id ? 'Negocio actualizado' : 'Negocio agregado'); }
    catch (error) { notify(`No se pudo guardar: ${error.message}`); }
    setBusy(false);
  };
  const remove = async () => {
    if (!window.confirm(`¿Eliminar ${form.name}? Esta acción no se puede deshacer.`)) return;
    setBusy(true);
    try { await deleteBusiness(form.id); await onSaved('Negocio eliminado'); }
    catch (error) { notify(`No se pudo eliminar: ${error.message}`); }
    setBusy(false);
  };

  return (
    <Sheet open={!!business} onClose={onClose} title={business?.id ? 'Editar negocio' : 'Agregar negocio'} className="tall">
      <form className="form" onSubmit={submit}>
        <label className="field"><span>Nombre *</span><input required value={form.name} onChange={set('name')} maxLength={80} /></label>
        <div className="field-row">
          <label className="field"><span>Categoría</span>
            <select value={form.categoryId || ''} onChange={set('categoryId')}>
              {catalog.categories.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
            </select>
          </label>
          <label className="field"><span>Nivel</span>
            <select value={form.level} onChange={set('level')}>{LEVELS.map((l) => <option key={l}>{l}</option>)}</select>
          </label>
        </div>
        <label className="field"><span>Subtítulo (ej. Tours de Buceo y Snorkel)</span><input value={form.category || ''} onChange={set('category')} maxLength={80} /></label>
        <label className="field"><span>Frase del banner</span><input value={form.tagline || ''} onChange={set('tagline')} maxLength={120} /></label>
        <label className="field"><span>Descripción</span><textarea rows="3" value={form.description || ''} onChange={set('description')} maxLength={1000} /></label>

        <div className="field"><span>Imagen principal</span>
          <div className="image-field">
            {form.image ? <img src={sized(form.image, 300)} alt="" /> : <div className="img-placeholder">Sin imagen</div>}
            <div>
              <label className="btn btn-light btn-sm"><Upload size={16} /> {uploading ? 'Subiendo…' : 'Subir foto'}<input type="file" accept="image/*" hidden onChange={(e) => upload(e, 'image')} /></label>
              <input value={form.image || ''} onChange={set('image')} placeholder="o pega una URL" />
            </div>
          </div>
        </div>
        <div className="field"><span>Galería ({form.gallery.length})</span>
          <div className="gallery-edit">
            {form.gallery.map((g, i) => (
              <div key={i}><img src={sized(g, 160)} alt="" /><button type="button" onClick={() => setForm({ ...form, gallery: form.gallery.filter((_, j) => j !== i) })} aria-label="Quitar imagen"><Trash2 size={14} /></button></div>
            ))}
            <label className="add-img"><Plus size={20} /><input type="file" accept="image/*" hidden onChange={(e) => upload(e, 'gallery')} /></label>
          </div>
        </div>

        <div className="field-row">
          <label className="field"><span>Teléfono</span><input type="tel" value={form.phone || ''} onChange={set('phone')} placeholder="+57 300 000 0000" /></label>
          <label className="field"><span>WhatsApp</span><input type="tel" value={form.whatsapp || ''} onChange={set('whatsapp')} placeholder="573000000000" /></label>
        </div>
        <label className="field"><span>Sitio web</span><input value={form.website || ''} onChange={set('website')} placeholder="www.ejemplo.com" /></label>
        <label className="field"><span>Dirección</span><input value={form.address || ''} onChange={set('address')} /></label>
        <div className="field-row">
          <label className="field"><span>Latitud</span><input inputMode="decimal" value={form.lat ?? ''} onChange={set('lat')} placeholder="12.58" /></label>
          <label className="field"><span>Longitud</span><input inputMode="decimal" value={form.lng ?? ''} onChange={set('lng')} placeholder="-81.70" /></label>
        </div>
        <div className="field-row">
          <label className="field"><span>Calificación (0-5)</span><input type="number" step="0.1" min="0" max="5" value={form.rating ?? ''} onChange={set('rating')} /></label>
          <label className="field"><span>Nº de reseñas</span><input type="number" min="0" value={form.reviewsCount ?? ''} onChange={set('reviewsCount')} /></label>
        </div>
        <label className="field"><span>Texto del botón</span><input value={form.ctaLabel || ''} onChange={set('ctaLabel')} maxLength={30} /></label>
        <label className="check"><input type="checkbox" checked={!!form.active} onChange={set('active')} /> Publicado (visible para turistas)</label>

        <button className="btn btn-primary full" disabled={busy || uploading}>{busy ? 'Guardando…' : 'Guardar negocio'}</button>
        {business?.id && <button type="button" className="btn btn-ghost full danger" onClick={remove} disabled={busy}><Trash2 size={17} /> Eliminar negocio</button>}
      </form>
    </Sheet>
  );
}
