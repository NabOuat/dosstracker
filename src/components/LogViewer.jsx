import React, { useState, useEffect } from 'react';
import logger from '../utils/logger';
import { Download, Trash2, X } from 'lucide-react';

export default function LogViewer() {
  const [isOpen, setIsOpen] = useState(false);
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    if (isOpen) {
      setLogs(logger.getLogs());
    }
  }, [isOpen]);

  const filteredLogs = logs.filter(log => {
    const searchTerm = filter.toLowerCase();
    return (
      log.level.toLowerCase().includes(searchTerm) ||
      log.message.toLowerCase().includes(searchTerm) ||
      (log.data && JSON.stringify(log.data).toLowerCase().includes(searchTerm))
    );
  });

  const handleDownload = () => {
    logger.downloadLogs();
  };

  const handleClear = () => {
    if (confirm('Êtes-vous sûr de vouloir effacer tous les logs?')) {
      logger.clearLogs();
      setLogs([]);
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'DEBUG':
        return 'text-gray-500';
      case 'INFO':
        return 'text-blue-500';
      case 'WARN':
        return 'text-yellow-500';
      case 'ERROR':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getLevelBgColor = (level) => {
    switch (level) {
      case 'DEBUG':
        return 'bg-gray-100';
      case 'INFO':
        return 'bg-blue-100';
      case 'WARN':
        return 'bg-yellow-100';
      case 'ERROR':
        return 'bg-red-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-4 right-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-lg z-40 text-sm font-medium"
        title="Ouvrir le visualiseur de logs"
      >
        📋 Logs ({logs.length})
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-white rounded-lg shadow-2xl border border-gray-300 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="font-bold text-gray-800">Logs de l'application</h3>
        <button
          onClick={() => setIsOpen(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          <X size={20} />
        </button>
      </div>

      {/* Filter */}
      <div className="p-3 border-b border-gray-200 bg-gray-50">
        <input
          type="text"
          placeholder="Filtrer les logs..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Logs List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center text-gray-500 text-sm py-4">
            {logs.length === 0 ? 'Aucun log' : 'Aucun log correspondant au filtre'}
          </div>
        ) : (
          filteredLogs.map((log, index) => (
            <div
              key={index}
              className={`p-2 rounded text-xs font-mono border-l-4 ${getLevelBgColor(log.level)}`}
            >
              <div className="flex items-start gap-2">
                <span className={`font-bold min-w-fit ${getLevelColor(log.level)}`}>
                  {log.level}
                </span>
                <div className="flex-1">
                  <div className="text-gray-700">{log.message}</div>
                  {log.data && (
                    <div className="text-gray-600 mt-1 break-words">
                      {typeof log.data === 'string' ? log.data : JSON.stringify(log.data, null, 2)}
                    </div>
                  )}
                  <div className="text-gray-400 text-xs mt-1">{log.timestamp}</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between p-3 border-t border-gray-200 bg-gray-50">
        <span className="text-xs text-gray-600">
          {filteredLogs.length} / {logs.length} logs
        </span>
        <div className="flex gap-2">
          <button
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-xs font-medium"
            title="Télécharger les logs"
          >
            <Download size={14} />
            Télécharger
          </button>
          <button
            onClick={handleClear}
            className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-medium"
            title="Effacer les logs"
          >
            <Trash2 size={14} />
            Effacer
          </button>
        </div>
      </div>
    </div>
  );
}
