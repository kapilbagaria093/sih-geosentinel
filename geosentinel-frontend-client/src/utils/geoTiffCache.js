// Module-scope cache so switching a layer checkbox off/on (or remounting the
// dashboard) doesn't re-fetch and re-decode the same GeoTIFF repeatedly.
// Keyed by layer id -> Promise<{ dataUrl, bounds, min, max }>.
const cache = new Map();

export function getCachedOverlay(layerId) {
  return cache.get(layerId);
}

export function setCachedOverlay(layerId, promise) {
  cache.set(layerId, promise);
  return promise;
}

export function clearOverlayCache(layerId) {
  if (layerId) cache.delete(layerId);
  else cache.clear();
}
