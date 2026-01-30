// ================================
// SACOLA GLOBAL (INDEX + CATÁLOGO)
// ================================

// === ELEMENTOS ===
const cartBtn = document.querySelector('.icon-btn[aria-label="Sacola"]');
const cart = document.getElementById('cart');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

// === ESTADO GLOBAL ===
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];

// === FUNÇÕES ===
function saveCart() {
  localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function openCart() {
  if (!cart || !cartOverlay) return;
  cart.classList.add('active');
  cartOverlay.classList.add('active');
}

function closeCartFn() {
  if (!cart || !cartOverlay) return;
  cart.classList.remove('active');
  cartOverlay.classList.remove('active');
}

function renderCart() {
  if (!cartItemsContainer || !cartTotal) return;

  cartItemsContainer.innerHTML = "";
  let total = 0;

  cartItems.forEach((item, index) => {
    total += item.price;

    const div = document.createElement('div');
    div.classList.add('cart-item');

    div.innerHTML = `
      <span>${item.name}</span>
      <span>R$ ${item.price.toFixed(2)}</span>
      <button data-index="${index}">✕</button>
    `;

    div.querySelector('button').addEventListener('click', () => {
      cartItems.splice(index, 1);
      saveCart();
      renderCart();
    });

    cartItemsContainer.appendChild(div);
  });

  cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// === EVENTOS ===
if (cartBtn) cartBtn.addEventListener('click', openCart);
if (closeCart) closeCart.addEventListener('click', closeCartFn);
if (cartOverlay) cartOverlay.addEventListener('click', closeCartFn);

// === ADICIONAR PRODUTO (FUNCIONA EM QUALQUER PÁGINA) ===
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".add-to-cart");
  if (!btn) return;

  const name = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);

  if (!name || isNaN(price)) {
    console.error("Produto sem data-name ou data-price", btn);
    return;
  }

  cartItems.push({ name, price });
  saveCart();
  renderCart();
  openCart();
});

// === CARREGA SACOLA AO ABRIR A PÁGINA ===
renderCart();
