/**
 * BUTTON NAVIGATOR
 * Detects and clicks 'Continue', 'Next', 'Submit', and other navigation buttons
 * Handles dynamic buttons, various styling, and retry logic
 */

class ButtonNavigator {
  constructor() {
    this.clickedButtons = [];
    this.maxRetries = 5;
    this.retryDelay = 1000;
  }

  /**
   * Find and click next button (Continue, Next, Submit)
   */
  async findAndClickNextButton(options = {}) {
    const button = this.findNextButton();

    if (!button) {
      console.warn('No next button found');
      return { success: false, reason: 'No button found' };
    }

    return this.clickButton(button, options);
  }

  /**
   * Find next button with various patterns
   */
  findNextButton() {
    const patterns = [
      // Submit patterns
      { text: /^submit/i, priority: 1 },
      { text: /^send application/i, priority: 1 },
      { text: /^apply now/i, priority: 1 },
      { text: /^submit application/i, priority: 1 },
      
      // Next patterns
      { text: /^next/i, priority: 2 },
      { text: /^continue/i, priority: 2 },
      { text: /^proceed/i, priority: 2 },
      { text: /^go (ahead|forward)/i, priority: 2 },
      
      // Button types
      { text: /button/i, data: 'action', priority: 3 }
    ];

    const buttons = this.getAllClickableElements();
    let bestMatch = null;
    let bestPriority = Infinity;

    for (const button of buttons) {
      if (!this.isClickable(button)) continue;

      const text = this.getButtonText(button).toLowerCase().trim();
      if (!text) continue;

      // Check if this is a button we've already clicked
      if (this.hasBeenClicked(button)) {
        continue;
      }

      for (const pattern of patterns) {
        if (pattern.text.test(text)) {
          if (pattern.priority < bestPriority) {
            bestMatch = button;
            bestPriority = pattern.priority;
          }
        }
      }
    }

    return bestMatch;
  }

  /**
   * Get all clickable elements (buttons, links, divs with click handlers)
   */
  getAllClickableElements() {
    const elements = [];

    // Regular buttons
    document.querySelectorAll('button').forEach(btn => elements.push(btn));

    // Input submit buttons
    document.querySelectorAll('input[type="submit"]').forEach(btn => elements.push(btn));

    // Links that look like buttons
    document.querySelectorAll('a[role="button"]').forEach(btn => elements.push(btn));

    // Divs with click handlers (common in modern SPAs)
    document.querySelectorAll('[role="button"]').forEach(btn => {
      if (!elements.includes(btn)) elements.push(btn);
    });

    return elements;
  }

  /**
   * Get button text from various sources
   */
  getButtonText(element) {
    let text = element.innerText || element.textContent || '';

    // Check aria-label
    if (!text) {
      text = element.getAttribute('aria-label') || '';
    }

    // Check title attribute
    if (!text) {
      text = element.getAttribute('title') || '';
    }

    // Check value attribute (for input buttons)
    if (!text) {
      text = element.getAttribute('value') || '';
    }

    // Check data attributes
    if (!text) {
      text = element.getAttribute('data-text') || element.getAttribute('data-label') || '';
    }

    return text.trim();
  }

  /**
   * Check if button is clickable
   */
  isClickable(element) {
    // Check visibility
    if (element.style.display === 'none') return false;
    if (element.style.visibility === 'hidden') return false;
    if (element.offsetParent === null) return false;

    // Check if disabled
    if (element.disabled) return false;
    if (element.getAttribute('aria-disabled') === 'true') return false;

    // Check if it has a click handler or is a button/link
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'button' || tagName === 'a' || tagName === 'input') {
      return true;
    }

    // Check if it has click listeners
    if (element.onclick || element.getAttribute('onclick')) {
      return true;
    }

    // Check if it has role="button"
    if (element.getAttribute('role') === 'button') {
      return true;
    }

    return false;
  }

  /**
   * Check if button has already been clicked
   */
  hasBeenClicked(button) {
    // Simple check based on button text or element reference
    const text = this.getButtonText(button);
    return this.clickedButtons.some(clicked => clicked.text === text && clicked.text !== '');
  }

  /**
   * Click a button with various methods
   */
  async clickButton(button, options = {}) {
    try {
      const text = this.getButtonText(button);
      console.log(`Clicking button: ${text}`);

      // Try multiple click methods
      const methods = [
        () => button.click(),
        () => button.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true })),
        () => button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })) ||
              button.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })) ||
              button.click(),
        () => this.simulateKeyPress(button)
      ];

      for (const method of methods) {
        try {
          method();
          console.log(`Successfully clicked: ${text}`);
          this.clickedButtons.push({ text, timestamp: Date.now() });
          
          // Wait for page transition or form update
          if (options.waitFor) {
            await this.waitForElement(options.waitFor, 5000);
          } else {
            await this.delay(options.delay || 2000);
          }

          return { success: true, button: text };
        } catch (e) {
          continue;
        }
      }

      return { success: false, reason: 'All click methods failed' };
    } catch (error) {
      console.error('Error clicking button:', error);
      return { success: false, reason: error.message };
    }
  }

  /**
   * Simulate keyboard press on button
   */
  simulateKeyPress(button) {
    button.focus();
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
  }

  /**
   * Wait for element to appear
   */
  async waitForElement(selector, timeout = 5000) {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      const element = document.querySelector(selector);
      if (element && this.isElementVisible(element)) {
        return element;
      }
      await this.delay(100);
    }

    throw new Error(`Element not found: ${selector}`);
  }

  /**
   * Check if element is visible
   */
  isElementVisible(element) {
    return !!(element.offsetParent || element.offsetWidth || element.offsetHeight || element.getClientRects().length);
  }

  /**
   * Click button with retry logic
   */
  async clickButtonWithRetry(button, maxRetries = 3) {
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        const result = await this.clickButton(button);
        if (result.success) {
          return result;
        }
        lastError = result;
      } catch (error) {
        lastError = error;
        console.error(`Click attempt ${i + 1} failed:`, error);
      }

      if (i < maxRetries - 1) {
        await this.delay(this.retryDelay);
      }
    }

    return { success: false, reason: lastError };
  }

  /**
   * Find all buttons on page
   */
  findAllButtons() {
    const buttons = [];

    document.querySelectorAll('button, input[type="submit"], a[role="button"], [role="button"]').forEach(btn => {
      const text = this.getButtonText(btn);
      if (text) {
        buttons.push({
          element: btn,
          text: text,
          clickable: this.isClickable(btn)
        });
      }
    });

    return buttons;
  }

  /**
   * Find submit button specifically
   */
  findSubmitButton() {
    const buttons = this.getAllClickableElements();

    for (const button of buttons) {
      const text = this.getButtonText(button).toLowerCase();
      if (text.includes('submit') && this.isClickable(button)) {
        return button;
      }
    }

    // Fallback to submit input
    const submitInput = document.querySelector('input[type="submit"]:not([disabled])');
    if (submitInput && this.isClickable(submitInput)) {
      return submitInput;
    }

    return null;
  }

  /**
   * Scroll button into view before clicking
   */
  scrollButtonIntoView(button) {
    try {
      button.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return true;
    } catch (error) {
      console.error('Error scrolling button into view:', error);
      return false;
    }
  }

  /**
   * Helper: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Clear clicked button history
   */
  clearHistory() {
    this.clickedButtons = [];
  }

  /**
   * Reset all clicked states
   */
  reset() {
    this.clearHistory();
  }
}

// Create global instance
window.buttonNavigator = new ButtonNavigator();
