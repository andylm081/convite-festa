import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Play audio helper
export function playAudio(src) {
  try {
    const audio = new Audio(src);
    audio.volume = 0.5;
    audio.play().catch(() => {});
  } catch (e) {}
}

// Wax seal SVG
function WaxSeal({ onClick, broken }) {
  return (
    <motion.button
      data-testid="invite-envelope-seal-button"
      onClick={onClick}
      className="relative flex items-center justify-center focus:outline-none"
      style={{ width: 72, height: 72 }}
      whileTap={{ scale: 0.9 }}
    >
      {!broken ? (
        <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
          <circle cx="36" cy="36" r="34" fill="#8B1A1A" stroke="#D8B55B" strokeWidth="2.5" />
          <circle cx="36" cy="36" r="28" fill="#A02020" stroke="#D8B55B" strokeWidth="1" strokeDasharray="3 2" />
          {/* Letter A & A initials */}
          <text x="36" y="42" textAnchor="middle" fill="#D8B55B" fontSize="16" fontWeight="bold" fontFamily="serif">A&A</text>
          {/* Shimmer ring */}
          <circle cx="36" cy="36" r="32" fill="none" stroke="rgba(216,181,91,0.4)" strokeWidth="1" className="shimmer" />
        </svg>
      ) : (
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.2, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
            <circle cx="36" cy="36" r="34" fill="#8B1A1A" stroke="#D8B55B" strokeWidth="2.5" opacity="0.3" />
          </svg>
        </motion.div>
      )}
      {/* Tap hint */}
      {!broken && (
        <motion.div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 text-xs text-amber-700 font-medium whitespace-nowrap"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          Toque para abrir
        </motion.div>
      )}
    </motion.button>
  );
}

export default function EnvelopeAnimation({ onOpen, isOpen }) {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [phase, setPhase] = React.useState(isOpen ? 'open' : 'closed');

  const handleSealClick = () => {
    if (phase !== 'closed') return;
    playAudio('/sounds/envelope-open.wav');
    setPhase('breaking');
    setTimeout(() => setPhase('flap_open'), 300);
    setTimeout(() => {
      setPhase('open');
      onOpen && onOpen();
    }, 900);
  };

  if (prefersReduced) {
    return (
      <div data-testid="invite-envelope-stage" className="flex flex-col items-center">
        {!isOpen && (
          <button
            data-testid="invite-envelope-seal-button"
            onClick={() => { onOpen && onOpen(); }}
            className="px-6 py-3 bg-green-800 text-white rounded-xl font-medium"
          >
            Abrir convite
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      data-testid="invite-envelope-stage"
      className="flex flex-col items-center"
      style={{ perspective: '1000px' }}
    >
      <AnimatePresence mode="wait">
        {phase === 'closed' && (
          <motion.div
            key="envelope-closed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="relative flex flex-col items-center"
          >
            {/* Envelope body */}
            <div
              className="relative"
              style={{
                width: 280,
                height: 200,
                background: 'linear-gradient(145deg, #FEFCF5 0%, #F5EFD8 100%)',
                borderRadius: '4px 4px 8px 8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15), 0 1px 4px rgba(0,0,0,0.1)',
                border: '1.5px solid rgba(216,181,91,0.4)',
              }}
            >
              {/* Brazil ribbon top */}
              <div className="copa-ribbon w-full rounded-t" style={{ height: 5 }} />
              {/* Envelope flap top */}
              <div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: 'linear-gradient(160deg, #FEFCF5 60%, #F0E8C8 100%)',
                  clipPath: 'polygon(0 0, 50% 55%, 100% 0)',
                  border: '1.5px solid rgba(216,181,91,0.3)',
                  zIndex: 2,
                }}
              />
              {/* Envelope fold lines */}
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                background: 'linear-gradient(to bottom right, transparent 49.5%, rgba(216,181,91,0.15) 50%, transparent 50.5%)',
                zIndex: 1
              }} />
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0, top: 0,
                background: 'linear-gradient(to bottom left, transparent 49.5%, rgba(216,181,91,0.15) 50%, transparent 50.5%)',
                zIndex: 1
              }} />
              {/* Wax seal centered on flap */}
              <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <WaxSeal onClick={handleSealClick} broken={false} />
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'breaking' && (
          <motion.div
            key="envelope-breaking"
            className="relative flex flex-col items-center"
          >
            <div
              className="relative"
              style={{
                width: 280, height: 200,
                background: 'linear-gradient(145deg, #FEFCF5 0%, #F5EFD8 100%)',
                borderRadius: '4px 4px 8px 8px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                border: '1.5px solid rgba(216,181,91,0.4)',
              }}
            >
              <div className="copa-ribbon w-full rounded-t" style={{ height: 5 }} />
              <div style={{ position: 'absolute', top: 56, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
                <WaxSeal onClick={() => {}} broken={true} />
              </div>
            </div>
          </motion.div>
        )}

        {phase === 'flap_open' && (
          <motion.div
            key="envelope-opening"
            className="relative flex flex-col items-center"
            initial={{ rotateX: 0 }}
            animate={{ rotateX: 5 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          >
            <div
              className="relative overflow-hidden"
              style={{
                width: 280, height: 200,
                background: 'linear-gradient(145deg, #FEFCF5 0%, #F5EFD8 100%)',
                borderRadius: '4px 4px 8px 8px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
                border: '1.5px solid rgba(216,181,91,0.4)',
              }}
            >
              <div className="copa-ribbon w-full rounded-t" style={{ height: 5 }} />
              {/* Flap open animation */}
              <motion.div
                style={{
                  position: 'absolute',
                  top: 5,
                  left: 0,
                  right: 0,
                  height: 100,
                  background: 'linear-gradient(160deg, #FEFCF5 60%, #F0E8C8 100%)',
                  clipPath: 'polygon(0 0, 50% 55%, 100% 0)',
                  zIndex: 3,
                  transformOrigin: 'top center',
                }}
                initial={{ rotateX: 0 }}
                animate={{ rotateX: -160 }}
                transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              />
              {/* Inside envelope - peek of card */}
              <motion.div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 16,
                  right: 16,
                  height: 80,
                  background: '#FEFCF5',
                  borderRadius: 4,
                  border: '1px solid rgba(216,181,91,0.3)',
                  zIndex: 2,
                }}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
              />
            </div>
          </motion.div>
        )}

        {phase === 'open' && (
          <motion.div
            key="envelope-open"
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 26 }}
            className="flex flex-col items-center"
          >
            {/* Empty open envelope at bottom */}
            <div
              style={{
                width: 280, height: 60,
                background: 'linear-gradient(145deg, #FEFCF5 0%, #F5EFD8 100%)',
                borderRadius: '4px 4px 8px 8px',
                boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
                border: '1.5px solid rgba(216,181,91,0.3)',
                marginBottom: -8,
                zIndex: 0,
                position: 'relative',
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
