import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Check, X, AlertTriangle, FileText, Clock, User, Shield,
  Users, UserPlus, Edit2, ToggleLeft, ToggleRight, Search,
  FolderOpen, RotateCcw, Trash2, BookOpen, BarChart2, Settings,
  Plus, RefreshCw,
} from 'lucide-react'
import { getDossiers, getDemandesDroits, traiterDemandeDroits, getDossier } from '../api/dossiers'
import { getUsers, createUser, updateUser } from '../api/users'
import {
  reinitialiserDossier, supprimerDossier,
  getJournal, getAgentStats,
  getAdminServices, updateService,
  getConfig, updateConfig,
  getMotifs, createMotif, deleteMotif,
} from '../api/admin'
import Button from '../components/ui/Button'
import Alert  from '../components/ui/Alert'
import Input  from '../components/ui/Input'

const SERVICES = [
  { id: 1, libelle: 'Service Courrier' },
  { id: 2, libelle: 'SPFEI' },
  { id: 3, libelle: 'SCVAA' },
  { id: 4, libelle: 'Administration' },
]

const SERVICE_COLORS = {
  1: { bg: '#EFF6FF', color: '#1E40AF' },
  2: { bg: 'var(--ci-orange-pale)', color: 'var(--ci-orange-dark)' },
  3: { bg: 'var(--ci-green-pale)',  color: 'var(--ci-green-dark)' },
  4: { bg: '#F5F3FF', color: '#5B21B6' },
}

const STATUT_LABELS = {
  COURRIER: 'Courrier', SPFEI_ADMIN: 'SPFEI Admin',
  SCVAA: 'SCVAA', NON_CONFORME: 'Non Conforme',
  SPFEI_TITRE: 'SPFEI Titre', CONSERVATION: 'Conservation',
}

const STATUT_COLORS = {
  COURRIER:     { bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
  SPFEI_ADMIN:  { bg: 'var(--ci-orange-pale)', color: 'var(--ci-orange-dark)', border: '#FCD9BD' },
  SCVAA:        { bg: 'var(--ci-green-pale)',  color: 'var(--ci-green-dark)',  border: '#A7F3D0' },
  NON_CONFORME: { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  SPFEI_TITRE:  { bg: '#F5F3FF', color: '#5B21B6', border: '#DDD6FE' },
  CONSERVATION: { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
}

const PREV_STATUTS = {
  SPFEI_ADMIN: ['COURRIER'], SCVAA: ['SPFEI_ADMIN'],
  NON_CONFORME: ['SCVAA'], SPFEI_TITRE: ['SCVAA'], CONSERVATION: ['SPFEI_TITRE'],
}

const EMPTY_USER_FORM = { nom_complet: '', username: '', email: '', service_id: 1, password: '' }
const JOURNAL_LIMIT = 30

function StatutBadge({ statut }) {
  const s = STATUT_COLORS[statut] || { bg: 'var(--n-100)', color: 'var(--n-600)', border: 'var(--n-200)' }
  return (
    <span style={{
      background: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      fontSize: '0.68rem', fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase',
      padding: '2px 8px', borderRadius: 99,
      display: 'inline-flex', alignItems: 'center', gap: 5,
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, opacity: 0.7 }} />
      {STATUT_LABELS[statut] || statut}
    </span>
  )
}

function ServiceBadge({ id }) {
  const s = SERVICE_COLORS[id] || { bg: 'var(--n-100)', color: 'var(--n-600)' }
  const svc = SERVICES.find(x => x.id === id)
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: '0.7rem', fontWeight: 600,
      padding: '2px 8px', borderRadius: 99,
    }}>
      {svc?.libelle || '–'}
    </span>
  )
}

export default function Admin() {
  const [activeTab, setActiveTab] = useState('users')
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const [users, setUsers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  const [userSearch, setUserSearch] = useState('')
  const [showUserModal, setShowUserModal] = useState(false)
  const [editingUser, setEditingUser] = useState(null)
  const [userForm, setUserForm] = useState(EMPTY_USER_FORM)
  const [formError, setFormError] = useState('')
  const [processingUser, setProcessingUser] = useState(null)
  const [savingUser, setSavingUser] = useState(false)

  const [dossiers, setDossiers] = useState([])
  const [loadingDossiers, setLoadingDossiers] = useState(false)
  const [dossierSearch, setDossierSearch] = useState('')
  const [dossierStatut, setDossierStatut] = useState('')
  const [resetTarget, setResetTarget] = useState(null)
  const [resetForm, setResetForm] = useState({ nouveau_statut: '', motif: '' })
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleteMotifText, setDeleteMotifText] = useState('')
  const [processingDossier, setProcessingDossier] = useState(null)

  const [journal, setJournal] = useState([])
  const [loadingJournal, setLoadingJournal] = useState(false)
  const [journalPage, setJournalPage] = useState(0)
  const [hasMoreJournal, setHasMoreJournal] = useState(true)
  const [journalDateDebut, setJournalDateDebut] = useState('')
  const [journalDateFin, setJournalDateFin] = useState('')

  const [adminStats, setAdminStats] = useState(null)
  const [loadingStats, setLoadingStats] = useState(false)

  const [demandes, setDemandes] = useState([])
  const [loadingDemandes, setLoadingDemandes] = useState(true)
  const [processing, setProcessing] = useState(null)
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [dossierDetails, setDossierDetails] = useState(null)

  const [services, setServices] = useState([])
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [editingServiceLib, setEditingServiceLib] = useState('')
  const [savingService, setSavingService] = useState(false)
  const [config, setConfig] = useState({ delai_modification_heures: 24 })
  const [savingConfig, setSavingConfig] = useState(false)
  const [motifs, setMotifs] = useState([])
  const [newMotif, setNewMotif] = useState('')
  const [addingMotif, setAddingMotif] = useState(false)
  const [deletingMotif, setDeletingMotif] = useState(null)
  const [loadingParametrage, setLoadingParametrage] = useState(false)

  useEffect(() => {
    loadUsers()
    loadDemandes()
    const interval = setInterval(loadDemandes, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (activeTab === 'dossiers'    && dossiers.length === 0  && !loadingDossiers)   loadDossiers()
    if (activeTab === 'journal'     && journal.length === 0   && !loadingJournal)    loadJournal(0, true)
    if (activeTab === 'stats'       && !adminStats            && !loadingStats)      loadStats()
    if (activeTab === 'parametrage' && services.length === 0  && !loadingParametrage) loadParametrage()
  }, [activeTab]) // eslint-disable-line react-hooks/exhaustive-deps

  const loadUsers = async () => {
    setLoadingUsers(true)
    try { setUsers(await getUsers()) }
    catch { showAlert('Erreur lors du chargement des utilisateurs.', 'error') }
    finally { setLoadingUsers(false) }
  }

  const loadDemandes = async () => {
    setLoadingDemandes(true)
    try { setDemandes(await getDemandesDroits()) }
    catch {}
    finally { setLoadingDemandes(false) }
  }

  const loadDossiers = async () => {
    setLoadingDossiers(true)
    try { setDossiers(await getDossiers()) }
    catch { showAlert('Erreur chargement dossiers.', 'error') }
    finally { setLoadingDossiers(false) }
  }

  const loadJournal = async (page = 0, reset = false) => {
    setLoadingJournal(true)
    try {
      const data = await getJournal({
        skip: page * JOURNAL_LIMIT, limit: JOURNAL_LIMIT,
        date_debut: journalDateDebut || undefined,
        date_fin: journalDateFin || undefined,
      })
      setJournal(prev => reset ? data : [...prev, ...data])
      setJournalPage(page)
      setHasMoreJournal(data.length === JOURNAL_LIMIT)
    } catch { showAlert('Erreur chargement journal.', 'error') }
    finally { setLoadingJournal(false) }
  }

  const loadStats = async () => {
    setLoadingStats(true)
    try { setAdminStats(await getAgentStats()) }
    catch { showAlert('Erreur chargement statistiques.', 'error') }
    finally { setLoadingStats(false) }
  }

  const loadParametrage = async () => {
    setLoadingParametrage(true)
    try {
      const [svc, cfg, mot] = await Promise.all([getAdminServices(), getConfig(), getMotifs()])
      setServices(svc); setConfig(cfg); setMotifs(mot)
    } catch { showAlert('Erreur chargement configuration.', 'error') }
    finally { setLoadingParametrage(false) }
  }

  const showAlert = (msg, type = 'success') => {
    if (type === 'success') { setSuccess(msg); setError('') }
    else { setError(msg); setSuccess('') }
    setTimeout(() => { setSuccess(''); setError('') }, 3500)
  }

  const handleOpenCreate = () => {
    setEditingUser(null); setUserForm(EMPTY_USER_FORM); setFormError(''); setShowUserModal(true)
  }

  const handleOpenEdit = (user) => {
    setEditingUser(user)
    setUserForm({ nom_complet: user.nom_complet, username: user.username, email: user.email, service_id: user.service_id, password: '' })
    setFormError(''); setShowUserModal(true)
  }

  const handleUserSubmit = async (e) => {
    e.preventDefault(); setFormError(''); setSavingUser(true)
    try {
      if (editingUser) {
        const d = { nom_complet: userForm.nom_complet, email: userForm.email, service_id: userForm.service_id }
        if (userForm.password) d.password = userForm.password
        await updateUser(editingUser.id, d)
        showAlert('Utilisateur mis à jour.')
      } else {
        await createUser(userForm)
        showAlert('Utilisateur créé.')
      }
      setShowUserModal(false); loadUsers()
    } catch (err) {
      setFormError(err.response?.data?.detail || 'Erreur lors de la sauvegarde.')
    } finally { setSavingUser(false) }
  }

  const handleToggleActive = async (user) => {
    setProcessingUser(user.id)
    try {
      await updateUser(user.id, { is_active: !user.is_active })
      showAlert(user.is_active ? 'Désactivé.' : 'Activé.')
      loadUsers()
    } catch { showAlert('Erreur.', 'error') }
    finally { setProcessingUser(null) }
  }

  const handleOpenReset = (dossier) => {
    const prev = PREV_STATUTS[dossier.statut] || []
    setResetTarget(dossier)
    setResetForm({ nouveau_statut: prev[0] || '', motif: '' })
  }

  const handleReset = async () => {
    if (!resetTarget || !resetForm.nouveau_statut || !resetForm.motif.trim()) return
    setProcessingDossier(resetTarget.id)
    try {
      await reinitialiserDossier(resetTarget.id, resetForm)
      showAlert(`Dossier réinitialisé.`)
      setResetTarget(null); loadDossiers()
    } catch (err) { showAlert(err.response?.data?.detail || 'Erreur.', 'error') }
    finally { setProcessingDossier(null) }
  }

  const handleOpenDelete = (dossier) => { setDeleteTarget(dossier); setDeleteMotifText('') }

  const handleDelete = async () => {
    if (!deleteTarget || !deleteMotifText.trim()) return
    setProcessingDossier(deleteTarget.id)
    try {
      await supprimerDossier(deleteTarget.id, deleteMotifText)
      showAlert(`Dossier supprimé.`)
      setDeleteTarget(null); loadDossiers()
    } catch (err) { showAlert(err.response?.data?.detail || 'Erreur.', 'error') }
    finally { setProcessingDossier(null) }
  }

  const handleSelectDemande = async (demande) => {
    setSelectedDemande(demande)
    try { setDossierDetails(await getDossier(demande.dossier_id)) }
    catch { setDossierDetails(null) }
  }

  const handleTraiterDemande = async (demandeId, approuver) => {
    setProcessing(demandeId)
    try {
      await traiterDemandeDroits(demandeId, approuver)
      showAlert(approuver ? 'Approuvée.' : 'Rejetée.')
      await loadDemandes(); setSelectedDemande(null); setDossierDetails(null)
    } catch { showAlert('Erreur.', 'error') }
    finally { setProcessing(null) }
  }

  const handleSaveService = async (id) => {
    setSavingService(true)
    try {
      await updateService(id, { libelle: editingServiceLib })
      showAlert('Service mis à jour.'); setEditingServiceId(null); loadParametrage()
    } catch { showAlert('Erreur.', 'error') }
    finally { setSavingService(false) }
  }

  const handleSaveConfig = async () => {
    setSavingConfig(true)
    try { await updateConfig({ delai_modification_heures: config.delai_modification_heures }); showAlert('Configuration sauvegardée.') }
    catch { showAlert('Erreur.', 'error') }
    finally { setSavingConfig(false) }
  }

  const handleAddMotif = async () => {
    if (!newMotif.trim()) return
    setAddingMotif(true)
    try {
      const m = await createMotif({ libelle: newMotif.trim() })
      setMotifs(prev => [...prev, m]); setNewMotif('')
    } catch { showAlert("Erreur lors de l'ajout.", 'error') }
    finally { setAddingMotif(false) }
  }

  const handleDeleteMotif = async (motif) => {
    if (String(motif.id).startsWith('default-')) return showAlert('Motif par défaut non supprimable.', 'error')
    setDeletingMotif(motif.id)
    try {
      await deleteMotif(motif.id)
      setMotifs(prev => prev.filter(m => m.id !== motif.id)); showAlert('Supprimé.')
    } catch { showAlert('Erreur.', 'error') }
    finally { setDeletingMotif(null) }
  }

  const formatDate = (d) => {
    if (!d) return '–'
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(d))
  }

  const pendingCount = demandes.filter(d => d.statut === 'EN_ATTENTE').length

  const TABS = [
    { id: 'users',       label: 'Utilisateurs',  Icon: Users,     badge: users.length || null },
    { id: 'dossiers',    label: 'Dossiers',       Icon: FolderOpen, badge: null },
    { id: 'journal',     label: 'Journal',        Icon: BookOpen,  badge: null },
    { id: 'stats',       label: 'Statistiques',   Icon: BarChart2, badge: null },
    { id: 'demandes',    label: "Droits d'accès", Icon: Shield,    badge: pendingCount > 0 ? pendingCount : null },
    { id: 'parametrage', label: 'Paramétrage',    Icon: Settings,  badge: null },
  ]

  const filteredUsers = users.filter(u => {
    const q = userSearch.toLowerCase()
    return u.nom_complet?.toLowerCase().includes(q)
      || u.username?.toLowerCase().includes(q)
      || u.email?.toLowerCase().includes(q)
  })

  const filteredDossiers = dossiers.filter(d => {
    const matchSearch = !dossierSearch || d.numero_dossier?.toLowerCase().includes(dossierSearch.toLowerCase())
    const matchStatut = !dossierStatut || d.statut === dossierStatut
    return matchSearch && matchStatut
  })

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="page"
    >
      <div className="page-inner">

        {/* ─── En-tête ─── */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center"
            style={{ background: '#F5F3FF', color: '#5B21B6' }}>
            <Shield size={22} />
          </div>
          <div>
            <span className="section-label">Administration</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--n-900)' }}>
              Panneau <span style={{ color: 'var(--ci-orange)' }}>d'administration</span>
            </h1>
          </div>
        </div>

        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error   && <Alert variant="error"   className="mb-4">{error}</Alert>}

        {/* ─── Onglets ─── */}
        <div className="tab-bar mb-6">
          {TABS.map(({ id, label, Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`tab-item ${activeTab === id ? 'active' : ''}`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{label}</span>
              {badge != null && (
                <span style={{
                  padding: '1px 6px', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700,
                  background: activeTab === id ? 'var(--ci-orange-pale)' : 'var(--n-100)',
                  color: activeTab === id ? 'var(--ci-orange-dark)' : 'var(--n-500)',
                }}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── TAB : UTILISATEURS ─── */}
        {activeTab === 'users' && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--n-400)' }} />
                <input
                  type="text" placeholder="Nom, identifiant, email…" value={userSearch}
                  onChange={e => setUserSearch(e.target.value)}
                  className="input-field pl-9"
                />
              </div>
              <Button variant="primary" onClick={handleOpenCreate}>
                <UserPlus size={15} /> Créer
              </Button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loadingUsers ? (
                <div className="empty-state"><p className="empty-state-sub">Chargement…</p></div>
              ) : filteredUsers.length === 0 ? (
                <div className="empty-state">
                  <Users size={28} style={{ color: 'var(--n-300)', marginBottom: 8 }} />
                  <p className="empty-state-title">Aucun utilisateur</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Nom complet</th>
                        <th>Identifiant</th>
                        <th className="hidden md:table-cell">Email</th>
                        <th>Service</th>
                        <th>Statut</th>
                        <th className="hidden md:table-cell">Dernière connexion</th>
                        <th style={{ textAlign: 'right' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map(user => (
                        <tr key={user.id}>
                          <td>
                            <div className="flex items-center gap-2.5">
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%',
                                background: 'var(--ci-orange-pale)', color: 'var(--ci-orange-dark)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.82rem', fontWeight: 700, flexShrink: 0,
                              }}>
                                {user.nom_complet?.charAt(0).toUpperCase()}
                              </div>
                              <span style={{ fontWeight: 600, color: 'var(--n-800)' }}>{user.nom_complet}</span>
                            </div>
                          </td>
                          <td>
                            <span className="mono" style={{ color: 'var(--n-600)' }}>{user.username}</span>
                          </td>
                          <td className="hidden md:table-cell" style={{ color: 'var(--n-500)' }}>{user.email}</td>
                          <td><ServiceBadge id={user.service_id} /></td>
                          <td>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5,
                              padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                              background: user.is_active ? '#F0FDF4' : 'var(--n-100)',
                              color: user.is_active ? '#166534' : 'var(--n-500)',
                            }}>
                              <span style={{
                                width: 6, height: 6, borderRadius: '50%',
                                background: user.is_active ? '#22C55E' : 'var(--n-300)',
                              }} />
                              {user.is_active ? 'Actif' : 'Inactif'}
                            </span>
                          </td>
                          <td className="hidden md:table-cell" style={{ color: 'var(--n-400)', fontSize: '0.78rem' }}>
                            {formatDate(user.last_login)}
                          </td>
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleOpenEdit(user)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--n-400)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = 'var(--ci-orange)'; e.currentTarget.style.background = 'var(--ci-orange-pale)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-400)'; e.currentTarget.style.background = 'transparent' }}
                              >
                                <Edit2 size={14} />
                              </button>
                              <button
                                onClick={() => handleToggleActive(user)}
                                disabled={processingUser === user.id}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--n-400)', opacity: processingUser === user.id ? 0.5 : 1 }}
                                onMouseEnter={e => { e.currentTarget.style.color = user.is_active ? '#EF4444' : 'var(--ci-green)' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-400)' }}
                              >
                                {user.is_active ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB : DOSSIERS ─── */}
        {activeTab === 'dossiers' && (
          <div>
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--n-400)' }} />
                <input type="text" placeholder="Numéro de dossier…" value={dossierSearch}
                  onChange={e => setDossierSearch(e.target.value)}
                  className="input-field pl-9" />
              </div>
              <select value={dossierStatut} onChange={e => setDossierStatut(e.target.value)}
                className="input-field sm:w-44">
                <option value="">Tous les statuts</option>
                {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <button onClick={loadDossiers} disabled={loadingDossiers}
                className="p-2.5 rounded-lg border transition-colors"
                style={{ border: '1px solid var(--n-200)', color: 'var(--n-500)', background: 'white' }}>
                <RefreshCw size={15} className={loadingDossiers ? 'animate-spin' : ''} />
              </button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loadingDossiers ? (
                <div className="empty-state"><p className="empty-state-sub">Chargement…</p></div>
              ) : filteredDossiers.length === 0 ? (
                <div className="empty-state">
                  <FolderOpen size={28} style={{ color: 'var(--n-300)', marginBottom: 8 }} />
                  <p className="empty-state-title">Aucun dossier</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Numéro</th>
                        <th>Propriétaire</th>
                        <th>Région</th>
                        <th>Statut</th>
                        <th>Date</th>
                        <th style={{ textAlign: 'right' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDossiers.map(d => (
                        <tr key={d.id}>
                          <td><span className="mono font-semibold" style={{ color: 'var(--n-800)' }}>{d.numero_dossier}</span></td>
                          <td style={{ color: 'var(--n-700)' }}>{d.demandeur || '–'}</td>
                          <td style={{ color: 'var(--n-500)' }}>{d.region}</td>
                          <td><StatutBadge statut={d.statut} /></td>
                          <td style={{ fontSize: '0.78rem', color: 'var(--n-400)' }}>{formatDate(d.created_at)}</td>
                          <td>
                            <div className="flex items-center justify-end gap-1">
                              {PREV_STATUTS[d.statut] && (
                                <button onClick={() => handleOpenReset(d)}
                                  className="p-1.5 rounded-lg transition-colors"
                                  style={{ color: 'var(--n-400)' }}
                                  onMouseEnter={e => { e.currentTarget.style.color = '#F59E0B'; e.currentTarget.style.background = '#FEF3C7' }}
                                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-400)'; e.currentTarget.style.background = 'transparent' }}>
                                  <RotateCcw size={14} />
                                </button>
                              )}
                              <button onClick={() => handleOpenDelete(d)}
                                className="p-1.5 rounded-lg transition-colors"
                                style={{ color: 'var(--n-400)' }}
                                onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2' }}
                                onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-400)'; e.currentTarget.style.background = 'transparent' }}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB : JOURNAL ─── */}
        {activeTab === 'journal' && (
          <div>
            <div className="flex flex-wrap gap-3 mb-4 items-end">
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Du</label>
                <input type="date" value={journalDateDebut} onChange={e => setJournalDateDebut(e.target.value)} className="input-field w-40" />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontSize: '0.75rem' }}>Au</label>
                <input type="date" value={journalDateFin} onChange={e => setJournalDateFin(e.target.value)} className="input-field w-40" />
              </div>
              <Button variant="outline-orange" onClick={() => loadJournal(0, true)}>
                <Search size={14} /> Filtrer
              </Button>
            </div>

            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {loadingJournal && journal.length === 0 ? (
                <div className="empty-state"><p className="empty-state-sub">Chargement…</p></div>
              ) : journal.length === 0 ? (
                <div className="empty-state">
                  <BookOpen size={28} style={{ color: 'var(--n-300)', marginBottom: 8 }} />
                  <p className="empty-state-title">Aucune activité</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Date', 'Agent', 'Service', 'Dossier', 'Action', 'Transition'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {journal.map(entry => (
                          <tr key={entry.id}>
                            <td style={{ fontSize: '0.75rem', color: 'var(--n-400)', whiteSpace: 'nowrap' }}>
                              {formatDate(entry.created_at)}
                            </td>
                            <td style={{ fontWeight: 600 }}>{entry.users?.nom_complet || '–'}</td>
                            <td style={{ color: 'var(--n-500)' }}>{entry.services?.libelle || '–'}</td>
                            <td>
                              <span className="mono" style={{ color: 'var(--n-600)' }}>
                                {entry.dossiers?.numero_dossier || '–'}
                              </span>
                            </td>
                            <td style={{ maxWidth: 200 }}>
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
                                {entry.action}
                              </span>
                            </td>
                            <td>
                              {entry.ancien_statut ? (
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <StatutBadge statut={entry.ancien_statut} />
                                  <span style={{ color: 'var(--n-300)', fontSize: 12 }}>→</span>
                                  <StatutBadge statut={entry.nouveau_statut} />
                                </div>
                              ) : <StatutBadge statut={entry.nouveau_statut} />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {hasMoreJournal && (
                    <div className="p-4 text-center" style={{ borderTop: '1px solid var(--n-100)' }}>
                      <Button variant="ghost" onClick={() => loadJournal(journalPage + 1)} disabled={loadingJournal}>
                        {loadingJournal ? 'Chargement…' : 'Charger plus'}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB : STATISTIQUES ─── */}
        {activeTab === 'stats' && (
          <div>
            {loadingStats ? (
              <div className="empty-state"><p className="empty-state-sub">Chargement…</p></div>
            ) : !adminStats ? (
              <div className="empty-state"><p className="empty-state-title">Aucune statistique</p></div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
                  {Object.entries(STATUT_LABELS).map(([key, label]) => (
                    <div key={key} className="card" style={{ textAlign: 'center', padding: '16px 12px' }}>
                      <p className="stat-value text-2xl" style={{ color: 'var(--n-900)' }}>
                        {adminStats.global?.par_statut?.[key] || 0}
                      </p>
                      <div className="mt-2"><StatutBadge statut={key} /></div>
                    </div>
                  ))}
                </div>

                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                  <div className="flex items-center justify-between px-5 py-4"
                    style={{ borderBottom: '1px solid var(--n-100)' }}>
                    <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-800)' }}>
                      Productivité par agent
                    </h2>
                    <button onClick={loadStats}
                      className="p-1.5 rounded-lg transition-colors"
                      style={{ color: 'var(--n-400)' }}>
                      <RefreshCw size={14} />
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="data-table">
                      <thead>
                        <tr>
                          {['Agent', 'Service', 'Statut', 'Actions', 'Dernière action', 'Connexion'].map(h => (
                            <th key={h}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {[...(adminStats.agents || [])].sort((a, b) => b.nb_actions - a.nb_actions).map(agent => (
                          <tr key={agent.id}>
                            <td>
                              <div className="flex items-center gap-2.5">
                                <div style={{
                                  width: 30, height: 30, borderRadius: '50%',
                                  background: 'var(--ci-orange-pale)', color: 'var(--ci-orange-dark)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  fontSize: '0.75rem', fontWeight: 700, flexShrink: 0,
                                }}>
                                  {agent.nom_complet?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--n-800)' }}>{agent.nom_complet}</p>
                                  <p className="mono" style={{ color: 'var(--n-400)', fontSize: '0.72rem' }}>{agent.username}</p>
                                </div>
                              </div>
                            </td>
                            <td><ServiceBadge id={agent.service_id} /></td>
                            <td>
                              <span style={{
                                display: 'inline-flex', alignItems: 'center', gap: 5,
                                padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600,
                                background: agent.is_active ? '#F0FDF4' : 'var(--n-100)',
                                color: agent.is_active ? '#166534' : 'var(--n-500)',
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: agent.is_active ? '#22C55E' : 'var(--n-300)',
                                }} />
                                {agent.is_active ? 'Actif' : 'Inactif'}
                              </span>
                            </td>
                            <td style={{ fontWeight: 700, color: 'var(--n-800)' }}>{agent.nb_actions}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--n-400)' }}>{formatDate(agent.derniere_action)}</td>
                            <td style={{ fontSize: '0.78rem', color: 'var(--n-400)' }}>{formatDate(agent.last_login)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── TAB : DROITS D'ACCÈS ─── */}
        {activeTab === 'demandes' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="lg:col-span-1">
              <div className="card-lg">
                <h2 className="font-display font-bold text-base mb-4" style={{ color: 'var(--n-800)' }}>
                  Demandes de droits
                </h2>
                {loadingDemandes && <p className="text-sm" style={{ color: 'var(--n-400)' }}>Chargement…</p>}
                {!loadingDemandes && demandes.length === 0 && (
                  <div className="empty-state" style={{ padding: '2rem 0' }}>
                    <AlertTriangle size={24} style={{ color: 'var(--n-300)', marginBottom: 8 }} />
                    <p className="empty-state-title">Aucune demande</p>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {demandes.map(demande => {
                    const statusMap = {
                      EN_ATTENTE: { bg: '#FEF3C7', color: '#92400E', label: 'En attente' },
                      APPROUVEE:  { bg: '#F0FDF4', color: '#166534', label: 'Approuvée' },
                      REJETEE:    { bg: '#FEF2F2', color: '#991B1B', label: 'Rejetée' },
                    }
                    const s = statusMap[demande.statut] || statusMap.EN_ATTENTE
                    return (
                      <div
                        key={demande.id}
                        onClick={() => handleSelectDemande(demande)}
                        style={{
                          padding: '12px 14px', borderRadius: 10, cursor: 'pointer',
                          border: `1px solid ${selectedDemande?.id === demande.id ? 'var(--ci-orange)' : 'var(--n-150)'}`,
                          background: selectedDemande?.id === demande.id ? 'var(--ci-orange-pale)' : 'white',
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="mono font-semibold text-xs" style={{ color: 'var(--n-800)' }}>
                            {demande.numero_dossier}
                          </span>
                          <span style={{
                            background: s.bg, color: s.color,
                            fontSize: '0.65rem', fontWeight: 700,
                            padding: '1px 7px', borderRadius: 99, textTransform: 'uppercase',
                          }}>
                            {s.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--n-500)' }}>
                          <User size={11} /> {demande.demandeur}
                        </div>
                        <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: 'var(--n-400)', fontFamily: 'var(--font-mono)' }}>
                          <Clock size={11} /> {formatDate(demande.date_demande)}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedDemande ? (
                <div className="card-lg">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-800)' }}>Détails</h2>
                    {selectedDemande.statut === 'EN_ATTENTE' && (
                      <div className="flex gap-2">
                        <Button variant="danger" size="sm"
                          disabled={processing === selectedDemande.id}
                          onClick={() => handleTraiterDemande(selectedDemande.id, false)}>
                          <X size={14} /> Rejeter
                        </Button>
                        <Button variant="outline-green" size="sm"
                          disabled={processing === selectedDemande.id}
                          onClick={() => handleTraiterDemande(selectedDemande.id, true)}>
                          <Check size={14} /> Approuver
                        </Button>
                      </div>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--n-400)' }}>
                        Informations
                      </p>
                      <div className="space-y-2">
                        {[
                          ['Date', formatDate(selectedDemande.date_demande)],
                          ...(selectedDemande.date_traitement ? [['Traité le', formatDate(selectedDemande.date_traitement)]] : []),
                        ].map(([label, val]) => (
                          <div key={label} className="flex justify-between text-sm">
                            <span style={{ color: 'var(--n-400)' }}>{label}</span>
                            <span style={{ fontWeight: 500 }}>{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: 'var(--n-400)' }}>
                        Dossier
                      </p>
                      {dossierDetails ? (
                        <div className="space-y-2">
                          {[
                            ['Numéro', dossierDetails.numero_dossier],
                            ['Propriétaire', dossierDetails.nom_demandeur],
                            ['Contact', dossierDetails.contact_demandeur],
                          ].map(([label, val]) => (
                            <div key={label} className="flex justify-between text-sm">
                              <span style={{ color: 'var(--n-400)' }}>{label}</span>
                              <span style={{ fontWeight: 500, fontFamily: label === 'Numéro' ? 'var(--font-mono)' : undefined }}>{val}</span>
                            </div>
                          ))}
                        </div>
                      ) : <p className="text-sm" style={{ color: 'var(--n-400)' }}>Chargement…</p>}
                    </div>
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: 'var(--n-400)' }}>Motif</p>
                  <div className="flex items-start gap-2.5 p-3.5 rounded-lg"
                    style={{ background: 'var(--n-50)', border: '1px solid var(--n-150)' }}>
                    <FileText size={15} style={{ color: 'var(--n-400)', marginTop: 1, flexShrink: 0 }} />
                    <p className="text-sm" style={{ color: 'var(--n-700)' }}>{selectedDemande.motif}</p>
                  </div>
                </div>
              ) : (
                <div className="card-lg flex flex-col items-center justify-center" style={{ minHeight: 280 }}>
                  <AlertTriangle size={28} style={{ color: 'var(--n-200)', marginBottom: 12 }} />
                  <p className="text-sm font-medium" style={{ color: 'var(--n-400)' }}>
                    Sélectionnez une demande
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── TAB : PARAMÉTRAGE ─── */}
        {activeTab === 'parametrage' && (
          <div className="space-y-5">
            {loadingParametrage ? (
              <div className="empty-state"><p className="empty-state-sub">Chargement…</p></div>
            ) : (
              <>
                {/* Services */}
                <div className="card-lg">
                  <h2 className="font-display font-bold text-base mb-1" style={{ color: 'var(--n-800)' }}>Services</h2>
                  <p className="text-sm mb-4" style={{ color: 'var(--n-400)' }}>Libellé affiché de chaque service.</p>
                  <div className="flex flex-col gap-2">
                    {services.map(svc => (
                      <div key={svc.id} className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
                        style={{ background: 'var(--n-50)', border: '1px solid var(--n-150)' }}>
                        <span style={{
                          padding: '2px 8px', borderRadius: 99, fontSize: '0.72rem', fontWeight: 700,
                          background: SERVICE_COLORS[svc.id]?.bg || 'var(--n-100)',
                          color: SERVICE_COLORS[svc.id]?.color || 'var(--n-600)',
                        }}>
                          #{svc.id}
                        </span>
                        {editingServiceId === svc.id ? (
                          <>
                            <input
                              value={editingServiceLib}
                              onChange={e => setEditingServiceLib(e.target.value)}
                              onKeyDown={e => { if (e.key === 'Enter') handleSaveService(svc.id); if (e.key === 'Escape') setEditingServiceId(null) }}
                              className="input-field flex-1"
                              style={{ paddingTop: 6, paddingBottom: 6 }}
                              autoFocus
                            />
                            <Button size="sm" variant="outline-green" onClick={() => handleSaveService(svc.id)} disabled={savingService}>Sauver</Button>
                            <Button size="sm" variant="ghost" onClick={() => setEditingServiceId(null)}>Annuler</Button>
                          </>
                        ) : (
                          <>
                            <span className="flex-1 text-sm font-medium" style={{ color: 'var(--n-800)' }}>{svc.libelle}</span>
                            <button
                              onClick={() => { setEditingServiceId(svc.id); setEditingServiceLib(svc.libelle) }}
                              className="p-1.5 rounded-lg transition-colors"
                              style={{ color: 'var(--n-400)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = 'var(--ci-orange)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-400)' }}>
                              <Edit2 size={13} />
                            </button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Délai modification */}
                <div className="card-lg">
                  <h2 className="font-display font-bold text-base mb-1" style={{ color: 'var(--n-800)' }}>Délai de modification</h2>
                  <p className="text-sm mb-4" style={{ color: 'var(--n-400)' }}>
                    Durée pendant laquelle le service Courrier peut modifier un dossier.
                  </p>
                  <div className="flex items-center gap-3">
                    <input type="number" min="1" max="720"
                      value={config.delai_modification_heures}
                      onChange={e => setConfig(p => ({ ...p, delai_modification_heures: parseInt(e.target.value) || 24 }))}
                      className="input-field w-24 text-center" />
                    <span className="text-sm" style={{ color: 'var(--n-500)' }}>heures</span>
                    <Button variant="primary" size="sm" onClick={handleSaveConfig} disabled={savingConfig}>
                      {savingConfig ? 'Enregistrement…' : 'Enregistrer'}
                    </Button>
                  </div>
                </div>

                {/* Motifs */}
                <div className="card-lg">
                  <h2 className="font-display font-bold text-base mb-1" style={{ color: 'var(--n-800)' }}>Motifs de non-conformité</h2>
                  <p className="text-sm mb-4" style={{ color: 'var(--n-400)' }}>
                    Motifs proposés au SCVAA lors d'une décision de non-conformité.
                  </p>
                  <div className="flex gap-2 mb-4">
                    <input type="text" placeholder="Nouveau motif…" value={newMotif}
                      onChange={e => setNewMotif(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAddMotif()}
                      className="input-field flex-1" />
                    <Button variant="primary" size="sm" onClick={handleAddMotif}
                      disabled={addingMotif || !newMotif.trim()}>
                      <Plus size={14} /> Ajouter
                    </Button>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    {motifs.map(motif => (
                      <div key={motif.id} className="flex items-center justify-between px-3.5 py-2.5 rounded-lg transition-colors"
                        style={{ border: '1px solid var(--n-150)', background: 'var(--n-50)' }}>
                        <span className="text-sm" style={{ color: 'var(--n-700)' }}>{motif.libelle}</span>
                        <button
                          onClick={() => handleDeleteMotif(motif)}
                          disabled={deletingMotif === motif.id}
                          className="p-1 rounded-lg transition-colors"
                          style={{ color: 'var(--n-300)', opacity: deletingMotif === motif.id ? 0.5 : 1 }}
                          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444' }}
                          onMouseLeave={e => { e.currentTarget.style.color = 'var(--n-300)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                    {motifs.length === 0 && (
                      <p className="text-sm text-center py-4" style={{ color: 'var(--n-400)' }}>Aucun motif défini</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* ─── MODALE : Créer/Modifier utilisateur ─── */}
        {showUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(9,14,19,0.45)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              style={{ boxShadow: 'var(--shadow-xl)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--n-900)' }}>
                  {editingUser ? "Modifier l'utilisateur" : 'Créer un utilisateur'}
                </h2>
                <button onClick={() => setShowUserModal(false)}
                  className="p-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
                  style={{ color: 'var(--n-400)' }}>
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleUserSubmit} className="space-y-4">
                {formError && <Alert variant="error">{formError}</Alert>}
                <Input label="Nom complet" required value={userForm.nom_complet}
                  onChange={e => setUserForm(p => ({ ...p, nom_complet: e.target.value }))} />
                {!editingUser && (
                  <Input label="Nom d'utilisateur" required value={userForm.username}
                    onChange={e => setUserForm(p => ({ ...p, username: e.target.value }))} />
                )}
                <Input label="Email" type="email" required value={userForm.email}
                  onChange={e => setUserForm(p => ({ ...p, email: e.target.value }))} />
                <div className="form-group">
                  <label className="form-label">
                    Service <span style={{ color: 'var(--ci-orange)' }}>*</span>
                  </label>
                  <select value={userForm.service_id}
                    onChange={e => setUserForm(p => ({ ...p, service_id: parseInt(e.target.value) }))}
                    className="input-field">
                    {SERVICES.map(s => <option key={s.id} value={s.id}>{s.libelle}</option>)}
                  </select>
                </div>
                <Input
                  label={editingUser ? 'Mot de passe (laisser vide si inchangé)' : 'Mot de passe'}
                  type="password" required={!editingUser}
                  value={userForm.password}
                  onChange={e => setUserForm(p => ({ ...p, password: e.target.value }))} />
                <div className="flex gap-3 pt-1">
                  <Button type="button" variant="ghost" onClick={() => setShowUserModal(false)} className="flex-1">
                    Annuler
                  </Button>
                  <Button type="submit" variant="primary" disabled={savingUser} className="flex-1">
                    {savingUser ? 'Enregistrement…' : editingUser ? 'Enregistrer' : 'Créer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* ─── MODALE : Réinitialiser ─── */}
        {resetTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(9,14,19,0.45)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              style={{ boxShadow: 'var(--shadow-xl)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#FEF3C7', color: '#92400E' }}>
                  <RotateCcw size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-900)' }}>
                    Réinitialiser le dossier
                  </h2>
                  <p className="text-xs" style={{ color: 'var(--n-400)' }}>
                    <span className="mono">{resetTarget.numero_dossier}</span>
                    {' '}— <StatutBadge statut={resetTarget.statut} />
                  </p>
                </div>
                <button onClick={() => setResetTarget(null)} className="ml-auto p-1.5 rounded-lg hover:bg-neutral-100"
                  style={{ color: 'var(--n-400)' }}><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Nouveau statut <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
                  <select value={resetForm.nouveau_statut}
                    onChange={e => setResetForm(p => ({ ...p, nouveau_statut: e.target.value }))}
                    className="input-field">
                    {(PREV_STATUTS[resetTarget.statut] || []).map(s => (
                      <option key={s} value={s}>{STATUT_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Motif <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
                  <textarea value={resetForm.motif}
                    onChange={e => setResetForm(p => ({ ...p, motif: e.target.value }))}
                    rows={3} placeholder="Raison de la réinitialisation…"
                    className="input-field resize-none" />
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setResetTarget(null)} className="flex-1">Annuler</Button>
                  <Button variant="outline-orange" onClick={handleReset}
                    disabled={!resetForm.motif.trim() || processingDossier === resetTarget.id}
                    className="flex-1">
                    <RotateCcw size={14} /> Réinitialiser
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* ─── MODALE : Supprimer ─── */}
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(9,14,19,0.45)', backdropFilter: 'blur(4px)' }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl p-6 w-full max-w-md"
              style={{ boxShadow: 'var(--shadow-xl)' }}
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: '#FEF2F2', color: '#EF4444' }}>
                  <Trash2 size={18} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-900)' }}>
                    Supprimer le dossier
                  </h2>
                  <p className="text-xs font-medium" style={{ color: '#EF4444' }}>Action irréversible</p>
                </div>
                <button onClick={() => setDeleteTarget(null)} className="ml-auto p-1.5 rounded-lg hover:bg-neutral-100"
                  style={{ color: 'var(--n-400)' }}><X size={16} /></button>
              </div>
              <p className="text-sm mb-4" style={{ color: 'var(--n-600)' }}>
                Suppression définitive du dossier{' '}
                <span className="mono font-semibold">{deleteTarget.numero_dossier}</span>.
              </p>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Motif <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
                  <textarea value={deleteMotifText}
                    onChange={e => setDeleteMotifText(e.target.value)}
                    rows={3} placeholder="Raison de la suppression…"
                    className="input-field resize-none" />
                </div>
                <div className="flex gap-3">
                  <Button variant="ghost" onClick={() => setDeleteTarget(null)} className="flex-1">Annuler</Button>
                  <Button variant="danger" onClick={handleDelete}
                    disabled={!deleteMotifText.trim() || processingDossier === deleteTarget.id}
                    className="flex-1">
                    <Trash2 size={14} /> Supprimer
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  )
}