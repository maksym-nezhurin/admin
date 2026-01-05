import axios from 'axios';

const SCRAPPER_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000/';

const apiScrapperClient = axios.create({
  baseURL: SCRAPPER_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export default apiScrapperClient;