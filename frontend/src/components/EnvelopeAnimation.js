import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function playAudio(src) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    fetch(src)
      .then(r => r.arrayBuffer())
      .then(buf => ctx.decodeAudioData(buf))
      .then(decoded => {
        const source = ctx.createBufferSource();
        const gain = ctx.createGain();
        gain.gain.value = 0.55;
        source.buffer = decoded;
        source.connect(gain);
        gain.connect(ctx.destination);
        source.start(0);
      })
      .catch(() => {
        // Fallback to Audio element
        const a = new Audio(src);
        a.volume = 0.55;
        a.play().catch(() => {});
      });
  } catch (e) {
    const a = new Audio(src);
    a.volume = 0.55;
    a.play().catch(() => {});
  }
}

const CONFETTI_COLORS = [
  '#FFD700', '#00C853', '#FF6B00', '#003087', '#FFFFFF',
  '#FF3D00', '#FFCC00', '#69F0AE', '#40C4FF', '#FF80AB',
];

// Confetti pieces always fall from the very TOP of the viewport
function ConfettiParticles({ count = 28 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => {
        const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
        const left = `${(i / count) * 100 + Math.random() * (100 / count)}%`;
        const delay = `${(i * 0.25) % 5}s`;
        const duration = `${5 + (i % 4)}s`;
        const size = `${7 + (i % 5)}px`;
        const height = `${4 + (i % 4)}px`;
        const isCircle = i % 3 === 0;
        return (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left,
              top: '-12px',        // always start from the very top
              width: isCircle ? size : size,
              height: isCircle ? size : height,
              background: color,
              animationDelay: delay,
              animationDuration: duration,
              borderRadius: isCircle ? '50%' : '1px',
            }}
          />
        );
      })}
    </>
  );
}

export default function EnvelopeAnimation({ onOpen }) {
  const [phase, setPhase] = useState('sealed');
  const prefersReduced = typeof window !== 'undefined' &&
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const handleTap = () => {
    if (phase !== 'sealed') return;
    playAudio('/sounds/envelope-open.wav');
    setPhase('breaking');
    setTimeout(() => { setPhase('open'); onOpen && onOpen(); }, 650);
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
      <ConfettiParticles count={28} />

      <AnimatePresence mode="wait">
        {phase === 'sealed' && (
          <motion.div
            key="sealed"
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: -30 }}
            transition={{ type: 'spring', stiffness: 240, damping: 22, delay: 0.2 }}
            className="w-full max-w-[340px] px-4"
          >
            <div className="sealed-card p-0 overflow-hidden">
              <div className="brazil-ribbon" />
              <div className="px-6 pt-7 pb-6 flex flex-col items-center text-center">
                {/* Floating envelope icon */}
                <motion.div
                  animate={{ y: [0, -12, 0], rotate: [0, 3, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
                  className="text-6xl mb-4 select-none"
                >
                  🎁
                </motion.div>

                <h2
                  className="font-bebas text-3xl mb-1 tracking-wider"
                  style={{ color: '#FFD700', textShadow: '0 0 20px rgba(255,215,0,0.5)' }}
                >
                  Você foi convocado!
                </h2>
                <p className="text-sm font-medium mb-6" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  Anderson & Arthur te chamam pra festa 🎉
                </p>

                {/* CTA button */}
                <motion.button
                  data-testid="invite-envelope-seal-button"
                  onClick={handleTap}
                  className="relative btn-shimmer glow-pulse text-green-900 font-bold text-lg px-8 py-4 rounded-2xl shadow-xl cursor-pointer select-none"
                  whileTap={{ scale: 0.91 }}
                  whileHover={{ scale: 1.05 }}
                  style={{ fontFamily: 'Manrope, sans-serif', minWidth: 220 }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <span className="text-xl">✨</span>
                    Abrir convite
                    <span className="text-xl">✨</span>
                  </span>
                </motion.button>

                <p className="text-xs mt-3 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  Toque para revelar a surpresa
                </p>
              </div>

              {/* Emoji row */}
              <div className="flex justify-center gap-5 pb-4">
                {['⚽', '🏆', '🎊', '🇧🇷', '🎉'].map((em, i) => (
                  <motion.span
                    key={i}
                    className="text-lg select-none"
                    style={{ opacity: 0.5 }}
                    animate={{ opacity: [0.35, 0.7, 0.35] }}
                    transition={{ repeat: Infinity, duration: 2.5, delay: i * 0.35 }}
                  >
                    {em}
                  </motion.span>
                ))}
              </div>
              <div className="brazil-ribbon" />
            </div>
          </motion.div>
        )}

        {phase === 'breaking' && (
          <motion.div
            key="breaking"
            animate={{ scale: [1, 1.1, 0.92], rotate: [0, 3, -3, 0], opacity: [1, 1, 0] }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-[340px] px-4"
          >
            <div className="sealed-card p-8 flex flex-col items-center">
              <motion.div
                animate={{ scale: [1, 1.6, 1.2], rotate: [0, 20, -20, 0] }}
                transition={{ duration: 0.55 }}
                className="text-6xl"
              >
                🎆
              </motion.div>
              <p className="font-bebas text-xl tracking-wider mt-3" style={{ color: '#FFD700' }}>
                Abrindo...
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
