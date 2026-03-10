import { create } from "zustand";
import { authApi } from "../lib/api";

const ACCESS_KEY = "tunehive_access";
const REFRESH_KEY = "tunehive_refresh";

export const useAuthStore = create((set, get) => ({
  email: "",
  user: null,
  plan: null,
  usage: null,
  plans: [],

  access: localStorage.getItem(ACCESS_KEY) || "",
  refresh: localStorage.getItem(REFRESH_KEY) || "",

  loading: false,
  error: "",

  setEmail: (email) => set({ email }),

  sendOtp: async (email) => {
    console.log("sendOtp called with:", email);

    set({ loading: true, error: "" });

    try {
      const res = await authApi.sendOtp(email);

      console.log("OTP API success:", res);

      set({
        email,
        loading: false,
      });

      return true;
    } catch (err) {
      console.error("OTP API error:", err);

      set({
        loading: false,
        error: err.message || "Failed to send OTP",
      });

      return false;
    }
  },

  verifyOtp: async (email, otp) => {
    console.log("verifyOtp called:", email, otp);

    set({ loading: true, error: "" });

    try {
      const data = await authApi.verifyOtp(email, otp);

      console.log("OTP verify success:", data);

      localStorage.setItem(ACCESS_KEY, data.access);
      localStorage.setItem(REFRESH_KEY, data.refresh);

      set({
        access: data.access,
        refresh: data.refresh,
        user: data.user,
        plan: data.plan,
        loading: false,
      });

      return true;
    } catch (err) {
      console.error("OTP verify error:", err);

      set({
        loading: false,
        error: err.message || "Invalid OTP",
      });

      return false;
    }
  },

  logout: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);

    set({
      email: "",
      user: null,
      plan: null,
      usage: null,
      plans: [],
      access: "",
      refresh: "",
      error: "",
    });
  },
}));