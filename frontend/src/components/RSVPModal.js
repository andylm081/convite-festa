import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, UserX, User } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { playAudio } from './EnvelopeAnimation';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function fireConfetti() {
  confetti({
    particleCount: 80,
    spread: 60,
    startVelocity: 28,
    gravity: 0.9,
    ticks: 200,
    colors: ['#006400', '#00A550', '#FFD700', '#003087', '#FFFFFF'],
    origin: { x: 0.5, y: 0.6 }
  });
}

export default function RSVPModal({ type, slug, guestName, settings, onClose, onSuccess }) {
  const [name, setName] = useState(guestName || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');

  const isConfirm = type === 'confirm';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug && !name.trim()) {
      toast.error('Por favor, informe seu nome.');
      return;
    }
    setLoading(true);
    try {
      const payload = { slug: slug || null, response_name: name.trim() || null };
      const endpoint = isConfirm ? '/api/rsvp/confirm' : '/api/rsvp/cancel';
      const res = await axios.post(`${API_BASE}${endpoint}`, payload);
      setMessage(res.data.message);
      setDone(true);
      if (isConfirm) {
        playAudio('/sounds/celebration.wav');
        fireConfetti();
      }
      onSuccess && onSuccess(isConfirm ? 'confirmed' : 'cancelled');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao registrar resposta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!done ? onClose : undefined}
      />

      {/* Modal */}
      <motion.div
        className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden shadow-2xl"
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Header strip */}
        <div className={`px-5 py-4 ${isConfirm ? 'bg-green-800' : 'bg-gray-800'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isConfirm
                ? <Check className="text-green-300" size={20} />
                : <UserX className="text-gray-300" size={20} />
              }
              <h2 className="text-white font-semibold text-base">
                {isConfirm ? 'Confirmar presença' : 'Cancelar presença'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white transition-colors p-1"
              data-testid="rsvp-modal-close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {!slug ? (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      <User size={14} className="inline mr-1" />
                      Seu nome ou apelido
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 focus:border-transparent"
                      required
                      data-testid="rsvp-name-input"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-3 bg-green-50 rounded-xl border border-green-100">
                    <p className="text-sm text-green-800">
                      <span className="font-semibold">Convidado:</span> {guestName}
                    </p>
                  </div>
                )}

                <p className="text-sm text-gray-600 mb-4">
                  {isConfirm
                    ? '🎉 Que ótimo! Confirme sua presença na festa!'
                    : '😢 Que pena! Confirme o cancelamento.'}
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid={isConfirm ? 'rsvp-confirm-submit' : 'rsvp-cancel-confirm'}
                  className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                    isConfirm
                      ? 'bg-green-800 hover:bg-green-700 text-white'
                      : 'bg-gray-800 hover:bg-gray-700 text-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Enviando...' : (isConfirm ? 'Confirmar presença!' : 'Cancelar presença')}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-2 py-2.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Voltar
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                  isConfirm ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  {isConfirm
                    ? <Check className="text-green-700" size={28} />
                    : <UserX className="text-gray-600" size={28} />
                  }
                </div>
                <p
                  data-testid={isConfirm ? 'rsvp-confirm-success-text' : 'rsvp-cancel-success-text'}
                  className="text-gray-800 font-medium text-base leading-relaxed mb-5"
                >
                  {message}
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-green-800 text-white rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
                >
                  Fechar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
