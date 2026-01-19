/**
 * JOBHUNTER AUTOFILL POPUP
 * 
 * Floating popup that appears on job application pages
 * Shows form analysis and provides "Autofill" button
 * Similar to Jobright AI popup UI
 */

class AutofillPopup {
  constructor(jobInfo, formFields) {
    this.jobInfo = jobInfo;
    this.formFields = formFields;
    this.isVisible = false;
    this.isMinimized = false;
    this.container = null;
  }

  /**
   * Create and show the popup
   */
  show() {
    if (this.isVisible) return;

    this.container = this.createPopupContainer();
    document.body.appendChild(this.container);
    this.isVisible = true;

    console.log('✓ Autofill popup shown');
    
    // Listen for submission status updates from content script
    this.setupSubmissionMonitoring();
  }

  /**
   * Set up listening for submission status from content script
   */
  setupSubmissionMonitoring() {
    // Store reference to this for use in callbacks
    const self = this;
    
    // Listen for messages from content script about submission status
    try {
      chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        try {
          if (request.action === 'submissionStatusUpdate') {
            console.log('📍 Submission status received:', request.status);
            
            if (request.status.status === 'success' && self.container) {
              self.showStatus('✅ Application submitted successfully!', 'success');
              
              // Add celebration animation
              const statusElement = self.container.querySelector('.jobhunter-popup-status');
              if (statusElement) {
                statusElement.classList.add('success-celebration');
              }
            }
            
            sendResponse({ received: true });
          }
        } catch (error) {
          console.error('Error handling submission status message:', error);
          try {
            sendResponse({ error: error.message });
          } catch (e) {
            // Extension context may be invalidated, ignore
          }
        }
      });
    } catch (error) {
      console.warn('Could not set up message listener (extension context may be invalidated):', error);
    }
    
    // Also check storage periodically for latest status
    this.statusCheckInterval = setInterval(() => {
      // Only check if popup is still visible and container exists
      if (!self.isVisible || !self.container) {
        return;
      }
      
      // Check if chrome is still available
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome API not available, extension context may be invalidated');
        clearInterval(self.statusCheckInterval);
        return;
      }
      
      try {
        chrome.storage.local.get(['lastSubmissionStatus'], (data) => {
          try {
            // Validate chrome call succeeded and data exists
            if (chrome.runtime.lastError) {
              console.warn('Error reading submission status:', chrome.runtime.lastError);
              return;
            }
            
            if (data && data.lastSubmissionStatus && data.lastSubmissionStatus.status === 'success') {
              // Check if this is a new status (not the one we already showed)
              const statusElement = self.container ? self.container.querySelector('.jobhunter-popup-status') : null;
              if (statusElement && !statusElement.classList.contains('success-celebration')) {
                self.showStatus('✅ Application submitted successfully!', 'success');
                statusElement.classList.add('success-celebration');
              }
            }
          } catch (innerError) {
            console.error('Error processing submission status:', innerError);
          }
        });
      } catch (error) {
        console.error('Error calling chrome.storage.local.get:', error);
        clearInterval(self.statusCheckInterval);
      }
    }, 1000);
  }

  /**
   * Hide the popup
   */
  hide() {
    if (this.container) {
      this.container.remove();
      this.container = null;
      this.isVisible = false;
    }
    
    // Clean up status check interval
    if (this.statusCheckInterval) {
      clearInterval(this.statusCheckInterval);
      this.statusCheckInterval = null;
    }

    console.log('✓ Autofill popup hidden');
  }

  /**
   * Toggle minimize/expand
   */
  toggleMinimize() {
    this.isMinimized = !this.isMinimized;
    const content = this.container.querySelector('.jobhunter-popup-content');
    const body = this.container.querySelector('.jobhunter-popup-body');

    if (this.isMinimized) {
      content.style.display = 'none';
      body.style.display = 'none';
    } else {
      content.style.display = 'block';
      body.style.display = 'block';
    }
  }

  /**
   * Create popup HTML structure
   */
  createPopupContainer() {
    const container = document.createElement('div');
    container.className = 'jobhunter-autofill-popup';

    container.innerHTML = `
      <div class="jobhunter-popup-container">
        <!-- Header -->
        <div class="jobhunter-popup-header">
          <div class="jobhunter-popup-title-section">
            <div class="jobhunter-logo">🎯</div>
            <div class="jobhunter-title">JobHunter</div>
          </div>
          <div class="jobhunter-popup-controls">
            <button class="jobhunter-popup-minimize">−</button>
            <button class="jobhunter-popup-close">×</button>
          </div>
        </div>

        <!-- Content -->
        <div class="jobhunter-popup-content">
          <!-- Job Info -->
          <div class="jobhunter-popup-job-info">
            <div class="job-company">${this.escapeHtml(this.jobInfo.company)}</div>
            <div class="job-title">${this.escapeHtml(this.jobInfo.title)}</div>
            <div class="job-platform">
              <span class="platform-badge">${this.escapeHtml(this.jobInfo.platform)}</span>
            </div>
          </div>

          <!-- Form Analysis -->
          <div class="jobhunter-popup-analysis">
            <div class="analysis-label">Form:</div>
            <div class="field-count">${this.jobInfo.formFields} fields</div>
          </div>

          <!-- Main Button -->
          <button class="jobhunter-autofill-button">
            <span class="button-icon">⚡</span>
            <span class="button-text">Autofill & Apply</span>
          </button>

          <!-- Apply Mode Selection -->
          <div class="jobhunter-apply-mode">
            <label class="mode-option">
              <input type="radio" name="applyMode" value="auto" checked>
              <span class="mode-label">Auto Apply</span>
              <span class="mode-desc">Auto-submit application</span>
            </label>
            <label class="mode-option">
              <input type="radio" name="applyMode" value="manual">
              <span class="mode-label">Manual Apply</span>
              <span class="mode-desc">You click next/submit</span>
            </label>
          </div>

          <!-- Status -->
          <div class="jobhunter-popup-status">
            <div class="status-icon">✓</div>
            <div class="status-text">Ready to apply</div>
          </div>
        </div>

        <!-- Progress Bar (hidden by default) -->
        <div class="jobhunter-popup-progress" style="display: none;">
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
          <div class="progress-text">Processing...</div>
        </div>
      </div>
    `;

    // Add event listeners
    container.querySelector('.jobhunter-popup-close').addEventListener('click', () => {
      this.hide();
    });

    container.querySelector('.jobhunter-popup-minimize').addEventListener('click', () => {
      this.toggleMinimize();
    });

    container.querySelector('.jobhunter-autofill-button').addEventListener('click', () => {
      this.onAutofillClick();
    });

    // Add styles
    this.injectStyles();

    return container;
  }

  /**
   * Get breakdown of field types
   */
  getFieldTypesBreakdown() {
    const types = {};
    this.formFields.forEach(field => {
      types[field.type] = (types[field.type] || 0) + 1;
    });

    return Object.entries(types)
      .map(([type, count]) => `<div class="field-type"><span class="type-icon">${this.getTypeIcon(type)}</span>${count} ${type}${count > 1 ? 's' : ''}</div>`)
      .join('');
  }

  /**
   * Get icon for field type
   */
  getTypeIcon(type) {
    const icons = {
      input: '📝',
      textarea: '📄',
      select: '📋',
      checkbox: '☑️',
      radio: '◯'
    };
    return icons[type] || '□';
  }

  /**
   * Handle autofill button click
   */
  onAutofillClick() {
    console.log('⚡ Autofill button clicked');

    // Get selected apply mode
    const applyModeRadios = this.container.querySelectorAll('input[name="applyMode"]');
    let applyMode = 'auto'; // default

    for (const radio of applyModeRadios) {
      if (radio.checked) {
        applyMode = radio.value;
        break;
      }
    }

    console.log(`📍 Apply mode: ${applyMode}`);

    // Show progress
    const progress = this.container.querySelector('.jobhunter-popup-progress');
    if (progress) {
      progress.style.display = 'block';
    }

    // Execute autofill with selected mode
    if (applyMode === 'auto') {
      this.autofillAndApply();
    } else {
      this.autofillManual();
    }
  }

  /**
   * Autofill form and automatically apply (submit)
   */
  autofillAndApply() {
    console.log('🚀 Auto mode: filling form and auto-submitting...');
    this.showStatus('Filling and submitting...', 'info');

    // Get profile and FAQ from storage
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome API not available');
        this.showStatus('Extension context lost. Please reload.', 'error');
        return;
      }
      
      chrome.storage.local.get(['userProfile', 'commonQuestions'], (data) => {
        if (chrome.runtime.lastError) {
          console.warn('Error reading storage:', chrome.runtime.lastError);
          return;
        }
        
        const profile = data.userProfile || {};
        const commonQuestions = data.commonQuestions || {};

        // Fill form with profile and FAQ
        if (typeof fillFormWithProfile === 'function') {
          fillFormWithProfile(profile);
          console.log('✓ Form filled');
        } else {
          console.warn('fillFormWithProfile not available');
        }

        // Auto-click apply button after filling
        setTimeout(() => {
          if (typeof findAndClickApplyButton === 'function') {
            const result = findAndClickApplyButton();
            if (result.success) {
              this.showStatus('✓ Application submitted!', 'success');
              console.log('✓ Apply button clicked - application submitted');
            } else {
              this.showStatus('Form filled. Click apply to submit.', 'warning');
              console.log('⚠ Apply button not found - user needs to click manually');
            }
          }
        }, 1000);
      });

      // Hide progress
      setTimeout(() => {
        const progress = this.container.querySelector('.jobhunter-popup-progress');
        if (progress) {
          progress.style.display = 'none';
        }
      }, 3000);
    } catch (error) {
      console.error('Error in autofillAndApply:', error);
      this.showStatus('Error: ' + error.message, 'error');
    }
  }

  /**
   * Autofill form but let user click buttons (manual mode)
   */
  autofillManual() {
    console.log('👤 Manual mode: filling form, user clicks next/submit...');
    this.showStatus('Form filled. Click next/submit.', 'info');

    // Get profile and FAQ from storage
    try {
      if (typeof chrome === 'undefined' || !chrome.storage) {
        console.warn('Chrome API not available');
        this.showStatus('Extension context lost. Please reload.', 'error');
        return;
      }
      
      chrome.storage.local.get(['userProfile', 'commonQuestions'], (data) => {
        if (chrome.runtime.lastError) {
          console.warn('Error reading storage:', chrome.runtime.lastError);
          return;
        }
        
        const profile = data.userProfile || {};
        const commonQuestions = data.commonQuestions || {};

        // Fill form with profile and FAQ
        if (typeof fillFormWithProfile === 'function') {
          // Call without clicking apply button
          const inputs = document.querySelectorAll('input, textarea, select');
          
          inputs.forEach(input => {
            if (input.tagName === 'SELECT') {
              // Handle select
              const options = input.querySelectorAll('option');
              for (const option of options) {
                const optionText = option.textContent.toLowerCase();
                
                if (profile.firstName && optionText.includes('first')) {
                  input.value = option.value;
                  break;
                } else if (profile.lastName && optionText.includes('last')) {
                  input.value = option.value;
                  break;
                } else if (profile.email && optionText.includes('email')) {
                  input.value = option.value;
                  break;
                } else if (profile.phone && optionText.includes('phone')) {
                  input.value = option.value;
                  break;
                }
              }
            } else {
              // Handle text inputs
              const label = input.previousElementSibling?.textContent?.toLowerCase() || '';
              const name = (input.name || input.id || '').toLowerCase();
              const placeholder = (input.placeholder || '').toLowerCase();
              const searchText = label + ' ' + name + ' ' + placeholder;

              if (profile.firstName && (searchText.includes('first') || searchText.includes('fname'))) {
                input.value = profile.firstName;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (profile.lastName && (searchText.includes('last') || searchText.includes('lname'))) {
                input.value = profile.lastName;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (profile.email && (searchText.includes('email') || searchText.includes('mail'))) {
                input.value = profile.email;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              } else if (profile.phone && (searchText.includes('phone') || searchText.includes('mobile'))) {
                input.value = profile.phone;
                input.dispatchEvent(new Event('change', { bubbles: true }));
              }
            }
          });

          console.log('✓ Form filled');
          this.showStatus('Form ready. Click next/submit to continue.', 'info');
        }
      });

      // Hide progress
      const progress = this.container.querySelector('.jobhunter-popup-progress');
      if (progress) {
        setTimeout(() => {
          progress.style.display = 'none';
        }, 1000);
      }
    } catch (error) {
      console.error('Error in autofillManual:', error);
      this.showStatus('Error: ' + error.message, 'error');
    }
  }

  /**
   * Handle analyze button click
   */
  onAnalyzeClick() {
    console.log('👆 Analyze button clicked');
    this.showStatus('Analyzing form...', 'info');
    this.showAnalyzeDiagram();

    // Try to send message to background, but don't fail if it errors
    try {
      chrome.runtime.sendMessage(
        {
          action: 'analyzeForm',
          jobInfo: this.jobInfo,
          formFields: this.formFields
        },
        (response) => {
          // Check error BEFORE accessing properties
          if (chrome.runtime.lastError) {
            console.warn('⚠️ Could not send to background:', chrome.runtime.lastError.message);
            return;
          }

          console.log('✓ Analysis:', response);
        }
      );
    } catch (error) {
      console.log('ℹ️ Analysis running locally');
    }
  }

  /**
   * Handle review button click
   */
  onReviewClick() {
    console.log('👆 Review button clicked');
    // Open review modal or panel
    this.showReviewPanel();
  }

  /**
   * Handle settings button click
   */
  onSettingsClick() {
    console.log('👆 Settings button clicked');
    try {
      if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.warn('Chrome API not available');
        return;
      }
      chrome.runtime.openOptionsPage();
    } catch (error) {
      console.warn('Could not open options page:', error);
    }
  }

  /**
   * Show analyze diagram/breakdown panel
   */
  showAnalyzeDiagram() {
    // Remove existing diagram if present
    const existing = document.querySelector('.jobhunter-analyze-panel');
    if (existing) existing.remove();

    const panel = document.createElement('div');
    panel.className = 'jobhunter-analyze-panel';
    panel.innerHTML = `
      <div class="analyze-header">
        <h3>📊 Form Analysis</h3>
        <button class="analyze-close">×</button>
      </div>
      <div class="analyze-body">
        <div class="analyze-section">
          <h4>Job Info</h4>
          <div class="analyze-info">
            <div class="info-row"><strong>Company:</strong> ${this.escapeHtml(this.jobInfo.company)}</div>
            <div class="info-row"><strong>Position:</strong> ${this.escapeHtml(this.jobInfo.title)}</div>
            <div class="info-row"><strong>Platform:</strong> ${this.escapeHtml(this.jobInfo.platform)}</div>
          </div>
        </div>

        <div class="analyze-section">
          <h4>Form Fields Breakdown</h4>
          <div class="field-breakdown">
            <div class="breakdown-stat">
              <div class="stat-number">${this.formFields.length}</div>
              <div class="stat-label">Total Fields</div>
            </div>
            ${this.getFieldStatistics()}
          </div>
        </div>

        <div class="analyze-section">
          <h4>Field Classification</h4>
          <div class="field-list">
            ${this.formFields.map((field, i) => `
              <div class="field-item">
                <span class="field-num">${i + 1}</span>
                <span class="field-name">${this.escapeHtml(field.label || field.name)}</span>
                <span class="field-badge">${field.type}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    // Close button
    panel.querySelector('.analyze-close').addEventListener('click', () => {
      panel.style.animation = 'slideDown 0.3s ease-out reverse';
      setTimeout(() => panel.remove(), 300);
    });

    this.injectAnalyzePanelStyles();
  }

  /**
   * Get field statistics for analysis
   */
  getFieldStatistics() {
    const types = {};
    this.formFields.forEach(field => {
      types[field.type] = (types[field.type] || 0) + 1;
    });

    return Object.entries(types)
      .map(([type, count]) => `
        <div class="breakdown-stat">
          <div class="stat-number">${count}</div>
          <div class="stat-label">${type}${count > 1 ? 's' : ''}</div>
        </div>
      `)
      .join('');
  }

  /**
   * Show review panel
   */
  showReviewPanel() {
    const panel = document.createElement('div');
    panel.className = 'jobhunter-review-panel';
    panel.innerHTML = `
      <div class="review-header">
        <h3>Form Review</h3>
        <button class="review-close">×</button>
      </div>
      <div class="review-body">
        <div class="review-fields">
          ${this.formFields.map((field, i) => `
            <div class="review-field">
              <div class="field-number">${i + 1}</div>
              <div class="field-info">
                <div class="field-label">${this.escapeHtml(field.label || field.name)}</div>
                <div class="field-type">${field.type}${field.required ? ' (required)' : ''}</div>
              </div>
              <div class="field-status">
                <span class="status-badge pending">Pending</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    panel.querySelector('.review-close').addEventListener('click', () => {
      panel.remove();
    });

    this.injectReviewPanelStyles();
  }

  /**
   * Update status message
   */
  showStatus(message, type = 'info') {
    const status = this.container.querySelector('.jobhunter-popup-status');
    const statusText = status.querySelector('.status-text');
    const statusIcon = status.querySelector('.status-icon');

    const icons = {
      info: 'ℹ️',
      success: '✓',
      error: '✗',
      warning: '⚠'
    };

    statusIcon.textContent = icons[type] || '•';
    statusText.textContent = message;
    status.className = `jobhunter-popup-status status-${type}`;
  }

  /**
   * Update progress
   */
  updateProgress(percent) {
    const fill = this.container.querySelector('.progress-fill');
    fill.style.width = percent + '%';
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * Inject popup styles
   */
  injectStyles() {
    if (document.querySelector('#jobhunter-popup-styles')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'jobhunter-popup-styles';
    style.textContent = `
      .jobhunter-autofill-popup {
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      .jobhunter-popup-container {
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        width: 320px;
        max-width: 90vw;
        overflow: hidden;
      }

      .jobhunter-popup-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 12px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-weight: 600;
      }

      .jobhunter-popup-title-section {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .jobhunter-logo {
        font-size: 20px;
      }

      .jobhunter-title {
        font-size: 14px;
        font-weight: 600;
      }

      .jobhunter-popup-controls {
        display: flex;
        gap: 8px;
      }

      .jobhunter-popup-minimize,
      .jobhunter-popup-close {
        background: rgba(255, 255, 255, 0.2);
        border: none;
        color: white;
        width: 28px;
        height: 28px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .jobhunter-popup-minimize:hover,
      .jobhunter-popup-close:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .jobhunter-popup-content {
        padding: 16px;
      }

      .jobhunter-popup-job-info {
        margin-bottom: 16px;
      }

      .job-company {
        font-size: 12px;
        color: #999;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .job-title {
        font-size: 16px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
        line-height: 1.3;
      }

      .job-platform {
        display: flex;
        gap: 8px;
      }

      .platform-badge {
        display: inline-block;
        background: #f0f0f0;
        color: #666;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      .jobhunter-popup-page-type {
        display: flex;
        justify-content: center;
        margin-bottom: 12px;
      }

      .page-type-badge {
        display: inline-block;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 6px 12px;
        border-radius: 20px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .jobhunter-popup-overview-info {
        background: #f0f4ff;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
        border-left: 4px solid #667eea;
      }

      .overview-message {
        font-size: 13px;
        color: #333;
        line-height: 1.5;
      }

      .jobhunter-popup-analysis {
        background: #f9f9f9;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 16px;
      }

      .analysis-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 8px;
        font-weight: 600;
      }

      .field-count {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        margin-bottom: 8px;
      }

      .field-types {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .field-type {
        font-size: 12px;
        color: #666;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .type-icon {
        font-size: 14px;
      }

      .jobhunter-autofill-button {
        width: 100%;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border: none;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 12px;
        transition: transform 0.2s, box-shadow 0.2s;
      }

      .jobhunter-autofill-button:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
      }

      .jobhunter-autofill-button:active {
        transform: translateY(0);
      }

      .button-icon {
        font-size: 16px;
      }

      .jobhunter-popup-options {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 8px;
        margin-bottom: 12px;
      }

      .option-button {
        background: #f5f5f5;
        border: 1px solid #e0e0e0;
        padding: 8px;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 4px;
        color: #333;
        transition: background 0.2s, border-color 0.2s;
      }

      .option-button:hover {
        background: #e8e8e8;
        border-color: #ccc;
      }

      .option-icon {
        font-size: 16px;
      }

      .option-text {
        font-size: 11px;
      }

      .jobhunter-popup-status {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        background: #e8f5e9;
        border-radius: 6px;
        font-size: 12px;
        color: #2e7d32;
      }

      .jobhunter-popup-status.status-error {
        background: #ffebee;
        color: #c62828;
      }

      .jobhunter-popup-status.status-warning {
        background: #fff3e0;
        color: #e65100;
      }

      .jobhunter-popup-status.status-info {
        background: #e3f2fd;
        color: #1565c0;
      }

      .status-icon {
        font-size: 14px;
        font-weight: 600;
      }

      .jobhunter-popup-progress {
        padding: 12px 16px;
        border-top: 1px solid #e0e0e0;
      }

      .progress-bar {
        height: 4px;
        background: #e0e0e0;
        border-radius: 2px;
        overflow: hidden;
        margin-bottom: 8px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        width: 0%;
        transition: width 0.3s;
      }

      .progress-text {
        font-size: 11px;
        color: #999;
      }

      /* Review Panel */
      .jobhunter-review-panel {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10001;
        display: flex;
        align-items: flex-end;
      }

      .jobhunter-review-panel > * {
        width: 100%;
        max-width: 600px;
        background: white;
        border-radius: 12px 12px 0 0;
        max-height: 80vh;
        overflow-y: auto;
      }

      .review-header {
        padding: 16px;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .review-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .review-close {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #999;
      }

      .review-body {
        padding: 16px;
      }

      .review-field {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        margin-bottom: 8px;
      }

      .field-number {
        font-weight: 600;
        color: #667eea;
        min-width: 24px;
        text-align: center;
      }

      .field-info {
        flex: 1;
      }

      .field-label {
        font-size: 13px;
        font-weight: 500;
        color: #333;
      }

      .field-type {
        font-size: 11px;
        color: #999;
        margin-top: 2px;
      }

      .field-status {
        display: flex;
        gap: 8px;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      .status-badge.pending {
        background: #fff9c4;
        color: #f57f17;
      }

      .jobhunter-apply-mode {
        margin: 12px 0;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 8px;
      }

      .mode-option {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 8px;
        margin-bottom: 8px;
        cursor: pointer;
        border-radius: 6px;
        transition: background 0.2s;
      }

      .mode-option:hover {
        background: #f0f0f0;
      }

      .mode-option input[type="radio"] {
        margin-top: 2px;
        cursor: pointer;
        accent-color: #667eea;
      }

      .mode-option input[type="radio"]:checked + .mode-label {
        color: #667eea;
        font-weight: 600;
      }

      .mode-label {
        font-size: 13px;
        font-weight: 500;
        color: #333;
      }

      .mode-desc {
        font-size: 11px;
        color: #999;
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Inject analyze panel styles
   */
  injectAnalyzePanelStyles() {
    if (document.querySelector('#jobhunter-analyze-styles')) {
      return; // Already injected
    }

    const style = document.createElement('style');
    style.id = 'jobhunter-analyze-styles';
    style.textContent = `
      .jobhunter-analyze-panel {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: white;
        box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        max-height: 80vh;
        overflow-y: auto;
        animation: slideUp 0.3s ease-out;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }

      @keyframes slideUp {
        from {
          transform: translateY(100%);
        }
        to {
          transform: translateY(0);
        }
      }

      @keyframes slideDown {
        from {
          transform: translateY(0);
        }
        to {
          transform: translateY(100%);
        }
      }

      .analyze-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 20px;
        border-bottom: 1px solid #e0e0e0;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: sticky;
        top: 0;
      }

      .analyze-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .analyze-close {
        background: none;
        border: none;
        font-size: 28px;
        cursor: pointer;
        color: white;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.2s;
      }

      .analyze-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .analyze-body {
        padding: 20px;
      }

      .analyze-section {
        margin-bottom: 24px;
      }

      .analyze-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: #333;
      }

      .analyze-info {
        background: #f5f5f5;
        border-radius: 6px;
        padding: 12px;
      }

      .info-row {
        font-size: 13px;
        padding: 6px 0;
        color: #666;
      }

      .info-row strong {
        color: #333;
        margin-right: 8px;
      }

      .field-breakdown {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
      }

      .breakdown-stat {
        flex: 1;
        min-width: 100px;
        text-align: center;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 16px;
        border-radius: 8px;
      }

      .stat-number {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 4px;
      }

      .stat-label {
        font-size: 12px;
        opacity: 0.9;
      }

      .field-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .field-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px;
        background: #f9f9f9;
        border: 1px solid #e0e0e0;
        border-radius: 6px;
        font-size: 13px;
      }

      .field-num {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 24px;
        height: 24px;
        background: #667eea;
        color: white;
        border-radius: 50%;
        font-size: 11px;
        font-weight: 600;
      }

      .field-name {
        flex: 1;
        font-weight: 500;
        color: #333;
      }

      .field-badge {
        background: #e3f2fd;
        color: #1976d2;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 500;
      }

      @media (max-width: 600px) {
        .jobhunter-analyze-panel {
          max-height: 90vh;
        }

        .field-breakdown {
          flex-direction: column;
        }

        .breakdown-stat {
          min-width: auto;
        }
      }
    `;

    document.head.appendChild(style);
  }

  /**
   * Inject review panel styles (if not already present)
   */
  injectReviewPanelStyles() {
    // Styles are included in injectStyles() above
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutofillPopup;
}

console.log('✓ Autofill Popup module loaded');
