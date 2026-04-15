import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ExternalLink } from 'lucide-react';

const CONFETTI_BG = 'https://images.unsplash.com/photo-1702311952079-7e34acc96888?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85';
const STADIUM_BG = 'https://images.unsplash.com/photo-1706675780107-7c43cc487928?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85';

const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  visible: (i = 0) => ({
    opacity: 1, y: 0,
    transition: { type: 'spring', stiffness: 280, damping: 28, delay: i * 0.08 }
  }),
};

// Jersey-style name card — replaces emoji icon
function JerseyCard({ name, number, color, textColor = '#fff', index = 0 }) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="relative overflow-hidden flex flex-col items-center"
      style={{
        background: color,
        borderRadius: 20,
        width: 120,
        height: 120,
        boxShadow: `0 8px 24px ${color}55`,
        border: '2px solid rgba(255,255,255,0.15)',
      }}
    >
      {/* Big watermark number */}
      <div
        className="absolute font-bebas select-none pointer-events-none"
        style={{
          fontSize: 80,
          color: 'rgba(0,0,0,0.18)',
          bottom: -12,
          right: 6,
          lineHeight: 1,
          letterSpacing: '-2px',
        }}
      >
        {number}
      </div>

      {/* Jersey stripes */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0,
        height: 6,
        background: 'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.05) 100%)'
      }} />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-1 px-2">
        {/* Number badge */}
        <div
          className="font-bebas text-3xl leading-none"
          style={{ color: textColor, textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}
        >
          #{number}
        </div>
        {/* Name */}
        <div
          className="font-bebas text-lg tracking-wider leading-none text-center"
          style={{
            color: textColor,
            textShadow: '0 1px 6px rgba(0,0,0,0.4)',
            letterSpacing: '0.06em'
          }}
        >
          {name}
        </div>
        {/* Shimmer bar */}
        <div style={{
          width: '60%', height: 2, borderRadius: 2,
          background: 'rgba(255,255,255,0.35)',
          marginTop: 4
        }} />
      </div>
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
      <span className="text-xl flex-shrink-0 mt-0.5">{emoji}</span>
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
      {/* ===== HERO SECTION ===== */}
      <div className="invite-hero relative" style={{ minHeight: 220 }}>
        <div className="invite-hero-img" style={{ backgroundImage: `url(${CONFETTI_BG})` }} />
        <div className="invite-hero-overlay" />
        <div className="brazil-ribbon relative z-10" />

        <div className="relative z-10 px-6 pt-5 pb-7 text-center">
          {/* Copa badge */}
          <motion.div custom={0} variants={fadeUp} className="inline-flex items-center gap-2 mb-3">
            <span
              className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(255,215,0,0.15)', border: '1px solid rgba(255,215,0,0.35)', color: '#FFD700' }}
            >
              <span>⚽</span> Copa do Mundo 2026
            </span>
          </motion.div>

          {/* VOCÊ FOI CONVOCADO */}
          <motion.h1
            custom={1}
            variants={fadeUp}
            className="font-bebas leading-none mb-0.5"
            style={{ color: '#FFD700', fontSize: 52, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}
          >
            Você foi
          </motion.h1>
          <motion.h1
            custom={2}
            variants={fadeUp}
            className="font-bebas leading-none"
            style={{ color: '#FFD700', fontSize: 52, textShadow: '0 0 30px rgba(255,215,0,0.4)' }}
          >
            Convocado!
          </motion.h1>

          {/* Guest greeting */}
          {guestName && (
            <motion.div
              custom={3}
              variants={fadeUp}
              className="mt-3 inline-block px-4 py-1.5 rounded-full text-sm font-semibold"
              style={{ background: 'rgba(0,200,83,0.2)', border: '1px solid rgba(0,200,83,0.4)', color: '#69F0AE' }}
            >
              Olá, {guestName}! 👋
            </motion.div>
          )}
        </div>
      </div>

      {/* ===== JERSEY CARDS (replaces emojis) ===== */}
      <motion.div
        custom={4}
        variants={fadeUp}
        className="px-5 py-5"
        style={{
          background: 'linear-gradient(135deg, rgba(255,215,0,0.06) 0%, rgba(0,200,83,0.05) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)'
        }}
      >
        <div className="flex items-center justify-center gap-5">
          <JerseyCard
            name="ANDERSON"
            number="24"
            color="linear-gradient(135deg, #FFA000, #FFD700)"
            textColor="#1a1a00"
            index={4}
          />

          {/* VS / & divider */}
          <div className="flex flex-col items-center gap-0.5">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ repeat: Infinity, duration: 2.2 }}
              className="text-2xl"
            >
              ❤️‍🔥
            </motion.div>
            <span className="text-xs font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>&</span>
          </div>

          <JerseyCard
            name="ARTHUR"
            number="23"
            color="linear-gradient(135deg, #006400, #00C853)"
            textColor="#e0ffe8"
            index={5}
          />
        </div>
        <p className="text-center text-xs mt-3 font-medium" style={{ color: 'rgba(255,255,255,0.35)' }}>
          🇧🇷 Comemoração em grande estilo
        </p>
      </motion.div>

      {/* ===== DATE / STADIUM ===== */}
      <motion.div custom={6} variants={fadeUp} className="px-5 pt-4">
        <div
          className="rounded-2xl overflow-hidden"
          style={{ backgroundImage: `url(${STADIUM_BG})`, backgroundSize: 'cover', backgroundPosition: 'center', position: 'relative' }}
        >
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
            <span className="text-base">⚽</span>
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
            <span className="text-xl">📍</span>
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
            {guestStatus === 'confirmed' ? '✓ Presença confirmada 🎉' : '✗ Presença cancelada'}
          </div>
        </motion.div>
      )}

      <div className="brazil-ribbon" />
    </motion.div>
  );
}
