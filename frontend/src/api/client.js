import axios from "axios";

const client = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
});

client.interceptors.request.use((config) => {
  const password = localStorage.getItem("app_password");
  if (password) {
    config.headers["x-app-password"] = password;
  }
  return config;
});

export default client;
