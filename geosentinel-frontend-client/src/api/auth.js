import { apiClient, unwrapError } from "./client";

// --- /auth ------------------------------------------------------------
// Matches geosentinel_backend_description.md sections 5-10.

export async function signUp({ phoneNumber, latitude, longitude }) {
  try {
    const { data } = await apiClient.post("/auth/sign-up", {
      phoneNumber,
      latitude,
      longitude,
    });
    return data; // { success, message, userId, otp }
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function requestSignInOtp({ phoneNumber }) {
  try {
    const { data } = await apiClient.post("/auth/sign-in/request-otp", { phoneNumber });
    return data; // { success, message }
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function verifySignInOtp({ phoneNumber, otp, latitude, longitude }) {
  try {
    const { data } = await apiClient.post("/auth/sign-in/verify-otp", {
      phoneNumber,
      otp,
      latitude,
      longitude,
    });
    return data; // { success, message, user, accessToken, refreshToken }
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function getMe() {
  try {
    const { data } = await apiClient.get("/auth/me");
    return data; // { success, user }
  } catch (err) {
    throw unwrapError(err);
  }
}

export async function logout({ refreshToken }) {
  try {
    const { data } = await apiClient.post("/auth/logout", { refreshToken });
    return data;
  } catch (err) {
    throw unwrapError(err);
  }
}
