// src/api/apiClient.js
import axios from 'axios';

// Get the backend URL from your .env file
const baseURL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

const apiClient = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default apiClient;