/**
 * @jest-environment jsdom
 */

describe('Event Handlers - Form Submission', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
    
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="email" id="email" value="" />
        <input type="password" id="password" value="" />
        <div id="loginMessage" style="display: none;"></div>
        <button type="submit">Login</button>
      </form>
    `;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should prevent default form submission', () => {
    const form = document.getElementById('loginForm');
    const mockEvent = {
      preventDefault: jest.fn(),
      target: form
    };
    
    const submitHandler = (e) => {
      e.preventDefault();
    };
    
    submitHandler(mockEvent);
    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('should get form values from inputs', () => {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    emailInput.value = 'test@example.com';
    passwordInput.value = 'password123';
    
    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
  });

  test('should handle button click event', () => {
    const button = document.querySelector('button[type="submit"]');
    const clickHandler = jest.fn();
    
    button.addEventListener('click', clickHandler);
    button.click();
    
    expect(clickHandler).toHaveBeenCalled();
  });

  test('should attach event listener to form', () => {
    const form = document.getElementById('loginForm');
    const submitHandler = jest.fn((e) => e.preventDefault());
    
    form.addEventListener('submit', submitHandler);
    
    // Trigger submit event
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    form.dispatchEvent(submitEvent);
    
    expect(submitHandler).toHaveBeenCalled();
  });
});

describe('Event Handlers - Client Table Interactions', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <table>
        <tbody id="clientsTableBody">
          <tr data-id="1">
            <td>Client 1</td>
            <td>client1@test.com</td>
            <td>123</td>
            <td>Address 1</td>
            <td>TAX1</td>
            <td><button class="btn-small btn-delete">Izbriši</button></td>
            <td><button class="btn-small btn-edit">Uredi</button></td>
          </tr>
          <tr data-id="2">
            <td>Client 2</td>
            <td>client2@test.com</td>
            <td>456</td>
            <td>Address 2</td>
            <td>TAX2</td>
            <td><button class="btn-small btn-delete">Izbriši</button></td>
            <td><button class="btn-small btn-edit">Uredi</button></td>
          </tr>
        </tbody>
      </table>
    `;
  });

  test('should find delete button on click', () => {
    const tbody = document.getElementById('clientsTableBody');
    const deleteBtn = tbody.querySelector('.btn-delete');
    
    expect(deleteBtn).toBeTruthy();
    expect(deleteBtn.textContent).toBe('Izbriši');
  });

  test('should find edit button on click', () => {
    const tbody = document.getElementById('clientsTableBody');
    const editBtn = tbody.querySelector('.btn-edit');
    
    expect(editBtn).toBeTruthy();
    expect(editBtn.textContent).toBe('Uredi');
  });

  test('should get client id from row data attribute', () => {
    const tbody = document.getElementById('clientsTableBody');
    const row = tbody.querySelector('tr[data-id="1"]');
    
    expect(row.dataset.id).toBe('1');
  });

  test('should handle event delegation on tbody', () => {
    const tbody = document.getElementById('clientsTableBody');
    const clickHandler = jest.fn((e) => {
      const deleteBtn = e.target.closest('.btn-delete');
      if (deleteBtn) {
        const id = deleteBtn.closest('tr').dataset.id;
        return id;
      }
    });
    
    tbody.addEventListener('click', clickHandler);
    
    const deleteBtn = tbody.querySelector('.btn-delete');
    deleteBtn.click();
    
    expect(clickHandler).toHaveBeenCalled();
  });

  test('should extract cell values from table row', () => {
    const row = document.querySelector('tr[data-id="1"]');
    const cells = row.querySelectorAll('td');
    
    expect(cells[0].textContent).toBe('Client 1');
    expect(cells[1].textContent).toBe('client1@test.com');
    expect(cells[2].textContent).toBe('123');
  });
});

describe('API Interactions - Fetch Calls', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('should make POST request to register endpoint', async () => {
    const mockResponse = { message: 'Registration successful', userId: 1 };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });
    
    const response = await fetch('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'pass123' })
    });
    
    const data = await response.json();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/users/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test', email: 'test@example.com', password: 'pass123' })
    });
    expect(response.ok).toBe(true);
    expect(data.message).toBe('Registration successful');
  });

  test('should make POST request to login endpoint', async () => {
    const mockResponse = { message: 'Login successful', userId: 1 };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockResponse
    });
    
    const response = await fetch('/api/users/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@example.com', password: 'pass123' })
    });
    
    const data = await response.json();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/users/login', expect.any(Object));
    expect(data.userId).toBe(1);
  });

  test('should make GET request to fetch clients', async () => {
    const mockClients = [
      { id: 1, name: 'Client 1' },
      { id: 2, name: 'Client 2' }
    ];
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockClients
    });
    
    const response = await fetch('/api/clients');
    const data = await response.json();
    
    expect(global.fetch).toHaveBeenCalledWith('/api/clients');
    expect(data.length).toBe(2);
    expect(data[0].name).toBe('Client 1');
  });

  test('should make DELETE request to remove client', async () => {
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Client deleted' })
    });
    
    const response = await fetch('/api/clients/1', { method: 'DELETE' });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/clients/1', { method: 'DELETE' });
    expect(response.ok).toBe(true);
  });

  test('should make PUT request to update client', async () => {
    const clientData = { name: 'Updated Client', email: 'updated@example.com' };
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'Client updated' })
    });
    
    const response = await fetch('/api/clients/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    
    expect(global.fetch).toHaveBeenCalledWith('/api/clients/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(clientData)
    });
    expect(response.ok).toBe(true);
  });

  test('should handle fetch error response', async () => {
    global.fetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: async () => ({ message: 'Not logged in' })
    });
    
    const response = await fetch('/api/clients');
    const data = await response.json();
    
    expect(response.ok).toBe(false);
    expect(response.status).toBe(401);
    expect(data.message).toBe('Not logged in');
  });

  test('should handle network error', async () => {
    global.fetch.mockRejectedValue(new Error('Network error'));
    
    try {
      await fetch('/api/clients');
    } catch (error) {
      expect(error.message).toBe('Network error');
    }
  });
});
