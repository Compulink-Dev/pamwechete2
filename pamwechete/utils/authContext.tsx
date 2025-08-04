// utils/authContext.tsx
import { User } from "@/types";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SplashScreen, useRouter } from "expo-router";
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
} from "react";
import { Alert } from "react-native";

SplashScreen.preventAutoHideAsync();

type AuthState = {
  isLoggedIn: boolean;
  isReady: boolean;
  isLoading: boolean;
  user: User | null;
  logIn: (email: string, password: string) => Promise<void>;
  register: (
    username: string,
    email: string,
    password: string
  ) => Promise<void>;
  logOut: () => void;
};

const authStorageKey = "auth-key";
const API_URL = "https://pamwechete-server.onrender.com/api/v1/auth"; // Update with your server URL

export const AuthContext = createContext<AuthState>({
  isLoggedIn: false,
  isReady: false,
  isLoading: false,
  user: null,
  logIn: async () => {},
  register: async () => {},
  logOut: () => {},
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  const storeAuthState = async (token: string, userData: any) => {
    try {
      await AsyncStorage.setItem(
        authStorageKey,
        JSON.stringify({ token, user: userData })
      );
    } catch (error) {
      console.log("Error saving auth state", error);
    }
  };

  const logIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      await storeAuthState(data.token, data.user);
      setIsLoggedIn(true);
      setUser({ ...data.user, token: data.token });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Login failed");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (
    username: string,
    email: string,
    password: string
  ) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      await storeAuthState(data.token, data.user);
      setIsLoggedIn(true);
      setUser({ ...data.user, token: data.token });
      router.replace("/");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Registration failed");
      console.error("Registration error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const logOut = async () => {
    try {
      await AsyncStorage.removeItem(authStorageKey);
      setIsLoggedIn(false);
      setUser(null);
      router.replace("/login");
    } catch (error) {
      console.log("Logout error:", error);
    }
  };

  useEffect(() => {
    const getAuthFromStorage = async () => {
      try {
        const value = await AsyncStorage.getItem(authStorageKey);
        if (value !== null) {
          const { token, user } = JSON.parse(value);
          setUser({ ...user, token });

          // Verify token with backend
          const response = await fetch(`${API_URL}/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const userData = await response.json();
            setIsLoggedIn(true);
            setUser({ ...(userData.data || user), token });
          } else {
            await AsyncStorage.removeItem(authStorageKey);
          }
        }
      } catch (error) {
        console.log("Error fetching auth state", error);
      } finally {
        setIsReady(true);
      }
    };

    getAuthFromStorage();
  }, []);

  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  return (
    <AuthContext.Provider
      value={{
        isReady,
        isLoggedIn,
        isLoading,
        user,
        logIn,
        register,
        logOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
