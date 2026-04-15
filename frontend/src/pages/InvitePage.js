import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EnvelopeAnimation from '../components/EnvelopeAnimation';
import InviteCard from '../components/InviteCard';
import RSVPModal from '../components/RSVPModal';
import { Emoji } from '../components/Emoji';
import { Check, X as CancelIcon, RefreshCw } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Already-responded banner for individual links
function AlreadyRespondedBanner({ guest, guestStatus, onChangeClick, name }) {
  const displayName = name || guest?.full_name?.split(' ')[0] || 'Você';
  const isConfirmed = guestStatus === 'confirmed';
  const formattedDate = guest?.responded_at
    ? new Date(guest.responded_at).toLocaleDateString('pt-BR', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
      })
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 26, delay: 0.3 }}
      className="w-full max-w-[400px] mx-auto mb-4 rounded-2xl overflow-hidden"
      style={{
        border: isConfirmed
          ? '2px solid rgba(0,200,83,0.5)'
          : '2px solid rgba(255,80,80,0.4)',
        background: isConfirmed
          ? 'rgba(0,100,40,0.35)'
          : 'rgba(100,20,20,0.35)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Top stripe */}
      <div
        style={{
          height: 4,
          background: isConfirmed
            ? 'linear-gradient(90deg, #00C853, #69F0AE)'
            : 'linear-gradient(90deg, #ff5050, #ff9090)',
        }}
      />
      <div className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: isConfirmed ? 'rgba(0,200,83,0.2)' : 'rgba(255,80,80,0.2)',
            }}
          >
            <Emoji symbol={isConfirmed ? '✅' : '❌'} size="20px" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-sm mb-0.5"
              style={{ color: isConfirmed ? '#69F0AE' : '#ff9090' }}
            >
              {isConfirmed
                ? `✓ Presença confirmada, ${displayName}!`
                : `Presença cancelada, ${displayName}`}
            </p>
            {formattedDate && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Registrado em {formattedDate}
              </p>
            )}
          </div>
        </div>

        {/* Change mind section */}
        <div
          className="mt-3 pt-3"
          style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}
        >
          <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {isConfirmed
              ? 'Precisou cancelar? Você pode mudar sua resposta abaixo.'
              : 'Mudou de ideia? Você ainda pode confirmar sua presença.'}
          </p>
          <button
            onClick={onChangeClick}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'rgba(255,255,255,0.65)',
            }}
          >
            <RefreshCw size={12} />
            Mudar minha resposta
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function InvitePage() {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [loadingGuest, setLoadingGuest] = useState(!!slug);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [modal, setModal] = useState(null);
  const [guestStatus, setGuestStatus] = useState(null);
  const [showChangeMind, setShowChangeMind] = useState(false);
  const [sessionResponseName, setSessionResponseName] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/event-settings`)
      .then(res => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    if (slug) {
      setLoadingGuest(true);
      axios.get(`${API_BASE}/api/rsvp/guest/${slug}`)
        .then(res => {
          setGuest(res.data);
          setGuestStatus(res.data.status);
          if (res.data.status !== 'pending') {
            setEnvelopeOpened(true);
          }
        })
        .catch(() => {})
        .finally(() => setLoadingGuest(false));
    }
  }, [slug]);

  // Pre-existing response (page loaded with already-responded guest)
  const alreadyResponded = !!(slug && guest && guestStatus !== 'pending');
  // Show banner when: pre-existing OR just confirmed in this session
  const showStatusBanner = alreadyResponded || (sessionResponseName !== null && guestStatus !== 'pending');

  const handleRsvpSuccess = (newStatus, responseName) => {
    setGuestStatus(newStatus);
    setShowChangeMind(false);
    setSessionResponseName(responseName || guest?.full_name || guest?.nickname || 'Você');
    setTimeout(() => setModal(null), 3500);
  };

  if (loadingSettings || loadingGuest) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: '#0a140d' }}
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 rounded-full"
          style={{ border: '3px solid #FFD700', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div
      className="theme-invite party-bg min-h-screen"
      style={{ overflowX: 'hidden' }}
    >
      {/* Richer background: bokeh confetti overlay */}
      <div
        style={{
          position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
          backgroundImage: `url(https://images.unsplash.com/photo-1678491448890-f4ac6414cb61?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85)`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          opacity: 0.12,
          filter: 'blur(2px) saturate(2)',
        }}
      />
      {/* Dark overlay on top of background image */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', background: 'rgba(8,16,10,0.75)' }} />
      {/* ===== PRE-OPEN STATE ===== */}
      <AnimatePresence>
        {!envelopeOpened && (
          <motion.div
            key="sealed-view"
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="min-h-screen flex flex-col items-center justify-center px-4 py-10 relative"
            style={{ zIndex: 1 }}
          >
            {/* Top header — personal, not Copa-focused */}
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center mb-8"
            >
              <p
                className="font-bebas text-5xl tracking-widest mb-1"
                style={{ color: '#FFD700', textShadow: '0 0 30px rgba(255,215,0,0.3)' }}
              >
                ANDERSON & ARTHUR
              </p>
              <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Uma celebração especial · 13 de Junho de 2026
              </p>
            </motion.div>

            {/* Sealed card */}
            <EnvelopeAnimation
              onOpen={() => setEnvelopeOpened(true)}
              openAudioUrl={settings?.open_audio_url || '/sounds/envelope-open.wav'}
            />

            {/* Date pill */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-8 flex items-center gap-3"
            >
              <div
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold"
                style={{
                  background: 'rgba(255,215,0,0.1)',
                  border: '1px solid rgba(255,215,0,0.25)',
                  color: '#FFD700'
                }}
              >
                <span>&#128197;</span>
                <span>13 de Junho de 2026</span>
              </div>
              <div
                className="px-3 py-2 rounded-full text-xs font-bold"
                style={{
                  background: 'rgba(0,200,83,0.1)',
                  border: '1px solid rgba(0,200,83,0.25)',
                  color: '#69F0AE'
                }}
              >
                🎉
              </div>
            </motion.div>

            {/* Admin link — subtle, for organizers */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="absolute bottom-6 left-0 right-0 flex justify-center"
            >
              <a
                href="/admin/login"
                className="text-xs font-medium px-3 py-1.5 rounded-full transition-all"
                style={{
                  color: 'rgba(255,255,255,0.25)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(0,0,0,0.2)',
                  textDecoration: 'none',
                }}
              >
                👑 Área dos organizadores
              </a>
            </motion.div>

            {/* Floating emoji decorations */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
              {['⚽', '🏆', '🎉', '🎊', '✨', '🇧🇷'].map((em, i) => (
                <motion.div
                  key={i}
                  className="absolute"
                  style={{ left: `${10 + i * 16}%`, top: `${15 + (i % 3) * 28}%` }}
                  animate={{ y: [0, -15, 0], rotate: [0, 10, -10, 0], opacity: [0.07, 0.16, 0.07] }}
                  transition={{ repeat: Infinity, duration: 4 + i * 0.5, delay: i * 0.4 }}
                >
                  <Emoji symbol={em} size="28px" style={{ filter: 'brightness(0.7)' }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== OPENED STATE: STORY CARD ===== */}
      <AnimatePresence>
        {envelopeOpened && (
          <motion.div
            key="opened-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="min-h-screen flex flex-col items-center px-4 pt-6 pb-32 relative"
            style={{ zIndex: 1 }}
          >
            {/* Subtle top text */}
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 0.5, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-medium mb-4 text-center"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              ✨ Seu convite especial está abaixo ✨
            </motion.p>

            {/* Story Card */}
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 220, damping: 26, delay: 0.1 }}
              className="w-full max-w-[400px]"
            >
              {showStatusBanner && (
                <AlreadyRespondedBanner
                  guest={guest}
                  name={sessionResponseName || guest?.full_name?.split(' ')[0]}
                  guestStatus={guestStatus}
                  onChangeClick={() => setShowChangeMind(true)}
                />
              )}
              <InviteCard
                settings={settings}
                guestName={guest?.full_name || guest?.nickname}
                guestStatus={guestStatus}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== STICKY CTA ===== */}
      {/* Hide when: status is non-pending (confirmed/cancelled) — unless user clicked "Mudar resposta" */}
      <AnimatePresence>
        {envelopeOpened && (guestStatus === 'pending' || guestStatus === null || showChangeMind) && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.4 }}
            className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
            style={{
              background: 'linear-gradient(180deg, transparent 0%, rgba(10,20,13,0.97) 25%)',
              paddingTop: '1.5rem'
            }}
          >
            <div className="max-w-[420px] mx-auto space-y-2">
              <button
                data-testid="rsvp-confirm-button"
                onClick={() => setModal('confirm')}
                className="w-full h-14 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, #00C853, #006400)',
                  color: 'white',
                  boxShadow: '0 4px 24px rgba(0,200,83,0.4)',
                }}
              >
                <Check size={17} />
                🎉 Confirmar presença
              </button>
              <button
                data-testid="rsvp-cancel-button"
                onClick={() => setModal('cancel')}
                className="w-full h-10 rounded-xl font-medium text-xs transition-all flex items-center justify-center gap-1.5"
                style={{
                  background: 'transparent',
                  color: 'rgba(255,255,255,0.38)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <CancelIcon size={12} />
                Não vou poder comparecer
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== RSVP MODAL ===== */}
      <AnimatePresence>
        {modal && (
          <RSVPModal
            key={modal}
            type={modal}
            slug={slug || null}
            guestName={guest?.full_name || guest?.nickname || ''}
            settings={settings}
            onClose={() => setModal(null)}
            onSuccess={handleRsvpSuccess}
            celebrationAudioUrl={settings?.celebration_audio_url || '/sounds/celebration.wav'}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
