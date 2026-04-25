import axios from "axios";

const API_URL = "/api/companies";

const getHeaders = () => {
  const token = localStorage.getItem("token");
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const getStudentCompanies = async () => {
  const response = await axios.get(API_URL, getHeaders());
  return response.data;
};
