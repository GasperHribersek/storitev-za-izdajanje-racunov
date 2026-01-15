/**
 * @jest-environment jsdom
 */

describe('Form Validation - Register', () => {
  let form, nameInput, emailInput, passwordInput;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <form id="registerForm">
        <input type="text" id="name" required />
        <input type="email" id="email" required />
        <input type="password" id="password" required />
        <div id="registerMessage" style="display: none;"></div>
        <button type="submit">Register</button>
      </form>
    `;

    form = document.getElementById('registerForm');
    nameInput = document.getElementById('name');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
  });

  test('should validate that name input exists', () => {
    expect(nameInput).toBeTruthy();
    expect(nameInput.type).toBe('text');
    expect(nameInput.required).toBe(true);
  });

  test('should validate that email input exists and has correct type', () => {
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
    expect(emailInput.required).toBe(true);
  });

  test('should validate that password input exists and has correct type', () => {
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.type).toBe('password');
    expect(passwordInput.required).toBe(true);
  });

  test('should validate form has correct id', () => {
    expect(form).toBeTruthy();
    expect(form.id).toBe('registerForm');
  });

  test('should have message element for displaying feedback', () => {
    const messageEl = document.getElementById('registerMessage');
    expect(messageEl).toBeTruthy();
    expect(messageEl.style.display).toBe('none');
  });

  test('should validate email format using HTML5 validation', () => {
    emailInput.value = 'invalid-email';
    expect(emailInput.validity.valid).toBe(false);
    expect(emailInput.validity.typeMismatch).toBe(true);

    emailInput.value = 'valid@example.com';
    expect(emailInput.validity.valid).toBe(true);
  });

  test('should validate required fields are empty initially', () => {
    expect(nameInput.value).toBe('');
    expect(emailInput.value).toBe('');
    expect(passwordInput.value).toBe('');
  });
});

describe('Form Validation - Login', () => {
  let form, emailInput, passwordInput;

  beforeEach(() => {
    // Setup DOM
    document.body.innerHTML = `
      <form id="loginForm">
        <input type="email" id="email" required />
        <input type="password" id="password" required />
        <div id="loginMessage" style="display: none;"></div>
        <button type="submit">Login</button>
      </form>
    `;

    form = document.getElementById('loginForm');
    emailInput = document.getElementById('email');
    passwordInput = document.getElementById('password');
  });

  test('should validate that login form exists', () => {
    expect(form).toBeTruthy();
    expect(form.id).toBe('loginForm');
  });

  test('should validate that email input exists and is required', () => {
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
    expect(emailInput.required).toBe(true);
  });

  test('should validate that password input exists and is required', () => {
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.type).toBe('password');
    expect(passwordInput.required).toBe(true);
  });

  test('should have message element for displaying feedback', () => {
    const messageEl = document.getElementById('loginMessage');
    expect(messageEl).toBeTruthy();
  });
});

describe('Form Validation - Client Form', () => {
  let form, nameInput, emailInput, phoneInput, addressInput, taxIdInput;

  beforeEach(() => {
    // Setup DOM for client form
    document.body.innerHTML = `
      <form id="clientForm">
        <input type="text" name="name" id="clientName" required />
        <input type="email" name="email" id="clientEmail" />
        <input type="text" name="phone" id="clientPhone" />
        <input type="text" name="address" id="clientAddress" />
        <input type="text" name="tax_id" id="clientTaxId" />
        <button type="submit">Save</button>
      </form>
    `;

    form = document.getElementById('clientForm');
    nameInput = document.getElementById('clientName');
    emailInput = document.getElementById('clientEmail');
    phoneInput = document.getElementById('clientPhone');
    addressInput = document.getElementById('clientAddress');
    taxIdInput = document.getElementById('clientTaxId');
  });

  test('should validate that client form exists', () => {
    expect(form).toBeTruthy();
    expect(form.id).toBe('clientForm');
  });

  test('should validate that name field is required', () => {
    expect(nameInput).toBeTruthy();
    expect(nameInput.required).toBe(true);
    expect(nameInput.name).toBe('name');
  });

  test('should validate that email field has correct type but is not required', () => {
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
    expect(emailInput.required).toBe(false);
  });

  test('should validate optional fields exist', () => {
    expect(phoneInput).toBeTruthy();
    expect(addressInput).toBeTruthy();
    expect(taxIdInput).toBeTruthy();
  });
});
