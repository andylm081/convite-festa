import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function playAudio(src) {
  try {
    const audio = new Audio(src);
    audio.volume = 0.45;
    audio.play().catch(() => {});
  } catch (e) {}
}

// CSS-animated confetti particles
const CONFETTI_COLORS = [
  '#FFD700', '#00C853', '#FF6B00', '#003087', '#FFFFFF',
  '#FF3D00', '#FFCC00', '#69F0AE', '#40C4FF',
];

function ConfettiParticles({ count = 24 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left = `${Math.random() * 100}%`;
        const delay = `${Math.random() * 6}s`;
        const duration = `${4 + Math.random() * 6}s`;
        const size = `${6 + Math.random() * 8}px`;
        const height = `${4 + Math.random() * 5}px`;
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left,
              width: size,
              height,
              background: color,
              animationDelay: delay,
              animationDuration: duration,
              borderRadius: Math.random() > 0.5 ? '50%' : '1px',
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        );
      })}
    </>
  );
}

export default function EnvelopeAnimation({ onOpen, isOpen }) {
  const [phase, setPhase] = useState('sealed'); // sealed | breaking | open
  const prefersReduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleTap = () => {
    if (phase !== 'sealed') return;
    playAudio('/sounds/envelope-open.wav');
    setPhase('breaking');
    setTimeout(() => {
      setPhase('open');
      onOpen && onOpen();
    }, 700);
  };

  if (prefersReduced) {
    return (
      <div data-testid="invite-envelope-stage" className="flex flex-col items-center">
        <button
          data-testid="invite-envelope-seal-button"
          onClick={() => { onOpen && onOpen(); }}
          className="px-6 py-3 bg-yellow-400 text-green-900 rounded-xl font-bold text-lg"
        >
          Abrir convite ✉️
        </button>
      </div>
    );
  }

  return (
    <div data-testid="invite-envelope-stage" className="w-full flex flex-col items-center">
      <ConfettiParticles count={20} />

      <AnimatePresence mode="wait">
        {phase === 'sealed' && (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.85, y: -20 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.2 }}
            className="w-full max-w-[340px] px-4"
          >
            {/* Sealed card */}
            <div className="sealed-card p-0 overflow-hidden">
              {/* Top ribbon */}
              <div className="brazil-ribbon" />

              {/* Inner content */}
              <div className="px-6 pt-7 pb-8 flex flex-col items-center text-center">
                {/* Floating envelope emoji */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                  className="text-6xl mb-4 select-none"
                >
                  🎁
                </motion.div>

                <h2 className="font-bebas text-3xl text-yellow-400 text-glow-yellow mb-1 tracking-wider">
                  Você tem um convite!
                </h2>
                <p className="text-green-300 text-sm font-medium mb-6 opacity-80">
                  Anderson & Arthur te chamam pra festa 🎉
                </p>

                {/* Seal tap button */}
                <motion.button
                  data-testid="invite-envelope-seal-button"
                  onClick={handleTap}
                  className="relative btn-shimmer glow-pulse text-green-900 font-bold text-lg px-8 py-4 rounded-2xl shadow-lg cursor-pointer select-none"
                  whileTap={{ scale: 0.93 }}
                  whileHover={{ scale: 1.04 }}
                  style={{ fontFamily: 'Manrope, sans-serif' }}
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Abrir convite</span>
                    <span>✨</span>
                  </span>
                </motion.button>

                <p className="text-green-600 text-xs mt-4 font-medium">
                  Toque para revelar a surpresa
                </p>
              </div>

              {/* Stars decorations */}
              <div className="flex justify-center gap-6 pb-5">
                {['⚽', '🏆', '🎊', '🇧🇷', '🎉'].map((em, i) => (
                  <motion.span
                    key={i}
                    className="text-xl opacity-60"
                    animate={{ opacity: [0.4, 0.8, 0.4] }}
                    transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
                  >
                    {em}
                  </motion.span>
                ))}
              </div>

              {/* Bottom ribbon */}
              <div className="brazil-ribbon" />
            </div>
          </motion.div>
        )}

        {phase === 'breaking' && (
          <motion.div
            key="breaking"
            initial={{ scale: 1 }}
            animate={{ scale: [1, 1.08, 0.95], rotate: [0, 2, -2, 0] }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[340px] px-4"
          >
            <div className="sealed-card p-8 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.5, 1], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl"
              >
                🎊
              </motion.div>
              <p className="text-yellow-400 font-bold text-lg mt-3 font-bebas tracking-wider">Abrindo...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
