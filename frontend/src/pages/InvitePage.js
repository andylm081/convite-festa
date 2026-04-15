import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import EnvelopeAnimation from '../components/EnvelopeAnimation';
import InviteCard from '../components/InviteCard';
import RSVPModal from '../components/RSVPModal';
import { Check, UserX, Trophy } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

export default function InvitePage() {
  const { slug } = useParams();
  const [settings, setSettings] = useState(null);
  const [guest, setGuest] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [modal, setModal] = useState(null); // 'confirm' | 'cancel' | null
  const [guestStatus, setGuestStatus] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/api/event-settings`)
      .then(res => setSettings(res.data))
      .catch(() => {})
      .finally(() => setLoadingSettings(false));
  }, []);

  useEffect(() => {
    if (slug) {
      axios.get(`${API_BASE}/api/rsvp/guest/${slug}`)
        .then(res => {
          setGuest(res.data);
          setGuestStatus(res.data.status);
        })
        .catch(() => {});
    }
  }, [slug]);

  const handleRsvpSuccess = (newStatus) => {
    setGuestStatus(newStatus);
    setTimeout(() => setModal(null), 3000);
  };

  if (loadingSettings) {
    return (
      <div className="min-h-screen invite-bg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-10 h-10 border-3 border-green-700 border-t-transparent rounded-full"
          style={{ borderWidth: 3 }}
        />
      </div>
    );
  }

  return (
    <div className="theme-invite invite-bg min-h-screen">
      {/* Meta tags via document title */}
      <title>Convite - Anderson & Arthur</title>

      {/* Top ribbon */}
      <div className="copa-ribbon" />

      {/* Main content */}
      <div className="flex flex-col items-center px-4 pt-6 pb-32">
        {/* Header chip */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="flex items-center gap-1.5 bg-green-800 text-yellow-300 text-xs font-semibold px-3 py-1.5 rounded-full">
            <Trophy size={12} />
            Copa do Mundo 2026
          </div>
          {settings?.event_date && (
            <span className="text-xs text-amber-700 font-medium bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full">
              {settings.event_date}
            </span>
          )}
        </motion.div>

        {/* Envelope stage */}
        <AnimatePresence>
          {!envelopeOpened && (
            <motion.div
              key="envelope"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.2 }}
              className="w-full flex flex-col items-center mb-6"
            >
              {/* Stadium background blur */}
              <div
                className="absolute inset-x-0 top-0 h-96 opacity-10 pointer-events-none"
                style={{
                  backgroundImage: 'url(https://images.unsplash.com/photo-1571190894029-caa26b1f4c09?crop=entropy&cs=srgb&fm=jpg&ixlib=rb-4.1.0&q=85)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'blur(4px)',
                }}
              />

              {/* Guest greeting */}
              {guest && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center text-green-800 font-medium text-sm mb-5 bg-green-50 border border-green-200 px-4 py-2 rounded-full"
                >
                  Olá, <strong>{guest.full_name}</strong>! Seu convite especial está aqui ↓
                </motion.p>
              )}

              <EnvelopeAnimation onOpen={() => setEnvelopeOpened(true)} isOpen={false} />

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                transition={{ delay: 1 }}
                className="text-xs text-gray-500 mt-10 text-center"
              >
                Você tem um convite especial esperando por você
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Invite card — after envelope opens */}
        <AnimatePresence>
          {envelopeOpened && (
            <motion.div
              key="invite-content"
              initial={{ opacity: 0, y: 40, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 240, damping: 26, delay: 0.1 }}
              className="w-full max-w-[380px]"
            >
              <InviteCard
                settings={settings}
                guestName={guest?.full_name || guest?.nickname}
                guestStatus={guestStatus}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Sticky CTA Bar — only after envelope opens */}
      <AnimatePresence>
        {envelopeOpened && (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 280, damping: 30, delay: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 px-4 py-3 shadow-lg"
          >
            <div className="grid grid-cols-2 gap-3 max-w-[420px] mx-auto">
              <button
                data-testid="rsvp-confirm-button"
                onClick={() => setModal('confirm')}
                disabled={guestStatus === 'confirmed'}
                className="h-12 rounded-xl bg-green-800 text-white font-semibold text-sm hover:bg-green-700 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
              >
                <Check size={16} />
                {guestStatus === 'confirmed' ? 'Confirmado!' : 'Confirmar'}
              </button>
              <button
                data-testid="rsvp-cancel-button"
                onClick={() => setModal('cancel')}
                disabled={guestStatus === 'cancelled'}
                className="h-12 rounded-xl bg-white text-gray-700 font-semibold text-sm border border-gray-200 hover:bg-gray-50 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <UserX size={16} />
                {guestStatus === 'cancelled' ? 'Cancelado' : 'Cancelar'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* RSVP Modal */}
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
          />
        )}
      </AnimatePresence>
    </div>
  );
}
