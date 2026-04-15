# Plano de Desenvolvimento — Convite Digital Interativo Copa 2026

## Visão Geral
Aplicativo web completo de convite digital interativo para aniversário de Anderson (24) e Arthur (23), tema Copa do Mundo / torcida brasileira, com animação de envelope, sistema RSVP e painel administrativo.

**Data do evento:** 13/06/2026  
**Admin:** admin@festa.com / festa2024  
**Stack:** React + FastAPI + MongoDB + Framer Motion + Tailwind CSS

---

## Phase 1: POC — SKIPPED
Não necessário. Stack padrão, sem integrações de alto risco.

---

## Phase 2: Implementação Completa (ATUAL)

### Backend (FastAPI + MongoDB)
**Coleções MongoDB:**
- `event_settings` — configurações do evento (seed inicial incluído)
- `guests` — convidados com slug único
- `rsvp_logs` — histórico de ações
- `admin_users` — administradores (seed: admin@festa.com / festa2024)

**Rotas da API:**
- POST `/api/auth/login` — login admin (JWT)
- GET `/api/auth/me` — dados do admin logado
- GET `/api/event-settings` — buscar configurações do evento
- PUT `/api/event-settings` — atualizar configurações (admin)
- GET `/api/guests` — listar convidados (admin)
- POST `/api/guests` — criar convidado (admin)
- GET `/api/guests/{id}` — buscar convidado por ID (admin)
- PUT `/api/guests/{id}` — atualizar convidado (admin)
- DELETE `/api/guests/{id}` — remover convidado (admin)
- GET `/api/rsvp/guest/{slug}` — buscar convidado por slug (público)
- POST `/api/rsvp/confirm` — confirmar presença (público)
- POST `/api/rsvp/cancel` — cancelar presença (público)
- GET `/api/rsvp-logs` — listar logs (admin)

### Frontend (React + React Router + Framer Motion)
**Rotas:**
- `/` → redirect para `/convite`
- `/convite` — convite público genérico
- `/convite/:slug` — convite individual por convidado
- `/admin` → redirect para `/admin/login`
- `/admin/login` — login administrativo
- `/admin/dashboard` — painel com estatísticas
- `/admin/guests` — gestão de convidados
- `/admin/settings` — configurações do evento

### Componentes principais
- `EnvelopeAnimation` — envelope fechado com selo clicável (Framer Motion)
- `InviteCard` — conteúdo do convite com informações do evento
- `RSVPModal` — modal de confirmação/cancelamento
- `AdminLayout` — layout do painel admin com sidebar
- `GuestTable` — tabela de convidados com CRUD
- `StatsCards` — cards de estatísticas do dashboard
- `EventSettingsForm` — formulário de edição das configurações

### Assets
- `/public/sounds/envelope-open.wav` — som de abertura (gerado via Python)
- `/public/sounds/celebration.wav` — som de comemoração (gerado via Python)
- `/public/og-image.png` — imagem Open Graph para WhatsApp (SVG/PNG com tema Copa)

### Seed Inicial do Evento
```json
{
  "title": "Você foi convidado!",
  "subtitle": "Comemoração do aniversário de Anderson 24 anos e Arthur 23 anos",
  "honoree_1_name": "Anderson",
  "honoree_1_age": 24,
  "honoree_2_name": "Arthur",
  "honoree_2_age": 23,
  "event_date": "13/06/2026",
  "start_time_text": "a partir das 15h",
  "match_text": "Transmissão do jogo Brasil x Marrocos às 19h",
  "drinks_text": "Cada convidado é responsável por levar sua própria bebida",
  "dress_code_text": "Camisa da seleção ou camisa amarela, verde ou azul",
  "party_items_text": "Leve corneta, vuvuzela, bandeira e adereços de torcida",
  "address_text": "Rua da Linha, 30 — 51150-630",
  "maps_url": "https://www.google.com/maps/search/?api=1&query=Rua%20da%20Linha%2C%2030%2C%2051150-630",
  "confirmation_success_text": "Presença confirmada! Te esperamos para torcer com a gente!",
  "cancellation_success_text": "Resposta registrada. Obrigado por avisar.",
  "theme_name": "copa",
  "is_active": true
}
```

### User Stories — Phase 2
1. **Convidado via link individual**: Abre `/convite/anderson-silva-x8k2`, vê envelope, clica no selo, envelope abre com animação + som, lê convite, confirma presença → nome já preenchido → sucesso + som de comemoração
2. **Convidado via link público**: Abre `/convite`, mesmo fluxo mas precisa digitar nome/apelido ao confirmar
3. **Cancelamento**: Convidado clica em "Cancelar presença" → formulário → status muda para cancelled
4. **Admin login**: Acessa `/admin/login`, faz login com admin@festa.com/festa2024, vai para dashboard
5. **Admin dashboard**: Vê cards com total, confirmados, cancelados, pendentes
6. **Admin CRUD**: Adiciona convidado, gera link, copia link, edita, remove
7. **Admin settings**: Edita dados do evento sem alterar código, salva, convite atualiza
8. **WhatsApp preview**: Link enviado mostra imagem temática bonita com dados do evento

---

## Status das Fases

- [ ] Phase 2: Backend implementado
- [ ] Phase 2: Frontend implementado
- [ ] Phase 2: Assets de áudio gerados
- [ ] Phase 2: OG image configurada
- [ ] Phase 2: All user stories covered
- [ ] Phase 2: End to end testing
