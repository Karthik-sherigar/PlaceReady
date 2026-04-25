import { createContext, useContext, useState, useEffect } from "react";
import { loginUser, registerUser, logoutUser, getMe } from "../services/authService";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch {
          logoutUser();
          setUser(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    setUser(data);
    return data;
  };

  const register = async (userData) => {
    const data = await registerUser(userData);
    setUser(data);
    return data;
  };

  const logout = () => {
    logoutUser();
    setUser(null);
  };

  const updateUserCollege = (collegeId, collegeName, inviteCode) => {
    setUser((prev) => ({
      ...prev,
      collegeId,
      collegeName,
      inviteCode
    }));
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, updateUserCollege, isAuthenticated, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};
