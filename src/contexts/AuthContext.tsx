import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { User, SubscriptionPlan, SupabaseError } from "../types";
import supabase from "../services/apiAdapter";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  updateSubscription: (planId: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Expose setUser for manual updates after profile/subscription changes
  loading: boolean;
  updateUser: (rawApiUser: any) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// HELPER: Map the raw metadata suitcase to our clean TypeScript Types
export const mapUserFromMetadata = (apiUser: any): User => {
  const md = apiUser.user_metadata || {};

  return {
    id: String(apiUser.id),
    email: apiUser.email || "",
    firstName: md.first_name || apiUser.first_name || "",
    lastName: md.last_name || apiUser.last_name || "",

    // CHANGE THIS LINE: Look in metadata first (where the adapter puts it)
    remainingSearches: Number(
      md.remaining_searches ?? apiUser.remaining_searches ?? 0,
    ),
    // 2. Look at ROOT first (Laravel style), then fallback to Metadata
    remainingMonthlyCredits: Number(
      md.monthly_credits ?? apiUser.monthly_credits ?? 0,
    ),
    topupCredits: Number(md.topup_credits ?? apiUser.topup_credits ?? 0),

    // 3. Plan Mapping (Laravel sends it at root as 'plan')
    subscriptionPlan: {
      id: String(apiUser.plan?.id || md.plan?.id || "1"),
      slug: apiUser.plan?.slug || md.plan?.slug || "free",
      name: apiUser.plan?.name || md.plan?.name || "Free",
      monthlyCreditLimit: Number(
        apiUser.plan?.monthly_credits || md.plan?.monthly_credits || 0,
      ),
      searchLimit: Number(
        apiUser.plan?.search_limit || md.plan?.search_limit || 0,
      ),
      isActive: Boolean(apiUser.plan?.is_active ?? md.plan?.is_active ?? true),
      price: Number(apiUser.plan?.price || md.plan?.price || 0),
      features: apiUser.plan?.features || md.plan?.features || [],
      currency: "USD",
    },

    // ... rest of your mapping
    user_metadata: md,
    createdAt: new Date(apiUser.created_at || Date.now()),
    lastLoginAt: new Date(apiUser.last_login_at || Date.now()),
    role: apiUser.role || "user",
  };
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const updateUser = (rawApiUser: any) => {
    if (!rawApiUser) return;

    // Use your existing mapper
    const mappedUser = mapUserFromMetadata(rawApiUser);

    // Update state and persistence in one shot
    setUser(mappedUser);
    localStorage.setItem("user", JSON.stringify(mappedUser));
  };

  useEffect(() => {
    const initAuth = async () => {
      // 1. Try to load from localStorage first for instant UI
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("user");
        }
      }

      // 2. CRITICAL: Verify the session with the backend
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) {
          // If the token is expired or invalid, clear everything
          setUser(null);
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
        } else {
          // If valid, update the state with the fresh user data from Laravel
          const mappedUser = mapUserFromMetadata(data.session.user);
          setUser(mappedUser);
          localStorage.setItem("user", JSON.stringify(mappedUser));
        }
      } catch (err) {
        console.error("Auth verification failed", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const err = error as SupabaseError;
        const errorObj = new Error(err.message || "Login failed") as any;
        errorObj.status = err.status;
        throw errorObj;
      }

      if (!data?.session?.user) throw new Error("No session data received");

      const mappedUser = mapUserFromMetadata(data.session.user);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
    } catch (error: any) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
          },
        },
      });

      if (error) throw new Error(error.message || "Registration failed");
      if (!data?.user) throw new Error("No user data received");

      // We trust the Laravel response even for new users
      const mappedUser = mapUserFromMetadata(data.user);
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    if (!user) return;
    setLoading(true);
    try {
      const payload = {
        first_name: profileData.firstName ?? user.firstName,
        last_name: profileData.lastName ?? user.lastName,
        phone: profileData.phone ?? user.phone,
        location: profileData.location ?? user.location,
        bio: profileData.bio ?? user.bio,
        avatar_url: profileData.avatar ?? user.avatar,
      };

      const { data, error } = await (supabase as any).auth.updateUserProfile(
        payload,
      );
      if (error) throw error;

      const updatedUser = mapUserFromMetadata(data.user);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateSubscription = async (planId: string) => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await (
        supabase as any
      ).auth.updateUserSubscription(planId);
      if (error) throw error;
      const userDataFromBackend = data.data || data.user || data;
      const updatedUser = mapUserFromMetadata(userDataFromBackend);

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Subscription update failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    setUser,
    login,
    register,
    logout,
    updateProfile,
    updateSubscription,
    loading,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
