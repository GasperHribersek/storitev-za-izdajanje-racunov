document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const authCheck = await fetch('/api/services');
    if (authCheck.status === 401) {
      window.location.href = '/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  const tbody = document.getElementById('servicesTableBody');
  const addBtn = document.getElementById('addServiceBtn');

  let allServices = []; // Store all services
  let editingId = null;

  addBtn.addEventListener('click', () => {
    openModal();
    setEditMode(null);
  });

  // Render table based on services array
  function renderTable(services) {
    if (!Array.isArray(services) || services.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6">Nimate shranjenih storitev</td></tr>';
      return;
    }

    tbody.innerHTML = services.map(srv => {
      const name = srv.name || '';
      const description = srv.description || '';
      const amount = srv.amount != null ? srv.amount : '';
      const category = srv.category || '';

      return `
        <tr data-id="${srv.id || ''}">
          <td>${escapeHtml(name)}</td>
          <td>${escapeHtml(description)}</td>
          <td>${escapeHtml(amount)}</td>
          <td>${escapeHtml(category)}</td>
          <td><button class="btn-small btn-delete">Izbriši</button></td>
          <td><button class="btn-small btn-edit">Uredi</button></td>
        </tr>
      `;
    }).join('');
  }

  // Fetch services from API and populate table
  async function loadServices() {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="6">Ne morem naložiti storitev</td></tr>';
        return;
      }

      const services = await res.json();
      allServices = services;
      renderTable(allServices);
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

  loadServices();

  // Modal handling
  const modal = document.getElementById('serviceModal');
  const serviceForm = document.getElementById('serviceForm');
  const cancelBtn = document.getElementById('cancelService');

  function setEditMode(id) {
    editingId = id;
    const title = document.querySelector('.modal-card h2');
    const submitBtn = serviceForm.querySelector('button[type="submit"]');
    if (id) {
      title.textContent = 'Uredi storitev';
      submitBtn.textContent = 'Posodobi';
    } else {
      title.textContent = 'Dodaj storitev';
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
    serviceForm.reset();
    setEditMode(null);
  }

  cancelBtn.addEventListener('click', closeModal);

  // Event delegation on table body for edit/delete buttons
  tbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
      const id = delBtn.closest('tr').dataset.id;
      if (!id) { alert('Ni id-ja storitve'); return; }
      if (!confirm('Izbriši to storitev?')) return;
      fetch(`/api/services/${id}`, { method: 'DELETE' })
        .then(r => { if (r.ok) loadServices(); else alert('Delete failed'); })
        .catch(() => alert('Delete failed'));
      return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      const id = tr.dataset.id;
      if (!id) { alert('Ni id-ja storitve'); return; }
      const cells = tr.querySelectorAll('td');
      const name = cells[0].textContent.trim();
      const description = cells[1].textContent.trim();
      const amount = cells[2].textContent.trim();
      const category = cells[3].textContent.trim();

      serviceForm.elements['name'].value = name;
      serviceForm.elements['amount'].value = amount;
      serviceForm.elements['description'].value = description;
      serviceForm.elements['category'].value = category;
      setEditMode(id);
      openModal();
      return;
    }
  });

  serviceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(serviceForm);
    const payload = {
      name: fd.get('name'),
      amount: parseFloat(fd.get('amount')) || 0,
      description: fd.get('description') || null,
      category: fd.get('category') || null
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/services/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }
      if (!res.ok) {
        const err = await res.json().catch(()=>({message:'Napaka'}));
        alert('Napaka pri shranjevanju: ' + (err.message||res.status));
        return;
      }
      closeModal();
      loadServices();
    } catch (err) {
      console.error(err);
      alert('Napaka pri shranjevanju');
    }
  });
});

// Logout function
function logout(event) {
  event.preventDefault();
  // In a real app, you'd call /api/users/logout or similar
  // For now, just redirect to login
  window.location.href = 'login.html';
}
