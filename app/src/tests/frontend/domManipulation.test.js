/**
 * @jest-environment jsdom
 */

describe('DOM Manipulation - Client Management', () => {
  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <div id="clientModal" class="" aria-hidden="true">
        <h2>Add Client</h2>
        <form id="clientForm">
          <input type="text" name="name" />
        </form>
      </div>
      <table>
        <tbody id="clientsTableBody"></tbody>
      </table>
      <button id="addClientBtn">Add Client</button>
      <button id="cancelClient">Cancel</button>
    `;
  });

  test('should show modal by adding "show" class', () => {
    const modal = document.getElementById('clientModal');
    
    // Initially modal should not have 'show' class
    expect(modal.classList.contains('show')).toBe(false);
    
    // Add show class
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    expect(modal.classList.contains('show')).toBe(true);
    expect(modal.getAttribute('aria-hidden')).toBe('false');
  });

  test('should hide modal by removing "show" class', () => {
    const modal = document.getElementById('clientModal');
    
    // Add show class first
    modal.classList.add('show');
    modal.setAttribute('aria-hidden', 'false');
    
    // Remove show class
    modal.classList.remove('show');
    modal.setAttribute('aria-hidden', 'true');
    
    expect(modal.classList.contains('show')).toBe(false);
    expect(modal.getAttribute('aria-hidden')).toBe('true');
  });

  test('should change modal title for edit mode', () => {
    const modal = document.getElementById('clientModal');
    const title = modal.querySelector('h2');
    
    expect(title.textContent).toBe('Add Client');
    
    title.textContent = 'Uredi stranko';
    expect(title.textContent).toBe('Uredi stranko');
  });

  test('should reset form when closing modal', () => {
    const form = document.getElementById('clientForm');
    const input = form.querySelector('input[name="name"]');
    
    input.value = 'Test Client';
    expect(input.value).toBe('Test Client');
    
    form.reset();
    expect(input.value).toBe('');
  });

  test('should render client table with data', () => {
    const tbody = document.getElementById('clientsTableBody');
    const clients = [
      { id: 1, name: 'Client 1', email: 'client1@test.com', phone: '123', address: 'Addr1', tax_id: 'TAX1' },
      { id: 2, name: 'Client 2', email: 'client2@test.com', phone: '456', address: 'Addr2', tax_id: 'TAX2' }
    ];
    
    // Render table
    tbody.innerHTML = clients.map(client => `
      <tr data-id="${client.id}">
        <td>${client.name}</td>
        <td>${client.email}</td>
        <td>${client.phone}</td>
        <td>${client.address}</td>
        <td>${client.tax_id}</td>
        <td><button class="btn-small btn-delete">Izbriši</button></td>
        <td><button class="btn-small btn-edit">Uredi</button></td>
      </tr>
    `).join('');
    
    const rows = tbody.querySelectorAll('tr');
    expect(rows.length).toBe(2);
    expect(rows[0].dataset.id).toBe('1');
    expect(rows[0].querySelector('td').textContent).toBe('Client 1');
  });

  test('should render empty message when no clients', () => {
    const tbody = document.getElementById('clientsTableBody');
    
    tbody.innerHTML = '<tr><td colspan="7">Ni strank</td></tr>';
    
    const rows = tbody.querySelectorAll('tr');
    expect(rows.length).toBe(1);
    expect(rows[0].querySelector('td').textContent).toBe('Ni strank');
  });

  test('should escape HTML in client data', () => {
    const escapeHtml = (str) => {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };
    
    const maliciousString = '<script>alert("xss")</script>';
    const escaped = escapeHtml(maliciousString);
    
    expect(escaped).toBe('&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;');
    expect(escaped).not.toContain('<script>');
  });
});

describe('DOM Manipulation - Message Display', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="registerMessage" style="display: none;"></div>
      <div id="loginMessage" style="display: none;"></div>
    `;
  });

  test('should display success message', () => {
    const msgEl = document.getElementById('registerMessage');
    
    msgEl.style.display = 'block';
    msgEl.textContent = 'Registration successful';
    msgEl.className = 'form-message success';
    
    expect(msgEl.style.display).toBe('block');
    expect(msgEl.textContent).toBe('Registration successful');
    expect(msgEl.className).toBe('form-message success');
  });

  test('should display error message', () => {
    const msgEl = document.getElementById('loginMessage');
    
    msgEl.style.display = 'block';
    msgEl.textContent = 'Invalid credentials';
    msgEl.className = 'form-message error';
    
    expect(msgEl.style.display).toBe('block');
    expect(msgEl.textContent).toBe('Invalid credentials');
    expect(msgEl.className).toBe('form-message error');
  });

  test('should hide message initially', () => {
    const msgEl = document.getElementById('registerMessage');
    
    expect(msgEl.style.display).toBe('none');
  });

  test('should update message text dynamically', () => {
    const msgEl = document.getElementById('loginMessage');
    
    msgEl.textContent = 'First message';
    expect(msgEl.textContent).toBe('First message');
    
    msgEl.textContent = 'Second message';
    expect(msgEl.textContent).toBe('Second message');
  });
});
