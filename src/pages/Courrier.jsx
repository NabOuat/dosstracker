import { useEffect, useState } from 'react'
import {
  Plus, Send, X, Edit, Clock, AlertTriangle,
  Lock, FileQuestion
} from 'lucide-react'
import {
  getDossiers, createDossier, envoyerAuSpfei,
  isDossierModifiable, demanderDroitsAdmin
} from '../api/dossiers'
import DossierCard from '../components/DossierCard'
import DossierDetail from '../components/DossierDetail'
import ServiceDashboardSection from '../components/ServiceDashboardSection'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const INIT = {
  numero: '', date_enregistrement: new Date().toISOString().slice(0, 10),
  region: '', prefecture: '', sous_prefecture: '', village: '', departement: '',
  numero_cf: '', demandeur: '', contact: '',
}

export default function Courrier({ mode = 'creer' }) {
  const { user } = useAuth()
  const [dossiers, setDossiers] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState(INIT)
  const [selected, setSelected] = useState(null)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(null)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [editMode, setEditMode] = useState(false)
  const [editableDossiers, setEditableDossiers] = useState({})
  const [showDemandeForm, setShowDemandeForm] = useState(false)
  const [demandeForm, setDemandeForm] = useState({ dossier_id: null, motif: '' })
  const [demandeSending, setDemandeSending] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)

  const load = () => getDossiers('COURRIER').then(d => {
    setDossiers(Array.isArray(d) ? d : [])
  })

  const checkEditableDossiers = async (dossiersArray) => {
    if (!dossiersArray || !Array.isArray(dossiersArray)) {
      setEditableDossiers({})
      return
    }
    const status = {}
    for (const d of dossiersArray) {
      status[d.id] = await isDossierModifiable(d.id)
    }
    setEditableDossiers(status)
  }

  useEffect(() => {
    load().then(d => checkEditableDossiers(d || []))
    const interval = setInterval(() => checkEditableDossiers(dossiers || []), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const handleDemandeChange = e => setDemandeForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleEdit = (dossier) => {
    if (!editableDossiers[dossier.id]) {
      setDemandeForm({ dossier_id: dossier.id, motif: '' })
      setShowDemandeForm(true)
      return
    }
    setForm({ ...INIT, ...dossier })
    setEditMode(true)
    setShowForm(true)
  }

  const handleDemanderDroits = async (e) => {
    e.preventDefault()
    if (!demandeForm.motif.trim()) { setError('⚠️ Veuillez indiquer un motif.'); return }
    setDemandeSending(true); setError('')
    try {
      await demanderDroitsAdmin(demandeForm.dossier_id, demandeForm.motif)
      setSuccess("✅ Demande envoyée à l'administrateur avec succès.")
      setShowDemandeForm(false)
      setDemandeForm({ dossier_id: null, motif: '' })
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || "Erreur lors de l'envoi de la demande"
      setError(`❌ ${errorMsg}`)
    }
    finally { setDemandeSending(false) }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.numero.trim() || !form.demandeur.trim() || !form.contact.trim() || !form.region.trim()) {
      setError('Les champs marqués * sont obligatoires.'); return
    }
    setSaving(true); setError(''); setSuccess('')
    try {
      await createDossier(form)
      setSuccess('✅ Dossier enregistré avec succès !')
      setForm(INIT); setShowForm(false); setEditMode(false)
      const updated = await load()
      checkEditableDossiers(updated)
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors de la création du dossier'
      if (errorMsg.includes('existe déjà')) {
        setError('DOUBLON: Un dossier avec ce numéro de demande existe déjà. Veuillez utiliser un numéro différent.')
      } else if (errorMsg.includes('Propriétaire')) {
        setError('ERREUR: Propriétaire non trouvé. Vérifiez le contact.')
      } else {
        setError(`ERREUR: ${errorMsg}`)
      }
    } finally { setSaving(false) }
  }

  const handleEnvoyer = async id => {
    setSending(id); setError('')
    try {
      await envoyerAuSpfei(id)
      setSuccess('✅ Dossier envoyé au SERVICE SPFEI avec succès.')
      await load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur lors de l\'envoi'
      setError(`❌ ${errorMsg}`)
    } finally { setSending(null) }
  }

  const closeForm = () => { setShowForm(false); setEditMode(false); setForm(INIT); setError('') }

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
      className="page"
    >
      <div className="page-inner">

        {/* ─── Tableau de bord du service (pour service_tag='Bob') ─── */}
        <ServiceDashboardSection />

        {/* ─── En-tête ─── */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-7">
          <div>
            <span className="section-label">Service Courrier</span>
            <h1 className="font-display font-bold text-2xl sm:text-3xl" style={{ color: 'var(--n-900)' }}>
              {mode === 'envoyer'
                ? <>Envoi des <span style={{ color: 'var(--ci-orange)' }}>dossiers</span></>
                : <>Enregistrement des <span style={{ color: 'var(--ci-orange)' }}>dossiers</span></>
              }
            </h1>
            {user?.service_tag === 'Bob' && (
              <p className="text-xs text-neutral-500 mt-2">📊 Mode consultation - Accès aux statistiques uniquement</p>
            )}
          </div>
          {mode === 'creer' && !showForm && user?.service_tag !== 'Bob' && (
            <Button variant="primary" onClick={() => { setShowForm(true); setError('') }}>
              <Plus size={15} /> Nouveau dossier
            </Button>
          )}
        </div>

        {success && <Alert variant="success" className="mb-5">{success}</Alert>}

        {/* ─── Formulaire dossier ─── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-lg mb-6"
              style={{ borderTop: '3px solid var(--ci-orange)' }}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display font-bold text-lg" style={{ color: 'var(--n-800)' }}>
                  {editMode ? 'Modifier le dossier' : 'Nouveau dossier'}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1.5 rounded-lg transition-colors hover:bg-neutral-100"
                  style={{ color: 'var(--n-400)' }}
                >
                  <X size={18} />
                </button>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                    transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
                    className="mb-4 p-4 rounded-lg border-l-4"
                    style={{
                      background: '#FEE2E2',
                      borderColor: '#DC2626',
                      borderLeft: '4px solid #DC2626'
                    }}
                  >
                    <p style={{ color: '#991B1B', fontWeight: '600', fontSize: '0.95rem' }}>
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="N° de dossier"         name="numero"                required value={form.numero}              onChange={handleChange} placeholder="DOS-2026-XXXX" />
                  <Input label="Date d'enregistrement" name="date_enregistrement"   required value={form.date_enregistrement} onChange={handleChange} type="date" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Nom du demandeur"      name="demandeur"             required value={form.demandeur}           onChange={handleChange} placeholder="Nom Prénom" />
                  <Input label="Contact (téléphone)"   name="contact"               required value={form.contact}             onChange={handleChange} placeholder="07XXXXXXXX" type="tel" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Région"                name="region"                required value={form.region}              onChange={handleChange} placeholder="ex : Lagunes" />
                  <Input label="Département"           name="departement"                    value={form.departement}         onChange={handleChange} placeholder="ex : Abidjan 1" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Préfecture"            name="prefecture"                     value={form.prefecture}          onChange={handleChange} placeholder="ex : Abidjan" />
                  <Input label="Sous-Préfecture"       name="sous_prefecture"                value={form.sous_prefecture}     onChange={handleChange} placeholder="ex : Cocody" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input label="Village"               name="village"                        value={form.village}             onChange={handleChange} placeholder="ex : Riviera" />
                  <Input label="Numéro de la demande"  name="numero_cf"                      value={form.numero_cf}           onChange={handleChange} placeholder="ex : DEM-2026-0001" />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <Button type="button" variant="ghost" onClick={closeForm}>Annuler</Button>
                  <Button type="submit" variant="primary" disabled={saving}>
                    {saving ? 'Enregistrement…' : editMode ? 'Modifier' : 'Enregistrer'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Formulaire demande de droits ─── */}
        <AnimatePresence>
          {showDemandeForm && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="card-lg mb-6"
              style={{ borderTop: '3px solid #F59E0B' }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: '#FEF3C7', color: '#92400E' }}>
                    <FileQuestion size={18} />
                  </div>
                  <h2 className="font-display font-bold text-base" style={{ color: 'var(--n-800)' }}>
                    Demande de droits
                  </h2>
                </div>
                <button onClick={() => setShowDemandeForm(false)} className="p-1.5 rounded-lg hover:bg-neutral-100" style={{ color: 'var(--n-400)' }}>
                  <X size={18} />
                </button>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-lg mb-4"
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                <AlertTriangle size={16} style={{ color: '#92400E', marginTop: 2, flexShrink: 0 }} />
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#92400E' }}>
                    Délai de modification expiré (15 min)
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#A16207' }}>
                    Expliquez votre motif pour demander des droits spéciaux à l'administrateur.
                  </p>
                </div>
              </div>

              {error && <Alert variant="error" className="mb-4">{error}</Alert>}

              <form onSubmit={handleDemanderDroits} className="space-y-4">
                <div className="form-group">
                  <label className="form-label">Motif de la demande <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
                  <textarea
                    name="motif"
                    value={demandeForm.motif}
                    onChange={handleDemandeChange}
                    className="input-field resize-none"
                    rows={3}
                    placeholder="Expliquez pourquoi vous devez modifier ce dossier…"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setShowDemandeForm(false)}>Annuler</Button>
                  <Button type="submit" variant="primary" disabled={demandeSending}>
                    {demandeSending ? 'Envoi…' : 'Envoyer la demande'}
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Liste dossiers ─── */}
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold mb-1" style={{ color: 'var(--n-500)' }}>
            {dossiers.length} dossier{dossiers.length > 1 ? 's' : ''} en attente
          </p>
          {dossiers.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <DossierCard
                dossier={d}
                onClick={() => setSelected(d)}
                action={
                  <div className="flex gap-2">
                    <Button
                      variant={editableDossiers[d.id] ? 'outline' : 'ghost'}
                      size="sm"
                      onClick={e => { e.stopPropagation(); handleEdit(d) }}
                    >
                      {editableDossiers[d.id]
                        ? <><Edit size={12} /> Modifier</>
                        : <><Lock size={12} /> Verrouillé</>
                      }
                    </Button>
                    <Button
                      variant="secondary" size="sm"
                      disabled={sending === d.id}
                      onClick={e => { e.stopPropagation(); handleEnvoyer(d.id) }}
                    >
                      <Send size={12} />
                      {sending === d.id ? 'Envoi…' : 'Envoyer'}
                    </Button>
                  </div>
                }
              />
            </motion.div>
          ))}
          {dossiers.length === 0 && !showForm && (
            <div className="empty-state card">
              <p className="empty-state-icon">📭</p>
              <p className="empty-state-title">Aucun dossier en attente</p>
              <p className="empty-state-sub">Créez un nouveau dossier pour commencer.</p>
            </div>
          )}
        </div>

        <DossierDetail dossier={selected} onClose={() => setSelected(null)} />
      </div>
    </motion.div>
  )
}