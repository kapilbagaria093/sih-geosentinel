import { apiClient, unwrapError } from "./client";

// --- /reports ---------------------------------------------------------
// Sections 16-31 of geosentinel_backend_description.md.

export async function submitReport(payload, { onUploadProgress } = {}) {
  const formData = new FormData();
  formData.append("severity", payload.severity);
  formData.append("description", payload.description);
  formData.append("reportedAt", payload.reportedAt);
  formData.append("latitude", String(payload.location.latitude));
  formData.append("longitude", String(payload.location.longitude));
  if (payload.location.altitude !== null && payload.location.altitude !== undefined) {
    formData.append("altitude", String(payload.location.altitude));
  }
  if (payload.location.address) {
    formData.append("address", payload.location.address);
  }
  for (const media of payload.media || []) {
    // media.file is the raw File object selected by the user
    formData.append("media", media.file, media.fileName);
  }

  try {
    const { data } = await apiClient.post("/reports", formData, {
      // Do not set Content-Type manually — the browser needs to add the
      // multipart boundary itself (see section 34 of the backend doc).
      onUploadProgress,
    });
    return data; // { success, message, data: LandslideReport }
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getReportById(id) {
  try {
    const { data } = await apiClient.get(`/reports/${id}`);
    return data; // { success, data: LandslideReport }
  } catch (err) {
    throw unwrapError(err);
  }
}

// ASSUMPTION: a listing endpoint (GET /reports) is discussed in section 36
// of the backend doc as the "next endpoint" for the web dashboard, but is
// explicitly NOT implemented yet. We call it optimistically for the
// incident feed and degrade gracefully (empty feed + notice) if the server
// returns 404/501, so the dashboard still works against today's backend.
export async function listReports(params = {}) {
  try {
    const { data } = await apiClient.get("/reports", { params });
    return { ...data, notImplemented: false };
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404 || status === 501 || status === 405) {
      return { success: true, data: [], count: 0, notImplemented: true };
    }
    throw unwrapError(err);
  }
}
