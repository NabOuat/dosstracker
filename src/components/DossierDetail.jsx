import { X, Phone, MapPin, Calendar, User, FileText } from 'lucide-react'
import WorkflowBadge, { WorkflowStepper } from './WorkflowBadge'

/**
 * DossierDetail – panneau latéral de détail d'un dossier
 * @param {object|null} dossier – null = fermé
 * @param {function} onClose
 */
export default function DossierDetail({ dossier, onClose }) {
  if (!dossier) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panneau */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 bg-white w-full max-w-lg flex flex-col"
        style={{ boxShadow: '-8px 0 48px rgba(0,0,0,0.15)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 shrink-0"
        >
          <div>
            <p className="font-display font-bold text-base text-neutral-900">{dossier.numero_dossier}</p>
            <WorkflowBadge statut={dossier.statut} size="sm" />
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-full text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">

          {/* Workflow stepper */}
          <div className="bg-neutral-100 rounded-lg p-4">
            <p className="text-[0.7rem] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-3">
              Progression du dossier
            </p>
            <WorkflowStepper statut={dossier.statut} />
          </div>

          {/* Courrier */}
          <Section title="Service Courrier" icon={FileText}>
            <Row label="N° Dossier"       val={dossier.numero_dossier} />
            <Row label="Demandeur"        val={dossier.demandeur} />
            <Row label="Contact demandeur" val={dossier.contact_demandeur} icon={Phone} />
            <Row label="Agent Courrier"   val={dossier.agent_courrier} />
            <Row label="Région"           val={dossier.region} icon={MapPin} />
            <Row label="Préfecture"       val={dossier.prefecture} />
            <Row label="Sous-Préfecture"  val={dossier.sous_prefecture} />
            <Row label="Village"          val={dossier.village} />
            <Row label="Département"      val={dossier.departement} />
            <Row label="N° CF"            val={dossier.numero_cf} />
            <Row label="Date enreg."      val={fmt(dossier.date_enregistrement)} icon={Calendar} />
          </Section>

          {/* SPFEI Admin */}
          {dossier.nationalite && (
            <Section title="SPFEI – Contrôle Administratif" icon={User}>
              <Row label="Nationalité"      val={dossier.nationalite} />
              <Row label="Genre"            val={dossier.genre} />
              <Row label="Type CF"          val={dossier.type_cf} />
              <Row label="Date enquête"     val={fmt(dossier.date_enquete)} />
              <Row label="Validation enquête" val={fmt(dossier.date_validation_enquete)} />
              <Row label="Établissement CF" val={fmt(dossier.date_etablissement_cf)} />
              <Row label="Demande immatriculation" val={fmt(dossier.date_demande_immatriculation)} />
            </Section>
          )}

          {/* SCVAA */}
          {dossier.decision && (
            <Section title="SCVAA – Contrôle Technique" icon={FileText}>
              <Row label="Superficie"       val={dossier.superficie ? `${dossier.superficie} ha` : ''} />
              <Row label="Date bornage"     val={fmt(dossier.date_bornage)} />
              <Row label="Géomètre Expert"  val={dossier.geometre} />
              <Row label="Contact géomètre" val={dossier.contact_geometre} />
              <Row
                label="Décision"
                val={dossier.decision}
                accent={dossier.decision === 'NON_CONFORME' ? 'red' : 'green'}
              />
              {dossier.motifs?.length > 0 && (
                <div>
                  <p className="text-[0.72rem] font-bold text-neutral-400 mb-1">Motifs d'inconformité</p>
                  <ul className="list-disc list-inside space-y-0.5">
                    {dossier.motifs.map(m => (
                      <li key={m} className="text-sm text-red-600">{m}</li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          )}

          {/* SPFEI Titre */}
          {dossier.numero_tf && (
            <Section title="SPFEI – Titre Foncier" icon={FileText}>
              <Row label="Conservation"   val={dossier.conservation} />
              <Row label="N° Titre Foncier" val={dossier.numero_tf} accent="green" />
            </Section>
          )}
        </div>
      </div>
    </>
  )
}

function Section({ title, icon: Icon, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-6 h-6 rounded-md flex items-center justify-center"
          style={{ background: 'var(--ci-orange-pale)' }}
        >
          <Icon size={13} style={{ color: 'var(--ci-orange)' }} />
        </div>
        <h3 className="font-display font-bold text-sm text-neutral-800">{title}</h3>
      </div>
      <div className="bg-neutral-100 rounded-md p-4 flex flex-col gap-2">
        {children}
      </div>
    </div>
  )
}

function Row({ label, val, icon: Icon, accent }) {
  if (!val) return null
  const textColor = accent === 'green' ? 'var(--ci-green-dark)' : accent === 'red' ? '#991B1B' : 'var(--neutral-800)'
  return (
    <div className="flex items-start justify-between gap-4">
      <p className="text-[0.72rem] font-bold text-neutral-400 shrink-0 pt-0.5">{label}</p>
      <p className="text-[0.82rem] font-semibold text-right" style={{ color: textColor }}>
        {Icon && <Icon size={11} className="inline mr-1" />}{val}
      </p>
    </div>
  )
}

function fmt(date) {
  if (!date) return ''
  try {
    return new Date(date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  } catch { return date }
}
