/**
 * Configuration des routes et actions par service
 * Ce fichier définit les routes et actions disponibles pour chaque service
 */

// Routes par défaut pour chaque service après connexion
export const DEFAULT_ROUTES = {
  COURRIER: '/',
  SPFEI: '/',
  SCVAA: '/',
  CONSERVATION: '/',
  ADMIN: '/'
};

// Actions disponibles par service
export const SERVICE_ACTIONS = {
  COURRIER: [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      description: 'Vue d\'ensemble du système',
      icon: 'LayoutDashboard',
      route: '/',
      primary: true
    },
    { 
      id: 'create_dossier', 
      label: 'Créer un dossier', 
      description: 'Enregistrer un nouveau dossier foncier',
      icon: 'Plus',
      route: '/courrier',
      primary: false
    },
    { 
      id: 'view_dossiers', 
      label: 'Consulter les dossiers', 
      description: 'Voir tous les dossiers enregistrés',
      icon: 'Files',
      route: '/dossiers'
    },
    { 
      id: 'send_dossier', 
      label: 'Envoyer au SPFEI', 
      description: 'Transmettre un dossier au Service SPFEI',
      icon: 'Send',
      route: '/courrier/envoyer'
    }
  ],
  
  SPFEI: [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      description: 'Vue d\'ensemble du système',
      icon: 'LayoutDashboard',
      route: '/',
      primary: true
    },
    { 
      id: 'admin_control', 
      label: 'Contrôle administratif', 
      description: 'Effectuer le contrôle administratif des dossiers',
      icon: 'ClipboardCheck',
      route: '/spfei/admin',
      primary: false
    },
    { 
      id: 'title_attribution', 
      label: 'Attribution de titre', 
      description: 'Attribuer un titre foncier aux dossiers conformes',
      icon: 'Award',
      route: '/spfei/titre',
      primary: false
    },
    { 
      id: 'view_dossiers', 
      label: 'Consulter les dossiers', 
      description: 'Voir tous les dossiers',
      icon: 'Files',
      route: '/dossiers',
      primary: false
    }
  ],
  
  SCVAA: [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      description: 'Vue d\'ensemble du système',
      icon: 'LayoutDashboard',
      route: '/',
      primary: true
    },
    { 
      id: 'technical_control', 
      label: 'Contrôle technique', 
      description: 'Effectuer le contrôle technique des dossiers',
      icon: 'FileCheck',
      route: '/scvaa',
      primary: false
    },
    { 
      id: 'view_dossiers', 
      label: 'Consulter les dossiers', 
      description: 'Voir tous les dossiers',
      icon: 'Files',
      route: '/dossiers',
      primary: false
    },
    { 
      id: 'view_sms', 
      label: 'Historique SMS', 
      description: 'Consulter les SMS envoyés aux propriétaires',
      icon: 'MessageSquare',
      route: '/sms',
      primary: false
    }
  ],
  
  CONSERVATION: [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      description: 'Vue d\'ensemble du système',
      icon: 'LayoutDashboard',
      route: '/',
      primary: true
    },
    { 
      id: 'view_dossiers', 
      label: 'Consulter les dossiers', 
      description: 'Voir tous les dossiers archivés',
      icon: 'Files',
      route: '/dossiers',
      primary: false
    },
    { 
      id: 'view_sms', 
      label: 'Historique SMS', 
      description: 'Consulter les SMS envoyés aux propriétaires',
      icon: 'MessageSquare',
      route: '/sms',
      primary: false
    }
  ],
  
  ADMIN: [
    { 
      id: 'dashboard', 
      label: 'Tableau de bord', 
      description: 'Vue d\'ensemble du système',
      icon: 'LayoutDashboard',
      route: '/',
      primary: true
    },
    { 
      id: 'manage_users', 
      label: 'Gestion des utilisateurs', 
      description: 'Gérer les utilisateurs et leurs droits',
      icon: 'Users',
      route: '/admin'
    },
    { 
      id: 'view_dossiers', 
      label: 'Consulter les dossiers', 
      description: 'Voir tous les dossiers',
      icon: 'Files',
      route: '/dossiers'
    },
    { 
      id: 'view_sms', 
      label: 'Historique SMS', 
      description: 'Consulter les SMS envoyés',
      icon: 'MessageSquare',
      route: '/sms'
    }
  ]
};

/**
 * Obtient les actions disponibles pour un service donné
 * @param {string} service - Code du service (COURRIER, SPFEI, etc.) ou libellé complet
 * @returns {Array} Liste des actions disponibles
 */
export function getServiceActions(service) {
  if (!service) return [];
  
  // Mapper les libellés complets aux codes de service
  const serviceMap = {
    'Service Courrier': 'COURRIER',
    'Service SPFEI': 'SPFEI',
    'Service SCVAA': 'SCVAA',
    'Service Conservation': 'CONSERVATION',
    'Administration': 'ADMIN'
  };
  
  // Utiliser le code du service si c'est un libellé, sinon utiliser directement
  const serviceCode = serviceMap[service] || service;
  
  return SERVICE_ACTIONS[serviceCode] || [];
}

/**
 * Obtient la route par défaut pour un service donné
 * @param {string} service - Code du service (COURRIER, SPFEI, etc.) ou libellé complet
 * @returns {string} Route par défaut
 */
export function getDefaultRoute(service) {
  if (!service) return '/';
  
  // Mapper les libellés complets aux codes de service
  const serviceMap = {
    'Service Courrier': 'COURRIER',
    'Service SPFEI': 'SPFEI',
    'Service SCVAA': 'SCVAA',
    'Service Conservation': 'CONSERVATION',
    'Administration': 'ADMIN'
  };
  
  // Utiliser le code du service si c'est un libellé, sinon utiliser directement
  const serviceCode = serviceMap[service] || service;
  
  return DEFAULT_ROUTES[serviceCode] || '/';
}

/**
 * Vérifie si un utilisateur a accès à une route spécifique
 * @param {string} service - Code du service de l'utilisateur
 * @param {string} route - Route à vérifier
 * @returns {boolean} True si l'utilisateur a accès à la route
 */
export function canAccessRoute(service, route) {
  if (service === 'ADMIN') return true; // L'admin a accès à tout
  
  const actions = SERVICE_ACTIONS[service] || [];
  return actions.some(action => action.route === route);
}
