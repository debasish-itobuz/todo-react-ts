import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:4001", // Set your base URL here
  headers: {
    "Content-Type": "application/json", // Common headers if needed
  },
});

// Add a request interceptor if needed, e.g., to attach tokens
axiosInstance.interceptors.request.use(
  (config) => {
    // console.log("config", localStorage.getItem("token"));
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
