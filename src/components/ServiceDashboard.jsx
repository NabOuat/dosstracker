import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getServiceActions } from '../utils/serviceRoutes';
import * as LucideIcons from 'lucide-react';

export default function ServiceDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [actions, setActions] = useState([]);

  useEffect(() => {
    if (user && user.service) {
      setActions(getServiceActions(user.service));
    }
  }, [user]);

  if (!user || !actions.length) return null;

  const handleActionClick = (route) => {
    navigate(route);
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <span className="section-label" style={{ color: getServiceColor(user.service) }}>
          {user.label || user.service}
        </span>
        <h1 className="font-display font-bold text-2xl text-neutral-900">
          Bienvenue, <span style={{ color: getServiceColor(user.service) }}>{user.username}</span>
        </h1>
        <p className="text-sm text-neutral-500 mt-1">
          Sélectionnez une action pour commencer
        </p>
      </div>

      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {actions.map((action) => {
          const Icon = LucideIcons[action.icon] || LucideIcons.Activity;
          
          return (
            <motion.div
              key={action.id}
              variants={item}
              className={`bg-white rounded-lg p-5 cursor-pointer transition-all hover:shadow-lg ${
                action.primary ? 'border-l-4' : ''
              }`}
              style={{ 
                boxShadow: 'var(--shadow-md)',
                borderLeftColor: action.primary ? getServiceColor(user.service) : 'transparent'
              }}
              onClick={() => handleActionClick(action.route)}
            >
              <div className="flex items-start gap-4">
                <div 
                  className="w-12 h-12 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{ 
                    backgroundColor: action.primary 
                      ? `${getServiceColorLight(user.service)}` 
                      : 'var(--neutral-100)'
                  }}
                >
                  <Icon 
                    size={24} 
                    style={{ 
                      color: action.primary 
                        ? getServiceColor(user.service) 
                        : 'var(--neutral-500)'
                    }} 
                  />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-neutral-800">
                    {action.label}
                  </h3>
                  <p className="text-sm text-neutral-500 mt-1">
                    {action.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// Fonction utilitaire pour obtenir la couleur du service
function getServiceColor(service) {
  const colors = {
    COURRIER: 'var(--ci-blue)',
    SPFEI: 'var(--ci-orange)',
    SCVAA: 'var(--ci-green)',
    CONSERVATION: 'var(--ci-purple)',
    ADMIN: '#6366F1' // Indigo
  };
  
  return colors[service] || 'var(--neutral-500)';
}

// Fonction utilitaire pour obtenir la couleur claire du service
function getServiceColorLight(service) {
  const colors = {
    COURRIER: 'var(--ci-blue-pale)',
    SPFEI: 'var(--ci-orange-pale)',
    SCVAA: 'var(--ci-green-pale)',
    CONSERVATION: '#F3E8FF', // Purple light
    ADMIN: '#EEF2FF' // Indigo light
  };
  
  return colors[service] || 'var(--neutral-100)';
}
