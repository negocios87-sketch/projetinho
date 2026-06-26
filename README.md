# ✈️ Planejamento de Viagem

Painel compartilhado de planejamento de viagem. Duas pessoas editam, as duas veem.

## Estrutura

```
/api/state.js        → serverless function (lê/grava data/state.json via GitHub API)
/public/index.html   → o painel
/data/state.json     → "banco de dados"
/vercel.json
/package.json
```

## Setup no Vercel

### 1. Variáveis de ambiente (Settings → Environment Variables)

| Variável | Valor |
|---|---|
| `VIAGEM_PASSWORD` | a senha que você quiser |
| `GITHUB_TOKEN` | seu Personal Access Token (veja abaixo) |
| `GITHUB_REPO` | `negocios87-sketch/projetinho` |

### 2. Gerar o GitHub Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token (classic)
3. Marcar permissão: **repo** (full control)
4. Copiar o token e colar na variável `GITHUB_TOKEN` no Vercel

### 3. Deploy

Conecta o repo no Vercel normalmente. Framework Preset: **Other**.

Pronto. Acessa o link, digita a senha e usa.

## Como funciona

- Frontend faz `GET /api/state` a cada 6 segundos → sincroniza mudanças da outra pessoa
- Qualquer alteração faz `POST /api/state` → grava no `data/state.json` via commit na branch `main`
- Senha validada no servidor via header `x-password`
