import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { Emoji } from './Emoji';

const CONFETTI_BG = 'https://images.unsplash.com/photo-1702311952079-7e34acc96888?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85';
const STADIUM_BG = 'https://images.unsplash.com/photo-1706675780107-7c43cc487928?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 28, delay: i * 0.08 }
  }),
};

// =============================================
// FOOTBALL JERSEY SVG — V3
// ClipPath constrains name+number inside jersey body
// textLength forces name to always fit perfectly
// =============================================
function FootballJersey({ name, number, bodyColor, collarColor, numberColor = 'white', nameColor = 'white', index = 0, gradId }) {
  const shineId = `shine-${gradId}`;
  const clipId = `clip-${gradId}`;
  const jerseyPath = "M 38,20 Q 75,3 112,20 L 148,44 L 126,62 L 112,62 L 110,158 Q 75,165 40,158 L 38,62 L 24,62 L 2,44 Z";

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      style={{ width: 150, height: 172, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <svg
        viewBox="0 0 150 172"
        xmlns="http://www.w3.org/2000/svg"
        width="150"
        height="172"
        style={{ overflow: 'visible', filter: 'drop-shadow(0 10px 28px rgba(0,0,0,0.55))' }}
      >
        <defs>
          <clipPath id={clipId}>
            <path d={jerseyPath} />
          </clipPath>
          <linearGradient id={shineId} x1="0%" y1="0%" x2="65%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.05)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
          </linearGradient>
        </defs>

        {/* Drop shadow */}
        <ellipse cx="75" cy="168" rx="54" ry="6" fill="rgba(0,0,0,0.4)" />

        {/* Jersey body base */}
        <path d={jerseyPath} fill={bodyColor} />

        {/* === CLIPPED CONTENT: all inside jersey shape === */}
        <g clipPath={`url(#${clipId})`}>
          {/* Collar band */}
          <path d="M 52,22 Q 75,40 98,22 L 98,18 Q 75,35 52,18 Z" fill={collarColor} opacity="0.9" />

          {/* Shoulder accent */}
          <path d="M 38,20 L 2,44 L 24,62 L 38,62 L 38,38 L 54,24 Z" fill="rgba(255,255,255,0.1)" />
          <path d="M 112,20 L 148,44 L 126,62 L 112,62 L 112,38 L 96,24 Z" fill="rgba(255,255,255,0.1)" />

          {/* Chest stripe */}
          <rect x="38" y="64" width="74" height="14" fill={collarColor} opacity="0.85" />
          <rect x="38" y="64" width="74" height="3" fill="rgba(255,255,255,0.4)" />

          {/* ---- NUMBER (large, dominant) ---- */}
          {/* Number shadow */}
          <text x="77" y="150"
            textAnchor="middle"
            fontFamily="'Bebas Neue','Impact','Arial Black',sans-serif"
            fontSize="72" fontWeight="900"
            fill="rgba(0,0,0,0.3)"
          >{number}</text>
          {/* Number main */}
          <text x="75" y="148"
            textAnchor="middle"
            fontFamily="'Bebas Neue','Impact','Arial Black',sans-serif"
            fontSize="70" fontWeight="900"
            fill={numberColor}
            stroke="rgba(0,0,0,0.25)" strokeWidth="1.5"
          >{number}</text>

          {/* ---- NAME (above number, always fits) ---- */}
          {/* Name shadow */}
          <text x="76" y="99"
            textAnchor="middle"
            fontFamily="'Bebas Neue','Impact','Arial Black',sans-serif"
            fontSize="17" fontWeight="900"
            fill="rgba(0,0,0,0.45)"
            textLength="66" lengthAdjust="spacingAndGlyphs"
          >{name}</text>
          {/* Name main */}
          <text x="75" y="98"
            textAnchor="middle"
            fontFamily="'Bebas Neue','Impact','Arial Black',sans-serif"
            fontSize="16" fontWeight="900"
            fill={nameColor}
            stroke="rgba(0,0,0,0.3)" strokeWidth="0.6"
            textLength="66" lengthAdjust="spacingAndGlyphs"
          >{name}</text>

          {/* Name underline */}
          <line x1="44" y1="102" x2="106" y2="102" stroke={nameColor} strokeWidth="1.5" opacity="0.5" />
        </g>

        {/* Shine overlay (not clipped so it covers full jersey incl. sleeves) */}
        <path d={jerseyPath} fill={`url(#${shineId})`} />

        {/* Collar border line */}
        <path d="M 52,22 Q 75,40 98,22" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" />
      </svg>
    </motion.div>
  );
}

function InfoSticker({ emoji, label, value, variant = 'default', index = 0 }) {
  const variantClass = {
    default: 'info-sticker', yellow: 'info-sticker-yellow',
    green: 'info-sticker-green', blue: 'info-sticker-blue', orange: 'info-sticker-orange',
  }[variant];
  return (
    <motion.div custom={index} variants={fadeUp} className={`${variantClass} px-4 py-3 flex items-start gap-3`}>
      <Emoji symbol={emoji} size="1.3em" style={{ marginTop: 2, flexShrink: 0 }} />
      <div>
        <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</p>
        <p className="text-sm font-semibold leading-snug" style={{ color: 'rgba(255,255,255,0.9)' }}>{value}</p>
      </div>
    </motion.div>
  );
}

export default function InviteCard({ settings, guestName, guestStatus }) {
  if (!settings) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.07, delayChildren: 0.05 } }
  };

  return (
    <motion.div
      data-testid="invite-card"
      className="story-card"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ===== HERO ===== */}
      <div className="invite-hero relative" style={{ minHeight: 200 }}>
        <div className="invite-hero-img" style={{ backgroundImage: `url(${CONFETTI_BG})` }} />
        <div className="invite-hero-overlay" />
        <div className="brazil-ribbon relative z-10" />

        <div className="relative z-10 px-6 pt-6 pb-7 text-center">
          {/* VOCÊ FOI CONVOCADO — no badge above */}
          <motion.h1
            custom={0}
            variants={fadeUp}
            className="font-bebas leading-none mb-0.5"
            style={{ color: '#FFD700', fontSize: 54, textShadow: '0 0 30px rgba(255,215,0,0.45)' }}
          >
            Você foi
          </motion.h1>
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-bebas leading-none"
            style={{ color: '#FFD700', fontSize: 54, textShadow: '0 0 30px rgba(255,215,0,0.45)' }}
          >
            Convocado!
          </motion.h1>

          {guestName && (
            <motion.div
              custom={2}
              variants={fadeUp}
              className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(0,200,83,0.2)', border: '1px solid rgba(0,200,83,0.4)', color: '#69F0AE' }}
            >
              <Emoji symbol="👋" size="16px" style={{ verticalAlign: 'middle', marginRight: 4 }} />
              Olá, {guestName}!
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== FOOTBALL JERSEYS ===== */}
      <motion.div
        custom={3}
        variants={fadeUp}
        className="px-5 py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(0,200,83,0.05) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="flex items-center justify-center gap-3">
          {/* Anderson #24 — Yellow jersey (home), green collar */}
          <FootballJersey
            name="ANDERSON"
            number="24"
            bodyColor="#FFD700"
            collarColor="#005500"
            numberColor="#003300"
            nameColor="#003300"
            index={3}
            gradId="anderson"
          />

          {/* Divider */}
          <div className="flex flex-col items-center gap-1 mx-1">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.2 }}>
              <Emoji symbol="❤️" size="24px" />
            </motion.div>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>&</span>
          </div>

          {/* Arthur #23 — Green jersey (away), yellow collar */}
          <FootballJersey
            name="ARTHUR"
            number="23"
            bodyColor="#006400"
            collarColor="#FFD700"
            numberColor="white"
            nameColor="white"
            index={4}
            gradId="arthur"
          />
        </div>

        <p className="text-center text-xs mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Emoji symbol="🇧🇷" size="14px" style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Comemoração em grande estilo
        </p>
      </motion.div>

      {/* ===== DATE / STADIUM ===== */}
      <motion.div custom={5} variants={fadeUp} className="px-5 pt-4">
        <div className="rounded-2xl overflow-hidden" style={{
          backgroundImage: `url(${STADIUM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative'
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.72)' }} />
          <div className="relative z-10 px-5 py-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Data da festa</p>
              <p className="font-bebas text-3xl" style={{ color: '#FFD700' }}>13 / 06 / 2026</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Começa</p>
              <p className="font-bebas text-3xl" style={{ color: '#69F0AE' }}>15h00</p>
            </div>
          </div>
          <div className="relative z-10 px-5 pb-3 flex items-center gap-2">
            <Emoji symbol="⚽" size="16px" />
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.65)' }}>{settings.match_text}</p>
          </div>
        </div>
      </motion.div>

      {/* ===== INFO STICKERS ===== */}
      <div className="px-5 pt-4 pb-2 grid grid-cols-1 gap-3">
        <InfoSticker emoji="👕" label="Traje" value={settings.dress_code_text} variant="yellow" index={6} />
        <InfoSticker emoji="🎤" label="Energia de torcida" value={settings.party_items_text} variant="green" index={7} />
        <InfoSticker emoji="🍺" label="Bebidas" value={settings.drinks_text} variant="blue" index={8} />
      </div>

      {/* ===== ADDRESS ===== */}
      <motion.div custom={9} variants={fadeUp} className="px-5 pb-5 pt-2">
        <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="flex items-start gap-3 mb-3">
            <Emoji symbol="📍" size="20px" style={{ marginTop: 2 }} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Local</p>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.9)' }}>{settings.address_text}</p>
            </div>
          </div>
          <a
            data-testid="invite-maps-link"
            href={settings.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all"
            style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#FFD700' }}
          >
            <MapPin size={14} />
            Abrir no Google Maps
            <ExternalLink size={12} />
          </a>
        </div>
      </motion.div>

      {/* Status chip */}
      {guestStatus && guestStatus !== 'pending' && (
        <motion.div custom={10} variants={fadeUp} className="px-5 pb-5">
          <div className={`text-center text-sm font-bold py-3 rounded-2xl ${
            guestStatus === 'confirmed'
              ? 'bg-green-900/40 text-green-400 border border-green-700/40'
              : 'bg-red-900/40 text-red-400 border border-red-700/40'
          }`}>
            {guestStatus === 'confirmed' ? '✓ Presença confirmada 🎉' : '✗ Presença cancelada'}
          </div>
        </motion.div>
      )}

      <div className="brazil-ribbon" />
    </motion.div>
  );
}
