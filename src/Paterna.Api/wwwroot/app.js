const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authStatus = document.getElementById('authStatus');

const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');

const currencySelect = document.getElementById('currency');
const cartBtn = document.getElementById('cartBtn');
const cartEl = document.getElementById('cart');
const cartCount = document.getElementById('cartCount');
const cartItemsEl = document.getElementById('cartItems');
const cartTotalEl = document.getElementById('cartTotal');
const closeCart = document.getElementById('closeCart');
const checkoutBtn = document.getElementById('checkout');

showLogin.onclick = () => {
  showLogin.classList.add('active');
  showSignup.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
};

showSignup.onclick = () => {
  showSignup.classList.add('active');
  showLogin.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
};

async function send(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error('Authentication failed');
  return res.json();
}

signupForm.onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(signupForm);

  try {
    const result = await send('/api/auth/signup', {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password')
    });

    authStatus.textContent = `Welcome ${result.name}! Account created.`;
  } catch {
    authStatus.textContent = 'Signup failed. Try another email.';
  }
};

loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(loginForm);

  try {
    const result = await send('/api/auth/login', {
      email: form.get('email'),
      password: form.get('password')
    });

    authStatus.textContent = `Welcome back ${result.name}!`;
  } catch {
    authStatus.textContent = 'Login failed. Check your credentials.';
  }
};

// --- Cart & Products ---
const RATES = { USD: 1, EUR: 0.92, GBP: 0.79 };
let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  cartCount.textContent = cart.reduce((s, i) => s + i.qty, 0);
}

function formatPrice(value, currency = 'USD') {
  const amount = Number(value) * (RATES[currency] || 1);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

function renderProducts() {
  const container = document.getElementById('products');
  container.innerHTML = products.map(p => `
    <article class="product">
      <div class="thumb">${p.name.charAt(0)}</div>
      <div>
        <div class="meta"><h3>${p.name}</h3><div class="price">${formatPrice(p.price, currencySelect.value)}</div></div>
        <p class="details">${p.description}</p>
      </div>
      <div class="actions">
        <button class="add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>
  `).join('');

  // Attach add handlers
  document.querySelectorAll('.add').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const prod = products.find(x => String(x.id) === String(id));
      if (!prod) return;
      const existing = cart.find(i => String(i.id) === String(id));
      if (existing) existing.qty += 1; else cart.push({ id: prod.id, name: prod.name, price: prod.price, qty: 1 });
      saveCart();
      renderCart();
    };
  });
}

function renderCart() {
  cartItemsEl.innerHTML = '';
  cart.forEach(item => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div>
        <div style="font-weight:600">${item.name}</div>
        <div style="font-size:.9rem;color:#6b7280">${formatPrice(item.price, currencySelect.value)} × ${item.qty}</div>
      </div>
      <div>
        <div style="text-align:right">${formatPrice(item.price * item.qty, currencySelect.value)}</div>
        <div style="display:flex;gap:.3rem;margin-top:.4rem"><button data-op="dec" data-id="${item.id}">-</button><button data-op="inc" data-id="${item.id}">+</button></div>
      </div>
    `;
    cartItemsEl.appendChild(div);
  });

  cartTotalEl.textContent = formatPrice(cart.reduce((s,i)=>s + i.price * i.qty, 0), currencySelect.value);

  // buttons
  cartItemsEl.querySelectorAll('button').forEach(b => {
    b.onclick = () => {
      const id = b.getAttribute('data-id');
      const op = b.getAttribute('data-op');
      const it = cart.find(i => String(i.id) === String(id));
      if (!it) return;
      if (op === 'inc') it.qty += 1; else it.qty -= 1;
      if (it.qty <= 0) cart = cart.filter(x => String(x.id) !== String(id));
      saveCart(); renderCart();
    };
  });
}

async function loadProducts() {
  const res = await fetch('/api/products');
  products = await res.json();
  renderProducts();
  saveCart();
  renderCart();
}

currencySelect.onchange = () => { renderProducts(); renderCart(); };
cartBtn.onclick = () => cartEl.classList.toggle('hidden');
closeCart.onclick = () => cartEl.classList.add('hidden');
checkoutBtn.onclick = () => alert('Checkout not implemented in demo.');

loadProducts();
