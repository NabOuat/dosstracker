/**
 * Fichier de debug pour tester la réponse de l'API d'authentification
 */
import axios from './axios'
import logger from '../utils/logger'

export async function testLoginResponse() {
  logger.info('Test de la réponse de login')
  try {
    const formData = new URLSearchParams()
    formData.append('username', 'admin')
    formData.append('password', 'admin2026')
    
    logger.debug('Envoi de la requête de test')
    const response = await axios.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    logger.info('Réponse brute reçue', { 
      status: response.status,
      data: response.data,
      keys: Object.keys(response.data)
    })
    
    // Vérifier la structure
    if (response.data.access_token) {
      logger.info('✓ access_token présent')
    } else {
      logger.warn('✗ access_token manquant')
    }
    
    if (response.data.username) {
      logger.info('✓ username présent')
    } else {
      logger.warn('✗ username manquant')
    }
    
    if (response.data.user_id) {
      logger.info('✓ user_id présent')
    } else {
      logger.warn('✗ user_id manquant')
    }
    
    return response.data
  } catch (error) {
    logger.error('Erreur lors du test', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    })
    throw error
  }
}
