/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('Dashboard Tests', () => {
  let document;

  beforeEach(() => {
    // Load the dashboard.html file
    const html = fs.readFileSync(
      path.resolve(__dirname, '../../src/views/dashboard.html'),
      'utf8'
    );
    document = window.document;
    document.documentElement.innerHTML = html;
  });

  // Test 1: Check existence of sidebar navigation
  it('should have a sidebar navigation', () => {
    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toBeTruthy();
  });

  // Test 2: Check existence of navigation list
  it('should have a navigation list', () => {
    const navList = document.querySelector('.nav-list');
    expect(navList).toBeTruthy();
    expect(navList.tagName).toBe('UL');
  });

  // Test 3: Check existence of main content
  it('should have main content area', () => {
    const mainContent = document.querySelector('.main-content');
    expect(mainContent).toBeTruthy();
    expect(mainContent.tagName).toBe('MAIN');
  });

  // Test 4: Check existence of cards container
  it('should have a cards container', () => {
    const cardsContainer = document.querySelector('.cards-container');
    expect(cardsContainer).toBeTruthy();
  });

  // Test 5: Check active navigation item
  it('should have an active navigation item', () => {
    const activeNavItem = document.querySelector('.nav-item a.active');
    expect(activeNavItem).toBeTruthy();
    expect(activeNavItem.classList.contains('active')).toBe(true);
  });
});
