const BASE_URL = import.meta.env.VITE_API_BASE_URL;

console.log("API BASE URL:", BASE_URL); // confirms env variable

async function request(path, { method = "GET", body, token } = {}) {
  const url = `${BASE_URL}${path}`;

  console.log("API Request →", url, body); // debug

  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  console.log("API Status:", res.status);

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    console.error("API Error:", data);
    throw new Error(data?.error || data?.detail || "Request failed");
  }

  console.log("API Response:", data);
  return data;
}

export const authApi = {
  sendOtp: (email) =>
    request("/api/auth/email/send-otp/", {
      method: "POST",
      body: { email },
    }),

  verifyOtp: (email, otp) =>
    request("/api/auth/email/verify-otp/", {
      method: "POST",
      body: { email, otp },
    }),

  me: (token) =>
    request("/api/me/", {
      token,
    }),

  plans: () =>
    request("/api/plans/"),

  upgradeSubscription: (token, planName) =>
    request("/api/subscription/upgrade/", {
      method: "POST",
      token,
      body: { plan_name: planName },
    }),
};