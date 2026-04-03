/**
 * API Auth - Appels API réels vers le backend
 */
import axios from './axios'
import logger from '../utils/logger'

/**
 * POST /auth/login
 * @returns {{ token: string, user: object }}
 */
export async function loginApi(username, password) {
  logger.debug('loginApi appelée', { username })
  try {
    const formData = new URLSearchParams()
    formData.append('username', username)
    formData.append('password', password)
    
    logger.debug('Envoi de la requête POST /api/v1/auth/login', { username })
    const response = await axios.post('/api/v1/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    
    logger.info('Réponse réussie de /v1/auth/login', { 
      username,
      userId: response.data.user_id 
    })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Nom d\'utilisateur ou mot de passe incorrect.'
    logger.error('Erreur lors de loginApi', {
      username,
      status: error.response?.status,
      message: errorMessage,
      fullError: error.message
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/logout
 */
export async function logoutApi() {
  logger.debug('logoutApi appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/logout')
    const response = await axios.post('/api/v1/auth/logout')
    logger.info('Déconnexion réussie')
    return response.data
  } catch (error) {
    logger.warn('Erreur lors de la déconnexion (ignorée)', {
      status: error.response?.status,
      message: error.message
    })
    return { ok: true }
  }
}

/**
 * POST /auth/forgot-password
 * Demande de réinitialisation de mot de passe
 * @param {string} email - Email de l'utilisateur
 */
export async function forgotPasswordApi(email) {
  logger.debug('forgotPasswordApi appelée', { email })
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/forgot-password', { email })
    const response = await axios.post('/api/v1/auth/forgot-password', { email })
    logger.info('Demande de réinitialisation envoyée avec succès', { email })
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors de la demande de réinitialisation.'
    logger.error('Erreur lors de forgotPasswordApi', {
      email,
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/validate-reset-token
 * Valide un token de réinitialisation
 * @param {string} token - Token de réinitialisation
 */
export async function validateResetTokenApi(token) {
  logger.debug('validateResetTokenApi appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/validate-reset-token')
    const response = await axios.post('/api/v1/auth/validate-reset-token', { token })
    logger.info('Token validé avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Token invalide ou expiré.'
    logger.error('Erreur lors de validateResetTokenApi', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /auth/reset-password
 * Réinitialise le mot de passe
 * @param {string} token - Token de réinitialisation
 * @param {string} newPassword - Nouveau mot de passe
 */
export async function resetPasswordApi(token, newPassword) {
  logger.debug('resetPasswordApi appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/auth/reset-password')
    const response = await axios.post('/api/v1/auth/reset-password', {
      token,
      new_password: newPassword
    })
    logger.info('Mot de passe réinitialisé avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors de la réinitialisation du mot de passe.'
    logger.error('Erreur lors de resetPasswordApi', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}
