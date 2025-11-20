document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const authCheck = await fetch('/api/clients');
    if (authCheck.status === 401) {
      window.location.href = '/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  const tbody = document.getElementById('clientsTableBody');
  const addBtn = document.getElementById('addClientBtn');
  const modal = document.getElementById('clientModal');
  const clientForm = document.getElementById('clientForm');
  const cancelBtn = document.getElementById('cancelClient');

  let editingId = null;

  addBtn.addEventListener('click', () => {
    openModal();
    setEditMode(null);
  });

  function setEditMode(id) {
    editingId = id;
    const title = modal.querySelector('h2');
    const submitBtn = clientForm.querySelector('button[type="submit"]');
    if (id) {
      title.textContent = 'Uredi stranko';
      submitBtn.textContent = 'Posodobi';
    } else {
      title.textContent = 'Dodaj stranko';
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
    clientForm.reset();
    setEditMode(null);
  }

  cancelBtn.addEventListener('click', closeModal);

  async function loadClients() {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="7">Ne morem naložiti strank</td></tr>';
        return;
      }
      const clients = await res.json();
      renderTable(clients);
    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="7">Napaka pri nalaganju</td></tr>';
    }
  }

  function renderTable(clients) {
    if (!clients || clients.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7">Ni strank</td></tr>';
      return;
    }

    tbody.innerHTML = clients.map(client => `
      <tr data-id="${client.id}">
        <td>${escapeHtml(client.name)}</td>
        <td>${escapeHtml(client.email || '')}</td>
        <td>${escapeHtml(client.phone || '')}</td>
        <td>${escapeHtml(client.address || '')}</td>
        <td>${escapeHtml(client.tax_id || '')}</td>
        <td><button class="btn-small btn-delete">Izbriši</button></td>
        <td><button class="btn-small btn-edit">Uredi</button></td>
      </tr>
    `).join('');
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

  tbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
      const id = delBtn.closest('tr').dataset.id;
      if (!confirm('Izbriši to stranko?')) return;
      fetch(`/api/clients/${id}`, { method: 'DELETE' })
        .then(r => { if (r.ok) loadClients(); else alert('Delete failed'); })
        .catch(() => alert('Delete failed'));
      return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      const id = tr.dataset.id;
      const cells = tr.querySelectorAll('td');
      
      clientForm.elements['name'].value = cells[0].textContent.trim();
      clientForm.elements['email'].value = cells[1].textContent.trim();
      clientForm.elements['phone'].value = cells[2].textContent.trim();
      clientForm.elements['address'].value = cells[3].textContent.trim();
      clientForm.elements['tax_id'].value = cells[4].textContent.trim();
      
      setEditMode(id);
      openModal();
      return;
    }
  });

  clientForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(clientForm);
    const payload = {
      name: fd.get('name'),
      email: fd.get('email') || null,
      phone: fd.get('phone') || null,
      address: fd.get('address') || null,
      tax_id: fd.get('tax_id') || null
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/clients/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/clients', {
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
      loadClients();
    } catch (err) {
      console.error(err);
      alert('Napaka pri shranjevanju');
    }
  });

  loadClients();
});
