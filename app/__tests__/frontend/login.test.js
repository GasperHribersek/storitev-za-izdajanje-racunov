/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Login Page Tests', () => {
  let document;

  beforeEach(() => {
    // Load the login.html file
    const html = fs.readFileSync(
      path.resolve(__dirname, '../../src/views/login.html'),
      'utf8'
    );
    document = window.document;
    document.documentElement.innerHTML = html;
  });

  // Test 1: Check existence of form elements
  it('should have a login form', () => {
    const form = document.getElementById('loginForm');
    expect(form).toBeTruthy();
    expect(form.tagName).toBe('FORM');
  });

  // Test 2: Check email input type
  it('should have email input with correct type', () => {
    const emailInput = document.getElementById('email');
    expect(emailInput).toBeTruthy();
    expect(emailInput.type).toBe('email');
  });

  // Test 3: Check password input type
  it('should have password input with correct type', () => {
    const passwordInput = document.getElementById('password');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.type).toBe('password');
  });

  // Test 4: Check required attribute on email field
  it('should have required attribute on email field', () => {
    const emailInput = document.getElementById('email');
    expect(emailInput).toBeTruthy();
    expect(emailInput.required).toBe(true);
  });

  // Test 5: Check required attribute on password field
  it('should have required attribute on password field', () => {
    const passwordInput = document.getElementById('password');
    expect(passwordInput).toBeTruthy();
    expect(passwordInput.required).toBe(true);
  });
});
