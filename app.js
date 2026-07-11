// app.js — Frontend do Codex Multiversal
// Consome a API REST do backend Express e monta a interface, sem frameworks.

(() => {
  'use strict';

  const shelfEl = document.getElementById('shelf');
  const searchInput = document.getElementById('search-input');
  const searchResultsEl = document.getElementById('search-results');
  const overlayEl = document.getElementById('tome-overlay');
  const modalContentEl = document.getElementById('tome-content');
  const closeBtn = document.getElementById('tome-close');

  const API = {
    games: '/api/games',
    game: (id) => `/api/games/${encodeURIComponent(id)}`,
    search: (q) => `/api/search?q=${encodeURIComponent(q)}`,
    stats: '/api/stats',
  };

  // ---------- Estante ----------
  async function loadShelf() {
    shelfEl.innerHTML = '<div class="loading-state">Abrindo a estante...</div>';
    try {
      const res = await fetch(API.games);
      if (!res.ok) throw new Error('Falha ao carregar a estante');
      const { games } = await res.json();
      renderShelf(games);
    } catch (err) {
      shelfEl.innerHTML = `<div class="empty-state">Não foi possível carregar os tomos. Verifique se o servidor backend está rodando.</div>`;
      console.error(err);
    }
  }

  function renderShelf(games) {
    if (!games.length) {
      shelfEl.innerHTML = '<div class="empty-state">Nenhum tomo encontrado.</div>';
      return;
    }
    shelfEl.innerHTML = '';
    games.forEach((game) => {
      const btn = document.createElement('button');
      btn.className = 'tome';
      btn.style.setProperty('--spine', game.spineColor || '#6b5230');
      btn.setAttribute('aria-label', `Abrir tomo: ${game.name}`);
      btn.innerHTML = `
        <span class="tome__sigil" aria-hidden="true">${game.sigil || '📖'}</span>
        <span class="tome__name">${escapeHtml(game.name)}</span>
        <span class="tome__tagline">${escapeHtml(game.tagline || '')}</span>
        <span class="tome__dev">${escapeHtml(game.developer || '')}</span>
      `;
      btn.addEventListener('click', () => openTome(game.id));
      shelfEl.appendChild(btn);
    });
  }

  // ---------- Estatísticas do hero ----------
  async function loadStats() {
    try {
      const res = await fetch(API.stats);
      if (!res.ok) throw new Error('Falha ao carregar estatísticas');
      const stats = await res.json();
      document.querySelector('[data-stat="totalGames"]').textContent = stats.totalGames;
      document.querySelector('[data-stat="totalFactions"]').textContent = stats.totalFactions;
      document.querySelector('[data-stat="totalFigures"]').textContent = stats.totalFigures;
    } catch (err) {
      console.error(err);
    }
  }

  // ---------- Modal de tomo ----------
  async function openTome(id) {
    modalContentEl.innerHTML = '<p class="tome-modal__meta">Desenrolando o pergaminho...</p>';
    overlayEl.hidden = false;
    document.body.style.overflow = 'hidden';
    closeBtn.focus();

    try {
      const res = await fetch(API.game(id));
      if (!res.ok) throw new Error('Tomo não encontrado');
      const game = await res.json();
      renderTome(game);
    } catch (err) {
      modalContentEl.innerHTML = '<p class="tome-modal__meta">Este tomo está corrompido ou ausente da estante.</p>';
      console.error(err);
    }
  }

  function renderTome(game) {
    const factionsHtml = (game.factions || []).map((f) => `
      <li><strong>${escapeHtml(f.name)}</strong><span>${escapeHtml(f.desc || '')}</span></li>
    `).join('');

    const figuresHtml = (game.keyFigures || []).map((k) => `
      <li><strong>${escapeHtml(k.name)}</strong><span>${escapeHtml(k.role || '')}</span></li>
    `).join('');

    const themesHtml = (game.themes || []).map((t) => `
      <span class="tome-modal__theme">${escapeHtml(t)}</span>
    `).join('');

    modalContentEl.innerHTML = `
      <p class="eyebrow">${escapeHtml(game.developer || '')}</p>
      <h2>${escapeHtml(game.name)}</h2>
      <p class="tome-modal__meta">${escapeHtml(game.setting || '')} — ${escapeHtml(game.era || '')}</p>
      <p class="tome-modal__summary">${escapeHtml(game.summary || '')}</p>

      ${factionsHtml ? `
        <h3 class="tome-modal__section-title">Facções &amp; Ordens</h3>
        <ul class="tome-modal__list">${factionsHtml}</ul>
      ` : ''}

      ${figuresHtml ? `
        <h3 class="tome-modal__section-title">Figuras-chave</h3>
        <ul class="tome-modal__list">${figuresHtml}</ul>
      ` : ''}

      ${themesHtml ? `<div class="tome-modal__themes">${themesHtml}</div>` : ''}
    `;
  }

  function closeTome() {
    overlayEl.hidden = true;
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', closeTome);
  overlayEl.addEventListener('click', (e) => {
    if (e.target === overlayEl) closeTome();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlayEl.hidden) closeTome();
  });

  // ---------- Busca ----------
  let searchTimer = null;
  searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    const q = searchInput.value.trim();
    if (!q) {
      searchResultsEl.hidden = true;
      searchResultsEl.innerHTML = '';
      return;
    }
    searchTimer = setTimeout(() => runSearch(q), 220);
  });

  async function runSearch(q) {
    try {
      const res = await fetch(API.search(q));
      if (!res.ok) throw new Error('Falha na busca');
      const { results } = await res.json();
      renderSearchResults(results);
    } catch (err) {
      console.error(err);
    }
  }

  function renderSearchResults(results) {
    searchResultsEl.hidden = false;
    if (!results.length) {
      searchResultsEl.innerHTML = '<div class="empty">Nenhum eco encontrado nos tomos.</div>';
      return;
    }
    searchResultsEl.innerHTML = '';
    results.forEach((game) => {
      const btn = document.createElement('button');
      btn.innerHTML = `<span aria-hidden="true">${game.sigil || '📖'}</span> ${escapeHtml(game.name)} — <em>${escapeHtml(game.tagline || '')}</em>`;
      btn.addEventListener('click', () => {
        searchResultsEl.hidden = true;
        searchInput.value = '';
        openTome(game.id);
      });
      searchResultsEl.appendChild(btn);
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hero__search')) {
      searchResultsEl.hidden = true;
    }
  });

  // ---------- Utilitário de segurança ----------
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str ?? '';
    return div.innerHTML;
  }

  // ---------- Boot ----------
  loadShelf();
  loadStats();
})();
