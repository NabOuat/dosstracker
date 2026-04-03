import { STATUTS } from '../utils/mockData'

const COLOR_MAP = {
  blue:   { bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
  orange: { bg: 'var(--ci-orange-pale)', text: 'var(--ci-orange-dark)', dot: 'var(--ci-orange)' },
  green:  { bg: 'var(--ci-green-pale)',  text: 'var(--ci-green-dark)',  dot: 'var(--ci-green)'  },
  purple: { bg: '#F5F3FF', text: '#6D28D9', dot: '#8B5CF6' },
  red:    { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444' },
}

/**
 * WorkflowBadge – affiche le statut actuel d'un dossier dans le circuit
 * @param {string} statut – clé STATUTS (ex: 'SCVAA', 'NON_CONFORME')
 * @param {'sm'|'md'} size
 */
export default function WorkflowBadge({ statut, size = 'md' }) {
  const info = STATUTS[statut]
  if (!info) return null

  const colors = COLOR_MAP[info.color] ?? COLOR_MAP.blue
  const px     = size === 'sm' ? '0.6rem' : '0.85rem'
  const py     = size === 'sm' ? '0.2rem' : '0.3rem'
  const fs     = size === 'sm' ? '0.65rem' : '0.72rem'

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-[0.04em]"
      style={{ background: colors.bg, color: colors.text, padding: `${py} ${px}`, fontSize: fs }}
    >
      <span
        className="rounded-full shrink-0"
        style={{ width: 6, height: 6, background: colors.dot }}
      />
      {info.label}
    </span>
  )
}

/**
 * WorkflowStepper – barre de progression multi-étapes
 */
const STEPS = [
  { key: 'COURRIER',     label: 'Courrier',    short: '1' },
  { key: 'SPFEI_ADMIN',  label: 'SPFEI Admin', short: '2' },
  { key: 'SCVAA',        label: 'SCVAA',       short: '3' },
  { key: 'SPFEI_TITRE',  label: 'SPFEI Titre', short: '4' },
  { key: 'CONSERVATION', label: 'Conservation',short: '5' },
]

export function WorkflowStepper({ statut }) {
  const currentStep = STATUTS[statut]?.step ?? 0

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto">
      {STEPS.map((step, i) => {
        const done   = step.key === 'CONSERVATION'
          ? statut === 'CONSERVATION'
          : currentStep > STEPS.indexOf(STEPS.find(s => s.key === step.key))
        const active = STATUTS[statut]?.step === i + 1 ||
          (statut === 'NON_CONFORME' && step.key === 'SCVAA')
        const isPast = currentStep > i + 1

        return (
          <div key={step.key} className="flex items-center flex-1 min-w-0">
            {/* Nœud */}
            <div className="flex flex-col items-center gap-1 shrink-0">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all"
                style={{
                  background: isPast || statut === 'CONSERVATION'
                    ? 'linear-gradient(135deg, var(--ci-green), var(--ci-green-dark))'
                    : active
                    ? 'linear-gradient(135deg, var(--ci-orange), var(--ci-orange-dark))'
                    : 'var(--neutral-100)',
                  color: (isPast || active || statut === 'CONSERVATION') ? 'white' : 'var(--neutral-400)',
                  border: active ? 'none' : '2px solid var(--neutral-200)',
                  boxShadow: active ? '0 4px 16px rgba(244,121,32,0.4)' : 'none',
                  animation: active ? 'pulseStep 2s infinite' : 'none',
                }}
              >
                {isPast || statut === 'CONSERVATION' ? '✓' : step.short}
              </div>
              <span className="text-[0.6rem] font-bold text-center text-neutral-400 whitespace-nowrap leading-tight hidden sm:block">
                {step.label}
              </span>
            </div>
            {/* Connecteur */}
            {i < STEPS.length - 1 && (
              <div
                className="h-[2px] flex-1 mx-1 transition-all"
                style={{
                  background: isPast || statut === 'CONSERVATION'
                    ? 'var(--ci-green)'
                    : active
                    ? 'linear-gradient(90deg, var(--ci-green), var(--ci-orange))'
                    : 'var(--neutral-200)',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
