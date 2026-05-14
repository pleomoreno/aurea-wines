(function () {
  const modal = document.createElement('div');
  modal.id = 'searchModal';
  modal.className = 'search-modal';
  modal.setAttribute('aria-hidden', 'true');
  modal.innerHTML = `
    <div class="search-overlay" id="searchOverlay"></div>
    <div class="search-box" role="dialog" aria-label="Buscar vinhos">
      <div class="search-input-wrap">
        <svg viewBox="0 0 24 24" class="search-icon-inline" width="20" height="20" stroke="var(--color-muted)" fill="none" stroke-width="2">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          id="searchInput"
          placeholder="Buscar vinho, tipo, origem..."
          autocomplete="off"
          spellcheck="false"
        />
        <button id="searchClose" aria-label="Fechar busca">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" fill="none" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>
      <div id="searchResults" class="search-results">
        <p class="search-hint">Digite para buscar em nosso catálogo</p>
      </div>
    </div>`;
  document.body.appendChild(modal);

  const input = document.getElementById('searchInput');
  const results = document.getElementById('searchResults');
  const overlay = document.getElementById('searchOverlay');
  const closeBtn = document.getElementById('searchClose');

  // === ABRIR / FECHAR ===
  function openSearch() {
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    setTimeout(() => input?.focus(), 100);
  }

  function closeSearch() {
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (input) input.value = '';
    if (results) results.innerHTML = '<p class="search-hint">Digite para buscar em nosso catálogo</p>';
  }

  document.querySelectorAll('.icon-btn[aria-label="Buscar"]').forEach(btn => {
    btn.addEventListener('click', openSearch);
  });

  overlay?.addEventListener('click', closeSearch);
  closeBtn?.addEventListener('click', closeSearch);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeSearch();
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); openSearch(); }
  });

  // === BUSCA COM DEBOUNCE ===
  let debounceTimer;
  input?.addEventListener('input', () => {
    clearTimeout(debounceTimer);
    const q = input.value.trim();
    if (q.length < 2) {
      results.innerHTML = '<p class="search-hint">Digite ao menos 2 caracteres</p>';
      return;
    }
    results.innerHTML = '<div class="search-loading"><span></span><span></span><span></span></div>';
    debounceTimer = setTimeout(() => doSearch(q), 350);
  });

  async function doSearch(query) {
    const q = query.toLowerCase();

    if (typeof searchShopifyProducts === 'function') {
      try {
        const raw = await searchShopifyProducts(query, 8);
        if (raw.length === 0) {
          showEmpty(query);
        } else {
          showResults(raw.map(mapShopifyProduct));
        }
        return;
      } catch (_) {
      }
    }

    if (typeof DEMO_PRODUCTS !== 'undefined') {
      const filtered = DEMO_PRODUCTS.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.productType.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
      filtered.length > 0 ? showResults(filtered) : showEmpty(query);
    }
  }

  function showResults(products) {
    if (!results) return;
    const root = isRoot();
    const catalogPath = root ? 'pages/catalogo.html' : 'catalogo.html';

    results.innerHTML = `
      <p class="search-count">${products.length} resultado${products.length !== 1 ? 's' : ''} encontrado${products.length !== 1 ? 's' : ''}</p>
      <div class="search-grid">
        ${products.map(p => `
          <div class="search-result-card">
            <div class="search-result-img">
              ${p.image
                ? `<img src="${p.image}" alt="${p.imageAlt}" loading="lazy">`
                : `<div class="search-img-placeholder">
                     <svg viewBox="0 0 24 24" width="32" height="32" stroke="var(--color-muted)" fill="none" stroke-width="1.2">
                       <path d="M6 8h12l-1.5 12h-9L6 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>
                     </svg>
                   </div>`}
            </div>
            <div class="search-result-info">
              <span class="search-result-type">${p.productType || 'Vinho'}</span>
              <h4>${p.title}</h4>
              <span class="search-result-price">${fmtBRL(p.price)}</span>
            </div>
            <button
              class="add-to-cart search-add-btn btn-outline btn-sm"
              data-name="${p.title}"
              data-price="${p.price}"
              data-variant-id="${p.variantId}"
              data-image="${p.image}"
            >Adicionar</button>
          </div>
        `).join('')}
      </div>
      <a href="${catalogPath}" class="search-see-all" onclick="closeSearch()">
        Ver catálogo completo →
      </a>`;
  }

  function showEmpty(query) {
    results.innerHTML = `
      <div class="search-empty">
        <p>Nenhum resultado para <strong>"${query}"</strong></p>
        <p class="search-hint">Tente buscar por tipo: Tinto, Branco, Rosé</p>
      </div>`;
  }

  function isRoot() {
    return !window.location.pathname.includes('/pages/');
  }

  function fmtBRL(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  window.closeSearchModal = closeSearch;
})();