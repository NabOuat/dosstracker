/**
 * API Utilisateurs - Gestion des profils et paramètres
 */
import axios from './axios'
import logger from '../utils/logger'

/**
 * GET /users/me - Récupérer le profil de l'utilisateur connecté
 */
export async function getUserProfile() {
  logger.debug('getUserProfile appelée')
  try {
    logger.debug('Envoi de la requête GET /api/v1/users/me')
    const response = await axios.get('/api/v1/users/me')
    logger.info('Profil utilisateur récupéré avec succès')
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la récupération du profil', {
      status: error.response?.status,
      message: error.message
    })
    throw error
  }
}

/**
 * PUT /users/me - Mettre à jour le profil de l'utilisateur connecté
 */
export async function updateUserProfile(profileData) {
  logger.debug('updateUserProfile appelée', { data: profileData })
  try {
    logger.debug('Envoi de la requête PUT /api/v1/users/me')
    const response = await axios.put('/api/v1/users/me', profileData)
    logger.info('Profil utilisateur mis à jour avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors de la mise à jour du profil'
    logger.error('Erreur lors de la mise à jour du profil', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * POST /users/change-password - Changer le mot de passe
 */
export async function changePassword(currentPassword, newPassword) {
  logger.debug('changePassword appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/users/change-password')
    const response = await axios.post('/api/v1/users/change-password', {
      current_password: currentPassword,
      new_password: newPassword
    })
    logger.info('Mot de passe changé avec succès')
    return response.data
  } catch (error) {
    const errorMessage = error.response?.data?.detail || 'Erreur lors du changement de mot de passe'
    logger.error('Erreur lors du changement de mot de passe', {
      status: error.response?.status,
      message: errorMessage
    })
    throw new Error(errorMessage)
  }
}

/**
 * GET /users/preferences - Récupérer les préférences de l'utilisateur
 */
export async function getUserPreferences() {
  logger.debug('getUserPreferences appelée')
  try {
    logger.debug('Envoi de la requête GET /api/v1/users/preferences')
    const response = await axios.get('/api/v1/users/preferences')
    logger.info('Préférences utilisateur récupérées')
    return response.data
  } catch (error) {
    logger.warn('Erreur lors de la récupération des préférences (utilisation des valeurs par défaut)', {
      status: error.response?.status,
      message: error.message
    })
    return null
  }
}

/**
 * PUT /users/preferences - Mettre à jour les préférences de l'utilisateur
 */
export async function updateUserPreferences(preferences) {
  logger.debug('updateUserPreferences appelée', { preferences })
  try {
    logger.debug('Envoi de la requête PUT /api/v1/users/preferences')
    const response = await axios.put('/api/v1/users/preferences', preferences)
    logger.info('Préférences utilisateur mises à jour')
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la mise à jour des préférences', {
      status: error.response?.status,
      message: error.message
    })
    throw error
  }
}

/**
 * GET /users/first-login/check - Vérifier si c'est la première connexion
 */
export async function checkFirstLogin() {
  logger.debug('checkFirstLogin appelée')
  try {
    logger.debug('Envoi de la requête GET /api/v1/users/first-login/check')
    const response = await axios.get('/api/v1/users/first-login/check')
    logger.info('Vérification de la première connexion complétée', { 
      isFirstLogin: response.data.is_first_login 
    })
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la vérification de la première connexion', {
      status: error.response?.status,
      message: error.message
    })
    throw error
  }
}

/**
 * POST /users/first-login/complete - Marquer la première connexion comme complétée
 */
export async function completeFirstLogin() {
  logger.debug('completeFirstLogin appelée')
  try {
    logger.debug('Envoi de la requête POST /api/v1/users/first-login/complete')
    const response = await axios.post('/api/v1/users/first-login/complete')
    logger.info('Première connexion marquée comme complétée')
    return response.data
  } catch (error) {
    logger.error('Erreur lors du marquage de la première connexion', {
      status: error.response?.status,
      message: error.message
    })
    throw error
  }
}

// ── Admin : gestion des utilisateurs ──────────────────────────────────────────

/**
 * GET /users - Liste tous les utilisateurs (admin uniquement)
 */
export async function getUsers() {
  try {
    const response = await axios.get('/api/v1/users')
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la récupération des utilisateurs', { message: error.message })
    throw error
  }
}

/**
 * POST /users - Crée un nouvel utilisateur (admin uniquement)
 */
export async function createUser(data) {
  try {
    const response = await axios.post('/api/v1/users', data)
    return response.data
  } catch (error) {
    logger.error('Erreur lors de la création de l\'utilisateur', { message: error.message })
    throw error
  }
}

/**
 * PUT /users/:id - Met à jour un utilisateur (admin uniquement)
 */
export async function updateUser(id, data) {
  try {
    const response = await axios.put(`/api/v1/users/${id}`, data)
    return response.data
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour de l'utilisateur ${id}`, { message: error.message })
    throw error
  }
}
