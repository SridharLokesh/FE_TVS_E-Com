import { useState, useCallback } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const USER_KEY = "shopeasy_user";

export function useAuth() {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const isLoggedIn = !!user;
  const isAdmin = user?.role === "admin";

  /* ── LOGIN — returns user object so callers can redirect ── */
  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      setUser(data);
      toast.success(`Welcome back, ${data.name}! 👋`);
      return data; // ← caller uses this for role-based redirect
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Check your credentials.";
      toast.error(msg);
      return null; // ← caller checks for null
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── REGISTER ── */
  const register = useCallback(async (name, email, password, phone) => {
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        phone,
      });
      localStorage.setItem(USER_KEY, JSON.stringify(data));
      setUser(data);
      toast.success(`Account created! Welcome, ${data.name}! 🎉`);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      toast.error(msg);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── LOGOUT ── */
  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    toast.success("Logged out successfully");
  }, []);

  /* ── UPDATE USER in localStorage after profile edit ── */
  const updateUser = useCallback(
    (updatedData) => {
      const merged = { ...user, ...updatedData };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      setUser(merged);
    },
    [user],
  );

  return {
    user,
    loading,
    isLoggedIn,
    isAdmin,
    login,
    register,
    logout,
    updateUser,
  };
}
