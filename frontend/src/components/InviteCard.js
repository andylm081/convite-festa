import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';
import { Emoji, TwemojiText } from './Emoji';

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
// SVG FOOTBALL JERSEY COMPONENT
// Proper jersey silhouette: collar, shoulders, body, number on back, name above
// =============================================
function FootballJersey({ name, number, bodyColor, collarColor, textColor = 'white', index = 0, gradId }) {
  const id = gradId || `grad-${number}`;
  const shadowId = `shadow-${number}`;
  const stripeId = `stripe-${number}`;

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
        style={{ overflow: 'visible', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.5))' }}
      >
        <defs>
          {/* Jersey shine gradient */}
          <linearGradient id={id} x1="0%" y1="0%" x2="60%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.28)" />
            <stop offset="45%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
          </linearGradient>
          {/* Stripe gradient */}
          <linearGradient id={stripeId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="50%" stopColor={collarColor} />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
        </defs>

        {/* ---- DROP SHADOW ---- */}
        <ellipse cx="75" cy="168" rx="56" ry="6" fill="rgba(0,0,0,0.35)" />

        {/* ---- JERSEY BODY ---- */}
        {/*
          Jersey (back view) shape:
          - Round collar at top center (arc)
          - Short sleeves/shoulder flaps
          - Rectangular body
          - Slightly curved hem
        */}
        <path
          d="
            M 40,20
            Q 75,4 110,20
            L 148,44
            L 126,62
            L 110,62
            L 108,158
            Q 75,164 42,158
            L 40,62
            L 24,62
            L 2,44
            Z
          "
          fill={bodyColor}
        />

        {/* ---- SHINE OVERLAY ---- */}
        <path
          d="
            M 40,20
            Q 75,4 110,20
            L 148,44
            L 126,62
            L 110,62
            L 108,158
            Q 75,164 42,158
            L 40,62
            L 24,62
            L 2,44
            Z
          "
          fill={`url(#${id})`}
        />

        {/* ---- COLLAR (round neck, contrasting color) ---- */}
        <path
          d="M 54,22 Q 75,40 96,22 Q 75,20 54,22 Z"
          fill={collarColor}
          opacity="0.9"
        />
        <path
          d="M 54,22 Q 75,40 96,22"
          fill="none"
          stroke="rgba(255,255,255,0.4)"
          strokeWidth="1.5"
        />

        {/* ---- SHOULDER STRIPES (sleeve details) ---- */}
        <path
          d="M 40,20 L 2,44 L 24,62 L 40,62 L 40,36 L 56,24 Z"
          fill="rgba(255,255,255,0.1)"
        />
        <path
          d="M 110,20 L 148,44 L 126,62 L 110,62 L 110,36 L 94,24 Z"
          fill="rgba(255,255,255,0.1)"
        />

        {/* ---- CHEST STRIPE (horizontal, like Brazil seleção) ---- */}
        <rect
          x="40" y="64" width="70" height="13" rx="1"
          fill={collarColor}
          opacity="0.75"
        />
        <rect
          x="40" y="64" width="70" height="3" rx="1"
          fill="rgba(255,255,255,0.3)"
        />

        {/* ---- BACK NUMBER (large, authentic) ---- */}
        {/* Shadow layer */}
        <text
          x="77"
          y="148"
          textAnchor="middle"
          fontFamily="'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif"
          fontSize="76"
          fontWeight="900"
          fill="rgba(0,0,0,0.25)"
          letterSpacing="-1"
        >
          {number}
        </text>
        {/* Main number */}
        <text
          x="75"
          y="146"
          textAnchor="middle"
          fontFamily="'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif"
          fontSize="74"
          fontWeight="900"
          fill={textColor}
          letterSpacing="-1"
          style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}
        >
          {number}
        </text>

        {/* ---- PLAYER NAME (above number) ---- */}
        <text
          x="75"
          y="100"
          textAnchor="middle"
          fontFamily="'Bebas Neue', 'Impact', 'Arial Narrow', sans-serif"
          fontSize="15"
          fontWeight="700"
          fill={textColor}
          letterSpacing="5"
          opacity="0.95"
        >
          {name}
        </text>
        {/* Name underline */}
        <line
          x1="42" y1="104"
          x2="108" y2="104"
          stroke={textColor}
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* ---- SLEEVE BOTTOM EDGE ---- */}
        <line x1="2" y1="44" x2="24" y2="62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
        <line x1="148" y1="44" x2="126" y2="62" stroke="rgba(0,0,0,0.15)" strokeWidth="1" />
      </svg>
    </motion.div>
  );
}

function InfoSticker({ emoji, label, value, variant = 'default', index = 0 }) {
  const variantClass = {
    default: 'info-sticker',
    yellow: 'info-sticker-yellow',
    green: 'info-sticker-green',
    blue: 'info-sticker-blue',
    orange: 'info-sticker-orange',
  }[variant];

  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className={`${variantClass} px-4 py-3 flex items-start gap-3`}
    >
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
      <div className="invite-hero relative" style={{ minHeight: 220 }}>
        <div className="invite-hero-img" style={{ backgroundImage: `url(${CONFETTI_BG})` }} />
        <div className="invite-hero-overlay" />
        <div className="brazil-ribbon relative z-10" />
        <div className="relative z-10 px-6 pt-5 pb-7 text-center">
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
            >
              <Emoji symbol="⚽" size="14px" /> Copa do Mundo 2026
            </span>
          </motion.div>

          <motion.h1 custom={1} variants={fadeUp} className="font-bebas leading-none mb-0.5"
            style={{ color: '#FFD700', fontSize: 52, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}
          >Você foi</motion.h1>
          <motion.h1 custom={2} variants={fadeUp} className="font-bebas leading-none"
            style={{ color: '#FFD700', fontSize: 52, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}
          >Convocado!</motion.h1>

          {guestName && (
            <motion.div custom={3} variants={fadeUp}
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
        custom={4}
        variants={fadeUp}
        className="px-5 py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(0,200,83,0.05) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="flex items-center justify-center gap-3">
          {/* Anderson #24 — Yellow jersey, green collar/stripe */}
          <FootballJersey
            name="ANDERSON"
            number="24"
            bodyColor="#FFD700"
            collarColor="#006400"
            textColor="#0a1f00"
            index={4}
            gradId="grad-anderson"
          />

          {/* Divider */}
          <div className="flex flex-col items-center gap-1 mx-1">
            <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ repeat: Infinity, duration: 2.2 }}>
              <Emoji symbol="❤️" size="24px" />
            </motion.div>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>&</span>
          </div>

          {/* Arthur #23 — Green jersey, yellow collar/stripe */}
          <FootballJersey
            name="ARTHUR"
            number="23"
            bodyColor="#006400"
            collarColor="#FFD700"
            textColor="white"
            index={5}
            gradId="grad-arthur"
          />
        </div>

        <p className="text-center text-xs mt-2 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          <Emoji symbol="🇧🇷" size="14px" style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Comemoração em grande estilo
        </p>
      </motion.div>

      {/* ===== DATE / STADIUM ===== */}
      <motion.div custom={6} variants={fadeUp} className="px-5 pt-4">
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
        <InfoSticker emoji="👕" label="Traje" value={settings.dress_code_text} variant="yellow" index={7} />
        <InfoSticker emoji="🎤" label="Energia de torcida" value={settings.party_items_text} variant="green" index={8} />
        <InfoSticker emoji="🍺" label="Bebidas" value={settings.drinks_text} variant="blue" index={9} />
      </div>

      {/* ===== ADDRESS ===== */}
      <motion.div custom={10} variants={fadeUp} className="px-5 pb-5 pt-2">
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

      {/* ===== STATUS CHIP ===== */}
      {guestStatus && guestStatus !== 'pending' && (
        <motion.div custom={11} variants={fadeUp} className="px-5 pb-5">
          <div className={`text-center text-sm font-bold py-3 rounded-2xl ${
            guestStatus === 'confirmed'
              ? 'bg-green-900/40 text-green-400 border border-green-700/40'
              : 'bg-red-900/40 text-red-400 border border-red-700/40'
          }`}>
            {guestStatus === 'confirmed' ? '\u2713 Presença confirmada' : '\u2717 Presença cancelada'}
          </div>
        </motion.div>
      )}

      <div className="brazil-ribbon" />
    </motion.div>
  );
}
