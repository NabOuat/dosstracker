import { useEffect, useState } from 'react'
import { MessageSquare, Phone, Calendar } from 'lucide-react'
import { getSmsHistory } from '../api/sms'

const TYPE_STYLE = {
  NON_CONFORME: { bg: '#FEF2F2', text: '#991B1B', dot: '#EF4444', label: 'Non Conforme' },
  FINALISE:     { bg: 'var(--ci-green-pale)', text: 'var(--ci-green-dark)', dot: 'var(--ci-green)', label: 'Finalisé' },
}

function fmt(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  } catch { return iso }
}

export default function SmsLog() {
  const [sms, setSms] = useState([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    getSmsHistory()
      .then(data => setSms(data || []))
      .catch(err => {
        console.error('Erreur chargement SMS:', err)
        setSms([])
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-8">
      <span className="section-label">Notifications</span>
      <h1 className="font-display font-bold text-2xl text-neutral-900 mb-2">
        Journal des <span style={{ color: 'var(--ci-orange)' }}>SMS</span>
      </h1>
      <p className="text-sm text-neutral-500 mb-8">
        Historique des notifications SMS envoyées aux propriétaires.
      </p>

      <div className="flex flex-col gap-4">
        {sms.map(s => {
          const style = TYPE_STYLE[s.type] ?? TYPE_STYLE.FINALISE
          return (
            <div key={s.id} className="bg-white rounded-lg p-5" style={{ boxShadow: 'var(--shadow-sm)', borderLeft: `4px solid ${style.dot}` }}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: style.bg }}>
                    <MessageSquare size={14} style={{ color: style.dot }} />
                  </div>
                  <div>
                    <p className="font-display font-bold text-sm text-neutral-800">{s.destinataire}</p>
                    <span className="inline-flex items-center gap-1 text-[0.65rem] font-bold uppercase tracking-[0.05em] rounded-full px-2 py-0.5" style={{ background: style.bg, color: style.text }}>
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                      {style.label}
                    </span>
                  </div>
                </div>
                <p className="text-[0.7rem] font-mono text-neutral-400 font-semibold">{s.dossier}</p>
              </div>
              <div className="flex flex-wrap gap-4 mb-3 text-[0.72rem] text-neutral-500">
                <span className="flex items-center gap-1"><Phone size={11} /> {s.contact}</span>
                <span className="flex items-center gap-1"><Calendar size={11} /> {fmt(s.date)}</span>
              </div>
              <div className="bg-neutral-100 rounded-md p-3">
                <p className="text-[0.78rem] text-neutral-700 leading-relaxed">{s.contenu}</p>
              </div>
            </div>
          )
        })}
        {sms.length === 0 && (
          <div className="text-center py-16 text-neutral-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">Aucun SMS envoyé pour l'instant</p>
          </div>
        )}
      </div>
    </div>
  )
}
