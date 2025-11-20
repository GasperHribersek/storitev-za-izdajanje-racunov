document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const authCheck = await fetch('/api/products');
    if (authCheck.status === 401) {
      window.location.href = '/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  const tbody = document.getElementById('productsTableBody');
  const addBtn = document.getElementById('addProductBtn');
  const modal = document.getElementById('productModal');
  const productForm = document.getElementById('productForm');
  const cancelBtn = document.getElementById('cancelProduct');

  let allProducts = [];
  let editingId = null;

  addBtn.addEventListener('click', () => {
    openModal();
    setEditMode(null);
  });

  function renderTable(products) {
    if (!Array.isArray(products) || products.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Ni proizvodov</td></tr>';
      return;
    }

    tbody.innerHTML = products.map(prod => {
      const name = prod.name || '';
      const description = prod.description || '';
      const price = prod.price != null ? parseFloat(prod.price).toFixed(2) : '';
      const category = prod.category || '';

      return `
        <tr data-id="${prod.id || ''}">
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(description)}</td>
          <td>${escapeHtml(price)}</td>
          <td>${escapeHtml(category)}</td>
          <td><button class="btn-small btn-delete">Izbriši</button></td>
          <td><button class="btn-small btn-edit">Uredi</button></td>
        </tr>
      `;
    }).join('');
  }

  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="6">Ne morem naložiti proizvodov</td></tr>';
        return;
      }

      const products = await res.json();
      allProducts = products;
      renderTable(products);
    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="6">Napaka pri nalaganju</td></tr>';
    }
  }

  function escapeHtml(str) {
    if (str == null) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function setEditMode(id) {
    editingId = id;
    const title = document.querySelector('.modal-card h2');
    const submitBtn = productForm.querySelector('button[type="submit"]');
    if (id) {
      title.textContent = 'Uredi proizvod';
      submitBtn.textContent = 'Posodobi';
    } else {
      title.textContent = 'Dodaj proizvod';
      submitBtn.textContent = 'Shrani';
    }
  }

  function openModal() {
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    productForm.reset();
    setEditMode(null);
  }

  cancelBtn.addEventListener('click', closeModal);

  tbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
      const id = delBtn.closest('tr').dataset.id;
      if (!id) { alert('Ni id-ja proizvoda'); return; }
      if (!confirm('Izbriši ta proizvod?')) return;
      fetch(`/api/products/${id}`, { method: 'DELETE' })
        .then(r => { if (r.ok) loadProducts(); else alert('Delete failed'); })
        .catch(() => alert('Delete failed'));
      return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      const id = tr.dataset.id;
      if (!id) { alert('Ni id-ja proizvoda'); return; }
      const cells = tr.querySelectorAll('td');
      const name = cells[0].textContent.trim();
      const description = cells[1].textContent.trim();
      const price = cells[2].textContent.trim();
      const category = cells[3].textContent.trim();

      productForm.elements['name'].value = name;
      productForm.elements['description'].value = description;
      productForm.elements['price'].value = price;
      productForm.elements['category'].value = category;
      setEditMode(id);
      openModal();
      return;
    }
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(productForm);
    const payload = {
      name: fd.get('name'),
      description: fd.get('description') || null,
      price: parseFloat(fd.get('price')),
      category: fd.get('category') || null
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/products/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Napaka' }));
        alert('Napaka pri shranjevanju: ' + (err.message || res.status));
        return;
      }
      closeModal();
      loadProducts();
    } catch (err) {
      console.error(err);
      alert('Napaka pri shranjevanju');
    }
  });

  loadProducts();

  function logout(event) {
    event.preventDefault();
    fetch('/api/users/logout', { method: 'POST' })
      .then(() => {
        window.location.href = 'login.html';
      });
  }

  window.logout = logout;
});
