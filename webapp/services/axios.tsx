import axios from "axios";
import { auth } from "./firebase";
import { User } from "firebase/auth"; 
import { onAuthStateChanged } from "firebase/auth";

// Axios instance setup
const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
});

// Add a request interceptor to include Firebase Auth token
axiosInstance.interceptors.request.use(
    async (config) => {
        
      // Wait for the authentication state to resolve
      const user = await new Promise<User | null>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          unsubscribe(); // Unsubscribe from state change listener
          resolve(user); // Return the user object
        });
      });
  
      if (user) {
        const token = await user.getIdToken(); // Get Firebase token
        config.headers.Authorization = `Bearer ${token}`; // Add token to headers
      }
  
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );
  
export default axiosInstance;
