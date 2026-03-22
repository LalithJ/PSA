// src/services/apiAdapter.ts
import axios from 'axios';
import { mapLaravelUserToSupabaseUser } from './converters';

interface LaravelAuthResponse {
  user: any;
  token: string;
}

interface LaravelUserResponse {
  id: number;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
  last_login_at?: string;
}

// ------------------------
// DYNAMIC API URL FROM ENV
// ------------------------
const API_BASE = "/api";

// ------------------------
// AXIOS INSTANCE
// ------------------------
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    "Accept": "application/json",
    "Content-Type": "application/json"
  }
});

// Store token in memory (with localStorage persistence)
let AUTH_TOKEN: string | null = (typeof window !== 'undefined' && localStorage.getItem('auth_token')) || null;

// Add Bearer token automatically
api.interceptors.request.use((config) => {
  if (AUTH_TOKEN) {
    config.headers.Authorization = `Bearer ${AUTH_TOKEN}`;
  }
  return config;
});

// ------------------------
// FORMAT USER LIKE SUPABASE
// ------------------------
const formatUser = (user: any) => mapLaravelUserToSupabaseUser(user);

// ------------------------
// SUPABASE MIMIC ADAPTER
// ------------------------
const supabase = {
  auth: {
    // --------------------
    // REGISTER
    // --------------------
    signUp: async ({ email, password, options = { data: {} } }: any) => {
      try {
        const response = await api.post<LaravelAuthResponse>("/register", {
          name: options?.data?.name || email.split("@")[0],
          email,
          password,
          password_confirmation: password,
          ...options?.data
        });

        if (!response.data.token) throw new Error("Token missing");

        AUTH_TOKEN = response.data.token;
        if (typeof window !== 'undefined') localStorage.setItem('auth_token', AUTH_TOKEN);

        const user = formatUser(response.data.user);

        return {
          data: {
            user,
            session: {
              access_token: AUTH_TOKEN,
              token_type: "bearer",
              user
            }
          },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null, session: null },
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status || 400
          }
        };
      }
    },

    // --------------------
    // LOGIN
    // --------------------
    signInWithPassword: async ({ email, password }: any) => {
      try {
        const response = await api.post<LaravelAuthResponse>("/login", {
          email,
          password
        });

        if (!response.data.token) throw new Error("Token missing");

        AUTH_TOKEN = response.data.token;
        if (typeof window !== 'undefined') localStorage.setItem('auth_token', AUTH_TOKEN);

        const user = formatUser(response.data.user);

        return {
          data: {
            user,
            session: {
              access_token: AUTH_TOKEN,
              token_type: "bearer",
              user
            }
          },
          error: null
        };
      } catch (error: any) {
        return {
          data: { user: null, session: null },
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    },

    // --------------------
    // LOGOUT
    // --------------------
    signOut: async () => {
      try {
        await api.post("/logout");
        AUTH_TOKEN = null;
        if (typeof window !== 'undefined') localStorage.removeItem('auth_token');
        return { error: null };
      } catch (error: any) {
        return {
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    },

    // --------------------
    // GET LOGGED USER
    // --------------------
    getSession: async () => {
      try {
        if (!AUTH_TOKEN) {
          return { data: { session: null }, error: null };
        }

        const response = await api.get<any>("/user/profile");
        const rawUser = response?.data?.user ?? response?.data;
        const user = formatUser(rawUser);

        return {
          data: {
            session: {
              user,
              access_token: AUTH_TOKEN,
              token_type: "bearer"
            }
          },
          error: null
        };
      } catch (error: any) {
        return {
          data: { session: null },
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    },

    // --------------------
    // UPDATE USER PROFILE
    // --------------------
    updateUserProfile: async (payload: any) => {
      try {
        const response = await api.put('/user/profile', payload);
        const rawUser = response?.data?.user ?? response?.data;
        const user = formatUser(rawUser);
        return { data: { user }, error: null };
      } catch (error: any) {
        return {
          data: { user: null },
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    },

    // --------------------
    // UPDATE USER SUBSCRIPTION
    // --------------------
    updateUserSubscription: async (plan: string) => {
      try {
        const response = await api.put('/user/subscription', { plan });
        const rawUser = response?.data?.user ?? response?.data;
        const user = formatUser(rawUser);
        return { data: { user }, error: null };
      } catch (error: any) {
        return {
          data: { user: null },
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    }
  },

  // --------------------
  // DATABASE MIMIC
  // --------------------
  from: (table: string) => ({
    select: () => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const res = await api.get(`/${table}?${column}=${value}`);
            return { data: res.data, error: null };
          } catch (error: any) {
            return {
              data: null,
              error: {
                message: error.response?.data?.message || error.message,
                status: error.response?.status
              }
            };
          }
        }
      })
    }),

    insert: async (data: any) => {
      try {
        const res = await api.post(`/${table}`, data);
        return { data: res.data, error: null };
      } catch (error: any) {
        return {
          data: null,
          error: {
            message: error.response?.data?.message || error.message,
            status: error.response?.status
          }
        };
      }
    },

    update: (data: any) => ({
      eq: (column: string, value: any) => ({
        single: async () => {
          try {
            const res = await api.put(`/${table}/${value}`, data);
            return { data: res.data, error: null };
          } catch (error: any) {
            return {
              data: null,
              error: {
                message: error.response?.data?.message || error.message,
                status: error.response?.status
              }
            };
          }
        }
      })
    })
  })
};

export default supabase;