import { apiClient, unwrapError, API_BASE_URL } from "./client";

// --- /layers --------------------------------------------------------------
// Section 13-15 of geosentinel_backend_description.md.
// Five raster layers exist today: dem, slope, aspect, ndvi, soil-moisture.
//
// ASSUMPTION (per project brief): the predicted-landslide-risk raster does
// not exist on the backend yet. The brief asked us to assume a route "in
// the same format as other data is accessed" — layers are read as
// GET /layers/:id and GET /layers/:id/file, so we mirror that shape with a
// synthetic id, `landslide-risk`, below. Metadata for it is NOT fetched from
// the server (there is nothing to fetch yet); it is declared locally and
// merged into the layer catalog. If the backend later adds a real
// `/layers/landslide-risk` entry, this local stub should be deleted and the
// server response used instead.

export const PREDICTED_RISK_LAYER_ID = "landslide-risk";

const ASSUMED_PREDICTED_LAYER = {
  id: PREDICTED_RISK_LAYER_ID,
  name: "Predicted Landslide Risk",
  type: "raster",
  format: "geotiff",
  unit: "probability",
  resolution: "30m",
  fileName: "landslide_risk_prediction.tif",
  bounds: null, // resolved at render time by falling back to the DEM layer's bounds
  isAssumed: true,
};

export async function getLayers() {
  try {
    const { data } = await apiClient.get("/layers");
    return {
      ...data,
      data: [...(data.data || []), ASSUMED_PREDICTED_LAYER],
      count: (data.count || 0) + 1,
    };
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getLayerMeta(id) {
  if (id === PREDICTED_RISK_LAYER_ID) {
    return { success: true, data: ASSUMED_PREDICTED_LAYER };
  }
  try {
    const { data } = await apiClient.get(`/layers/${id}`);
    return data;
  } catch (err) {
    throw unwrapError(err);
  }
}

// Fetches the raw GeoTIFF bytes for a layer as an ArrayBuffer.
// Used by components/map/GeoTiffOverlay.jsx which decodes it with geotiff.js
// and paints it onto a canvas so it can apply a per-layer colour ramp.
export async function getLayerFileArrayBuffer(id) {
  const url = `${API_BASE_URL}/layers/${id}/file`;
  try {
    const { data } = await apiClient.get(`/layers/${id}/file`, {
      responseType: "arraybuffer",
    });
    return data;
  } catch (err) {
    const wrapped = unwrapError(err);
    wrapped.sourceUrl = url;
    throw wrapped;
  }
}
