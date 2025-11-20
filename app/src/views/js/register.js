const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const name = document.getElementById('name').value;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ name, email, password })
  });

  const data = await res.json();
  const msgEl = document.getElementById('registerMessage');
  if (!msgEl) {
    alert(data.message);
  } else {
    msgEl.style.display = 'block';
    msgEl.textContent = data.message || (res.ok ? 'Success' : 'Error');
    msgEl.className = 'form-message ' + (res.ok ? 'success' : 'error');
  }

  if (res.ok) {
    setTimeout(() => { window.location.href = '/login.html'; }, 700);
  }
});
