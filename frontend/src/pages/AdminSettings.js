import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import AdminShell from '../components/AdminShell';
import { toast } from 'sonner';
import { Save, RefreshCw, ExternalLink, Upload, Volume2, Loader2, CheckCircle } from 'lucide-react';

const API_BASE = process.env.REACT_APP_BACKEND_URL || '';

const REGULAR_FIELDS = [
  { key: 'title', label: 'Título do convite', type: 'text', placeholder: 'Você foi convocado!' },
  { key: 'subtitle', label: 'Subtítulo', type: 'text', placeholder: 'Comemoração do aniversário...' },
  { key: 'honoree_1_name', label: 'Nome do aniversariante 1', type: 'text', placeholder: 'Anderson' },
  { key: 'honoree_1_age', label: 'Idade do aniversariante 1', type: 'number', placeholder: '24' },
  { key: 'honoree_2_name', label: 'Nome do aniversariante 2', type: 'text', placeholder: 'Arthur' },
  { key: 'honoree_2_age', label: 'Idade do aniversariante 2', type: 'number', placeholder: '23' },
  { key: 'event_date', label: 'Data do evento', type: 'text', placeholder: '13/06/2026' },
  { key: 'start_time_text', label: 'Horário de início', type: 'text', placeholder: 'a partir das 15h' },
  { key: 'match_text', label: 'Texto da transmissão', type: 'text', placeholder: 'Brasil x Marrocos às 19h' },
  { key: 'drinks_text', label: 'Instruções de bebidas', type: 'textarea', placeholder: 'Cada convidado é responsável...' },
  { key: 'dress_code_text', label: 'Dress code / Traje', type: 'textarea', placeholder: 'Camisa da seleção...' },
  { key: 'party_items_text', label: 'Itens de torcida', type: 'textarea', placeholder: 'Leve corneta, vuvuzela...' },
  { key: 'address_text', label: 'Endereço exibido', type: 'text', placeholder: 'Rua da Linha, 30' },
  { key: 'maps_url', label: 'Link Google Maps', type: 'url', placeholder: 'https://www.google.com/maps/...' },
  { key: 'confirmation_success_text', label: 'Mensagem de confirmação', type: 'textarea', placeholder: 'Presença confirmada!' },
  { key: 'cancellation_success_text', label: 'Mensagem de cancelamento', type: 'textarea', placeholder: 'Resposta registrada.' },
];

const AUDIO_FIELDS = [
  {
    key: 'open_audio_url',
    label: 'Áudio de abertura do convite',
    hint: 'Toca quando o convidado clica em "Abrir convite"',
    defaultUrl: '/sounds/envelope-open.wav',
  },
  {
    key: 'celebration_audio_url',
    label: 'Áudio de comemoração (confirmação)',
    hint: 'Toca ao confirmar presença — pode ser um áudio do Galvão Bueno!',
    defaultUrl: '/sounds/celebration.wav',
  },
  {
    key: 'cancellation_audio_url',
    label: 'Áudio de cancelamento',
    hint: 'Toca quando o convidado marca que não pode comparecer',
    defaultUrl: '/sounds/cancellation.wav',
  },
];

function AudioField({ fieldKey, label, hint, value, onChange, token }) {
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const fileRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploaded(false);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await axios.post(`${API_BASE}/api/upload/audio`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(fieldKey, res.data.url);
      setUploaded(true);
      toast.success(`Áudio enviado: ${res.data.filename}`);
      setTimeout(() => setUploaded(false), 3000);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao enviar áudio.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handlePreview = () => {
    if (!value) return;
    const src = value.startsWith('http') ? value : value;
    try {
      const a = new Audio(src);
      a.volume = 0.6;
      a.play().catch(() => toast.error('Não foi possível reproduzir o áudio.'));
    } catch {
      toast.error('URL de áudio inválida.');
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm md:col-span-2">
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
        {label}
      </label>
      {hint && <p className="text-xs text-gray-400 mb-3">{hint}</p>}

      {/* URL input */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={value || ''}
          onChange={e => onChange(fieldKey, e.target.value)}
          placeholder="Cole o link do MP3 aqui..."
          className="flex-1 border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
        />
        <button
          type="button"
          onClick={handlePreview}
          disabled={!value}
          title="Testar áudio"
          className="px-3 py-2.5 rounded-xl border border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-green-700 transition-colors disabled:opacity-40"
        >
          <Volume2 size={16} />
        </button>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-1 h-px bg-gray-100" />
        <span className="text-xs text-gray-400 font-medium">ou faça upload</span>
        <div className="flex-1 h-px bg-gray-100" />
      </div>

      {/* Upload button */}
      <div className="flex items-center gap-3">
        <input
          type="file"
          accept=".wav,.mp3,.ogg,.m4a,audio/*"
          ref={fileRef}
          onChange={handleUpload}
          className="hidden"
          id={`audio-upload-${fieldKey}`}
        />
        <label
          htmlFor={`audio-upload-${fieldKey}`}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
          style={{
            background: uploading ? 'rgba(0,100,0,0.08)' : 'rgba(0,100,0,0.06)',
            border: '1px dashed rgba(0,100,0,0.3)',
            color: '#006400',
          }}
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Enviando...</>
          ) : uploaded ? (
            <><CheckCircle size={14} className="text-green-600" /> Enviado!</>
          ) : (
            <><Upload size={14} /> Selecionar arquivo de áudio</>
          )}
        </label>
        <span className="text-xs text-gray-400">WAV, MP3, OGG — até 10MB</span>
      </div>

      {/* Current URL display */}
      {value && (
        <p className="text-xs text-gray-400 mt-2 truncate">
          <span className="font-medium">Atual:</span> {value}
        </p>
      )}
    </div>
  );
}

export default function AdminSettings() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/api/event-settings?_=${Date.now()}`);
      setForm(res.data);
    } catch (e) {
      toast.error('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleChange = (key, value) => {
    setForm(f => ({ ...f, [key]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.put(`${API_BASE}/api/event-settings`, form);
      toast.success('Configurações salvas com sucesso!');
    } catch (err) {
      toast.error('Erro ao salvar configurações.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminShell title="Configurações do Evento">
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-2 border-green-700 border-t-transparent rounded-full animate-spin" />
        </div>
      </AdminShell>
    );
  }

  return (
    <AdminShell title="Configurações do Evento">
      <div className="flex items-center justify-between mb-6">
        <p className="text-sm text-gray-500">Edite as informações do convite sem alterar o código.</p>
        <div className="flex items-center gap-2">
          <button onClick={fetchSettings}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-xl hover:bg-gray-100 transition-colors" title="Recarregar">
            <RefreshCw size={15} />
          </button>
          <a href="/convite" target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-green-700 hover:text-green-800 border border-green-200 bg-green-50 px-3 py-2 rounded-xl transition-colors">
            <ExternalLink size={12} />
            Ver convite
          </a>
        </div>
      </div>

      <form onSubmit={handleSave} data-testid="admin-settings-form">
        {/* Regular fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {REGULAR_FIELDS.map(field => (
            <div key={field.key} className={`bg-white rounded-xl border border-gray-100 p-4 shadow-sm ${field.type === 'textarea' ? 'md:col-span-2' : ''}`}>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {field.label}
              </label>
              {field.type === 'textarea' ? (
                <textarea
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700 resize-none"
                />
              ) : (
                <input
                  type={field.type}
                  value={form[field.key] || ''}
                  onChange={e => handleChange(field.key, field.type === 'number' ? Number(e.target.value) : e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full border border-gray-200 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-700"
                />
              )}
            </div>
          ))}
        </div>

        {/* Audio section */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Volume2 size={16} className="text-green-700" />
            Áudios do convite
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {AUDIO_FIELDS.map(f => (
              <AudioField
                key={f.key}
                fieldKey={f.key}
                label={f.label}
                hint={f.hint}
                value={form[f.key] || f.defaultUrl}
                onChange={handleChange}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            data-testid="admin-settings-save-button"
            className="flex items-center gap-2 h-11 px-6 bg-green-800 hover:bg-green-700 text-white font-semibold rounded-xl transition-all disabled:opacity-60 text-sm"
          >
            <Save size={15} />
            {saving ? 'Salvando...' : 'Salvar configurações'}
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
