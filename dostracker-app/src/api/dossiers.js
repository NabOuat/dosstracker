import axios from './axios'

/** GET /dossiers – filtre par statut optionnel */
export async function getDossiers(statut, region, search) {
  try {
    const params = {}
    if (statut) params.statut = statut
    if (region) params.region = region
    if (search) params.search = search

    const response = await axios.get('/api/v1/dossiers', { params })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des dossiers:', error)
    throw error
  }
}

/** GET /dossiers/:id */
export async function getDossier(id) {
  try {
    const response = await axios.get(`/api/v1/dossiers/${id}`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la récupération du dossier ${id}:`, error)
    throw error
  }
}

/**
 * Recherche un propriétaire par contact exact. Retourne l'objet ou null.
 */
export async function findProprietaireByContact(contact) {
  try {
    const resp = await axios.get('/api/v1/proprietaires', { params: { search: contact } })
    return (resp.data || []).find(p => p.contact === contact) || null
  } catch {
    return null
  }
}

/** Met à jour le nom d'un propriétaire existant */
export async function updateProprietaireNom(id, nom_complet) {
  const resp = await axios.put(`/api/v1/proprietaires/${id}`, { nom_complet })
  return resp.data
}

/**
 * POST /dossiers – Courrier crée un nouveau dossier.
 * Si forcedProprietaireId est fourni, la recherche/création du propriétaire est court-circuitée.
 */
export async function createDossier({ numero, demandeur, contact, date_enregistrement, region, sous_prefecture, village, departement, numero_cf, forcedProprietaireId = null }) {
  try {
    let proprietaire_id = forcedProprietaireId

    if (!proprietaire_id) {
      try {
        const existing = await axios.get('/api/v1/proprietaires', { params: { search: contact } })
        const found = (existing.data || []).find(p => p.contact === contact)
        if (found) {
          proprietaire_id = found.id
        } else {
          const propResp = await axios.post('/api/v1/proprietaires', { nom_complet: demandeur, contact })
          proprietaire_id = propResp.data.id
        }
      } catch (err) {
        throw new Error('Impossible de créer ou retrouver le propriétaire: ' + (err.response?.data?.detail || err.message))
      }
    }

    // Étape 2 : créer le dossier
    const response = await axios.post('/api/v1/dossiers', {
      numero_dossier: numero,
      date_enregistrement,
      region,
      sous_prefecture: sous_prefecture || null,
      village: village || null,
      departement: departement || null,
      numero_cf: numero_cf || null,
      proprietaire_id,
    })
    return response.data
  } catch (error) {
    console.error('Erreur lors de la création du dossier:', error)
    throw error
  }
}

/**
 * PUT /dossiers/:id/courrier – Courrier met à jour les champs de base d'un dossier
 */
export async function updateDossier(id, { region, sous_prefecture, village, numero_cf }) {
  try {
    const response = await axios.put(`/api/v1/dossiers/${id}/courrier`, {
      region: region || null,
      sous_prefecture: sous_prefecture || null,
      village: village || null,
      numero_cf: numero_cf || null,
    })
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du dossier ${id}:`, error)
    throw error
  }
}

/** PUT /dossiers/:id/spfei-admin – SPFEI renseigne contrôle admin */
export async function updateSpfeiAdmin(id, data) {
  try {
    const response = await axios.put(`/api/v1/dossiers/${id}/spfei-admin`, data)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour SPFEI Admin du dossier ${id}:`, error)
    throw error
  }
}

/** PUT /dossiers/:id/scvaa – SCVAA renseigne contrôle technique */
export async function updateScvaa(id, data) {
  try {
    const response = await axios.put(`/api/v1/dossiers/${id}/scvaa`, data)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour SCVAA du dossier ${id}:`, error)
    throw error
  }
}

/** PUT /dossiers/:id/spfei-titre – SPFEI attribue le titre foncier */
export async function updateSpfeiTitre(id, data) {
  try {
    const response = await axios.put(`/api/v1/dossiers/${id}/spfei-titre`, data)
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la mise à jour SPFEI Titre du dossier ${id}:`, error)
    throw error
  }
}

/** POST /dossiers/:id/resend-sms – Renvoie le SMS de non-conformité */
export async function resendSms(id) {
  try {
    const response = await axios.post(`/api/v1/dossiers/${id}/resend-sms`)
    return response.data
  } catch (error) {
    console.error(`Erreur lors du renvoi du SMS pour le dossier ${id}:`, error)
    throw error
  }
}

/** POST /dossiers/:id/envoyer – Envoyer le dossier au service suivant */
export async function envoyerDossier(id, destination) {
  try {
    const response = await axios.post(`/api/v1/dossiers/${id}/envoyer`, { destination })
    return response.data
  } catch (error) {
    console.error(`Erreur lors de l'envoi du dossier ${id}:`, error)
    throw error
  }
}

/** Fonction spécifique pour envoyer au SPFEI */
export async function envoyerAuSpfei(id) {
  return envoyerDossier(id, 'SPFEI_ADMIN')
}

/** Vérifier si un dossier est encore modifiable par le service Courrier */
export async function isDossierModifiable(id) {
  try {
    const response = await axios.get(`/api/v1/dossiers/${id}/modifiable`)
    return response.data.modifiable
  } catch (error) {
    console.error(`Erreur lors de la vérification de la modifiabilité du dossier ${id}:`, error)
    return false
  }
}

/** Demander des droits spéciaux à l'administrateur */
export async function demanderDroitsAdmin(id, motif) {
  try {
    const response = await axios.post(`/api/v1/dossiers/${id}/demande-droits`, { motif })
    return response.data
  } catch (error) {
    console.error(`Erreur lors de la demande de droits pour le dossier ${id}:`, error)
    throw error
  }
}

/** Obtenir la liste des demandes de droits (admin) */
export async function getDemandesDroits() {
  try {
    const response = await axios.get('/api/v1/admin/demandes-droits')
    return response.data
  } catch (error) {
    console.error('Erreur lors de la récupération des demandes de droits:', error)
    throw error
  }
}

/** Approuver ou rejeter une demande de droits (admin) */
export async function traiterDemandeDroits(demandeId, approuver) {
  try {
    const response = await axios.post(`/api/v1/admin/demandes-droits/${demandeId}/traiter`, { approuver })
    return response.data
  } catch (error) {
    console.error(`Erreur lors du traitement de la demande de droits ${demandeId}:`, error)
    throw error
  }
}
