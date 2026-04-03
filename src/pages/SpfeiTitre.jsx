import { useEffect, useState } from 'react'
import { Award, Archive, Paperclip } from 'lucide-react'
import { getDossiers, updateSpfeiTitre } from '../api/dossiers'
import { getRetourConservation } from '../api/apfr'
import DossierCard from '../components/DossierCard'
import DossierDetail from '../components/DossierDetail'
import RetourConservationModal from '../components/RetourConservationModal'
import FileUploadModal from '../components/FileUploadModal'
import ServiceDashboardSection from '../components/ServiceDashboardSection'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import { useAuth } from '../context/AuthContext'

export default function SpfeiTitre() {
  const { user } = useAuth()
  const [dossiers, setDossiers] = useState([])
  const [conservationDossiers, setConservationDossiers] = useState([])
  const [active,   setActive]   = useState(null)
  const [showFileUploadModal, setShowFileUploadModal] = useState(null)
  const [form,     setForm]     = useState({ conservation: '', numero_tf: '' })
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [success,  setSuccess]  = useState('')
  const [error,    setError]    = useState('')
  const [showRetourConservationModal, setShowRetourConservationModal] = useState(null)
  const [activeTab, setActiveTab] = useState('titre') // 'titre' ou 'conservation'

  const load = async () => {
    const titreData = await getDossiers('SPFEI_TITRE')
    setDossiers(titreData || [])
    
    const conservationData = await getDossiers('CONSERVATION')
    setConservationDossiers(conservationData || [])
  }
  
  useEffect(() => { load() }, [])

  const handleOpen = d => { setActive(d); setForm({ conservation: d.conservation ?? '', numero_tf: d.numero_tf ?? '' }) }
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.conservation.trim() || !form.numero_tf.trim()) {
      setError('La conservation et le numéro de titre sont obligatoires.'); return
    }
    setSaving(true); setError('')
    try {
      await updateSpfeiTitre(active.id, form)
      setSuccess('Titre Foncier attribué. Dossier transmis à la Conservation. SMS envoyé au propriétaire.')
      setActive(null); await load()
      setTimeout(() => setSuccess(''), 5000)
    } finally { setSaving(false) }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <ServiceDashboardSection />
      <span className="section-label">Service SPFEI</span>
      <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-900 mb-2">
        Attribution du <span style={{ color: 'var(--ci-orange)' }}>Titre Foncier</span>
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        {user?.service_tag === 'Bob' 
          ? '📊 Mode consultation - Accès aux statistiques uniquement'
          : 'Attribuez le numéro de titre foncier et transmettez à la Conservation Foncière.'
        }
      </p>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('titre')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'titre'
              ? 'text-neutral-900 border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Attribution Titre ({dossiers.length})
        </button>
        <button
          onClick={() => setActiveTab('conservation')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'conservation'
              ? 'text-neutral-900 border-b-2 border-green-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Retour Conservation ({conservationDossiers.length})
        </button>
      </div>

      {activeTab === 'titre' && active && user?.service_tag !== 'Bob' && (
        <div className="bg-white rounded-lg p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)', borderLeft: '4px solid var(--ci-orange)' }}>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--ci-orange-pale)' }}>
              <Award size={20} style={{ color: 'var(--ci-orange)' }} />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-neutral-800">{active.numero}</h2>
              <p className="text-sm text-neutral-500">{active.demandeur}</p>
            </div>
          </div>
          {error && <Alert variant="error" className="mb-4">{error}</Alert>}
          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Conservation"    name="conservation" required value={form.conservation} onChange={handleChange} placeholder="ex : Conservation d'Abidjan" />
            <Input label="N° Titre Foncier" name="numero_tf"    required value={form.numero_tf}    onChange={handleChange} placeholder="ex : TF-2026-0001" />
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setActive(null)}>Annuler</Button>
              <Button type="submit" variant="primary" disabled={saving}>
                <Award size={15} /> {saving ? 'Attribution…' : 'Attribuer et envoyer à la Conservation'}
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {activeTab === 'titre' && (
          <>
            <p className="text-sm text-neutral-500 font-semibold">{dossiers.length} dossier(s) conforme(s) en attente</p>
            {dossiers.map(d => (
              <DossierCard key={d.id} dossier={d} onClick={() => setSelected(d)}
                action={
                  <div className="flex gap-2">
                    <Button variant="primary" size="sm" onClick={() => handleOpen(d)} disabled={user?.service_tag === 'Bob'}><Award size={13} /> Attribuer</Button>
                    <Button variant="secondary" size="sm" onClick={() => setShowFileUploadModal(d.id)} disabled={user?.service_tag === 'Bob'}><Paperclip size={13} /> Fichiers</Button>
                  </div>
                }
              />
            ))}
            {dossiers.length === 0 && (
              <div className="text-center py-16 text-neutral-400">
                <p className="text-4xl mb-3">🏆</p><p className="font-semibold">Aucun dossier en attente d'attribution</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'conservation' && (
          <>
            <p className="text-sm text-neutral-500 font-semibold">{conservationDossiers.length} dossier(s) à la Conservation</p>
            {conservationDossiers.map(d => (
              <DossierCard key={d.id} dossier={d} onClick={() => setSelected(d)}
                action={<Button variant="secondary" size="sm" onClick={() => setShowRetourConservationModal(d)} disabled={user?.service_tag === 'Bob'}><Archive size={13} /> Enregistrer retour</Button>}
              />
            ))}
            {conservationDossiers.length === 0 && (
              <div className="text-center py-16 text-neutral-400">
                <p className="text-4xl mb-3">📦</p><p className="font-semibold">Aucun dossier à la Conservation</p>
              </div>
            )}
          </>
        )}
      </div>
      
      <DossierDetail dossier={selected} onClose={() => setSelected(null)} />
      
      {showRetourConservationModal && (
        <RetourConservationModal
          dossier={showRetourConservationModal}
          currentUserId={user?.id}
          onClose={() => setShowRetourConservationModal(null)}
          onSuccess={(msg) => {
            setSuccess(msg)
            load()
            setTimeout(() => setSuccess(''), 4000)
          }}
        />
      )}

      <FileUploadModal
        dossierId={showFileUploadModal}
        isOpen={!!showFileUploadModal}
        onClose={() => setShowFileUploadModal(null)}
      />
      </div>
    </div>
  )
}
