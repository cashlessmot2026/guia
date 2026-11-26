import { TILE_URL } from '../config.js';
import { sized } from './geo.js';

const BOUNDS = { north: 12.612, south: 12.47, west: -81.745, east: -81.668 };
const tileX = (lng, z) => Math.floor(((lng + 180) / 360) * 2 ** z);
const tileY = (lat, z) => {
  const r = (lat * Math.PI) / 180;
  return Math.floor(((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z);
};

export function offlineTileUrls(minZoom = 11, maxZoom = 15) {
  const urls = [];
  for (let z = minZoom; z <= maxZoom; z += 1) {
    for (let x = tileX(BOUNDS.west, z); x <= tileX(BOUNDS.east, z); x += 1) {
      for (let y = tileY(BOUNDS.north, z); y <= tileY(BOUNDS.south, z); y += 1) {
        urls.push(TILE_URL.replace('{z}', z).replace('{x}', x).replace('{y}', y));
      }
    }
  }
  return urls;
}

async function fillCache(cacheName, urls, onStep) {
  const cache = await caches.open(cacheName);
  let index = 0;
  const worker = async () => {
    while (index < urls.length) {
      const url = urls[index++];
      try {
        if (!(await cache.match(url))) {
          const response = await fetch(url, { mode: 'cors' });
          if (response.ok) await cache.put(url, response);
        }
      } catch { /* un recurso que falle no detiene la descarga */ }
      onStep();
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
}

// Guarda el mapa satelital de la isla y las fotos de lugares para usarlos sin conexión.
export async function downloadOffline(imageUrls, onProgress) {
  if (!('caches' in window)) throw new Error('Este navegador no permite guardar contenido sin conexión.');
  const tiles = offlineTileUrls();
  const images = [...new Set(imageUrls.filter(Boolean).flatMap((url) => [url, sized(url, 400)]))];
  const total = tiles.length + images.length;
  let done = 0;
  const step = () => { done += 1; onProgress?.(Math.round((done / total) * 100)); };
  await fillCache('sax-tiles', tiles, step);
  await fillCache('sax-images', images, step);
  return total;
}
