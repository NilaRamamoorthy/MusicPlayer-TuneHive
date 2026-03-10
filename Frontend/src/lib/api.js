// api.js
const base = () => import.meta.env.VITE_API_BASE_URL;

// Helper for making API requests
async function request(path, { method = "GET", body, token } = {}) {
  // Properly join base + path to avoid double slashes
  const url = `${base().replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // Needed if using cookies with CSRF
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg = data?.error || data?.detail || "Request failed";
    throw new Error(msg);
  }
  return data;
}

// Export all API calls
export const authApi = {
  sendOtp: (email) =>
    request("/api/auth/email/send-otp/", { method: "POST", body: { email } }),

  verifyOtp: (email, otp) =>
    request("/api/auth/email/verify-otp/", {
      method: "POST",
      body: { email, otp },
    }),

  me: (token) => request("/api/me/", { token }),

  plans: () => request("/api/plans/"),

  upgradeSubscription: (token, planName) =>
    request("/api/subscription/upgrade/", {
      method: "POST",
      token,
      body: { plan_name: planName },
    }),
};