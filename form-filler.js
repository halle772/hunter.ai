/**
 * FORM FILLER ENGINE
 * Universal form filling with intelligent field detection and mapping
 * Supports text, email, select, radio, checkbox, textarea, file upload
 */

class FormFillerEngine {
  constructor() {
    this.fieldMappings = {
      'first[_-]?name': 'firstName',
      'last[_-]?name': 'lastName',
      'full[_-]?name': 'fullName',
      'email': 'email',
      'phone': 'phone',
      'mobile': 'phone',
      'address': 'address',
      'city': 'city',
      'state': 'state',
      'zip|postal': 'zipCode',
      'country': 'country',
      'linkedin': 'linkedin',
      'portfolio': 'portfolio',
      'github': 'github',
      'website': 'website'
    };
  }

  /**
   * Fill all forms on the page
   */
  async fillAllForms(userProfile, options = {}) {
    const forms = document.querySelectorAll('form');
    const results = [];

    for (const form of forms) {
      const result = await this.fillForm(form, userProfile, options);
      results.push(result);
    }

    return results;
  }

  /**
   * Fill a specific form
   */
  async fillForm(form, userProfile, options = {}) {
    const results = {
      formId: form.id || `form_${Math.random().toString(36).substr(2, 9)}`,
      filledFields: [],
      skippedFields: []
    };

    // Get all form fields
    const fields = this.getFormFields(form);

    for (const field of fields) {
      const fieldInfo = this.analyzeField(field);
      const filled = await this.fillField(field, fieldInfo, userProfile, options);

      if (filled) {
        results.filledFields.push({
          name: fieldInfo.name,
          type: fieldInfo.type,
          value: filled
        });
      } else {
        results.skippedFields.push({
          name: fieldInfo.name,
          type: fieldInfo.type,
          reason: 'Could not determine value'
        });
      }
    }

    return results;
  }

  /**
   * Get all fillable form fields
   */
  getFormFields(form) {
    const fields = [];
    const selectors = [
      'input[type="text"]',
      'input[type="email"]',
      'input[type="tel"]',
      'input[type="number"]',
      'input[type="date"]',
      'input[type="password"]',
      'select',
      'textarea',
      'input[type="radio"]',
      'input[type="checkbox"]'
    ];

    selectors.forEach(selector => {
      form.querySelectorAll(selector).forEach(field => {
        if (this.isVisibleField(field)) {
          fields.push(field);
        }
      });
    });

    return fields;
  }

  /**
   * Check if field is visible
   */
  isVisibleField(field) {
    // Check if field is hidden
    if (field.type === 'hidden') return false;
    if (field.style.display === 'none') return false;
    if (field.style.visibility === 'hidden') return false;
    if (field.offsetParent === null) return false;

    // Check if field is disabled
    if (field.disabled) return false;

    return true;
  }

  /**
   * Analyze a form field to determine its purpose
   */
  analyzeField(field) {
    const fieldInfo = {
      element: field,
      type: field.type || field.tagName.toLowerCase(),
      name: field.name || field.id || '',
      label: this.getFieldLabel(field),
      placeholder: field.placeholder || '',
      required: field.required || false,
      value: field.value || '',
      options: this.getFieldOptions(field)
    };

    return fieldInfo;
  }

  /**
   * Get label text for a field
   */
  getFieldLabel(field) {
    let label = '';

    // Try to find associated label element
    if (field.id) {
      const labelElement = document.querySelector(`label[for="${field.id}"]`);
      if (labelElement) {
        label = labelElement.innerText;
      }
    }

    // Try to find parent label
    if (!label) {
      const parentLabel = field.closest('label');
      if (parentLabel) {
        label = parentLabel.innerText;
      }
    }

    // Use aria-label
    if (!label) {
      label = field.getAttribute('aria-label') || '';
    }

    // Use placeholder
    if (!label) {
      label = field.placeholder || '';
    }

    // Use name or id
    if (!label) {
      label = field.name || field.id || '';
    }

    return label.toLowerCase().trim();
  }

  /**
   * Get available options for select/radio/checkbox fields
   */
  getFieldOptions(field) {
    const options = [];

    if (field.type === 'select' || field.tagName === 'SELECT') {
      Array.from(field.options || []).forEach(option => {
        options.push({
          value: option.value,
          label: option.text
        });
      });
    } else if (field.type === 'radio' || field.type === 'checkbox') {
      const name = field.name;
      if (name) {
        const group = document.querySelectorAll(`input[name="${name}"]`);
        group.forEach(input => {
          options.push({
            value: input.value,
            label: this.getFieldLabel(input)
          });
        });
      }
    }

    return options;
  }

  /**
   * Fill a specific field with appropriate value
   */
  async fillField(field, fieldInfo, userProfile, options) {
    // Skip if field already has value (unless overwrite is enabled)
    if (field.value && !options.overwrite) {
      return null;
    }

    let value = null;

    // Determine the value based on field purpose
    const fieldPurpose = this.determineFieldPurpose(fieldInfo, userProfile);

    if (fieldPurpose.source === 'profile') {
      value = this.getProfileValue(userProfile, fieldPurpose.key);
    } else if (fieldPurpose.source === 'ai' && options.useAI) {
      // Generate answer using AI
      if (window.aiIntegration && window.aiIntegration.enabled) {
        value = await window.aiIntegration.generateAnswer(
          fieldInfo.label,
          fieldInfo.name,
          userProfile
        );
      }
    } else if (fieldPurpose.source === 'derived') {
      value = this.deriveValue(fieldInfo, userProfile, fieldPurpose.derivation);
    }

    if (!value) {
      return null;
    }

    // Fill the field based on type
    return this.setFieldValue(field, value, fieldInfo);
  }

  /**
   * Determine the purpose/source of a field
   */
  determineFieldPurpose(fieldInfo, userProfile) {
    const text = fieldInfo.label + ' ' + fieldInfo.name + ' ' + fieldInfo.placeholder;

    // Check profile fields
    for (const [pattern, key] of Object.entries(this.fieldMappings)) {
      if (new RegExp(pattern, 'i').test(text)) {
        if (userProfile[key]) {
          return { source: 'profile', key };
        }
      }
    }

    // Check if it's an open-ended question (use AI)
    if (this.isOpenEndedQuestion(fieldInfo)) {
      return { source: 'ai' };
    }

    // Check if it's derivable from profile
    const derivation = this.checkDerivable(fieldInfo, userProfile);
    if (derivation) {
      return { source: 'derived', derivation };
    }

    return { source: 'unknown' };
  }

  /**
   * Check if field is an open-ended question
   */
  isOpenEndedQuestion(fieldInfo) {
    const questionPatterns = [
      'why', 'tell us', 'describe', 'explain', 'experience',
      'skill', 'accomplishment', 'achievement', 'motivat',
      'interest', 'question', 'comment', 'additional'
    ];

    const text = fieldInfo.label.toLowerCase();
    return questionPatterns.some(pattern => text.includes(pattern));
  }

  /**
   * Check if value can be derived from other profile fields
   */
  checkDerivable(fieldInfo, userProfile) {
    const text = fieldInfo.label.toLowerCase();

    // Full name from first + last
    if (text.includes('full') && text.includes('name')) {
      if (userProfile.firstName && userProfile.lastName) {
        return { type: 'concat', fields: ['firstName', 'lastName'] };
      }
    }

    return null;
  }

  /**
   * Derive a value from profile
   */
  deriveValue(fieldInfo, userProfile, derivation) {
    if (derivation.type === 'concat') {
      return derivation.fields
        .map(field => userProfile[field])
        .filter(v => v)
        .join(' ');
    }
    return null;
  }

  /**
   * Get value from user profile
   */
  getProfileValue(userProfile, key) {
    if (key === 'fullName') {
      return `${userProfile.firstName || ''} ${userProfile.lastName || ''}`.trim();
    }
    return userProfile[key] || '';
  }

  /**
   * Set field value based on field type
   */
  setFieldValue(field, value, fieldInfo) {
    try {
      if (field.type === 'select' || field.tagName === 'SELECT') {
        return this.setSelectValue(field, value);
      } else if (field.type === 'radio') {
        return this.setRadioValue(field, value);
      } else if (field.type === 'checkbox') {
        return this.setCheckboxValue(field, value);
      } else {
        // Text, email, tel, textarea, etc.
        field.value = value;
        this.triggerChangeEvents(field);
        return value;
      }
    } catch (error) {
      console.error('Error setting field value:', error);
      return null;
    }
  }

  /**
   * Set value for select field
   */
  setSelectValue(field, value) {
    const valueStr = String(value).toLowerCase().trim();

    // Try exact match
    for (const option of field.options) {
      if (option.value.toLowerCase() === valueStr || option.text.toLowerCase() === valueStr) {
        field.value = option.value;
        this.triggerChangeEvents(field);
        return option.value;
      }
    }

    // Try partial match
    for (const option of field.options) {
      if (option.text.toLowerCase().includes(valueStr) || valueStr.includes(option.text.toLowerCase())) {
        field.value = option.value;
        this.triggerChangeEvents(field);
        return option.value;
      }
    }

    // If no match found, try setting directly
    field.value = value;
    this.triggerChangeEvents(field);
    return value;
  }

  /**
   * Set value for radio button
   */
  setRadioValue(field, value) {
    const name = field.name;
    const valueStr = String(value).toLowerCase().trim();

    const radios = document.querySelectorAll(`input[name="${name}"][type="radio"]`);
    for (const radio of radios) {
      if (radio.value.toLowerCase() === valueStr) {
        radio.checked = true;
        this.triggerChangeEvents(radio);
        return radio.value;
      }
    }

    return null;
  }

  /**
   * Set value for checkbox
   */
  setCheckboxValue(field, value) {
    const valueStr = String(value).toLowerCase().trim();
    
    if (valueStr === 'true' || valueStr === 'yes' || valueStr === '1') {
      field.checked = true;
    } else if (valueStr === 'false' || valueStr === 'no' || valueStr === '0') {
      field.checked = false;
    }

    this.triggerChangeEvents(field);
    return field.checked;
  }

  /**
   * Trigger change events on field
   */
  triggerChangeEvents(field) {
    field.dispatchEvent(new Event('input', { bubbles: true }));
    field.dispatchEvent(new Event('change', { bubbles: true }));
    field.dispatchEvent(new Event('blur', { bubbles: true }));
  }

  /**
   * Get all filled fields for submission
   */
  getFilledFields(form) {
    const fields = this.getFormFields(form);
    const filledData = {};

    fields.forEach(field => {
      if (field.type === 'checkbox') {
        filledData[field.name] = field.checked;
      } else if (field.type === 'radio') {
        if (field.checked) {
          filledData[field.name] = field.value;
        }
      } else {
        if (field.value) {
          filledData[field.name] = field.value;
        }
      }
    });

    return filledData;
  }
}

// Create global instance
window.formFillerEngine = new FormFillerEngine();
