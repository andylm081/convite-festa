# Deploy — Convite Anderson & Arthur no Vercel

Um único deploy, tudo no Vercel. Banco incluso. Sem conta extra.

---

## O que você vai usar (tudo gratuito)

| Parte        | Serviço           | Limite gratuito         |
|--------------|-------------------|-------------------------|
| Frontend     | Vercel Static     | Ilimitado               |
| Backend API  | Vercel Serverless | 100GB-hrs/mês           |
| Banco dados  | Vercel Postgres   | 256MB / 60h compute/mês |
| Upload áudio | Vercel Blob       | 500MB storage           |

Tudo no mesmo painel do Vercel. Sem MongoDB Atlas, sem Railway, sem nada extra.

---

## Passo 1 — Prepare o repositório

1. No Emergent, clique em **Download/Export** para baixar o código
2. Descompacte a pasta
3. Na raiz do projeto, renomeie `requirements-vercel.txt` para `requirements.txt`
   ```
   mv requirements-vercel.txt requirements.txt
   ```
4. Crie um repositório privado no GitHub e faça push:
   ```bash
   git init
   git add .
   git commit -m "convite festa anderson arthur"
   git remote add origin https://github.com/SEU_USUARIO/convite-festa.git
   git push -u origin main
   ```

---

## Passo 2 — Crie o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) → **New Project**
2. Importe o repositório do GitHub
3. Na tela de configuração:
   - **Framework Preset**: `Other`
   - O `vercel.json` já configura o build automaticamente
4. Clique em **Deploy**
   > Vai falhar por enquanto (banco não configurado). Normal!

---

## Passo 3 — Banco de dados: Vercel Postgres

1. No painel Vercel → aba **Storage**
2. **Create Database** → **Neon Serverless Postgres** → nome: `convite-db`
3. Clique **Connect to Project** → selecione seu projeto
4. Isso adiciona `POSTGRES_URL` como variável de ambiente automaticamente

### Inicializar as tabelas
5. Ainda na página do banco → aba **Query**
6. Copie o conteúdo do arquivo **`schema.sql`** e clique **Run**
7. Aguarde: "Query ran successfully" ✅

---

## Passo 4 — Storage de áudio: Vercel Blob

1. No painel Vercel → aba **Storage**
2. **Create Database** → **Blob** → nome: `convite-audio`
3. Clique **Connect to Project**
4. Isso adiciona `BLOB_READ_WRITE_TOKEN` automaticamente ✅

---

## Passo 5 — Variáveis de ambiente

No Vercel → seu projeto → **Settings → Environment Variables**

Adicione estas duas variáveis:

| Variável       | Valor                                          |
|----------------|------------------------------------------------|
| `SECRET_KEY`   | qualquer-string-longa-aleatoria (ex: `abc123xyz456secretkey2026`) |
| `FRONTEND_URL` | `https://nome-do-seu-projeto.vercel.app`      |

> `POSTGRES_URL` e `BLOB_READ_WRITE_TOKEN` já foram adicionados automaticamente nos passos 3 e 4.

**Não adicione `REACT_APP_BACKEND_URL`** — no Vercel, o frontend e o backend ficam no mesmo domínio e as chamadas de API são relativas automaticamente.

---

## Passo 6 — Redeploy

1. Vercel → Deployments → clique nos 3 pontos do último deploy → **Redeploy**
2. Aguarde ~2 minutos
3. ✅ App no ar!

---

## Passo 7 — Primeiro acesso

1. Acesse: `https://nome-do-seu-projeto.vercel.app/admin/login`
2. Login: `admin@festa.com` / `festa2026`
3. ✅ Pronto!

---

## Resumo das variáveis de ambiente

| Variável              | De onde vem                     | Obrigatório |
|-----------------------|---------------------------------|-------------|
| `POSTGRES_URL`        | Vercel Postgres (automático)    | ✅ Sim      |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob (automático)      | Para upload de áudio |
| `SECRET_KEY`          | Você define                     | ✅ Sim      |
| `FRONTEND_URL`        | URL do seu app Vercel           | ✅ Sim      |

---

## ⚠️ Áudios padrão já funcionam

Os arquivos `envelope-open.wav`, `celebration.wav` e `cancellation.wav` estão  
em `frontend/public/sounds/` e são servidos como estáticos pelo Vercel.  
Funcionam sem configuração extra.

Para áudios personalizados (upload no painel admin), o Vercel Blob é usado automaticamente.

---

## Estrutura do projeto

```
/
├── api/
│   └── index.py          ← Backend FastAPI (Vercel Serverless Functions)
├── frontend/
│   ├── src/              ← React app (sem alterações)
│   ├── public/sounds/    ← Áudios padrão
│   └── package.json
├── schema.sql            ← Cole no Vercel Postgres Query
├── requirements.txt      ← (renomear de requirements-vercel.txt)
├── vercel.json           ← Configuração do deploy (já pronto)
└── DEPLOY.md             ← Este guia
```

---

## Dúvidas frequentes

**Preciso de MongoDB Atlas?**  
Não. Usamos Vercel Postgres — PostgreSQL dentro do próprio Vercel.

**Preciso de dois projetos Vercel?**  
Não. Um só projeto serve frontend + API.

**Quanto custa?**  
R$ 0. O plano hobby do Vercel inclui tudo que usamos dentro dos limites gratuitos.  
Para uma festa com 100–2000 convidados: bem dentro do gratuito.

**Posso usar domínio personalizado?**  
Sim. Vercel → Domains → adicione seu domínio.

**Como atualizar o app depois do deploy?**  
Faça push no GitHub → Vercel faz redeploy automático.
