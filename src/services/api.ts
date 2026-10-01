import axios from 'axios';
import { store } from '../Redux/store';


const url=process.env.NEXT_PUBLIC_API_URL;
const API = axios.create({
baseURL:`${url}/api/v1/`, // root API (auth -> /auth/*, posts -> /posts)
withCredentials: true, // set true if you use cookies
});


// Add token on every request
API.interceptors.request.use((config) => {
const state = store.getState();
  const token = state.auth?.token || localStorage.getItem('token');

if (token) {
config.headers = config.headers ?? {};
config.headers.Authorization = `Bearer ${token}`;
}
return config;
});


// Optional: central error/log handling
API.interceptors.response.use(
(res) => res,
(error) => {
// Example: auto-logout on 401
if (error?.response?.status === 401) {
// localStorage.removeItem('token');
// window.location.href = '/login';
}
return Promise.reject(error);
}
);


export default API;



// import axios from "axios";

// const API = axios.create({
//   baseURL: "http://localhost:5000/api/auth", // your backend URL
// });

// // Add token automatically for protected routes
// API.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// export const signup = (name: string, phone: string) => API.post("/signup", { name, phone });
// export const login = (phone: string) => API.post("/login", { phone });
// export const sendOtp = (phone: string) => API.post("/send-otp", { phone });
// export const verifyOtp = (phone: string, otp: string) => API.post("/verify-otp", { phone, otp });

// export const getProfile = () => API.get("/profile");
// export const updateProfile = (name: string) => API.put("/profile", { name });
