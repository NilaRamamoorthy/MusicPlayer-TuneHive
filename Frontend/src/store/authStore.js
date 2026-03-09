import { create } from "zustand";
import { authApi } from "../lib/api";
import { usePlayerStore } from "./playerStore";
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
    set({ loading: true, error: "" });
    try {
      await authApi.sendOtp(email);
      set({ email, loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e.message || "Failed to send OTP" });
      return false;
    }
  },

  verifyOtp: async (email, otp) => {
    set({ loading: true, error: "" });
    try {
      const data = await authApi.verifyOtp(email, otp);

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
    } catch (e) {
      set({ loading: false, error: e.message || "Invalid OTP" });
      return false;
    }
  },

  loadMe: async () => {
    const token = get().access;
    if (!token) return;

    set({ loading: true, error: "" });
    try {
      const me = await authApi.me(token);
      set({
        user: { id: me.id, email: me.email },
        plan: me.plan,
        usage: me.usage,
        loading: false,
      });
    } catch {
      get().logout();
    }
  },

  fetchPlans: async () => {
    set({ loading: true, error: "" });
    try {
      const plans = await authApi.plans();
      set({ plans, loading: false });
      return plans;
    } catch (e) {
      set({ loading: false, error: e.message || "Failed to load plans" });
      return [];
    }
  },

  upgradePlan: async (planName) => {
    const token = get().access;
    if (!token) return false;

    set({ loading: true, error: "" });
    try {
      await authApi.upgradeSubscription(token, planName);
      await get().loadMe();
      set({ loading: false });
      return true;
    } catch (e) {
      set({ loading: false, error: e.message || "Failed to upgrade plan" });
      return false;
    }
  },

 logout: () => {
  usePlayerStore.getState().clearQueue();

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