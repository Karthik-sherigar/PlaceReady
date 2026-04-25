import { createContext, useContext, useState, useEffect } from "react";
import { loginAdmin as apiLogin, registerAdmin as apiRegister, logoutAdmin as apiLogout, getAdminMe } from "../services/adminAuthService";

const AdminAuthContext = createContext(null);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider");
  }
  return context;
};

export const AdminAuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("adminToken");
      if (token) {
        try {
          const adminData = await getAdminMe();
          setAdmin(adminData);
        } catch {
          apiLogout();
          setAdmin(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const loginAdmin = async (credentials) => {
    const data = await apiLogin(credentials);
    setAdmin(data);
    return data;
  };

  const registerAdmin = async (adminData) => {
    const data = await apiRegister(adminData);
    setAdmin(data);
    return data;
  };

  const logoutAdmin = () => {
    apiLogout();
    setAdmin(null);
  };

  const isAdminAuthenticated = !!admin;

  return (
    <AdminAuthContext.Provider
      value={{ admin, loginAdmin, registerAdmin, logoutAdmin, isAdminAuthenticated, loading }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
