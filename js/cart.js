// === ELEMENTOS ===
const cartBtn = document.querySelector('.icon-btn[aria-label="Sacola"]');
const cart = document.getElementById('cart');
const cartOverlay = document.getElementById('cartOverlay');
const closeCart = document.getElementById('closeCart');
const cartItemsContainer = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

const addButtons = document.querySelectorAll('.add-to-cart');

// === ESTADO DA SACOLA ===
let cartItems = [];

// === FUNÇÕES ===
function openCart() {
  cart.classList.add('active');
  cartOverlay.classList.add('active');
}

function closeCartFn() {
  cart.classList.remove('active');
  cartOverlay.classList.remove('active');
}

function renderCart() {
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
      renderCart();
    });

    cartItemsContainer.appendChild(div);
  });

  cartTotal.textContent = `R$ ${total.toFixed(2)}`;
}

// === EVENTOS ===
cartBtn.addEventListener('click', openCart);
closeCart.addEventListener('click', closeCartFn);
cartOverlay.addEventListener('click', closeCartFn);

addButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const name = btn.dataset.name;
    const price = parseFloat(btn.dataset.price);

    cartItems.push({ name, price });
    renderCart();
    openCart();
  });
});
