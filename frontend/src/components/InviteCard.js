import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Shirt, Beer, Megaphone, Calendar, Trophy } from 'lucide-react';

const InfoBlock = ({ icon: Icon, label, text, colorClass = 'text-green-800' }) => (
  <div className="rounded-2xl bg-white border border-amber-200/60 p-3 flex gap-2.5 items-start">
    <div className={`mt-0.5 flex-shrink-0 ${colorClass}`}>
      <Icon size={16} />
    </div>
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm text-gray-800 leading-snug">{text}</p>
    </div>
  </div>
);

export default function InviteCard({ settings, guestName, guestStatus }) {
  if (!settings) return null;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.1 }
    }
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 28 } }
  };

  return (
    <motion.div
      data-testid="invite-card"
      className="invite-paper rounded-2xl overflow-hidden w-full max-w-[340px] mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Brazil ribbon stripe */}
      <div className="copa-ribbon" />

      {/* Header */}
      <div className="green-header px-5 pt-5 pb-6 text-center">
        <motion.div variants={itemVariants} className="flex justify-center mb-2">
          <Trophy className="text-yellow-400" size={28} />
        </motion.div>
        <motion.h1
          variants={itemVariants}
          className="font-display text-2xl font-bold text-yellow-300 leading-tight"
        >
          {settings.title}
        </motion.h1>
        <motion.p
          variants={itemVariants}
          className="text-green-200 text-sm mt-1.5 leading-relaxed"
        >
          {settings.subtitle}
        </motion.p>
        {guestName && (
          <motion.div
            variants={itemVariants}
            className="mt-3 inline-block bg-yellow-400/20 border border-yellow-400/40 text-yellow-300 text-xs font-medium px-3 py-1 rounded-full"
          >
            Olá, {guestName}!
          </motion.div>
        )}
      </div>

      {/* Date chip */}
      <motion.div
        variants={itemVariants}
        className="flex items-center justify-center gap-2 py-3 bg-yellow-50 border-b border-amber-100"
      >
        <Calendar size={14} className="text-amber-700" />
        <span className="text-sm font-semibold text-amber-800">{settings.event_date}</span>
        <span className="text-amber-400">•</span>
        <Clock size={14} className="text-amber-700" />
        <span className="text-sm text-amber-800">{settings.start_time_text}</span>
      </motion.div>

      {/* Info bento grid */}
      <div className="p-4 grid grid-cols-1 gap-3">
        <motion.div variants={itemVariants}>
          <InfoBlock
            icon={Trophy}
            label="Transmissão"
            text={settings.match_text}
            colorClass="text-yellow-700"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InfoBlock
            icon={Beer}
            label="Bebidas"
            text={settings.drinks_text}
            colorClass="text-blue-800"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InfoBlock
            icon={Shirt}
            label="Traje"
            text={settings.dress_code_text}
            colorClass="text-green-700"
          />
        </motion.div>
        <motion.div variants={itemVariants}>
          <InfoBlock
            icon={Megaphone}
            label="Torcida"
            text={settings.party_items_text}
            colorClass="text-red-700"
          />
        </motion.div>
      </div>

      {/* Address */}
      <motion.div variants={itemVariants} className="px-4 pb-4">
        <div className="rounded-2xl bg-green-900/5 border border-green-200 p-3">
          <div className="flex items-start gap-2.5 mb-2">
            <MapPin size={16} className="text-green-800 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">Local</p>
              <p className="text-sm text-gray-800">{settings.address_text}</p>
            </div>
          </div>
          <a
            data-testid="invite-maps-link"
            href={settings.maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-700 transition-colors"
          >
            <MapPin size={14} />
            Abrir no Google Maps
          </a>
        </div>
      </motion.div>

      {/* Status chip if already responded */}
      {guestStatus && guestStatus !== 'pending' && (
        <motion.div variants={itemVariants} className="px-4 pb-4">
          <div className={`text-center text-sm font-medium py-2 rounded-xl ${
            guestStatus === 'confirmed' ? 'badge-confirmed' : 'badge-cancelled'
          }`}>
            {guestStatus === 'confirmed' ? '✓ Presença confirmada' : '✗ Presença cancelada'}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
