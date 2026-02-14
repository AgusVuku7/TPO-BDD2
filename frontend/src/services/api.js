import axios from 'axios';

const api = axios.create({
  // La URL que definimos en el docker-compose para desarrollo
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

export default api;