import { useState } from 'react'
import { Search } from 'lucide-react'
import { Button, Badge } from '../components/ui'

export default function Recherche() {
  const [query, setQuery] = useState('')

  return (
    <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8">
      <span className="section-label">Outil</span>
      <h1 className="font-display font-bold text-2xl sm:text-3xl text-neutral-900 mb-2">
        Recherche <span style={{ color: 'var(--ci-orange)' }}>avancée</span>
      </h1>
      <p className="text-neutral-500 text-sm mb-8">
        Retrouvez un dossier par nom, numéro, type ou statut.
      </p>

      <div className="bg-white rounded-lg p-6" style={{ boxShadow: 'var(--shadow-md)' }}>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Nom, numéro de dossier, référence…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="input-field pl-9"
              autoFocus
            />
          </div>
          <Button variant="primary" className="shrink-0">
            <Search size={14} />
            Rechercher
          </Button>
        </div>

        {!query && (
          <div className="flex flex-wrap gap-2 mt-4">
            <p className="text-xs text-neutral-400 w-full">Recherches rapides :</p>
            {['SPFEI', 'SCVAA', 'Non conforme', 'En cours', 'Terminés'].map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1 rounded-full text-xs font-semibold bg-neutral-100 text-neutral-600 hover:bg-neutral-200 transition-colors"
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {query && (
          <p className="text-sm text-neutral-500 mt-6 text-center py-8">
            Aucun résultat pour "<strong>{query}</strong>". Connectez votre API pour les résultats réels.
          </p>
        )}
      </div>
    </div>
  )
}
