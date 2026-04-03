import { useState, useEffect } from 'react';
import { Search, X, Filter, Calendar, User, MapPin, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './ui/Button';

/**
 * Composant de filtres avancés pour la recherche de dossiers
 * @param {Object} props - Propriétés du composant
 * @param {Object} props.filters - État des filtres
 * @param {Function} props.setFilters - Fonction pour mettre à jour les filtres
 * @param {Function} props.onApplyFilters - Fonction appelée lors de l'application des filtres
 * @param {Function} props.onResetFilters - Fonction appelée lors de la réinitialisation des filtres
 */
export default function AdvancedFilters({ 
  filters, 
  setFilters, 
  onApplyFilters, 
  onResetFilters,
  regions = [],
  statuts = []
}) {
  const [expanded, setExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);
  const [activeFilterCount, setActiveFilterCount] = useState(0);

  // Mettre à jour les filtres locaux lorsque les filtres externes changent
  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  // Compter le nombre de filtres actifs
  useEffect(() => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.statut) count++;
    if (localFilters.region) count++;
    if (localFilters.dateDebut) count++;
    if (localFilters.dateFin) count++;
    if (localFilters.proprietaire) count++;
    if (localFilters.numero) count++;
    setActiveFilterCount(count);
  }, [localFilters]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleApply = () => {
    setFilters(localFilters);
    onApplyFilters?.(localFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: '',
      statut: '',
      region: '',
      dateDebut: '',
      dateFin: '',
      proprietaire: '',
      numero: ''
    };
    setLocalFilters(resetFilters);
    setFilters(resetFilters);
    onResetFilters?.();
  };

  return (
    <div className="bg-white rounded-lg p-4 mb-4" style={{ boxShadow: 'var(--shadow-sm)' }}>
      {/* Barre de recherche principale */}
      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            name="search"
            value={localFilters.search}
            onChange={handleChange}
            placeholder="Rechercher un dossier..."
            className="w-full pl-9 pr-3 py-2 rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
          {localFilters.search && (
            <button
              onClick={() => setLocalFilters(prev => ({ ...prev, search: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X size={14} />
            </button>
          )}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1"
        >
          <Filter size={14} />
          Filtres avancés
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-orange-500 rounded-full">
              {activeFilterCount}
            </span>
          )}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </Button>
        
        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-neutral-500"
          >
            Réinitialiser
          </Button>
        )}
      </div>

      {/* Filtres avancés */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-neutral-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Filtre par numéro de dossier */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Numéro de dossier</label>
              <div className="relative">
                <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  name="numero"
                  value={localFilters.numero}
                  onChange={handleChange}
                  placeholder="ex: DOS-2026-0001"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Filtre par statut */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Statut</label>
              <select
                name="statut"
                value={localFilters.statut}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="">Tous les statuts</option>
                {Object.entries(statuts).map(([key, value]) => (
                  <option key={key} value={key}>{value.label}</option>
                ))}
              </select>
            </div>

            {/* Filtre par région */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Région</label>
              <div className="relative">
                <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <select
                  name="region"
                  value={localFilters.region}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="">Toutes les régions</option>
                  {regions.map(region => (
                    <option key={region} value={region}>{region}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Filtre par date de début */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Date de début</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  name="dateDebut"
                  value={localFilters.dateDebut}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Filtre par date de fin */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Date de fin</label>
              <div className="relative">
                <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="date"
                  name="dateFin"
                  value={localFilters.dateFin}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>

            {/* Filtre par propriétaire */}
            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Propriétaire</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  name="proprietaire"
                  value={localFilters.proprietaire}
                  onChange={handleChange}
                  placeholder="Nom du propriétaire"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-md border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button
              variant="primary"
              size="sm"
              onClick={handleApply}
              className="flex items-center gap-1"
            >
              <Search size={14} />
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
