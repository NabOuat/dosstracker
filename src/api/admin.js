import axios from './axios'

// ── Dossiers ──────────────────────────────────────────────────────────────────

/** POST /admin/dossiers/:id/reinitialiser – remet un dossier à un statut antérieur */
export async function reinitialiserDossier(id, data) {
  const response = await axios.post(`/api/v1/admin/dossiers/${id}/reinitialiser`, data)
  return response.data
}

/** DELETE /admin/dossiers/:id – supprime définitivement un dossier */
export async function supprimerDossier(id, motif) {
  const response = await axios.delete(`/api/v1/admin/dossiers/${id}`, { params: { motif } })
  return response.data
}

// ── Journal d'activité ────────────────────────────────────────────────────────

/** GET /admin/journal – journal du workflow avec filtres optionnels */
export async function getJournal({ skip = 0, limit = 30, user_id, date_debut, date_fin } = {}) {
  const params = { skip, limit }
  if (user_id)    params.user_id    = user_id
  if (date_debut) params.date_debut = date_debut
  if (date_fin)   params.date_fin   = date_fin
  const response = await axios.get('/api/v1/admin/journal', { params })
  return response.data
}

// ── Statistiques ──────────────────────────────────────────────────────────────

/** GET /admin/stats/agents – productivité par agent */
export async function getAgentStats() {
  const response = await axios.get('/api/v1/admin/stats/agents')
  return response.data
}

// ── Services ──────────────────────────────────────────────────────────────────

/** GET /admin/services – liste des services */
export async function getAdminServices() {
  const response = await axios.get('/api/v1/admin/services')
  return response.data
}

/** PUT /admin/services/:id – met à jour le libellé d'un service */
export async function updateService(id, data) {
  const response = await axios.put(`/api/v1/admin/services/${id}`, data)
  return response.data
}

// ── Configuration système ─────────────────────────────────────────────────────

/** GET /admin/config – configuration système */
export async function getConfig() {
  const response = await axios.get('/api/v1/admin/config')
  return response.data
}

/** PUT /admin/config – met à jour la configuration système */
export async function updateConfig(data) {
  const response = await axios.put('/api/v1/admin/config', data)
  return response.data
}

// ── Motifs de non-conformité ──────────────────────────────────────────────────

/** GET /admin/motifs – liste des motifs */
export async function getMotifs() {
  const response = await axios.get('/api/v1/admin/motifs')
  return response.data
}

/** POST /admin/motifs – crée un motif */
export async function createMotif(data) {
  const response = await axios.post('/api/v1/admin/motifs', data)
  return response.data
}

/** DELETE /admin/motifs/:id – supprime un motif */
export async function deleteMotif(id) {
  const response = await axios.delete(`/api/v1/admin/motifs/${id}`)
  return response.data
}
