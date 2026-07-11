# 📜 Codex Multiversal — Lore dos Grandes RPGs

Site full-stack com a lore resumida de nove universos de RPG famosos: **The Witcher, The Elder Scrolls, Dark Souls, Final Fantasy VII, Dragon Age, Mass Effect, Diablo, Baldur's Gate/D&D e Persona.**

- **Backend:** Node.js + Express (API REST) com `helmet` (segurança de headers) e `compression` (gzip).
- **Frontend:** HTML/CSS/JS puro (sem framework), tema visual de "codex arcano" com estante de tomos interativa, busca em tempo real e modal de leitura.

---

## 🗂 Estrutura do projeto

```
rpg-lore-codex/
├── server.js              # Servidor Express + rotas da API
├── package.json
├── data/
│   └── games.json         # "Banco de dados" com a lore de cada jogo
└── public/                # Frontend estático servido pelo Express
    ├── index.html
    ├── css/style.css
    └── js/app.js
```

## 🔌 Rotas da API

| Método | Rota                | Descrição                                   |
|--------|----------------------|----------------------------------------------|
| GET    | `/api/games`         | Lista resumida de todos os tomos             |
| GET    | `/api/games/:id`     | Detalhe completo de um jogo (ex: `witcher`)  |
| GET    | `/api/search?q=termo`| Busca por nome, facção, personagem ou tema   |
| GET    | `/api/stats`         | Estatísticas gerais (contagens do hero)      |

---

## ▶️ Como rodar localmente

Pré-requisito: [Node.js](https://nodejs.org) instalado (versão 18 ou superior).

```bash
# 1. instale as dependências
npm install

# 2. inicie o servidor
npm start

# 3. abra no navegador
http://localhost:3000
```

Para desenvolvimento com recarregamento automático ao salvar arquivos:

```bash
npm run dev
```

---

## ☁️ Como colocar no GitHub e rodar a partir de lá

### 1. Criar o repositório no GitHub
1. Acesse [github.com/new](https://github.com/new).
2. Dê um nome ao repositório (ex: `codex-rpg-lore`) e clique em **Create repository**. Não marque "Add a README" (você já tem um).

### 2. Subir o projeto do seu computador

Dentro da pasta do projeto, rode:

```bash
git init
git add .
git commit -m "Codex Multiversal: primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/codex-rpg-lore.git
git push -u origin main
```

Troque `SEU-USUARIO` pelo seu usuário do GitHub.

### 3. Rodar o projeto depois de clonado do GitHub

Qualquer pessoa (ou você, em outra máquina) pode rodar assim:

```bash
git clone https://github.com/SEU-USUARIO/codex-rpg-lore.git
cd codex-rpg-lore
npm install
npm start
```

O site fica disponível em `http://localhost:3000`.

---

## ⚠️ Importante sobre o GitHub Pages

O **GitHub Pages** hospeda **apenas arquivos estáticos** (HTML/CSS/JS) — ele **não executa** um servidor Node/Express. Como este projeto tem um backend de verdade (a API em `server.js`), ele **não pode ser publicado direto no GitHub Pages**.

Você tem duas opções:

1. **Rodar localmente** (como descrito acima) — ideal para uso pessoal, portfólio ou desenvolvimento.
2. **Publicar o backend em um serviço gratuito que executa Node.js**, por exemplo:
   - [Render](https://render.com) (plano free — recomendado, é o mais simples: conecte o repositório do GitHub e ele builda e roda `npm start` automaticamente)
   - [Railway](https://railway.app)
   - [Fly.io](https://fly.io)
   - [Cyclic](https://www.cyclic.sh)

   Passos gerais no Render:
   1. Crie uma conta e clique em **New > Web Service**.
   2. Conecte seu repositório do GitHub.
   3. Build command: `npm install` — Start command: `npm start`.
   4. Deploy. Você recebe uma URL pública tipo `https://codex-rpg-lore.onrender.com`.

Se no futuro você quiser **apenas o front-end** publicado gratuitamente no GitHub Pages (sem backend, com os dados "congelados" em um arquivo JSON estático direto no navegador), me avise que eu adapto o `app.js` para ler `data/games.json` diretamente em vez de chamar a API — aí dá pra hospedar 100% grátis no GitHub Pages.

---

## 📝 Nota sobre o conteúdo

Os resumos de lore foram escritos de forma original para fins educativos/fã, sintetizando o conhecimento público sobre cada franquia. Todos os direitos das obras originais pertencem aos respectivos estúdios e autores (CD Projekt Red, Bethesda, FromSoftware, Square Enix, BioWare, Blizzard, Wizards of the Coast/Larian, Atlus).
