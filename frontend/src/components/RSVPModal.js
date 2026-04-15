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
    particleCount: 120,
    spread: 70,
    startVelocity: 32,
    gravity: 0.85,
    ticks: 220,
    colors: ['#006400', '#00C853', '#FFD700', '#003087', '#FFFFFF', '#FF6B00'],
    origin: { x: 0.5, y: 0.55 }
  });
  setTimeout(() => {
    confetti({ particleCount: 60, spread: 50, startVelocity: 20,
      colors: ['#FFD700', '#00C853', '#FF6B00'],
      origin: { x: 0.3, y: 0.7 } });
    confetti({ particleCount: 60, spread: 50, startVelocity: 20,
      colors: ['#FFD700', '#00C853', '#FF6B00'],
      origin: { x: 0.7, y: 0.7 } });
  }, 250);
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
      toast.error(err.response?.data?.detail || 'Erro ao registrar resposta.');
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
      <motion.div
        className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
        onClick={!done ? onClose : undefined}
      />

      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #0f2018 0%, #0a1a10 100%)',
          border: isConfirm ? '1.5px solid rgba(0,200,83,0.35)' : '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          boxShadow: '0 24px 60px rgba(0,0,0,0.7)'
        }}
        initial={{ y: 60, opacity: 0, scale: 0.96 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Brazil ribbon */}
        <div className="brazil-ribbon" />

        {/* Header */}
        <div
          className="px-5 py-4 flex items-center justify-between"
          style={{
            background: isConfirm
              ? 'linear-gradient(90deg, rgba(0,100,0,0.5), rgba(0,200,83,0.2))'
              : 'rgba(255,255,255,0.05)',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center gap-2">
            <span className="text-2xl">{isConfirm ? '🎉' : '😔'}</span>
            <h2 className="font-bold text-base" style={{ color: isConfirm ? '#69F0AE' : 'rgba(255,255,255,0.85)' }}>
              {isConfirm ? 'Confirmar presença' : 'Cancelar presença'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: 'rgba(255,255,255,0.5)' }}
            data-testid="rsvp-modal-close"
          >
            <X size={18} />
          </button>
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
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>
                      Seu nome ou apelido
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{
                        background: 'rgba(255,255,255,0.07)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        color: 'white',
                        caretColor: '#FFD700'
                      }}
                      required
                      data-testid="rsvp-name-input"
                    />
                  </div>
                ) : (
                  <div
                    className="mb-4 p-3 rounded-xl flex items-center gap-2"
                    style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)' }}
                  >
                    <span className="text-lg">👋</span>
                    <p className="text-sm font-semibold" style={{ color: '#69F0AE' }}>
                      {guestName}
                    </p>
                  </div>
                )}

                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {isConfirm
                    ? '🎉 Mal podemos esperar te ver na festa!'
                    : '😢 Sentiremos sua falta. Confirme o cancelamento:'}
                </p>

                <button
                  type="submit"
                  disabled={loading}
                  data-testid={isConfirm ? 'rsvp-confirm-submit' : 'rsvp-cancel-confirm'}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  style={{
                    background: isConfirm
                      ? 'linear-gradient(135deg, #00C853, #006400)'
                      : 'rgba(255,255,255,0.1)',
                    color: 'white',
                    border: isConfirm ? 'none' : '1px solid rgba(255,255,255,0.2)'
                  }}
                >
                  {loading ? 'Enviando...' : (isConfirm ? '🎉 Confirmar presença!' : 'Confirmar cancelamento')}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-2 py-2.5 text-sm font-medium transition-colors"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  Voltar
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.93 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <div className="text-5xl mb-3">
                  {isConfirm ? '🎉' : '🤍'}
                </div>
                <p
                  data-testid={isConfirm ? 'rsvp-confirm-success-text' : 'rsvp-cancel-success-text'}
                  className="font-semibold text-base leading-relaxed mb-5"
                  style={{ color: 'rgba(255,255,255,0.9)' }}
                >
                  {message}
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                  style={{ background: 'linear-gradient(135deg, #00C853, #006400)', color: 'white' }}
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
