const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const CURRENT_LOG_LEVEL = LOG_LEVELS.DEBUG;

class Logger {
  constructor() {
    this.logs = [];
    this.maxLogs = 1000;
  }

  formatTimestamp() {
    const now = new Date();
    return now.toISOString();
  }

  addLog(level, message, data = null) {
    const timestamp = this.formatTimestamp();
    const logEntry = {
      timestamp,
      level,
      message,
      data
    };

    this.logs.push(logEntry);

    // Garder seulement les derniers maxLogs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Sauvegarder dans localStorage
    this.saveToLocalStorage();

    // Afficher dans la console du navigateur
    this.logToConsole(level, timestamp, message, data);
  }

  logToConsole(level, timestamp, message, data) {
    const prefix = `[${timestamp}] [${level}]`;
    
    switch (level) {
      case 'DEBUG':
        console.debug(prefix, message, data);
        break;
      case 'INFO':
        console.info(prefix, message, data);
        break;
      case 'WARN':
        console.warn(prefix, message, data);
        break;
      case 'ERROR':
        console.error(prefix, message, data);
        break;
      default:
        console.log(prefix, message, data);
    }
  }

  debug(message, data = null) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.DEBUG) {
      this.addLog('DEBUG', message, data);
    }
  }

  info(message, data = null) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.INFO) {
      this.addLog('INFO', message, data);
    }
  }

  warn(message, data = null) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.WARN) {
      this.addLog('WARN', message, data);
    }
  }

  error(message, data = null) {
    if (CURRENT_LOG_LEVEL <= LOG_LEVELS.ERROR) {
      this.addLog('ERROR', message, data);
    }
  }

  saveToLocalStorage() {
    try {
      localStorage.setItem('dostracker_logs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Erreur lors de la sauvegarde des logs:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      const stored = localStorage.getItem('dostracker_logs');
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.error('Erreur lors du chargement des logs:', e);
    }
  }

  getLogs() {
    return this.logs;
  }

  getLogsAsText() {
    return this.logs
      .map(log => `[${log.timestamp}] [${log.level}] ${log.message}${log.data ? ' ' + JSON.stringify(log.data) : ''}`)
      .join('\n');
  }

  downloadLogs() {
    const logsText = this.getLogsAsText();
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(logsText));
    element.setAttribute('download', `dostracker_logs_${new Date().toISOString().split('T')[0]}.log`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('dostracker_logs');
  }
}

const logger = new Logger();
logger.loadFromLocalStorage();

export default logger;
