import axios from 'axios';

const apiScrapperClient = axios.create({
  baseURL: import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json'
  },
});

export default apiScrapperClient;