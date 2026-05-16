(function () {

  // === ELEMENTOS ===
  const cartBtn      = document.querySelector('.icon-btn[aria-label="Sacola"]');
  const cartEl       = document.getElementById('cart');
  const cartOverlay  = document.getElementById('cartOverlay');
  const closeCartBtn = document.getElementById('closeCart');
  const cartItemsEl  = document.getElementById('cartItems');
  const cartTotalEl  = document.getElementById('cartTotal');
  const cartBadge    = document.getElementById('cartBadge');
  const checkoutBtn  = document.getElementById('checkoutBtn');

  const WHATSAPP_NUMBER = '5511999031504';

  // === ESTADO ===
  let items = JSON.parse(localStorage.getItem('aurea_cart')) || [];

  // === PERSISTÊNCIA ===
  function save() {
    localStorage.setItem('aurea_cart', JSON.stringify(items));
    updateBadge();
  }

  function updateBadge() {
    if (!cartBadge) return;
    const count = items.reduce((sum, i) => sum + i.qty, 0);
    cartBadge.textContent = count;
    cartBadge.classList.toggle('visible', count > 0);
  }

  // === ABRIR / FECHAR ===
  function openCart() {
    if (!cartEl) return;
    cartEl.classList.add('active');
    cartOverlay?.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartEl) return;
    cartEl.classList.remove('active');
    cartOverlay?.classList.remove('active');
    document.body.style.overflow = '';
  }

  // === RENDERIZAR ===
  function render() {
    if (!cartItemsEl) return;
    cartItemsEl.innerHTML = '';

    if (items.length === 0) {
      cartItemsEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" width="52" height="52" stroke="var(--color-muted)" fill="none" stroke-width="1.2">
            <path d="M6 8h12l-1.5 12h-9L6 8z"/>
            <path d="M9 8V6a3 3 0 016 0v2"/>
          </svg>
          <p>Sua sacola está vazia</p>
          <a href="catalogo.html" class="btn-outline btn-sm">Explorar catálogo</a>
        </div>`;
      if (cartTotalEl) cartTotalEl.textContent = 'R$ 0,00';
      updateBadge();
      return;
    }

    let total = 0;

    items.forEach((item, i) => {
      total += item.price * item.qty;

      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-img-wrap">
          ${item.image
            ? `<img src="${item.image}" alt="${item.name}" loading="lazy">`
            : `<div class="cart-item-placeholder">
                 <svg viewBox="0 0 24 24" width="24" height="24" stroke="var(--color-muted)" fill="none" stroke-width="1.5">
                   <path d="M6 8h12l-1.5 12h-9L6 8z"/>
                 </svg>
               </div>`}
        </div>
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">${fmtBRL(item.price)}</span>
          <div class="cart-qty">
            <button class="qty-btn" data-action="dec" data-i="${i}">−</button>
            <span class="qty-num">${item.qty}</span>
            <button class="qty-btn" data-action="inc" data-i="${i}">+</button>
          </div>
        </div>
        <button class="cart-remove" data-i="${i}" aria-label="Remover">
          <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" fill="none" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>`;

      cartItemsEl.appendChild(div);
    });

    // Quantidade
    cartItemsEl.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = +btn.dataset.i;
        if (btn.dataset.action === 'inc') {
          items[idx].qty++;
        } else {
          items[idx].qty--;
          if (items[idx].qty <= 0) items.splice(idx, 1);
        }
        save();
        render();
      });
    });

    // Remover
    cartItemsEl.querySelectorAll('.cart-remove').forEach(btn => {
      btn.addEventListener('click', () => {
        items.splice(+btn.dataset.i, 1);
        save();
        render();
      });
    });

    if (cartTotalEl) cartTotalEl.textContent = fmtBRL(total);
    updateBadge();
  }

  // === ADICIONAR AO CARRINHO ===
  window.addToCart = function ({ name, price, variantId = null, image = null }) {
    const key = variantId || name;
    const existing = items.find(i => (i.variantId || i.name) === key);

    if (existing) {
      existing.qty++;
    } else {
      items.push({ name, price, variantId, image, qty: 1 });
    }

    save();
    render();
    openCart();
  };

  // === CHECKOUT VIA WHATSAPP ===
  function checkout(e) {
    e?.preventDefault();

    if (items.length === 0) {
      openCart();
      return;
    }

    const linhas = items
      .map(i => `• ${i.name} ×${i.qty} — ${fmtBRL(i.price * i.qty)}`)
      .join('\n');

    const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

    const mensagem = [
      '*AUREA WINES — Pedido*',
      '',
      'Olá! Gostaria de fazer o seguinte pedido:',
      '',
      linhas,
      '',
      `*Total:* ${fmtBRL(total)}`,
      '',
      'Poderia me informar o frete e a disponibilidade?',
    ].join('\n');

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(mensagem)}`,
      '_blank'
    );
  }

  // === UTILS ===
  function fmtBRL(v) {
    return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  // === DELEGAÇÃO GLOBAL — botões .add-to-cart ===
  document.addEventListener('click', e => {
    const btn = e.target.closest('.add-to-cart');
    if (!btn) return;

    const name  = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);
    if (!name || isNaN(price)) return;

    addToCart({
      name,
      price,
      variantId: btn.dataset.variantId || null,
      image:     btn.dataset.image     || null,
    });

    const original = btn.textContent;
    btn.textContent = '✓ Adicionado';
    btn.classList.add('added');
    setTimeout(() => {
      btn.textContent = original;
      btn.classList.remove('added');
    }, 1600);
  });

  // === EVENTOS ===
  cartBtn?.addEventListener('click', openCart);
  closeCartBtn?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', closeCart);
  checkoutBtn?.addEventListener('click', checkout);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && cartEl?.classList.contains('active')) closeCart();
  });

  // === INICIALIZA ===
  render();
  updateBadge();

})();