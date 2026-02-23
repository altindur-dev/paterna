const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const authStatus = document.getElementById('authStatus');

const showLogin = document.getElementById('showLogin');
const showSignup = document.getElementById('showSignup');

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

async function loadProducts() {
  const res = await fetch('/api/products');
  const data = await res.json();
  const container = document.getElementById('products');

  container.innerHTML = data.map(p => `
    <article class="product">
      <h3>${p.name}</h3>
      <p>${p.description}</p>
      <p class="price">$${Number(p.price).toFixed(2)}</p>
    </article>
  `).join('');
}

loadProducts();
