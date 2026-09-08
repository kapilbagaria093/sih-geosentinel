// Minimal geometry helpers — deliberately dependency-free (no turf) since we
// only need point-in-polygon tests against the four Sikkim district shapes.

// Ray-casting test for a single [lng, lat] ring (array of [lng, lat] pairs).
function pointInRing(point, ring) {
  const [x, y] = point;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// Polygon coordinates are [ [outerRing, hole1, hole2, ...] ]
function pointInPolygonCoords(point, polygonCoords) {
  const [outer, ...holes] = polygonCoords;
  if (!pointInRing(point, outer)) return false;
  for (const hole of holes) {
    if (pointInRing(point, hole)) return false;
  }
  return true;
}

export function pointInGeoJsonFeature(point, feature) {
  const { geometry } = feature;
  if (!geometry) return false;
  if (geometry.type === "Polygon") {
    return pointInPolygonCoords(point, geometry.coordinates);
  }
  if (geometry.type === "MultiPolygon") {
    return geometry.coordinates.some((poly) => pointInPolygonCoords(point, poly));
  }
  return false;
}

export function findDistrictForPoint(point, districtFeatures) {
  return districtFeatures.find((f) => pointInGeoJsonFeature(point, f)) || null;
}

export function boundsOfFeature(feature) {
  return boundsOfGeoJson({ features: [feature] });
}

export function boundsOfGeoJson(featureCollection) {
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;

  const walk = (coords) => {
    if (typeof coords[0] === "number") {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    } else {
      coords.forEach(walk);
    }
  };

  featureCollection.features.forEach((f) => walk(f.geometry.coordinates));
  return { west: minX, south: minY, east: maxX, north: maxY };
}
