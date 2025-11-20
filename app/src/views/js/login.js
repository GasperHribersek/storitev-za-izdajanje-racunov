const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ email, password })
  });

  const data = await res.json();
  const msgEl = document.getElementById('loginMessage');
  if (!msgEl) {
    // fallback: if message container not present, use alert
    alert(data.message);
  } else {
    msgEl.style.display = 'block';
    msgEl.textContent = data.message || (res.ok ? 'Success' : 'Error');
    msgEl.className = 'form-message ' + (res.ok ? 'success' : 'error');
  }

  if (res.ok) {
    // short delay so user can read the message then redirect
    setTimeout(() => { window.location.href = '/dashboard.html'; }, 700);
  }
});
