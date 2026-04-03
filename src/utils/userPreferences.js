/**
 * Service de gestion des préférences utilisateur
 * Permet de sauvegarder et charger les préférences utilisateur, notamment pour la personnalisation du tableau de bord
 */

// Clés de stockage local
const LS_DASHBOARD_LAYOUT = 'dostracker_dashboard_layout';
const LS_DASHBOARD_WIDGETS = 'dostracker_dashboard_widgets';
const LS_USER_PREFERENCES = 'dostracker_user_preferences';

/**
 * Widgets disponibles pour le tableau de bord
 */
export const AVAILABLE_WIDGETS = {
  'stats': {
    id: 'stats',
    title: 'Statistiques générales',
    type: 'stats',
    color: 'orange',
    size: 'large',
    removable: false,
    order: 1
  },
  'recent_dossiers': {
    id: 'recent_dossiers',
    title: 'Dossiers récents',
    type: 'recent_dossiers',
    color: 'blue',
    size: 'large',
    removable: true,
    order: 2
  },
  'my_tasks': {
    id: 'my_tasks',
    title: 'Mes tâches',
    type: 'my_tasks',
    color: 'green',
    size: 'medium',
    removable: true,
    order: 3
  },
  'sms_history': {
    id: 'sms_history',
    title: 'Historique des SMS',
    type: 'sms_history',
    color: 'purple',
    size: 'medium',
    removable: true,
    order: 4
  },
  'performance': {
    id: 'performance',
    title: 'Performance',
    type: 'performance',
    color: 'red',
    size: 'medium',
    removable: true,
    order: 5
  },
  'notifications': {
    id: 'notifications',
    title: 'Notifications',
    type: 'notifications',
    color: 'neutral',
    size: 'small',
    removable: true,
    order: 6
  }
};

/**
 * Layout par défaut du tableau de bord
 */
const DEFAULT_DASHBOARD_LAYOUT = {
  widgets: ['stats', 'recent_dossiers', 'my_tasks', 'sms_history']
};

/**
 * Préférences utilisateur par défaut
 */
const DEFAULT_USER_PREFERENCES = {
  theme: 'light',
  language: 'fr',
  notifications: {
    email: true,
    sms: true,
    app: true
  },
  display: {
    compactMode: false,
    showHelp: true
  }
};

/**
 * Charge le layout du tableau de bord depuis le stockage local
 * @returns {Object} Layout du tableau de bord
 */
export function loadDashboardLayout() {
  try {
    const savedLayout = localStorage.getItem(LS_DASHBOARD_LAYOUT);
    if (savedLayout) {
      return JSON.parse(savedLayout);
    }
  } catch (error) {
    console.error('Erreur lors du chargement du layout du tableau de bord:', error);
  }
  return DEFAULT_DASHBOARD_LAYOUT;
}

/**
 * Sauvegarde le layout du tableau de bord dans le stockage local
 * @param {Object} layout - Layout du tableau de bord à sauvegarder
 */
export function saveDashboardLayout(layout) {
  try {
    localStorage.setItem(LS_DASHBOARD_LAYOUT, JSON.stringify(layout));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du layout du tableau de bord:', error);
  }
}

/**
 * Charge les widgets du tableau de bord depuis le stockage local
 * @returns {Object} Widgets du tableau de bord avec leurs configurations
 */
export function loadDashboardWidgets() {
  try {
    const savedWidgets = localStorage.getItem(LS_DASHBOARD_WIDGETS);
    if (savedWidgets) {
      const parsedWidgets = JSON.parse(savedWidgets);
      
      // Fusionner avec les widgets disponibles pour s'assurer que tous les champs sont présents
      const mergedWidgets = {};
      Object.keys(parsedWidgets).forEach(widgetId => {
        if (AVAILABLE_WIDGETS[widgetId]) {
          mergedWidgets[widgetId] = {
            ...AVAILABLE_WIDGETS[widgetId],
            ...parsedWidgets[widgetId]
          };
        }
      });
      
      return mergedWidgets;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des widgets du tableau de bord:', error);
  }
  
  // Si aucun widget n'est sauvegardé, retourner les widgets par défaut
  const defaultWidgets = {};
  DEFAULT_DASHBOARD_LAYOUT.widgets.forEach(widgetId => {
    if (AVAILABLE_WIDGETS[widgetId]) {
      defaultWidgets[widgetId] = { ...AVAILABLE_WIDGETS[widgetId] };
    }
  });
  
  return defaultWidgets;
}

/**
 * Sauvegarde les widgets du tableau de bord dans le stockage local
 * @param {Object} widgets - Widgets du tableau de bord à sauvegarder
 */
export function saveDashboardWidgets(widgets) {
  try {
    localStorage.setItem(LS_DASHBOARD_WIDGETS, JSON.stringify(widgets));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des widgets du tableau de bord:', error);
  }
}

/**
 * Charge les préférences utilisateur depuis le stockage local
 * @returns {Object} Préférences utilisateur
 */
export function loadUserPreferences() {
  try {
    const savedPreferences = localStorage.getItem(LS_USER_PREFERENCES);
    if (savedPreferences) {
      return { ...DEFAULT_USER_PREFERENCES, ...JSON.parse(savedPreferences) };
    }
  } catch (error) {
    console.error('Erreur lors du chargement des préférences utilisateur:', error);
  }
  return DEFAULT_USER_PREFERENCES;
}

/**
 * Sauvegarde les préférences utilisateur dans le stockage local
 * @param {Object} preferences - Préférences utilisateur à sauvegarder
 */
export function saveUserPreferences(preferences) {
  try {
    localStorage.setItem(LS_USER_PREFERENCES, JSON.stringify(preferences));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des préférences utilisateur:', error);
  }
}

/**
 * Réinitialise le tableau de bord aux paramètres par défaut
 */
export function resetDashboardToDefault() {
  try {
    localStorage.removeItem(LS_DASHBOARD_LAYOUT);
    localStorage.removeItem(LS_DASHBOARD_WIDGETS);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du tableau de bord:', error);
  }
}

/**
 * Réinitialise toutes les préférences utilisateur aux paramètres par défaut
 */
export function resetAllPreferences() {
  try {
    localStorage.removeItem(LS_DASHBOARD_LAYOUT);
    localStorage.removeItem(LS_DASHBOARD_WIDGETS);
    localStorage.removeItem(LS_USER_PREFERENCES);
  } catch (error) {
    console.error('Erreur lors de la réinitialisation des préférences utilisateur:', error);
  }
}
