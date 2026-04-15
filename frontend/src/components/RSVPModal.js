import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import confetti from 'canvas-confetti';
import { playAudio } from './EnvelopeAnimation';
import { Emoji } from './Emoji';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function fireConfetti() {
  confetti({ particleCount: 100, spread: 70, startVelocity: 35, gravity: 0.9, ticks: 250,
    colors: ['#006400','#00C853','#FFD700','#003087','#FFFFFF','#FF6B00'],
    origin: { x: 0.5, y: 0.5 } });
  setTimeout(() => {
    confetti({ particleCount: 55, angle: 60, spread: 55, startVelocity: 28, origin: { x: 0, y: 0.65 } });
    confetti({ particleCount: 55, angle: 120, spread: 55, startVelocity: 28, origin: { x: 1, y: 0.65 } });
  }, 200);
  setTimeout(() => {
    confetti({ particleCount: 80, spread: 100, startVelocity: 15, gravity: 0.6, ticks: 300, origin: { x: 0.5, y: 0 } });
  }, 400);
}

const SPARKLE_POSITIONS = [
  { x: -60, y: -60 }, { x: 60, y: -60 },
  { x: -80, y: 0 }, { x: 80, y: 0 },
  { x: -50, y: 60 }, { x: 50, y: 60 },
  { x: 0, y: -80 }, { x: 0, y: 80 },
];

function SuccessSparkles() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
      {SPARKLE_POSITIONS.map((pos, i) => (
        <motion.div
          key={i}
          className="absolute"
          style={{ left: '50%', top: '50%' }}
          initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
          animate={{ x: pos.x, y: pos.y, scale: [0, 1.3, 0.8, 0], opacity: [1, 1, 0.6, 0] }}
          transition={{ duration: 0.9, delay: i * 0.06, ease: 'easeOut' }}
        >
          <Emoji symbol={i % 3 === 0 ? '⭐' : i % 3 === 1 ? '✨' : '🎉'} size="18px" />
        </motion.div>
      ))}
    </div>
  );
}

export default function RSVPModal({ type, slug, guestName, settings, onClose, onSuccess }) {
  const [name, setName] = useState(guestName || '');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [message, setMessage] = useState('');
  const isConfirm = type === 'confirm';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!slug && !name.trim()) { toast.error('Por favor, informe seu nome.'); return; }
    setLoading(true);
    try {
      const payload = { slug: slug || null, response_name: name.trim() || null };
      const res = await axios.post(`${API_BASE}${isConfirm ? '/api/rsvp/confirm' : '/api/rsvp/cancel'}`, payload);
      setMessage(res.data.message);
      setDone(true);
      if (isConfirm) { playAudio('/sounds/celebration.wav'); setTimeout(fireConfetti, 100); }
      onSuccess && onSuccess(isConfirm ? 'confirmed' : 'cancelled');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao registrar resposta.');
    } finally { setLoading(false); }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)' }}
        onClick={!done ? onClose : undefined}
      />
      <motion.div
        className="relative w-full max-w-sm overflow-hidden"
        style={{
          background: 'linear-gradient(170deg, #0f2018 0%, #0a1a10 100%)',
          border: isConfirm ? '1.5px solid rgba(0,200,83,0.4)' : '1.5px solid rgba(255,255,255,0.15)',
          borderRadius: 24,
          boxShadow: isConfirm ? '0 24px 60px rgba(0,0,0,0.7), 0 0 40px rgba(0,200,83,0.15)' : '0 24px 60px rgba(0,0,0,0.7)'
        }}
        initial={{ y: 80, opacity: 0, scale: 0.92 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 60, opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
      >
        <div className="brazil-ribbon" />
        <div className="px-5 py-4 flex items-center justify-between"
          style={{
            background: isConfirm ? 'linear-gradient(90deg, rgba(0,100,0,0.5), rgba(0,200,83,0.2))' : 'rgba(255,255,255,0.04)',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div className="flex items-center gap-2">
            <Emoji symbol={isConfirm ? '🎉' : '😔'} size="22px" />
            <h2 className="font-bold text-base" style={{ color: isConfirm ? '#69F0AE' : 'rgba(255,255,255,0.85)' }}>
              {isConfirm ? 'Confirmar presença' : 'Cancelar presença'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl" style={{ color: 'rgba(255,255,255,0.4)' }} data-testid="rsvp-modal-close">
            <X size={17} />
          </button>
        </div>

        <div className="p-5">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.form key="form" onSubmit={handleSubmit}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              >
                {!slug ? (
                  <div className="mb-4">
                    <label className="block text-sm font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.65)' }}>Seu nome ou apelido</label>
                    <input
                      type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="Como você quer ser chamado?"
                      className="w-full px-4 py-3 rounded-xl text-sm font-medium focus:outline-none"
                      style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', color: 'white', caretColor: '#FFD700' }}
                      required data-testid="rsvp-name-input"
                    />
                  </div>
                ) : (
                  <div className="mb-4 p-3 rounded-xl flex items-center gap-2"
                    style={{ background: 'rgba(0,200,83,0.1)', border: '1px solid rgba(0,200,83,0.25)' }}
                  >
                    <Emoji symbol="👋" size="18px" />
                    <p className="text-sm font-semibold" style={{ color: '#69F0AE' }}>{guestName}</p>
                  </div>
                )}
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {isConfirm ? 'Mal podemos esperar te ver na festa!' : 'Sentiremos sua falta. Confirme o cancelamento:'}
                </p>
                <motion.button
                  type="submit" disabled={loading}
                  data-testid={isConfirm ? 'rsvp-confirm-submit' : 'rsvp-cancel-confirm'}
                  whileHover={!loading ? { scale: 1.02 } : {}} whileTap={!loading ? { scale: 0.97 } : {}}
                  className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-50"
                  style={{
                    background: isConfirm ? 'linear-gradient(135deg, #00C853, #006400)' : 'rgba(255,255,255,0.09)',
                    color: 'white', border: isConfirm ? 'none' : '1px solid rgba(255,255,255,0.18)',
                    boxShadow: isConfirm ? '0 4px 20px rgba(0,200,83,0.35)' : 'none'
                  }}
                >
                  {loading ? 'Enviando...' : (isConfirm ? 'Confirmar presença!' : 'Confirmar cancelamento')}
                </motion.button>
                <button type="button" onClick={onClose} className="w-full mt-2 py-2 text-xs font-medium"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'transparent', border: 'none' }}
                >Voltar</button>
              </motion.form>
            ) : (
              <motion.div key="success"
                initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                className="text-center py-3 relative"
              >
                {isConfirm && <SuccessSparkles />}
                <motion.div className="relative z-10 flex justify-center mb-3"
                  initial={{ scale: 0, rotate: -30 }}
                  animate={{ scale: [0, 1.3, 0.95, 1.05, 1], rotate: [-30, 10, -5, 3, 0] }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                >
                  <Emoji symbol={isConfirm ? '🎉' : '🤍'} size="56px" />
                </motion.div>
                <motion.p
                  data-testid={isConfirm ? 'rsvp-confirm-success-text' : 'rsvp-cancel-success-text'}
                  className="font-semibold text-base leading-relaxed mb-1 relative z-10"
                  style={{ color: 'rgba(255,255,255,0.92)' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                >{message}</motion.p>
                {isConfirm && (
                  <motion.p className="text-xs mb-5 relative z-10 flex items-center justify-center gap-1" style={{ color: '#69F0AE' }}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                  >
                    <Emoji symbol="⚽" size="14px" />
                    Brasil x Marrocos às 19h — nos vemos lá!
                  </motion.p>
                )}
                <motion.button onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-sm font-bold relative z-10"
                  style={{ background: 'linear-gradient(135deg, #00C853, #006400)', color: 'white' }}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
                >Fechar</motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  );
}
