// server.js — Backend do Codex de Lore de RPGs
// API REST simples em Express, servindo dados de lore e o frontend estático.

const path = require('path');
const fs = require('fs');
const express = require('express');
const compression = require('compression');
const helmet = require('helmet');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_PATH = path.join(__dirname, 'data', 'games.json');

// ---------- Middlewares ----------
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'fonts.googleapis.com'],
      fontSrc: ["'self'", 'fonts.gstatic.com'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
    },
  },
}));
app.use(compression());
app.use(express.json());

// Cache simples em memória para não reler o disco a cada requisição
let gamesCache = null;
function loadGames() {
  if (gamesCache) return gamesCache;
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  gamesCache = JSON.parse(raw);
  return gamesCache;
}

// ---------- Rotas da API ----------

// Lista resumida de todos os jogos (para a estante/grid)
app.get('/api/games', (req, res) => {
  const games = loadGames().map(({ id, name, tagline, spineColor, sigil, developer }) => ({
    id, name, tagline, spineColor, sigil, developer,
  }));
  res.json({ count: games.length, games });
});

// Detalhe completo de um jogo específico
app.get('/api/games/:id', (req, res) => {
  const game = loadGames().find((g) => g.id === req.params.id);
  if (!game) {
    return res.status(404).json({ error: 'Jogo não encontrado no codex.' });
  }
  res.json(game);
});

// Busca por nome, facção, personagem ou tema
app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) {
    return res.json({ count: 0, results: [] });
  }
  const results = loadGames().filter((g) => {
    const haystack = [
      g.name,
      g.tagline,
      g.summary,
      ...(g.themes || []),
      ...(g.factions || []).map((f) => f.name),
      ...(g.keyFigures || []).map((k) => k.name),
    ].join(' ').toLowerCase();
    return haystack.includes(q);
  }).map(({ id, name, tagline, spineColor, sigil }) => ({ id, name, tagline, spineColor, sigil }));

  res.json({ count: results.length, results });
});

// Estatísticas gerais do codex (usado no hero da página)
app.get('/api/stats', (req, res) => {
  const games = loadGames();
  const totalFactions = games.reduce((sum, g) => sum + (g.factions?.length || 0), 0);
  const totalFigures = games.reduce((sum, g) => sum + (g.keyFigures?.length || 0), 0);
  res.json({
    totalGames: games.length,
    totalFactions,
    totalFigures,
  });
});

// ---------- Frontend estático ----------
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));

// Qualquer rota não-API cai no index (suporta navegação futura em SPA)
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ---------- Tratamento de erros ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Rota não encontrada.' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno do servidor.' });
});

app.listen(PORT, () => {
  console.log(`📜 Codex de Lore RPG rodando em http://localhost:${PORT}`);
});
