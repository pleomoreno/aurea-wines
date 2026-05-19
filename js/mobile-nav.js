// ================================
// AUREA WINES — NAVEGAÇÃO MOBILE
// ================================

(function () {
  const header = document.querySelector(".header-content");
  if (!header) return;

  // ── Path helper ───────────────────────────────
  // Se a URL contém /html/, usa caminhos relativos.
  // Se está na raiz (ex: rewrite do Netlify), usa /html/ absoluto.
  function href(filename) {
    if (window.location.pathname.includes("/html/")) return filename;
    return "/html/" + filename;
  }

  const LINKS = [
    { file: "index.html", label: "Início" },
    { file: "catalogo.html", label: "Catálogo" },
    { file: "clube.html", label: "Clube Aurea" },
    { file: "sobre.html", label: "Sobre" },
    { file: "contato.html", label: "Contato" },
  ];

  const page = window.location.pathname.split("/").pop() || "index.html";

  // ── 1. Botão hamburguer ───────────────────────
  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.setAttribute("aria-label", "Abrir menu");
  hamburger.innerHTML = `<span></span><span></span><span></span>`;
  header.appendChild(hamburger);

  // ── 2. Barra de pesquisa (linha 2 do header) ──
  const searchRow = document.createElement("div");
  searchRow.className = "mobile-header-search";
  searchRow.innerHTML = `
    <div class="mobile-search-wrap">
      <svg viewBox="0 0 24 24" width="16" height="16" stroke="var(--color-muted)" fill="none" stroke-width="2">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
      <input
        type="text"
        id="mobileSearchInput"
        placeholder="Buscar vinhos, tipos..."
        autocomplete="off"
      />
    </div>`;
  header.appendChild(searchRow);

  // Sugestões no mobile (chama após o elemento existir no DOM)
  requestAnimationFrame(() => {
    if (typeof window.attachSuggestions === "function") {
      window.attachSuggestions(
        document.getElementById("mobileSearchInput"),
        searchRow, // container inteiro da barra mobile
      );
    }
  });

  // Enter na busca → vai pro catálogo
  document
    .getElementById("mobileSearchInput")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const q = e.target.value.trim();
        const dest = href("catalogo.html");
        window.location.href = q ? `${dest}?q=${encodeURIComponent(q)}` : dest;
      }
    });

  // ── 3. Drawer de navegação ────────────────────
  const overlay = document.createElement("div");
  overlay.className = "mobile-nav-overlay";
  overlay.setAttribute("aria-hidden", "true");
  overlay.setAttribute("inert", "");
  overlay.innerHTML = `
    <div class="mobile-nav-drawer">
      <div class="mobile-nav-top">
        <span class="mobile-nav-logo">Aurea Wines</span>
        <button class="mobile-nav-close" aria-label="Fechar menu">
          <svg viewBox="0 0 24 24" width="22" height="22" stroke="currentColor" fill="none" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      <nav class="mobile-nav-links">
        ${LINKS.map(
          (l) => `
          <a href="${href(l.file)}" class="${page === l.file ? "active" : ""}">${l.label}</a>
        `,
        ).join("")}
      </nav>

      <div class="mobile-nav-footer">
        <a href="https://wa.me/5511999031504?text=Olá!%20Gostaria%20de%20conversar%20sobre%20os%20produtos%20da%20Aurea%20Wines."
           target="_blank" class="mobile-nav-wa">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          Fale conosco pelo WhatsApp
        </a>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  // ── Toggle ────────────────────────────────────
  function openMenu() {
    overlay.classList.add("active");
    overlay.setAttribute("aria-hidden", "false");
    overlay.removeAttribute("inert");
    hamburger.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeMenu() {
    overlay.classList.remove("active");
    overlay.setAttribute("aria-hidden", "true");
    overlay.setAttribute('inert', '');
    hamburger.classList.remove("open");
    document.body.style.overflow = "";
  }

  hamburger.addEventListener("click", openMenu);
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeMenu();
  });
  overlay
    .querySelector(".mobile-nav-close")
    .addEventListener("click", closeMenu);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("active")) closeMenu();
  });
})();
