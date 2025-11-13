document.addEventListener('DOMContentLoaded', () => {
  const tbody = document.getElementById('invoicesTableBody');
  const addBtn = document.getElementById('addInvoiceBtn');

  addBtn.addEventListener('click', () => {
    openModal();
    setEditMode(null);
  });

  // set default date to today when opening modal for create
  function setDefaultDate() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth()+1).padStart(2,'0');
    const d = String(today.getDate()).padStart(2,'0');
    const iso = `${y}-${m}-${d}`;
    invoiceForm.elements['date'].value = iso;
  }

  // Fetch invoices from API and populate table
  async function loadInvoices() {
    try {
      const res = await fetch('/api/invoices');
      if (!res.ok) {
        tbody.innerHTML = '<tr><td colspan="8">Ne morem naložiti računov</td></tr>';
        return;
      }

      const invoices = await res.json();
      if (!Array.isArray(invoices) || invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">Ni računov</td></tr>';
        return;
      }

      tbody.innerHTML = invoices.map(inv => {
        // Map fields where available. Some fields may be missing depending on backend schema.
        const status = inv.status || '';
        const number = inv.invoice_number || inv.id || '';
        const client = inv.client_name || inv.client || inv.description || '';
        const amount = inv.amount != null ? inv.amount : '';
        const date = inv.date ? formatDate(inv.date) : '';
        const due = inv.due_date ? formatDate(inv.due_date) : '';

        return `
          <tr data-id="${inv.id || ''}">
            <td>${escapeHtml(status)}</td>
            <td>${escapeHtml(number)}</td>
            <td>${escapeHtml(client)}</td>
            <td>${escapeHtml(amount)}</td>
            <td>${escapeHtml(date)}</td>
            <td>${escapeHtml(due)}</td>
            <td><button class="btn-small btn-delete">Izbriši</button></td>
            <td><button class="btn-small btn-edit">Uredi</button></td>
          </tr>
        `;
      }).join('');

      // use event delegation on tbody to handle edit/delete (attached once below)

    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="8">Napaka pri nalaganju</td></tr>';
    }
  }

  function formatDate(d) {
    const dt = new Date(d);
    if (isNaN(dt)) return '';
    return dt.toLocaleDateString();
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

  loadInvoices();
  
  // Modal handling
  const modal = document.getElementById('invoiceModal');
  const invoiceForm = document.getElementById('invoiceForm');
  const cancelBtn = document.getElementById('cancelInvoice');

  let editingId = null;

  function setEditMode(id) {
    editingId = id;
    const title = document.querySelector('.modal-card h2');
    const submitBtn = invoiceForm.querySelector('button[type="submit"]');
    if (id) {
      title.textContent = 'Uredi račun';
      submitBtn.textContent = 'Posodobi';
    } else {
      title.textContent = 'Dodaj račun';
      submitBtn.textContent = 'Shrani';
    }
  }

  function openModal(){
    modal.classList.add('show');
    modal.setAttribute('aria-hidden','false');
    // if creating a new invoice, prefill date with today
    if (!editingId) setDefaultDate();
  }
  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    invoiceForm.reset();
    setEditMode(null);
  }

  function toInputDate(displayDate) {
    if (!displayDate) return '';
    const d = new Date(displayDate);
    if (isNaN(d)) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${dd}`;
  }

  cancelBtn.addEventListener('click', closeModal);

  // Event delegation on table body to ensure buttons work after re-render
  tbody.addEventListener('click', (e) => {
    const delBtn = e.target.closest('.btn-delete');
    if (delBtn) {
      const id = delBtn.closest('tr').dataset.id;
      if (!id) { alert('Ni id-ja računa'); return; }
      if (!confirm('Izbriši ta račun?')) return;
      fetch(`/api/invoices/${id}`, { method: 'DELETE' })
        .then(r => { if (r.ok) loadInvoices(); else alert('Delete failed'); })
        .catch(() => alert('Delete failed'));
      return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      const id = tr.dataset.id;
      if (!id) { alert('Ni id-ja računa'); return; }
      const cells = tr.querySelectorAll('td');
      const number = cells[1].textContent.trim();
      const client = cells[2].textContent.trim();
      const amount = cells[3].textContent.trim();
      const date = cells[4].textContent.trim();
      const due = cells[5].textContent.trim();

      invoiceForm.elements['invoice_number'].value = number;
      invoiceForm.elements['date'].value = toInputDate(date);
      invoiceForm.elements['amount'].value = amount;
      invoiceForm.elements['client'].value = client;
      invoiceForm.elements['description'].value = '';
      invoiceForm.elements['due_date'].value = toInputDate(due);
      setEditMode(id);
      openModal();
      return;
    }
  });

  invoiceForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(invoiceForm);
    const payload = {
      invoice_number: fd.get('invoice_number'),
      date: fd.get('date'),
      due_date: fd.get('due_date') || null,
      client_name: fd.get('client') || null,
      amount: parseFloat(fd.get('amount')),
      description: fd.get('description') || null
    };

    try {
      let res;
      if (editingId) {
        res = await fetch(`/api/invoices/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/invoices', {
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
      loadInvoices();
    } catch (err) {
      console.error(err);
      alert('Napaka pri shranjevanju');
    }
  });
});
