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
  alert(data.message);

  if (res.ok) {
    window.location.href = '/login.html';
  }
});
