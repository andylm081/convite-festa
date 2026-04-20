import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AdminShell from '../components/AdminShell';
import { motion } from 'framer-motion';
import { Users, CheckCircle, XCircle, Clock, Trophy, TrendingUp, Calendar, ExternalLink } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

function StatCard({ label, value, icon: Icon, colorClass, bgClass, testId }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 shadow-sm"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgClass}`}>
        <Icon size={22} className={colorClass} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-800 tabular-nums" data-testid={testId}>{value ?? '-'}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </motion.div>
  );
}

function LogItem({ log }) {
  const isConfirm = log.action === 'confirmed';
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isConfirm ? 'bg-green-100' : 'bg-red-50'
      }`}>
        {isConfirm
          ? <CheckCircle size={14} className="text-green-700" />
          : <XCircle size={14} className="text-red-500" />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 truncate">{log.response_name || log.guest_name || 'Convidado'}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className={`text-xs font-medium ${ isConfirm ? 'text-green-700' : 'text-red-600' }`}>
            {isConfirm ? 'Confirmado' : 'Cancelado'}
          </span>
          <span className="text-gray-300">•</span>
          <span className="text-xs text-gray-400">{log.source === 'unique_link' ? 'Link individual' : 'Link público'}</span>
        </div>
      </div>
      <p className="text-xs text-gray-400 flex-shrink-0">
        {log.created_at ? new Date(log.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '-'}
      </p>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [statsRes, logsRes, settingsRes] = await Promise.all([
        axios.get(`${API_BASE}/api/guests/stats`),
        axios.get(`${API_BASE}/api/rsvp-logs`),
        axios.get(`${API_BASE}/api/event-settings?_=${Date.now()}`),
      ]);
      setStats(statsRes.data);
      setLogs(logsRes.data);
      setSettings(settingsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const confirmPct = stats?.total > 0 ? Math.round((stats.confirmed / stats.total) * 100) : 0;

  return (
    <AdminShell title="Dashboard">
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event banner */}
          {settings && (
            <div className="green-header rounded-2xl p-5 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Trophy size={16} className="text-yellow-400" />
                  <span className="text-yellow-300 text-xs font-semibold uppercase tracking-wider">Evento</span>
                </div>
                <h2 className="text-white font-bold text-lg leading-tight">{settings.title}</h2>
                <p className="text-green-200 text-sm mt-0.5">{settings.subtitle}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1.5 text-green-200 text-xs">
                    <Calendar size={12} />
                    {settings.event_date}
                  </span>
                  <span className="flex items-center gap-1.5 text-green-200 text-xs">
                    <Clock size={12} />
                    {settings.start_time_text}
                  </span>
                </div>
              </div>
              <a
                href="/convite"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-2 rounded-xl transition-colors flex-shrink-0"
              >
                <ExternalLink size={12} />
                Ver convite
              </a>
            </div>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total de Convidados"
              value={stats?.total}
              icon={Users}
              bgClass="bg-blue-50"
              colorClass="text-blue-700"
              testId="admin-stat-total"
            />
            <StatCard
              label="Confirmados"
              value={stats?.confirmed}
              icon={CheckCircle}
              bgClass="bg-green-50"
              colorClass="text-green-700"
              testId="admin-stat-confirmed"
            />
            <StatCard
              label="Cancelados"
              value={stats?.cancelled}
              icon={XCircle}
              bgClass="bg-red-50"
              colorClass="text-red-600"
              testId="admin-stat-cancelled"
            />
            <StatCard
              label="Pendentes"
              value={stats?.pending}
              icon={Clock}
              bgClass="bg-amber-50"
              colorClass="text-amber-700"
              testId="admin-stat-pending"
            />
          </div>

          {/* Progress bar */}
          {stats?.total > 0 && (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <TrendingUp size={15} className="text-green-700" />
                  <span className="text-sm font-semibold text-gray-700">Taxa de confirmação</span>
                </div>
                <span className="text-lg font-bold text-green-700">{confirmPct}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5">
                <div
                  className="bg-green-700 h-2.5 rounded-full transition-all duration-700"
                  style={{ width: `${confirmPct}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>{stats.confirmed} confirmados</span>
                <span>{stats.pending} aguardando resposta</span>
              </div>
            </div>
          )}

          {/* RSVP logs */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Atividade Recente</h3>
            {logs.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">Nenhuma atividade ainda</p>
            ) : (
              <div data-testid="admin-rsvp-logs" className="max-h-72 overflow-y-auto">
                {logs.slice(0, 20).map((log, i) => (
                  <LogItem key={log.id || i} log={log} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </AdminShell>
  );
}
