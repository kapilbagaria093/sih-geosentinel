import { apiClient, unwrapError } from "./client";

// --- /alerts ------------------------------------------------------------
// ASSUMPTION (explicitly called out in the project brief): this module does
// not exist on the backend yet. The brief told us to assume the route name
// "/alerts/register". We follow the same conventions as the rest of the
// API (JSON body, Bearer auth from the OTP-verified session, the common
// { success, message } envelope) so this will need minimal changes once
// the real endpoint ships.
//
// Payload shape assumed here:
//   { phoneNumber: string, districtIds: string[] }
// districtIds refer to the `dt_code` values from the Sikkim districts
// GeoJSON (see src/data/sikkim.geojson / src/hooks/useDistricts.js).

export async function registerForAlerts({ phoneNumber, districtIds }) {
  try {
    const { data } = await apiClient.post("/alerts/register", {
      phoneNumber,
      districtIds,
    });
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      const notReady = new Error(
        "Alert subscriptions aren't live on the server yet (/alerts/register is not implemented). Your preferences were captured but won't be sent until this ships."
      );
      notReady.notImplemented = true;
      throw notReady;
    }
    throw unwrapError(err);
  }
}
