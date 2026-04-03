import axios from './axios';

/**
 * Récupère l'historique des SMS avec filtres optionnels
 * @param {Object} filters - Filtres optionnels (dossier_id, type_sms, statut)
 * @param {number} skip - Nombre d'éléments à sauter (pagination)
 * @param {number} limit - Nombre maximum d'éléments à retourner
 * @returns {Promise<Array>} Liste des SMS
 */
export async function getSmsHistory(filters = {}, skip = 0, limit = 100) {
  try {
    const params = { skip, limit, ...filters };
    const response = await axios.get('/api/v1/sms', { params });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique SMS:', error);
    throw error;
  }
}

/**
 * Récupère les SMS pour un dossier spécifique
 * @param {string} dossierId - ID du dossier
 * @returns {Promise<Array>} Liste des SMS pour le dossier
 */
export async function getSmsForDossier(dossierId) {
  try {
    const response = await axios.get(`/api/v1/sms/dossier/${dossierId}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des SMS pour le dossier ${dossierId}:`, error);
    throw error;
  }
}

/**
 * Envoie un SMS
 * @param {Object} smsData - Données du SMS à envoyer
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendSms(smsData) {
  try {
    const response = await axios.post('/api/v1/sms', smsData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du SMS:', error);
    throw error;
  }
}

/**
 * Renvoie un SMS existant
 * @param {string} smsId - ID du SMS à renvoyer
 * @returns {Promise<Object>} Résultat du renvoi
 */
export async function resendSms(smsId) {
  try {
    const response = await axios.post(`/api/v1/sms/${smsId}/resend`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors du renvoi du SMS ${smsId}:`, error);
    throw error;
  }
}

/**
 * Envoie un code de vérification via Twilio Verify
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} channel - Canal d'envoi ('sms' ou 'call')
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendVerificationCode(phoneNumber, channel = 'sms') {
  try {
    const response = await axios.post('/api/v1/sms/send-verification', {
      phone_number: phoneNumber,
      channel
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi du code de vérification:', error);
    throw error;
  }
}

/**
 * Vérifie un code de vérification
 * @param {string} phoneNumber - Numéro de téléphone
 * @param {string} code - Code de vérification
 * @returns {Promise<Object>} Résultat de la vérification
 */
export async function checkVerificationCode(phoneNumber, code) {
  try {
    const response = await axios.post('/api/v1/sms/check-verification', {
      phone_number: phoneNumber,
      code
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    throw error;
  }
}

/**
 * Envoie une notification SMS basée sur un type prédéfini
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} notificationType - Type de notification ('non_conforme', 'finalise', etc.)
 * @param {Object} context - Données contextuelles pour personnaliser le message
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendNotification(phoneNumber, notificationType, context) {
  try {
    const response = await axios.post('/api/v1/sms/send-notification', {
      phone_number: phoneNumber,
      notification_type: notificationType,
      context
    });
    return response.data;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de la notification:', error);
    throw error;
  }
}

/**
 * Envoie une notification de non-conformité
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} numeroDossier - Numéro du dossier
 * @param {Array<string>} motifs - Liste des motifs d'inconformité
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendNonConformeNotification(phoneNumber, numeroDossier, motifs) {
  return sendNotification(phoneNumber, 'non_conforme', {
    numero: numeroDossier,
    motifs: motifs.join(', ')
  });
}

/**
 * Envoie une notification de finalisation de dossier
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} numeroDossier - Numéro du dossier
 * @param {string} numeroTitre - Numéro du titre foncier
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendFinaliseNotification(phoneNumber, numeroDossier, numeroTitre) {
  return sendNotification(phoneNumber, 'finalise', {
    numero: numeroDossier,
    titre: numeroTitre
  });
}

/**
 * Envoie une notification de progression de dossier
 * @param {string} phoneNumber - Numéro de téléphone du destinataire
 * @param {string} numeroDossier - Numéro du dossier
 * @param {string} service - Nom du service traitant le dossier
 * @returns {Promise<Object>} Résultat de l'envoi
 */
export async function sendProgressNotification(phoneNumber, numeroDossier, service) {
  return sendNotification(phoneNumber, 'en_cours', {
    numero: numeroDossier,
    service: service
  });
}
