import axios from "axios";

const API_URL = "/api/admin";

const getHeaders = () => {
  const token = localStorage.getItem("adminToken");
  return { headers: { Authorization: `Bearer ${token}` } };
};

// Dashboard Stats
export const getAdminStats = async () => {
  const response = await axios.get(`${API_URL}/stats`, getHeaders());
  return response.data;
};

// Companies CRUD
export const getAdminCompanies = async () => {
  const response = await axios.get(`${API_URL}/companies`, getHeaders());
  return response.data;
};

export const createCompany = async (companyData) => {
  const response = await axios.post(`${API_URL}/companies`, companyData, getHeaders());
  return response.data;
};

export const updateCompany = async (id, companyData) => {
  const response = await axios.put(`${API_URL}/companies/${id}`, companyData, getHeaders());
  return response.data;
};

export const deleteCompany = async (id) => {
  const response = await axios.delete(`${API_URL}/companies/${id}`, getHeaders());
  return response.data;
};

export const toggleCompanyStatus = async (id) => {
  const response = await axios.patch(`${API_URL}/companies/${id}/toggle-status`, {}, getHeaders());
  return response.data;
};
