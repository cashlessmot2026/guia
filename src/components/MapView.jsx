import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ISLAND_CENTER, TILE_URL } from '../config.js';
import { escapeHtml, sized } from '../lib/geo.js';

// Mapa satelital con pines fotográficos y línea punteada entre paradas.
export default function MapView({ points, activeId, userPos, showRoute = true, onSelect, padTop = 60, padBottom = 60 }) {
  const elRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const userRef = useRef(null);
  const selectRef = useRef(onSelect);
  selectRef.current = onSelect;

  useEffect(() => {
    const map = L.map(elRef.current, { zoomControl: false, center: ISLAND_CENTER, zoom: 12, minZoom: 11, maxZoom: 19 });
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>');
    L.tileLayer(TILE_URL, { maxNativeZoom: 17, maxZoom: 19, crossOrigin: 'anonymous', attribution: 'Imágenes © Esri' }).addTo(map);
    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;
    const onResize = () => map.invalidateSize();
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('resize', onResize); map.remove(); };
  }, []);

  const pointsKey = points.map((p) => `${p.id}:${p.done ? 1 : 0}`).join('|');

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const located = points.filter((p) => p.lat != null && p.lng != null);
    const latlngs = located.map((p) => [p.lat, p.lng]);
    if (showRoute && latlngs.length > 1) {
      L.polyline(latlngs, { color: '#0b3d91', weight: 6, opacity: 0.25, lineCap: 'round' }).addTo(layer);
      L.polyline(latlngs, { color: '#ffffff', weight: 3.5, dashArray: '2 10', lineCap: 'round' }).addTo(layer);
    }
    located.forEach((p) => {
      const isActive = p.id === activeId;
      const html = `<div class="pin ${p.done ? 'is-done' : ''} ${isActive ? 'is-active' : ''}">
          <div class="pin-photo"><img src="${escapeHtml(sized(p.image, 160))}" alt=""/>${p.done ? '<i>✓</i>' : ''}</div>
          ${p.number ? `<b class="pin-number">${p.number}</b>` : ''}
          ${isActive ? `<span class="pin-label">${escapeHtml(p.name)}</span>` : ''}
        </div>`;
      const icon = L.divIcon({ html, className: 'pin-wrap', iconSize: [54, 64], iconAnchor: [27, 62] });
      const marker = L.marker([p.lat, p.lng], { icon, title: p.name, zIndexOffset: isActive ? 1000 : 0 }).addTo(layer);
      marker.on('click', () => selectRef.current?.(p));
    });
    if (latlngs.length > 1) map.fitBounds(latlngs, { paddingTopLeft: [40, padTop], paddingBottomRight: [40, padBottom], maxZoom: 15 });
    else if (latlngs.length === 1) map.setView(latlngs[0], 15);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, activeId, showRoute]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    if (!userPos) { userRef.current?.remove(); userRef.current = null; return; }
    const latlng = [userPos.lat, userPos.lng];
    if (!userRef.current) {
      userRef.current = L.marker(latlng, { icon: L.divIcon({ className: 'user-dot-wrap', html: '<span class="user-dot"></span>', iconSize: [22, 22], iconAnchor: [11, 11] }), zIndexOffset: 2000 }).addTo(map);
      map.setView(latlng, Math.max(map.getZoom(), 14));
    } else userRef.current.setLatLng(latlng);
  }, [userPos]);

  return <div ref={elRef} className="map-view" />;
}
