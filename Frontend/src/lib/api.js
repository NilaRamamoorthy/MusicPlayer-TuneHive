const base = () => import.meta.env.VITE_API_BASE_URL;

async function request(path, { method = "GET", body, token } = {}) {
  const res = await fetch(`${base()}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error || data?.detail || "Request failed";
    throw new Error(msg);
  }
  return data;
}

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