import axios from "axios";

const API_URL = "/api/admin/auth";

export const registerAdmin = async (adminData) => {
  const response = await axios.post(`${API_URL}/register`, adminData);
  if (response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
    localStorage.setItem("admin", JSON.stringify(response.data));
  }
  return response.data;
};

export const loginAdmin = async (credentials) => {
  const response = await axios.post(`${API_URL}/login`, credentials);
  if (response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
    localStorage.setItem("admin", JSON.stringify(response.data));
  }
  return response.data;
};

export const getAdminMe = async () => {
  const token = localStorage.getItem("adminToken");
  const response = await axios.get(`${API_URL}/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

export const logoutAdmin = () => {
  localStorage.removeItem("adminToken");
  localStorage.removeItem("admin");
};
