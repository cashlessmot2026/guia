import { useEffect, useState } from 'react';

// Router mínimo basado en hash: funciona en cualquier hosting estático
// y respeta el botón "atrás" de Android dentro de la PWA.
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

if (typeof window !== 'undefined') {
  if (!history.state || typeof history.state.idx !== 'number') history.replaceState({ idx: 0 }, '');
  window.addEventListener('popstate', emit);
  window.addEventListener('hashchange', emit);
}

export function parseHash() {
  const raw = window.location.hash.replace(/^#\/?/, '');
  const [path, query = ''] = raw.split('?');
  const parts = path.split('/').filter(Boolean).map((part) => decodeURIComponent(part));
  return { name: parts[0] || 'inicio', param: parts[1] || null, query: new URLSearchParams(query), key: raw };
}

export function useRoute() {
  const [route, setRoute] = useState(parseHash);
  useEffect(() => {
    const update = () => setRoute(parseHash());
    listeners.add(update);
    return () => listeners.delete(update);
  }, []);
  return route;
}

export function go(path, { replace = false } = {}) {
  const url = `#/${String(path).replace(/^[#/]+/, '')}`;
  if (url === window.location.hash && !replace) return;
  const idx = (history.state?.idx ?? 0) + (replace ? 0 : 1);
  history[replace ? 'replaceState' : 'pushState']({ idx }, '', url);
  emit();
}

export function back(fallback = '') {
  if ((history.state?.idx ?? 0) > 0) history.back();
  else go(fallback, { replace: true });
}
