import axios from 'axios';

export const LOCAL_SCRAPPER_URL = 'http://localhost:8000/';
export const SCRAPPER_URL = import.meta.env.VITE_SCRAPPER_URL || LOCAL_SCRAPPER_URL;

const apiScrapperClient = axios.create({
  baseURL: SCRAPPER_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export default apiScrapperClient;