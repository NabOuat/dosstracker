import axios from './axios'

// ================================================================
// Demandes de Signature APFR
// ================================================================

/** POST /apfr/demandes – Créer une demande de signature APFR */
export async function createDemandeAPFR(numeroDemande, agentSpfeiId, dossierIds) {
  try {
    const response = await axios.post('/api/v1/apfr/demandes', {
      numero_demande: numeroDemande,
      agent_spfei_id: agentSpfeiId,
      dossier_ids: dossierIds,
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création de la demande APFR:', error)
    throw error
  }
}

/** GET /apfr/demandes – Lister les demandes APFR */
export async function getDemandesAPFR(statut = null) {
  try {
    const params = {}
    if (statut) params.statut = statut
    
    const response = await axios.get('/api/v1/apfr/demandes', { params })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes APFR:', error)
    throw error
  }
}

/** GET /apfr/demandes/:id – Récupérer une demande APFR spécifique */
export async function getDemandeAPFR(demandeId) {
  try {
    const response = await axios.get(`/api/v1/apfr/demandes/${demandeId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la récupération de la demande APFR ${demandeId}:`, error)
    throw error
  }
}

/** PUT /apfr/demandes/:id – Mettre à jour le statut d'une demande APFR */
export async function updateDemandeAPFR(demandeId, statut) {
  try {
    const response = await axios.put(`/api/v1/apfr/demandes/${demandeId}`, {
      statut,
    })
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la demande APFR ${demandeId}:`, error)
    throw error
  }
}

/** DELETE /apfr/demandes/:id – Supprimer une demande APFR (EN_ATTENTE uniquement) */
export async function deleteDemandeAPFR(demandeId) {
  try {
    const response = await axios.delete(`/api/v1/apfr/demandes/${demandeId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la suppression de la demande APFR ${demandeId}:`, error)
    throw error
  }
}

// ================================================================
// Retour de Conservation
// ================================================================

/** POST /apfr/retour-conservation – Enregistrer un retour de conservation */
export async function createRetourConservation(dossierId, agentId, numTitreFoncier, superficie, referenceCourrier) {
  try {
    const response = await axios.post('/api/v1/apfr/retour-conservation', {
      dossier_id: dossierId,
      agent_retour_conservation_id: agentId,
      num_titre_foncier_conservation: numTitreFoncier,
      superficie_conservation: superficie,
      reference_courier_conservation: referenceCourrier,
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création du retour de conservation:', error)
    throw error
  }
}

/** GET /apfr/retour-conservation/dossier/:id – Récupérer le retour de conservation d'un dossier */
export async function getRetourConservation(dossierId) {
  try {
    const response = await axios.get(`/api/v1/apfr/retour-conservation/dossier/${dossierId}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la récupération du retour de conservation du dossier ${dossierId}:`, error)
    throw error
  }
}
