import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import AdminShell from '../components/AdminShell';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Copy, ExternalLink, Pencil, Trash2,
  Check, X, Clock, CheckCircle, XCircle, Download, Link as LinkIcon
} from 'lucide-react';
import { toast } from 'sonner';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

// Sempre gera o link com o domínio atual — funciona em dev, staging e produção
const getInviteLink = (slug) => slug ? `${window.location.origin}/convite/${slug}` : '';

const STATUS_CONFIG = {
  pending: { label: 'Pendente', classes: 'badge-pending', icon: Clock },
  confirmed: { label: 'Confirmado', classes: 'badge-confirmed', icon: CheckCircle },
  cancelled: { label: 'Cancelado', classes: 'badge-cancelled', icon: XCircle },
};

function StatusBadge({ status }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      <Icon size={10} />
      {config.label}
    </span>
  );
}

// Phone mask: (xx) xxxxx-xxxx
function formatPhone(value) {
  const nums = value.replace(/\D/g, '').slice(0, 11);
  if (nums.length === 0) return '';
  if (nums.length <= 2) return `(${nums}`;
  if (nums.length <= 7) return `(${nums.slice(0,2)}) ${nums.slice(2)}`;
  if (nums.length <= 11) return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7)}`;
  return `(${nums.slice(0,2)}) ${nums.slice(2,7)}-${nums.slice(7,11)}`;
}

function GuestDrawer({ guest, onClose, onSave }) {
  const [form, setForm] = useState({
    full_name: guest?.full_name || '',
    nickname: guest?.nickname || '',
    phone: guest?.phone || '',
    notes: guest?.notes || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) {
      toast.error('Nome completo é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      if (guest) {
        await axios.put(`${API_BASE}/api/guests/${guest.id}`, form);
        toast.success('Convidado atualizado!');
      } else {
        await axios.post(`${API_BASE}/api/guests`, form);
        toast.success('Convidado adicionado!');
      }
      onSave();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar convidado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <div className="green-header px-5 py-4 flex items-center justify-between">
          <h2 className="text-white font-semibold">{guest ? 'Editar Convidado' : 'Novo Convidado'}</h2>
          <button onClick={onClose} className="text-white/70 hover:text-white p-1"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm(f => ({...f, full_name: e.target.value}))}
              placeholder="Nome completo"
              required
              data-testid="guest-form-name"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apelido</label>
            <input
              type="text"
              value={form.nickname}
              onChange={e => setForm(f => ({...f, nickname: e.target.value}))}
              placeholder="Apelido (opcional)"
              data-testid="guest-form-nickname"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={e => setForm(f => ({...f, phone: formatPhone(e.target.value)}))}
              placeholder="(21) 99999-9999"
              data-testid="guest-form-phone"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observações</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({...f, notes: e.target.value}))}
              placeholder="Observações sobre o convidado..."
              rows={2}
              data-testid="guest-form-notes"
              className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              data-testid="guest-form-submit"
              className="flex-1 h-11 rounded-xl bg-green-800 text-white text-sm font-semibold hover:bg-green-700 transition-colors disabled:opacity-60"
            >
              {loading ? 'Salvando...' : (guest ? 'Salvar' : 'Adicionar')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function AdminGuests() {
  const [guests, setGuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [drawerGuest, setDrawerGuest] = useState(undefined); // undefined=closed, null=create, obj=edit
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchGuests = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status_filter = statusFilter;
      const res = await axios.get(`${API_BASE}/api/guests`, { params });
      setGuests(res.data);
    } catch (e) {
      toast.error('Erro ao carregar convidados.');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchGuests(); }, [fetchGuests]);

  const copyLink = async (guest) => {
    try {
      await navigator.clipboard.writeText(getInviteLink(guest.slug));
      setCopiedId(guest.id);
      toast.success('Link copiado!');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error('Não foi possível copiar o link.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/api/guests/${id}`);
      toast.success('Convidado removido.');
      fetchGuests();
    } catch (err) {
      toast.error('Erro ao remover convidado.');
    } finally {
      setDeleteConfirm(null);
    }
  };

  const handleExportCSV = () => {
    const token = localStorage.getItem('admin_token');
    const url = `${API_BASE}/api/guests/export`;
    const a = document.createElement('a');
    a.download = 'convidados.csv';
    fetch(url, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => {
        const blobUrl = URL.createObjectURL(blob);
        a.href = blobUrl;
        a.click();
        URL.revokeObjectURL(blobUrl);
      })
      .catch(() => toast.error('Erro ao exportar lista.'));
  };

  return (
    <AdminShell title="Convidados">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome, apelido ou telefone..."
            data-testid="admin-guests-search-input"
            className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 bg-white"
            data-testid="admin-guests-status-filter"
          >
            <option value="">Todos</option>
            <option value="pending">Pendentes</option>
            <option value="confirmed">Confirmados</option>
            <option value="cancelled">Cancelados</option>
          </select>
          <button
            onClick={() => setDrawerGuest(null)}
            data-testid="admin-guests-create-button"
            className="flex items-center gap-2 px-4 py-2.5 bg-green-800 text-white text-sm font-semibold rounded-xl hover:bg-green-700 transition-colors"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Adicionar</span>
          </button>
          <button
            onClick={handleExportCSV}
            title="Exportar lista para CSV (Excel)"
            className="flex items-center gap-2 px-3 py-2.5 border border-gray-200 text-gray-600 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            <span className="hidden sm:inline">CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" data-testid="admin-guests-table">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Nome</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden md:table-cell">Apelido</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden lg:table-cell">Telefone</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider hidden sm:table-cell">Resposta</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center py-12">
                  <div className="w-7 h-7 border-2 border-green-700 border-t-transparent rounded-full animate-spin mx-auto" />
                </td></tr>
              ) : guests.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-12 text-gray-400 text-sm">
                  {search || statusFilter ? 'Nenhum resultado encontrado.' : 'Nenhum convidado cadastrado ainda.'}
                </td></tr>
              ) : (
                guests.map(guest => (
                  <tr key={guest.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-800">{guest.full_name}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-gray-500">{guest.nickname || '-'}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-gray-500">{guest.phone || '-'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={guest.status} />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <p className="text-xs text-gray-400">
                        {guest.responded_at
                          ? new Date(guest.responded_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
                          : '-'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => copyLink(guest)}
                          title="Copiar link do convite"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-green-700 transition-colors"
                          data-testid={`guest-copy-link-${guest.id}`}
                        >
                          {copiedId === guest.id ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                        </button>
                        <a
                          href={`https://wa.me/?text=${encodeURIComponent(`Olá ${guest.full_name}! Você foi convocado para a festa de Anderson e Arthur 🎉\nConfirme sua presença: ${getInviteLink(guest.slug)}`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Enviar via WhatsApp"
                          className="p-1.5 rounded-lg hover:bg-green-50 text-gray-400 hover:text-green-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                        </a>
                        <a
                          href={getInviteLink(guest.slug)}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Abrir link do convite"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-blue-700 transition-colors"
                        >
                          <ExternalLink size={14} />
                        </a>
                        <button
                          onClick={() => setDrawerGuest(guest)}
                          title="Editar convidado"
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-amber-700 transition-colors"
                          data-testid={`guest-edit-${guest.id}`}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(guest)}
                          title="Remover convidado"
                          className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                          data-testid={`guest-delete-${guest.id}`}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guest count */}
      {!loading && (
        <p className="text-xs text-gray-400 mt-3">
          {guests.length} convidado{guests.length !== 1 ? 's' : ''} encontrado{guests.length !== 1 ? 's' : ''}
        </p>
      )}

      {/* Drawer */}
      <AnimatePresence>
        {drawerGuest !== undefined && (
          <GuestDrawer
            guest={drawerGuest}
            onClose={() => setDrawerGuest(undefined)}
            onSave={fetchGuests}
          />
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div className="absolute inset-0 bg-black/40" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl p-6"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <h3 className="font-bold text-gray-800 mb-2">Remover convidado?</h3>
              <p className="text-sm text-gray-600 mb-5">
                Tem certeza que deseja remover <strong>{deleteConfirm.full_name}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 h-10 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm.id)}
                  className="flex-1 h-10 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors"
                  data-testid="guest-delete-confirm"
                >
                  Remover
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
