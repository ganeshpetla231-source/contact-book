import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const defaultAuthValue = {
  user: null,
  token: null,
  loading: false,
  register: async () => null,
  login: async () => null,
  logout: () => {},
  me: async () => null,
  updateProfilePhoto: async () => null,
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(token));

  const persistSession = (session) => {
    localStorage.setItem("token", session.token);
    setToken(session.token);
    setUser(session.user);
  };

  const register = async (values) => {
    const { data } = await api.post("/auth/register", values);
    persistSession(data);
    return data;
  };

  const login = async (values) => {
    const { data } = await api.post("/auth/login", values);
    persistSession(data);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  const me = async () => {
    const { data } = await api.get("/auth/me");
    setUser(data.user);
    return data.user;
  };

  const updateProfilePhoto = async (photo) => {
    const { data } = await api.patch("/auth/profile", { photo });
    setUser(data.user);
    return data.user;
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }
    me().catch(logout).finally(() => setLoading(false));
  }, [token]);

  return <AuthContext.Provider value={{ user, token, loading, register, login, logout, me, updateProfilePhoto }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext) ?? defaultAuthValue;
}
