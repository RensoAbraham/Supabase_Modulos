import React, { useState, useRef, useEffect } from 'react';
import { X, Banknote } from 'lucide-react';

interface OpeningModalProps {
  onOpenRegister: (amount: string, note: string) => void;
  onDiscard: () => void;
}

const OpeningModal: React.FC<OpeningModalProps> = ({ onOpenRegister, onDiscard }) => {
  const [amount, setAmount] = useState('0,00');
  const [note, setNote] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-select the amount text on mount to match the image (blue highlight)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.select();
    }
  }, []);

  return (
    <div className="w-[600px] bg-white rounded shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Control de apertura</h2>
      </div>

      {/* Body */}
      <div className="p-6 space-y-6">
        
        {/* Amount Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Caja de apertura
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-bold selection:bg-blue-600 selection:text-white"
              />
              {/* Clear 'X' button inside input */}
              <button 
                onClick={() => {
                    setAmount('');
                    inputRef.current?.focus();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} strokeWidth={3} />
              </button>
            </div>
            
            {/* Cash Icon Button */}
            <button className="px-3 py-2 border border-gray-300 rounded bg-gray-50 text-gray-600 hover:bg-gray-100">
              <Banknote size={20} />
            </button>
          </div>
        </div>

        {/* Note Field */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-600">
            Nota de apertura
          </label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Añadir una nota de apertura..."
            className="w-full h-32 p-3 border border-gray-300 rounded text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 bg-white flex items-center gap-3 mb-2">
        <button
          onClick={() => onOpenRegister(amount, note)}
          className="px-6 py-2.5 bg-[#704559] hover:bg-[#5a3748] text-white font-semibold rounded shadow-sm transition-colors text-sm"
        >
          Abrir caja registradora
        </button>
        <button
          onClick={onDiscard}
          className="px-6 py-2.5 bg-white border border-gray-300 text-gray-700 font-semibold rounded hover:bg-gray-50 transition-colors text-sm"
        >
          Descartar
        </button>
      </div>
    </div>
  );
};

export default OpeningModal;