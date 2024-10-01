import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4001", 
  headers: {
    "Content-Type": "application/json", 
  },
});

// Add a request interceptor if needed, e.g., to attach tokens
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add a response interceptor if needed
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle errors globally if needed
    return Promise.reject(error);
  }
);

export default axiosInstance;
