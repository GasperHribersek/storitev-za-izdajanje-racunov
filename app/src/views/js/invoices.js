// Logout function
async function logout() {
  try {
    await fetch('/api/users/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  }
  window.location.href = '/login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication first
  try {
    const authCheck = await fetch('/api/invoices');
    if (authCheck.status === 401) {
      window.location.href = '/login.html';
      return;
    }
  } catch (err) {
    window.location.href = '/login.html';
    return;
  }

  const tbody = document.getElementById('invoicesTableBody');
  const addBtn = document.getElementById('addInvoiceBtn');
  const statusFilter = document.getElementById('statusFilter');
  const serviceSelect = document.getElementById('serviceSelect');
  const addServiceBtn = document.getElementById('addServiceBtn');
  const productSelect = document.getElementById('productSelect');
  const addProductBtn = document.getElementById('addProductBtn');
  const clientSelect = document.getElementById('clientSelect');
  const clientNameInput = document.getElementById('clientNameInput');
  const itemsListContainer = document.getElementById('itemsListContainer');
  const itemsListBody = document.getElementById('itemsListBody');
  const itemsTotal = document.getElementById('itemsTotal');

  let allInvoices = []; // Store all invoices for filtering
  let allServices = []; // Store all services for selection
  let allProducts = []; // Store all products for selection
  let allClients = []; // Store all clients for selection
  let invoiceItems = []; // Store items added to current invoice

  addBtn.addEventListener('click', () => {
    openModal();
    setEditMode(null);
  });

  // Render table based on filter
  function renderTable(invoices) {
    if (!Array.isArray(invoices) || invoices.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9">Ni računov</td></tr>';
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
          <td>
            <button class="btn-small btn-pdf">PDF</button>
            <button class="btn-small btn-csv">CSV</button>
          </td>
          <td><button class="btn-small btn-delete">Izbriši</button></td>
          <td><button class="btn-small btn-edit">Uredi</button></td>
        </tr>
      `;
    }).join('');
  }

  // Apply filter
  function applyFilter() {
    const selectedStatus = statusFilter.value;
    if (selectedStatus === '') {
      renderTable(allInvoices);
    } else {
      const filtered = allInvoices.filter(inv => inv.status === selectedStatus);
      renderTable(filtered);
    }
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
      allInvoices = invoices; // Store all invoices
      statusFilter.value = ''; // Reset filter to "all"
      applyFilter(); // Render all invoices
    } catch (err) {
      console.error(err);
      tbody.innerHTML = '<tr><td colspan="8">Napaka pri nalaganju</td></tr>';
    }
  }

  // Fetch services and populate dropdown
  async function loadServices() {
    try {
      const res = await fetch('/api/services');
      if (!res.ok) {
        console.warn('Could not load services');
        return;
      }
      const services = await res.json();
      allServices = services;
      serviceSelect.innerHTML = '<option value="">-- Izberite storitev --</option>';
      services.forEach(svc => {
        const opt = document.createElement('option');
        opt.value = svc.id;
        opt.textContent = `${svc.name} (${parseFloat(svc.amount).toFixed(2)} €)`;
        serviceSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading services:', err);
    }
  }

  // Fetch products and populate dropdown
  async function loadProducts() {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) {
        console.warn('Could not load products');
        return;
      }
      const products = await res.json();
      allProducts = products;
      productSelect.innerHTML = '<option value="">-- Izberite proizvod --</option>';
      products.forEach(prod => {
        const opt = document.createElement('option');
        opt.value = prod.id;
        opt.textContent = `${prod.name} (${parseFloat(prod.price).toFixed(2)} €)`;
        productSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading products:', err);
    }
  }

  // Fetch clients and populate dropdown
  async function loadClients() {
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        console.warn('Could not load clients');
        return;
      }
      const clients = await res.json();
      allClients = clients;
      clientSelect.innerHTML = '<option value="">-- Izberite stranko ali vnesite ime --</option>';
      clients.forEach(client => {
        const opt = document.createElement('option');
        opt.value = client.id;
        opt.textContent = client.name;
        opt.dataset.name = client.name;
        clientSelect.appendChild(opt);
      });
    } catch (err) {
      console.error('Error loading clients:', err);
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
  loadServices();
  loadProducts();
  loadClients();
  
  // Client select change handler
  clientSelect.addEventListener('change', () => {
    const selectedOption = clientSelect.options[clientSelect.selectedIndex];
    if (selectedOption.value) {
      clientNameInput.value = selectedOption.dataset.name || selectedOption.textContent;
    }
  });
  
  // Filter change listener
  statusFilter.addEventListener('change', applyFilter);
  
  // Modal handling
  const modal = document.getElementById('invoiceModal');
  const invoiceForm = document.getElementById('invoiceForm');
  const cancelBtn = document.getElementById('cancelInvoice');

  let editingId = null;

  // set default date to today when opening modal for create
  function setDefaultDate() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth()+1).padStart(2,'0');
    const d = String(today.getDate()).padStart(2,'0');
    const iso = `${y}-${m}-${d}`;
    invoiceForm.elements['date'].value = iso;
  }

  // Fetch and set next invoice number
  async function setNextInvoiceNumber() {
    try {
      console.log('Fetching next invoice number...');
      const res = await fetch('/api/invoices/next-number');
      if (res.ok) {
        const data = await res.json();
        console.log('Got next invoice number:', data.nextNumber);
        invoiceForm.elements['invoice_number'].value = data.nextNumber;
      } else {
        console.error('Error response from next-number endpoint:', res.status);
      }
    } catch (err) {
      console.error('Error fetching next invoice number:', err);
    }
  }

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
    // if creating a new invoice, prefill date with today and get next invoice number
    if (!editingId) {
      setDefaultDate();
      setNextInvoiceNumber();
    }
  }
  function closeModal(){
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden','true');
    invoiceForm.reset();
    setEditMode(null);
    invoiceItems = []; // Clear items list
    renderInvoiceItems();
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

  // Add item to invoice
  function addItemToInvoice(name, price) {
    invoiceItems.push({ name, price: parseFloat(price) });
    renderInvoiceItems();
    updateInvoiceTotals();
  }

  // Render items list
  function renderInvoiceItems() {
    if (invoiceItems.length === 0) {
      itemsListContainer.style.display = 'none';
      return;
    }
    
    itemsListContainer.style.display = 'block';
    itemsListBody.innerHTML = invoiceItems.map((item, index) => `
      <tr>
        <td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(item.name)}</td>
        <td style="padding:8px;text-align:right;border:1px solid #e5e7eb;">${item.price.toFixed(2)}</td>
        <td style="padding:8px;text-align:center;border:1px solid #e5e7eb;">
          <button type="button" class="btn-small btn-delete" data-index="${index}">×</button>
        </td>
      </tr>
    `).join('');
    
    // Add event listeners for delete buttons
    itemsListBody.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const index = parseInt(e.target.dataset.index);
        invoiceItems.splice(index, 1);
        renderInvoiceItems();
        updateInvoiceTotals();
      });
    });
  }

  // Update totals and description
  function updateInvoiceTotals() {
    const total = invoiceItems.reduce((sum, item) => sum + item.price, 0);
    itemsTotal.textContent = total.toFixed(2) + ' €';
    invoiceForm.elements['amount'].value = total.toFixed(2);
    
    // Build description from all item names
    const description = invoiceItems.map(item => item.name).join(', ');
    invoiceForm.elements['description'].value = description;
  }

  // Add service to invoice
  addServiceBtn.addEventListener('click', () => {
    const serviceId = serviceSelect.value;
    if (!serviceId) {
      alert('Izberite storitev');
      return;
    }
    const service = allServices.find(s => s.id == serviceId);
    if (service) {
      addItemToInvoice(service.name, service.amount);
      serviceSelect.value = '';
    }
  });

  // Add product to invoice
  addProductBtn.addEventListener('click', () => {
    const productId = productSelect.value;
    if (!productId) {
      alert('Izberite proizvod');
      return;
    }
    const product = allProducts.find(p => p.id == productId);
    if (product) {
      addItemToInvoice(product.name, product.price);
      productSelect.value = '';
    }
  });

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

    const pdfBtn = e.target.closest('.btn-pdf');
    if (pdfBtn) {
      const id = pdfBtn.closest('tr').dataset.id;
      if (!id) { alert('Ni id-ja računa'); return; }
      window.open(`/api/invoices/${id}/pdf`, '_blank');
      return;
    }

    const csvBtn = e.target.closest('.btn-csv');
    if (csvBtn) {
      const id = csvBtn.closest('tr').dataset.id;
      if (!id) { alert('Ni id-ja računa'); return; }
      window.open(`/api/invoices/${id}/csv`, '_blank');
      return;
    }

    const editBtn = e.target.closest('.btn-edit');
    if (editBtn) {
      const tr = editBtn.closest('tr');
      const id = tr.dataset.id;
      if (!id) { alert('Ni id-ja računa'); return; }
      const cells = tr.querySelectorAll('td');
      const status = cells[0].textContent.trim();
      const number = cells[1].textContent.trim();
      const client = cells[2].textContent.trim();
      const amount = cells[3].textContent.trim();
      const date = cells[4].textContent.trim();
      const due = cells[5].textContent.trim();

      invoiceForm.elements['invoice_number'].value = number;
      invoiceForm.elements['date'].value = toInputDate(date);
      invoiceForm.elements['amount'].value = amount;
      invoiceForm.elements['client'].value = client;
      invoiceForm.elements['status'].value = status;
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
      description: fd.get('description') || null,
      status: fd.get('status') || 'draft'
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
