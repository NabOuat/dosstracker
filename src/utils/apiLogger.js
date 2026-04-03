import logger from './logger';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Créer une instance axios avec intercepteurs pour le logging
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000
});

// Intercepteur pour les requêtes
apiClient.interceptors.request.use(
  (config) => {
    logger.debug(`[API REQUEST] ${config.method.toUpperCase()} ${config.url}`, {
      headers: config.headers,
      data: config.data
    });
    return config;
  },
  (error) => {
    logger.error(`[API REQUEST ERROR] ${error.message}`, error);
    return Promise.reject(error);
  }
);

// Intercepteur pour les réponses
apiClient.interceptors.response.use(
  (response) => {
    logger.debug(`[API RESPONSE] ${response.status} ${response.config.url}`, {
      data: response.data
    });
    return response;
  },
  (error) => {
    const message = error.response?.data?.detail || error.message;
    const status = error.response?.status;
    
    logger.error(`[API ERROR] ${status} ${error.config?.url}`, {
      message,
      status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

export default apiClient;
