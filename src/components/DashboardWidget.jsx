import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Maximize2, Minimize2, X, Move, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './ui/Button';

/**
 * Composant de widget configurable pour le tableau de bord
 * @param {Object} props - Propriétés du composant
 * @param {string} props.id - Identifiant unique du widget
 * @param {string} props.title - Titre du widget
 * @param {React.ReactNode} props.children - Contenu du widget
 * @param {string} props.color - Couleur du widget (orange, green, blue, purple, red)
 * @param {boolean} props.collapsible - Si le widget peut être réduit
 * @param {boolean} props.removable - Si le widget peut être supprimé
 * @param {Function} props.onRemove - Fonction appelée lors de la suppression du widget
 * @param {Function} props.onResize - Fonction appelée lors du redimensionnement du widget
 * @param {Function} props.onMove - Fonction appelée lors du déplacement du widget
 * @param {Function} props.onSettingsClick - Fonction appelée lors du clic sur les paramètres
 * @param {string} props.size - Taille du widget (small, medium, large)
 * @param {boolean} props.isConfiguring - Si le tableau de bord est en mode configuration
 */
export default function DashboardWidget({
  id,
  title,
  children,
  color = 'orange',
  collapsible = true,
  removable = true,
  onRemove,
  onResize,
  onMove,
  onSettingsClick,
  size = 'medium',
  isConfiguring = false
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Définir les classes CSS en fonction de la couleur
  const colorClasses = {
    orange: {
      border: 'border-l-[3px] border-l-[var(--ci-orange)]',
      header: 'bg-[var(--ci-orange-pale)]',
      icon: 'text-[var(--ci-orange)]'
    },
    green: {
      border: 'border-l-[3px] border-l-[var(--ci-green)]',
      header: 'bg-[var(--ci-green-pale)]',
      icon: 'text-[var(--ci-green)]'
    },
    blue: {
      border: 'border-l-[3px] border-l-blue-500',
      header: 'bg-blue-50',
      icon: 'text-blue-500'
    },
    purple: {
      border: 'border-l-[3px] border-l-purple-500',
      header: 'bg-purple-50',
      icon: 'text-purple-500'
    },
    red: {
      border: 'border-l-[3px] border-l-red-500',
      header: 'bg-red-50',
      icon: 'text-red-500'
    },
    neutral: {
      border: 'border-l-[3px] border-l-neutral-400',
      header: 'bg-neutral-100',
      icon: 'text-neutral-500'
    }
  };

  // Définir les classes CSS en fonction de la taille
  const sizeClasses = {
    small: 'col-span-1',
    medium: 'col-span-1 md:col-span-2',
    large: 'col-span-1 md:col-span-3'
  };

  // Gérer le redimensionnement du widget
  const handleResize = (newSize) => {
    if (onResize) {
      onResize(id, newSize);
    }
  };

  // Gérer la suppression du widget
  const handleRemove = () => {
    if (onRemove) {
      onRemove(id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-lg overflow-hidden ${colorClasses[color]?.border || colorClasses.orange.border} ${sizeClasses[size] || sizeClasses.medium}`}
      style={{ boxShadow: 'var(--shadow-md)' }}
    >
      {/* En-tête du widget */}
      <div className={`px-4 py-3 flex items-center justify-between ${colorClasses[color]?.header || colorClasses.orange.header}`}>
        <h3 className="font-display font-bold text-neutral-800 text-sm">{title}</h3>
        <div className="flex items-center gap-1">
          {/* Mode configuration */}
          {isConfiguring && (
            <>
              {/* Bouton de déplacement */}
              <button
                className="p-1 rounded-md hover:bg-white/30 transition-colors cursor-move"
                title="Déplacer"
                onMouseDown={(e) => onMove && onMove(id, e)}
              >
                <Move size={14} className={colorClasses[color]?.icon || colorClasses.orange.icon} />
              </button>
              
              {/* Boutons de redimensionnement */}
              <div className="flex items-center">
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title="Petit"
                  onClick={() => handleResize('small')}
                >
                  <Minimize2 size={14} className={`${size === 'small' ? colorClasses[color]?.icon || colorClasses.orange.icon : 'text-neutral-400'}`} />
                </button>
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title="Moyen"
                  onClick={() => handleResize('medium')}
                >
                  <Maximize2 size={14} className={`${size === 'medium' ? colorClasses[color]?.icon || colorClasses.orange.icon : 'text-neutral-400'}`} />
                </button>
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title="Grand"
                  onClick={() => handleResize('large')}
                >
                  <Maximize2 size={16} className={`${size === 'large' ? colorClasses[color]?.icon || colorClasses.orange.icon : 'text-neutral-400'}`} />
                </button>
              </div>
              
              {/* Bouton de suppression */}
              {removable && (
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title="Supprimer"
                  onClick={handleRemove}
                >
                  <X size={14} className="text-red-500" />
                </button>
              )}
            </>
          )}
          
          {/* Mode normal */}
          {!isConfiguring && (
            <>
              {/* Bouton de paramètres */}
              {onSettingsClick && (
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title="Paramètres"
                  onClick={() => onSettingsClick(id)}
                >
                  <Settings size={14} className={colorClasses[color]?.icon || colorClasses.orange.icon} />
                </button>
              )}
              
              {/* Bouton pour réduire/agrandir */}
              {collapsible && (
                <button
                  className="p-1 rounded-md hover:bg-white/30 transition-colors"
                  title={collapsed ? "Agrandir" : "Réduire"}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  {collapsed ? (
                    <ChevronDown size={14} className={colorClasses[color]?.icon || colorClasses.orange.icon} />
                  ) : (
                    <ChevronUp size={14} className={colorClasses[color]?.icon || colorClasses.orange.icon} />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
      
      {/* Contenu du widget */}
      {!collapsed && (
        <div className="p-4">
          {children}
        </div>
      )}
    </motion.div>
  );
}
