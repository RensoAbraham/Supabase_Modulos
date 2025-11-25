import React, { useState, useEffect } from 'react';
import { Settings, Scale, RefreshCw, Hand } from 'lucide-react';

interface ScaleConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: ScaleConfig;
  onSave: (config: ScaleConfig) => void;
}

export interface ScaleConfig {
  mode: 'manual' | 'simulation';
  autoStability: boolean;
}

const ScaleConfigModal: React.FC<ScaleConfigModalProps> = ({ isOpen, onClose, config, onSave }) => {
  const [localConfig, setLocalConfig] = useState<ScaleConfig>(config);

  useEffect(() => {
    setLocalConfig(config);
  }, [config]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(localConfig);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden transform transition-all scale-100">
        <div className="bg-gradient-to-r from-[#704559] to-[#8a5a6e] p-4 flex items-center gap-3">
          <Settings className="text-white" size={24} />
          <h2 className="text-xl font-bold text-white">Configuración de Balanza</h2>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <label className="block text-sm font-bold text-gray-300 uppercase tracking-wide">Modo de Operación</label>
            
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setLocalConfig({ ...localConfig, mode: 'manual' })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  localConfig.mode === 'manual'
                    ? 'border-[#8a5a6e] bg-[#8a5a6e]/20 text-[#c89bb3]'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700/30 text-gray-400'
                }`}
              >
                <Hand size={32} className="mb-2" />
                <span className="font-bold">Manual</span>
                <span className="text-xs text-center mt-1 opacity-75">Ingreso directo de peso</span>
              </button>

              <button
                onClick={() => setLocalConfig({ ...localConfig, mode: 'simulation' })}
                className={`flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all ${
                  localConfig.mode === 'simulation'
                    ? 'border-[#8a5a6e] bg-[#8a5a6e]/20 text-[#c89bb3]'
                    : 'border-gray-600 hover:border-gray-500 bg-gray-700/30 text-gray-400'
                }`}
              >
                <RefreshCw size={32} className="mb-2" />
                <span className="font-bold">Simulación</span>
                <span className="text-xs text-center mt-1 opacity-75">Peso aleatorio / Conexión virtual</span>
              </button>
            </div>
          </div>

          {localConfig.mode === 'simulation' && (
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
              <div className="flex items-center gap-3">
                <Scale size={20} className="text-gray-400" />
                <div>
                  <p className="font-bold text-gray-200">Estabilización Automática</p>
                  <p className="text-xs text-gray-400">Simular tiempo de lectura</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={localConfig.autoStability}
                  onChange={(e) => setLocalConfig({ ...localConfig, autoStability: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#8a5a6e]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#8a5a6e]"></div>
              </label>
            </div>
          )}
        </div>

        <div className="p-4 bg-gray-800/50 border-t border-gray-700/50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 font-bold hover:bg-gray-700 rounded-lg transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-gradient-to-r from-[#704559] to-[#8a5a6e] text-white font-bold rounded-lg hover:from-[#5a3748] hover:to-[#704559] shadow-lg transition-all"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScaleConfigModal;
