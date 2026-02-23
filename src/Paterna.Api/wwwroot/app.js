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
const searchInput = document.getElementById('search');

const RATES = { USD: 1, EUR: 0.92, GBP: 0.79 };
const FALLBACK_PRODUCTS = [
  {
    id: 'p1',
    name: 'Arc Floor Lamp',
    description: 'Soft ambient light for modern rooms.',
    price: 129,
    category: 'living',
    image: 'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p2',
    name: 'Walnut Desk',
    description: 'Premium wooden desk with clean lines.',
    price: 399,
    category: 'desk',
    image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p3',
    name: 'Ceramic Vase',
    description: 'Minimal sculptural décor piece.',
    price: 59,
    category: 'living',
    image: 'https://images.unsplash.com/photo-1616628182509-6f57f4f0f510?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p4',
    name: 'Mechanical Keyboard',
    description: 'Tactile typing for focused work.',
    price: 145,
    category: 'desk',
    image: 'https://images.unsplash.com/photo-1593642634367-d91a135587b5?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p5',
    name: 'Lounge Chair',
    description: 'Comfortable accent chair in boucle.',
    price: 279,
    category: 'living',
    image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80'
  },
  {
    id: 'p6',
    name: 'Desk Organizer',
    description: 'Keep essentials clean and sorted.',
    price: 35,
    category: 'desk',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=900&q=80'
  }
];

let products = [];
let cart = JSON.parse(localStorage.getItem('cart') || '[]');
let activeTab = 'all';

function formatPrice(value, currency = 'USD') {
  const amount = Number(value) * (RATES[currency] || 1);
  return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(amount);
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((sum, item) => sum + item.qty, 0);
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartCount();
}

function setAuthMessage(text, ok = true) {
  authStatus.textContent = text;
  authStatus.style.color = ok ? '#16a34a' : '#b91c1c';
}

function normalizeProducts(apiProducts) {
  const mapped = (Array.isArray(apiProducts) ? apiProducts : []).map((p, i) => ({
    id: p.id ?? `api-${i}`,
    name: p.name,
    description: p.description,
    price: p.price,
    category: i % 2 === 0 ? 'desk' : 'living',
    image: `https://picsum.photos/seed/${encodeURIComponent(p.name + i)}/900/600`
  }));

  return [...mapped, ...FALLBACK_PRODUCTS].slice(0, 12);
}

function renderProducts() {
  const container = document.getElementById('products');
  const q = searchInput.value.trim().toLowerCase();

  let list = products.slice();
  if (activeTab !== 'all' && activeTab !== 'featured') {
    list = list.filter((p) => p.category === activeTab);
  }
  if (activeTab === 'featured') {
    list = list.slice(0, 4);
  }
  if (q) {
    list = list.filter((p) => `${p.name} ${p.description}`.toLowerCase().includes(q));
  }

  container.innerHTML = list.map((p) => `
    <article class="product">
      <img src="${p.image}" alt="${p.name}" loading="lazy" />
      <div class="product-body">
        <div class="product-head">
          <strong>${p.name}</strong>
          <span class="price">${formatPrice(p.price, currencySelect.value)}</span>
        </div>
        <p>${p.description}</p>
        <span class="badge">${p.category === 'desk' ? 'Desk' : 'Living'}</span>
        <button class="btn btn-dark add" data-id="${p.id}">Add to cart</button>
      </div>
    </article>
  `).join('');

  container.querySelectorAll('.add').forEach((button) => {
    button.addEventListener('click', () => {
      const product = products.find((p) => String(p.id) === button.dataset.id);
      if (!product) {
        return;
      }
      const existing = cart.find((item) => String(item.id) === String(product.id));
      if (existing) {
        existing.qty += 1;
      } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
      }
      saveCart();
      renderCart();
    });
  });
}

function renderCart() {
  if (cart.length === 0) {
    cartItemsEl.innerHTML = '<p class="empty">Your cart is empty.</p>';
  } else {
    cartItemsEl.innerHTML = cart.map((item) => `
      <div class="cart-item">
        <div>
          <strong>${item.name}</strong>
          <div>${formatPrice(item.price, currencySelect.value)} × ${item.qty}</div>
        </div>
        <div>
          <div>${formatPrice(item.price * item.qty, currencySelect.value)}</div>
          <div class="cart-actions">
            <button data-op="dec" data-id="${item.id}">−</button>
            <button data-op="inc" data-id="${item.id}">+</button>
          </div>
        </div>
      </div>
    `).join('');
  }

  cartTotalEl.textContent = formatPrice(cart.reduce((sum, item) => sum + item.price * item.qty, 0), currencySelect.value);

  cartItemsEl.querySelectorAll('button').forEach((button) => {
    button.addEventListener('click', () => {
      const item = cart.find((x) => String(x.id) === button.dataset.id);
      if (!item) {
        return;
      }
      if (button.dataset.op === 'inc') {
        item.qty += 1;
      } else {
        item.qty -= 1;
      }
      if (item.qty <= 0) {
        cart = cart.filter((x) => String(x.id) !== String(item.id));
      }
      saveCart();
      renderCart();
    });
  });
}

async function sendAuth(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Authentication request failed');
  }

  return response.json();
}

showLogin.addEventListener('click', () => {
  showLogin.classList.add('active');
  showSignup.classList.remove('active');
  loginForm.classList.remove('hidden');
  signupForm.classList.add('hidden');
});

showSignup.addEventListener('click', () => {
  showSignup.classList.add('active');
  showLogin.classList.remove('active');
  signupForm.classList.remove('hidden');
  loginForm.classList.add('hidden');
});

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(signupForm);

  try {
    const result = await sendAuth('/api/auth/signup', {
      name: form.get('name'),
      email: form.get('email'),
      password: form.get('password')
    });
    setAuthMessage(`Welcome ${result.name}, your account is ready.`);
    signupForm.reset();
  } catch {
    setAuthMessage('Signup failed. Try a different email.', false);
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const form = new FormData(loginForm);

  try {
    const result = await sendAuth('/api/auth/login', {
      email: form.get('email'),
      password: form.get('password')
    });
    setAuthMessage(`Welcome back ${result.name}.`);
    loginForm.reset();
  } catch {
    setAuthMessage('Login failed. Check your credentials.', false);
  }
});

currencySelect.addEventListener('change', () => {
  renderProducts();
  renderCart();
});

searchInput.addEventListener('input', renderProducts);

document.querySelectorAll('.tab').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach((x) => x.classList.remove('active'));
    button.classList.add('active');
    activeTab = button.dataset.tab;
    renderProducts();
  });
});

cartBtn.addEventListener('click', () => cartEl.classList.toggle('hidden'));
closeCart.addEventListener('click', () => cartEl.classList.add('hidden'));
checkoutBtn.addEventListener('click', () => {
  if (cart.length === 0) {
    alert('Your cart is empty.');
    return;
  }
  alert('Checkout flow is ready for backend integration.');
});

async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const data = await response.json();
    products = normalizeProducts(data);
  } catch {
    products = FALLBACK_PRODUCTS;
  }

  saveCart();
  renderProducts();
  renderCart();
}

loadProducts();
