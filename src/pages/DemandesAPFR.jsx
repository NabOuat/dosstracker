import { useEffect, useState } from 'react'
import { FileText, CheckCircle, Clock, XCircle, Trash2 } from 'lucide-react'
import { getDossiers } from '../api/dossiers'
import { getDemandesAPFR, updateDemandeAPFR, deleteDemandeAPFR } from '../api/apfr'
import { useAuth } from '../context/AuthContext'
import DemandeAPFRModal from '../components/DemandeAPFRModal'
import Button from '../components/ui/Button'
import Alert from '../components/ui/Alert'

const STATUT_COLORS = {
  'EN_ATTENTE': { bg: 'var(--ci-yellow-pale)', text: 'var(--ci-yellow)', icon: Clock },
  'SIGNEE': { bg: 'var(--ci-green-pale)', text: 'var(--ci-green)', icon: CheckCircle },
  'REJETEE': { bg: 'var(--ci-red-pale)', text: 'var(--ci-red)', icon: XCircle },
}

export default function DemandesAPFR() {
  const { user } = useAuth()
  const [demandes, setDemandes] = useState([])
  const [dossiers, setDossiers] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDemande, setSelectedDemande] = useState(null)
  const [updating, setUpdating] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  const loadData = async () => {
    try {
      setLoading(true)
      const demandesData = await getDemandesAPFR()
      setDemandes(demandesData || [])

      // Charger les dossiers SPFEI_TITRE pour la création de demande
      const dossiersData = await getDossiers('SPFEI_TITRE')
      setDossiers(dossiersData || [])
    } catch (err) {
      setError('Erreur lors du chargement des données')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSignerDemande = async (demandeId) => {
    setUpdating(demandeId)
    try {
      await updateDemandeAPFR(demandeId, 'SIGNEE')
      setSuccess('Demande signée avec succès. Les dossiers sont maintenant à la Conservation.')
      await loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message
      setError(`Erreur: ${errorMsg}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleRejeterDemande = async (demandeId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return

    setUpdating(demandeId)
    try {
      await updateDemandeAPFR(demandeId, 'REJETEE')
      setSuccess('Demande rejetée. Les dossiers restent au statut SPFEI_TITRE.')
      await loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message
      setError(`Erreur: ${errorMsg}`)
    } finally {
      setUpdating(null)
    }
  }

  const handleSupprimerDemande = async (demandeId) => {
    if (!window.confirm('Supprimer cette demande ? Les dossiers seront remis au statut SPFEI_TITRE.')) return

    setUpdating(demandeId)
    try {
      await deleteDemandeAPFR(demandeId)
      setSuccess('Demande supprimée. Les dossiers ont été remis au statut SPFEI_TITRE.')
      await loadData()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message
      setError(`Erreur: ${errorMsg}`)
    } finally {
      setUpdating(null)
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-neutral-500">Chargement...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <span className="section-label">Service SPFEI</span>
        <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-900 mb-2">
          Demandes de Signature <span style={{ color: 'var(--ci-blue)' }}>APFR</span>
        </h1>
        <p className="text-sm text-neutral-500 mb-6">
          Créez et gérez les demandes de signature APFR groupant plusieurs dossiers.
        </p>

        {success && <Alert variant="success" className="mb-4">{success}</Alert>}
        {error && <Alert variant="error" className="mb-4">{error}</Alert>}

        {user?.service_id === 2 && (
          <div className="mb-6">
            <Button
              variant="primary"
              onClick={() => setShowModal(true)}
              disabled={dossiers.length === 0}
            >
              <FileText size={16} />
              Créer une demande APFR
            </Button>
            {dossiers.length === 0 && (
              <p className="text-sm text-neutral-500 mt-2">
                Aucun dossier disponible pour créer une demande (statut SPFEI_TITRE requis)
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {demandes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-lg border border-neutral-200">
              <FileText size={48} className="mx-auto mb-3 text-neutral-300" />
              <p className="text-neutral-500 font-semibold">Aucune demande APFR</p>
            </div>
          ) : (
            demandes.map(demande => {
              const StatutIcon = STATUT_COLORS[demande.statut]?.icon || Clock
              const colors = STATUT_COLORS[demande.statut] || STATUT_COLORS['EN_ATTENTE']

              return (
                <div
                  key={demande.id}
                  className="bg-white rounded-lg p-6 border border-neutral-200 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className="w-10 h-10 rounded-md flex items-center justify-center"
                          style={{ background: colors.bg }}
                        >
                          <StatutIcon size={20} style={{ color: colors.text }} />
                        </div>
                        <div>
                          <h3 className="font-display font-bold text-lg text-neutral-900">
                            {demande.numero_demande}
                          </h3>
                          <p className="text-sm text-neutral-500">
                            Créée par {demande.agent_spfei_nom} • {demande.nombre_dossiers} dossier(s)
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 p-3 bg-neutral-50 rounded-lg">
                        <p className="text-sm font-semibold text-neutral-700 mb-1">Dossiers inclus:</p>
                        <p className="text-sm text-neutral-600">{demande.dossiers_list}</p>
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <span
                          className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: colors.bg, color: colors.text }}
                        >
                          {demande.statut === 'EN_ATTENTE' && 'En attente de signature'}
                          {demande.statut === 'SIGNEE' && 'Signée'}
                          {demande.statut === 'REJETEE' && 'Rejetée'}
                        </span>
                      </div>
                    </div>

                    {demande.statut === 'EN_ATTENTE' && user?.service_id === 2 && (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleSignerDemande(demande.id)}
                          disabled={updating === demande.id}
                        >
                          <CheckCircle size={14} />
                          {updating === demande.id ? 'Signature...' : 'Signer'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRejeterDemande(demande.id)}
                          disabled={updating === demande.id}
                        >
                          <XCircle size={14} />
                          Rejeter
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSupprimerDemande(demande.id)}
                          disabled={updating === demande.id}
                          style={{ color: '#EF4444' }}
                        >
                          <Trash2 size={14} />
                          Supprimer
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {showModal && (
        <DemandeAPFRModal
          dossiers={dossiers}
          currentUserId={user?.id}
          onClose={() => setShowModal(false)}
          onSuccess={(msg) => {
            setSuccess(msg)
            loadData()
            setTimeout(() => setSuccess(''), 4000)
          }}
        />
      )}
    </div>
  )
}
