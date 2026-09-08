import { apiClient, unwrapError } from "./client";

// --- /landslides --------------------------------------------------------
// Historical / scientific dataset (data/sikkim_landslide_ml_dataset.csv).
// Section 11-12 of geosentinel_backend_description.md.
// The backend does not currently cast numeric fields, so every numeric
// column can arrive as a string — normalize with Number() here, once,
// so the rest of the app can trust the shape.

function normalizeRecord(raw) {
  return {
    ...raw,
    latitude: Number(raw.latitude),
    longitude: Number(raw.longitude),
    elevation_m: Number(raw.elevation_m),
    slope_deg: Number(raw.slope_deg),
    aspect_deg: Number(raw.aspect_deg),
    ndvi: Number(raw.ndvi),
    soil_moisture: Number(raw.soil_moisture),
    landslide: Number(raw.landslide),
    event_id: raw.event_id,
    aspect_sin: Number(raw.aspect_sin),
    aspect_cos: Number(raw.aspect_cos),
  };
}

export async function getLandslides() {
  try {
    const { data } = await apiClient.get("/landslides");
    return {
      ...data,
      data: (data.data || []).map(normalizeRecord),
    };
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getLandslideById(id) {
  try {
    const { data } = await apiClient.get(`/landslides/${id}`);
    return { ...data, data: normalizeRecord(data.data) };
  } catch (err) {
    throw unwrapError(err);
  }
}
