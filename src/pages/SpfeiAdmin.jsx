import { useEffect, useState } from 'react'
import { CheckCircle, Send, Save, ChevronLeft } from 'lucide-react'
import { getDossiers, updateSpfeiAdmin, envoyerDossier } from '../api/dossiers'
import DossierCard from '../components/DossierCard'
import DossierDetail from '../components/DossierDetail'
import ServiceDashboardSection from '../components/ServiceDashboardSection'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Alert from '../components/ui/Alert'
import { motion, AnimatePresence } from 'framer-motion'

const INIT = {
  nationalite: '', genre: '', type_cf: '',
  date_enquete_officielle: '', date_valid_enq: '',
  date_etab_cf: '', date_demande_immat: '',
}

export default function SpfeiAdmin() {
  const [dossiers, setDossiers] = useState([])
  const [active,   setActive]   = useState(null)
  const [form,     setForm]     = useState(INIT)
  const [selected, setSelected] = useState(null)
  const [saving,   setSaving]   = useState(false)
  const [sending,  setSending]  = useState(false)
  const [success,  setSuccess]  = useState('')
  const [activeTab, setActiveTab] = useState('traiter') // 'traiter' ou 'envoyer'
  const [selectedDossiers, setSelectedDossiers] = useState([]) // Pour la sélection multiple

  const load = () => getDossiers('SPFEI_ADMIN').then(setDossiers)
  useEffect(() => { load() }, [])

  // Filtrer les dossiers: ceux à traiter (sans nationalite) et ceux traités (avec nationalite)
  const dossiersATraiter = dossiers.filter(d => !d.nationalite)
  const dossiersTrait = dossiers.filter(d => d.nationalite)

  const toggleSelectDossier = (dossierId) => {
    setSelectedDossiers(prev =>
      prev.includes(dossierId)
        ? prev.filter(id => id !== dossierId)
        : [...prev, dossierId]
    )
  }

  const selectAllTrait = () => {
    if (selectedDossiers.length === dossiersTrait.length) {
      setSelectedDossiers([])
    } else {
      setSelectedDossiers(dossiersTrait.map(d => d.id))
    }
  }

  const handleEnvoyerMultiple = async () => {
    if (selectedDossiers.length === 0) return
    setSending(true)
    try {
      for (const dossierId of selectedDossiers) {
        await envoyerDossier(dossierId, 'SCVAA')
      }
      setSuccess(`✅ ${selectedDossiers.length} dossier(s) envoyé(s) au SERVICE SCVAA.`)
      setSelectedDossiers([])
      await load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue'
      console.error('Erreur complète:', err)
      setSuccess(`❌ Erreur: ${errorMsg}`)
    } finally { setSending(false) }
  }

  const handleOpen = d => { setActive(d); setForm({ ...INIT, ...d }) }
  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleTraiter = async e => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateSpfeiAdmin(active.id, form)
      setSuccess('✅ Dossier traité avec succès. Vous pouvez maintenant l\'envoyer au SCVAA.')
      setForm({ ...INIT, ...active })
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.message || 'Erreur inconnue'
      console.error('Erreur complète:', err)
      setSuccess(`❌ Erreur: ${errorMsg}`)
    } finally { setSaving(false) }
  }

  const handleEnvoyerAuScvaa = async () => {
    if (!active) return
    setSending(true)
    try {
      await envoyerDossier(active.id, 'SCVAA')
      setSuccess('✅ Dossier envoyé au SERVICE SCVAA.')
      setActive(null); await load()
      setTimeout(() => setSuccess(''), 4000)
    } catch (err) {
      setSuccess(`❌ Erreur: ${err.response?.data?.detail || err.message}`)
    } finally { setSending(false) }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      <ServiceDashboardSection />
      <span className="section-label">Service SPFEI</span>
      <h1 className="font-display font-bold text-2xl sm:text-3xl lg:text-4xl text-neutral-900 mb-2">
        Contrôle <span style={{ color: 'var(--ci-orange)' }}>administratif</span>
      </h1>
      <p className="text-sm text-neutral-500 mb-6">
        {user?.service_tag === 'Bob' 
          ? '📊 Mode consultation - Accès aux statistiques uniquement'
          : 'Complétez les informations administratives puis transmettez au SERVICE SCVAA.'
        }
      </p>

      {success && <Alert variant="success" className="mb-4">{success}</Alert>}

      {active && user?.service_tag !== 'Bob' && (
        <div className="bg-white rounded-lg p-6 mb-6" style={{ boxShadow: 'var(--shadow-md)', borderLeft: '4px solid var(--ci-orange)' }}>
          <h2 className="font-display font-bold text-base text-neutral-800 mb-1">Traitement : {active.numero_dossier}</h2>
          <p className="text-sm text-neutral-500 mb-5">{active.demandeur}</p>
          <form onSubmit={handleTraiter} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">Nationalité <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
              <input name="nationalite" required value={form.nationalite} onChange={handleChange} className="input-field" placeholder="ex : Ivoirienne" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">Genre <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
              <select name="genre" required value={form.genre} onChange={handleChange} className="input-field">
                <option value="">Sélectionner…</option>
                <option value="Masculin">Masculin</option>
                <option value="Féminin">Féminin</option>
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[0.78rem] font-bold text-neutral-700">Type CF <span style={{ color: 'var(--ci-orange)' }}>*</span></label>
              <select name="type_cf" required value={form.type_cf} onChange={handleChange} className="input-field">
                <option value="">Sélectionner…</option>
                <option value="Rural">Rural</option>
                <option value="Urbain">Urbain</option>
              </select>
            </div>
            <Input label="Date enquête officielle"           name="date_enquete_officielle" value={form.date_enquete_officielle} onChange={handleChange} type="date" required />
            <Input label="Date validation enquête"           name="date_valid_enq"          value={form.date_valid_enq}          onChange={handleChange} type="date" required />
            <Input label="Date d'établissement du CF"        name="date_etab_cf"            value={form.date_etab_cf}            onChange={handleChange} type="date" required />
            <Input label="Date de demande d'immatriculation" name="date_demande_immat"      value={form.date_demande_immat}      onChange={handleChange} type="date" required />
            <div className="sm:col-span-2 flex gap-3 justify-end pt-2">
              <Button type="button" variant="ghost" onClick={() => setActive(null)}>Annuler</Button>
              <Button type="submit" variant="secondary" disabled={saving} onClick={handleTraiter}>
                <Check size={14} /> {saving ? 'Traitement…' : 'Traiter'}
              </Button>
              <Button type="button" disabled={sending} onClick={handleEnvoyerAuScvaa} style={{ background: 'var(--ci-green)', color: 'white' }}>
                <Send size={14} /> {sending ? 'Envoi…' : 'Envoyer au SCVAA'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-2 mb-6 border-b border-neutral-200">
        <button
          onClick={() => setActiveTab('traiter')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'traiter'
              ? 'text-neutral-900 border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          À traiter ({dossiersATraiter.length})
        </button>
        <button
          onClick={() => setActiveTab('envoyer')}
          className={`px-4 py-3 font-semibold text-sm transition-colors ${
            activeTab === 'envoyer'
              ? 'text-neutral-900 border-b-2 border-orange-500'
              : 'text-neutral-500 hover:text-neutral-700'
          }`}
        >
          Envoyer ({dossiersTrait.length})
        </button>
      </div>

      {/* Contenu des onglets */}
      <div className="flex flex-col gap-3">
        {activeTab === 'traiter' && (
          <>
            <p className="text-sm text-neutral-500 font-semibold mb-4">{dossiersATraiter.length} dossier(s) à traiter</p>
            <div className="grid grid-cols-1 gap-3">
              {dossiersATraiter.map(d => (
                <div
                  key={d.id}
                  className="flex items-center gap-4 p-4 rounded-lg bg-white border-l-4 border-orange-500 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => setSelected(d)}
                >
                  <div className="flex-1">
                    <p className="font-bold text-neutral-900">{d.numero_dossier}</p>
                    <p className="text-sm text-neutral-600">{d.demandeur}</p>
                    <p className="text-xs text-neutral-500 mt-1">Région: {d.region} • Département: {d.departement}</p>
                  </div>
                  <Button variant="primary" size="sm" onClick={(e) => { e.stopPropagation(); handleOpen(d) }}>
                    Traiter
                  </Button>
                </div>
              ))}
            </div>
            {dossiersATraiter.length === 0 && (
              <div className="text-center py-16 text-neutral-400">
                <p className="text-4xl mb-3">✅</p>
                <p className="font-semibold">Aucun dossier en attente de traitement</p>
              </div>
            )}
          </>
        )}

        {activeTab === 'envoyer' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-neutral-500 font-semibold">{dossiersTrait.length} dossier(s) traité(s) prêt(s) à envoyer</p>
              {dossiersTrait.length > 0 && (
                <div className="flex gap-2">
                  <button
                    onClick={selectAllTrait}
                    className="text-sm text-neutral-600 hover:text-neutral-900 font-semibold"
                  >
                    {selectedDossiers.length === dossiersTrait.length ? 'Désélectionner tout' : 'Sélectionner tout'}
                  </button>
                  {selectedDossiers.length > 0 && (
                    <Button
                      size="sm"
                      disabled={sending}
                      onClick={handleEnvoyerMultiple}
                      style={{ background: 'var(--ci-green)', color: 'white' }}
                    >
                      <Send size={14} /> Envoyer ({selectedDossiers.length})
                    </Button>
                  )}
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 gap-3">
              {dossiersTrait.map(d => (
                <div
                  key={d.id}
                  className={`flex items-center gap-4 p-4 rounded-lg border-l-4 transition-all ${
                    selectedDossiers.includes(d.id)
                      ? 'bg-green-50 border-green-500 shadow-md'
                      : 'bg-white border-green-200 hover:shadow-md'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedDossiers.includes(d.id)}
                    onChange={() => toggleSelectDossier(d.id)}
                    className="w-5 h-5 cursor-pointer flex-shrink-0"
                  />
                  <div className="flex-1 cursor-pointer" onClick={() => setSelected(d)}>
                    <p className="font-bold text-neutral-900">{d.numero_dossier}</p>
                    <p className="text-sm text-neutral-600">{d.demandeur}</p>
                    <p className="text-xs text-neutral-500 mt-1">Nationalité: {d.nationalite} • Genre: {d.genre}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => { e.stopPropagation(); setSelected(d) }}
                    style={{ color: 'var(--ci-green)' }}
                  >
                    Voir
                  </Button>
                </div>
              ))}
            </div>
            {dossiersTrait.length === 0 && (
              <div className="text-center py-16 text-neutral-400">
                <p className="text-4xl mb-3">📋</p>
                <p className="font-semibold">Aucun dossier traité à envoyer</p>
              </div>
            )}
          </>
        )}
      </div>
      <DossierDetail dossier={selected} onClose={() => setSelected(null)} />
      </div>
    </div>
  )
}
