// Content script - injected into every page
let currentApplyMode = 'manual'; // 'manual' or 'auto'
let useAIAnswers = false;

window.addEventListener('DOMContentLoaded', () => {
  // Load apply mode settings
  chrome.storage.local.get(['applyMode', 'useAIAnswers'], (result) => {
    currentApplyMode = result.applyMode || 'manual';
    useAIAnswers = result.useAIAnswers || false;
    console.log('Apply mode loaded:', currentApplyMode);
  });

  // Check if we should autofill on page load
  if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.sendMessage({ action: 'checkAutoFill', url: window.location.href }, (response) => {
      if (response && response.shouldAutofill) {
        chrome.runtime.sendMessage({
          action: 'autofill',
          url: window.location.href
        });
      }
    });
  }
  
  // Detect job application forms
  detectJobForms();

  // Initialize popup system for job pages
  if (typeof initializePopupSystem === 'function') {
    console.log('🎯 Initializing JobHunter popup system...');
    initializePopupSystem();
  } else {
    console.warn('⚠ Popup system not available');
  }
});

// Detect common job application form patterns
function detectJobForms() {
  const formIndicators = [
    'email', 'first.?name', 'last.?name', 'resume', 'cv', 'cover.letter',
    'phone', 'contact', 'address', 'job.?title', 'work.?auth'
  ];
  
  const forms = document.querySelectorAll('form');
  const hasJobForm = Array.from(forms).some(form => {
    const formText = form.innerText.toLowerCase();
    return formIndicators.some(indicator => new RegExp(indicator).test(formText));
  });
  
  if (hasJobForm || document.body.innerText.toLowerCase().includes('apply')) {
    chrome.runtime.sendMessage({ action: 'jobPageDetected', url: window.location.href });
  }
}

// Listen for autofill button click (sent from popup)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'executeAutofill') {
    chrome.runtime.sendMessage({
      action: 'autofill',
      url: window.location.href
    }, sendResponse);
    return true;
  }
  
  if (request.action === 'fillFormWithProfile') {
    fillFormWithProfile(request.profile);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'applyWithDocuments') {
    applyWithDocuments(request.profile, request.resumeId, request.coverLetterId);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'fillApplicationForm') {
    fillJobApplicationForm(request.resumeId, request.coverLetterId);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'applyWithDocument') {
    applyWithDocument(request.docType, request.fileId);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.action === 'fillAndSubmit') {
    fillApplicationForm(request.userData, request.documentData);
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'updateApplyMode') {
    currentApplyMode = request.applyMode;
    useAIAnswers = request.useAIAnswers;
    console.log('Apply mode updated:', currentApplyMode, 'Use AI:', useAIAnswers);
    sendResponse({ success: true });
    return true;
  }

  if (request.action === 'smartFillForm') {
    // Universal form filling with AI support
    if (window.formFillerEngine) {
      window.formFillerEngine.fillAllForms(request.userProfile, {
        useAI: useAIAnswers,
        overwrite: request.overwrite || false
      }).then(() => {
        sendResponse({ success: true });
      });
      return true;
    }
  }

  if (request.action === 'smartClickNextButton') {
    // Find and click next/continue button
    if (window.buttonNavigator) {
      window.buttonNavigator.findAndClickNextButton({
        delay: 2000,
        waitFor: 'form'
      }).then((result) => {
        sendResponse(result);
      });
      return true;
    }
  }

  if (request.action === 'autoApplyFlow') {
    // Full auto-apply workflow
    executeAutoApplyFlow(request).then(sendResponse);
    return true;
  }
});

// Fill an input field with value
function fillInput(input, value) {
  if (input.tagName === 'SELECT') {
    // For select, try to find matching option
    const options = input.querySelectorAll('option');
    for (const option of options) {
      if (option.textContent.toLowerCase().includes(value.toLowerCase()) ||
          option.value.toLowerCase().includes(value.toLowerCase())) {
        input.value = option.value;
        break;
      }
    }
    if (!input.value) {
      input.value = value;
    }
  } else {
    input.value = value;
  }
  
  // Trigger change events
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

// Intelligently fill dropdown by reading the label and matching profile data
function fillDropdownIntelligently(select, profile) {
  if (select.tagName !== 'SELECT') return false;
  
  // Get label text from multiple sources
  let labelText = '';
  
  // Try to find associated label
  const label = select.closest('label') || 
                document.querySelector(`label[for="${select.id}"]`) ||
                select.previousElementSibling;
  
  if (label && label.tagName === 'LABEL') {
    labelText = label.textContent.toLowerCase();
  } else if (label) {
    labelText = label.textContent.toLowerCase();
  }
  
  // Also check for placeholder, aria-label, data attributes
  const ariaLabel = (select.getAttribute('aria-label') || '').toLowerCase();
  const dataLabel = (select.getAttribute('data-label') || '').toLowerCase();
  const name = (select.name || '').toLowerCase();
  const id = (select.id || '').toLowerCase();
  labelText += ' ' + ariaLabel + ' ' + dataLabel + ' ' + name + ' ' + id;
  
  // Get all option texts
  const options = Array.from(select.options);
  const optionTexts = options.map(o => ({ text: o.textContent.toLowerCase().trim(), value: o.value, original: o.textContent }));
  
  // Determine what to select based on the question
  let selectedValue = null;
  
  // Check for "Are you currently residing in the US?" type questions
  if (labelText.includes('residing') || labelText.includes('currently in the us') || labelText.includes('reside in')) {
    if (profile.country && profile.country.toLowerCase().includes('united states')) {
      selectedValue = findBestMatch(optionTexts, ['yes', 'true', 'prefer to answer']);
    }
  }
  
  // Check for country/location questions
  if (!selectedValue && (labelText.includes('country') || labelText.includes('location') || labelText.includes('based'))) {
    if (profile.country) {
      const country = profile.country.toLowerCase();
      selectedValue = findBestMatch(optionTexts, [country, 'united states', 'us', 'usa']);
    }
  }
  
  // Check for "Do you require sponsorship?" type questions
  if (!selectedValue && (labelText.includes('sponsorship') || labelText.includes('visa') || labelText.includes('require sponsorship') || labelText.includes('require work'))) {
    // Default to "I don't require sponsorship" for US citizens/residents
    if (profile.country && profile.country.toLowerCase().includes('united states')) {
      selectedValue = findBestMatch(optionTexts, ['no', 'i don\'t require', 'don\'t require', 'not required']);
    } else if (profile.workAuth) {
      selectedValue = findBestMatch(optionTexts, [profile.workAuth.toLowerCase()]);
    }
  }
  
  // Check for state/province questions
  if (!selectedValue && (labelText.includes('state') || labelText.includes('province'))) {
    if (profile.state) {
      selectedValue = findBestMatch(optionTexts, [profile.state.toLowerCase()]);
    }
  }
  
  // Check for city questions
  if (!selectedValue && labelText.includes('city')) {
    if (profile.city) {
      selectedValue = findBestMatch(optionTexts, [profile.city.toLowerCase()]);
    }
  }
  
  // Check for work authorization
  if (!selectedValue && (labelText.includes('work.?auth') || labelText.includes('authorization') || labelText.includes('eligible') || labelText.includes('authorized'))) {
    if (profile.workAuth) {
      selectedValue = findBestMatch(optionTexts, [profile.workAuth.toLowerCase(), 'yes', 'true', 'authorized']);
    }
  }
  
  // Check for "How did you hear about us?" type questions
  if (!selectedValue && (labelText.includes('hear about') || labelText.includes('referred') || labelText.includes('source') || labelText.includes('found us'))) {
    // Try common default values
    selectedValue = findBestMatch(optionTexts, ['linkedin', 'job board', 'company website', 'other', 'prefer not to answer']);
  }
  
  // Check for job title
  if (!selectedValue && (labelText.includes('job') || labelText.includes('title') || labelText.includes('position'))) {
    // Don't auto-select job title as it's too generic
  }
  
  // Check for years of experience
  if (!selectedValue && (labelText.includes('experience') || labelText.includes('years'))) {
    // Could be customized based on profile.experience if we add that field
  }
  
  if (selectedValue) {
    select.value = selectedValue;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));
    // Trigger additional events that some frameworks (React, Vue) might need
    select.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log('✓ Dropdown filled:', labelText.substring(0, 60), '→', selectedValue);
    return true;
  }
  
  return false;
}

// Helper function to find best matching option
function findBestMatch(optionTexts, searchTerms) {
  if (!optionTexts || optionTexts.length === 0) return null;
  
  for (const term of searchTerms) {
    if (!term) continue;
    
    // Exact match (case-insensitive)
    const exactMatch = optionTexts.find(o => o.text === term.toLowerCase().trim());
    if (exactMatch) {
      console.log('Exact match found:', term, '→', exactMatch.value);
      return exactMatch.value;
    }
    
    // Partial match - check if option includes the term or term includes option
    const partialMatch = optionTexts.find(o => {
      const oText = o.text.trim();
      const tText = term.toLowerCase().trim();
      return oText.includes(tText) || tText.includes(oText) || 
             (oText.split(' ')[0] && tText.includes(oText.split(' ')[0]));
    });
    if (partialMatch) {
      console.log('Partial match found:', term, '→', partialMatch.value);
      return partialMatch.value;
    }
  }
  
  return null;
}

// Find and select a positive/affirmative option in a dropdown
function findPositiveOption(optionTexts) {
  if (!optionTexts || optionTexts.length === 0) return null;
  
  const positiveKeywords = ['yes', 'true', 'apply', 'submit', 'continue', 'confirm', 'ok', 'agree', 'accept'];
  
  for (const term of positiveKeywords) {
    const match = optionTexts.find(o => o.text.includes(term));
    if (match) {
      console.log('✓ Selected positive option:', match.original);
      return match.value;
    }
  }

  // If no positive keyword, skip the first option (usually "-- Select --") and select the next one
  if (optionTexts.length > 1) {
    return optionTexts[1].value;
  }

  return null;
}

// Fill form fields with data
function fillField(selector, value) {
  if (!value) return;
  
  const elements = document.querySelectorAll(selector);
  elements.forEach(element => {
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
      element.value = value;
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else if (element.tagName === 'SELECT') {
      const option = Array.from(element.options).find(opt => 
        opt.textContent.toLowerCase().includes(value.toLowerCase()) ||
        opt.value.toLowerCase().includes(value.toLowerCase())
      );
      if (option) {
        element.value = option.value;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      }
    }
  });
}

// Attach file to form field
function attachFileToField(selector, fileData) {
  const fileInputs = document.querySelectorAll(selector);
  fileInputs.forEach(input => {
    if (input.type === 'file') {
      // Create a File object from base64 data
      const byteString = atob(fileData.data.split(',')[1]);
      const mimeString = fileData.data.split(',')[0].match(/:(.*?);/)[1];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], fileData.name, { type: mimeString });
      
      // Set file to input
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      input.files = dataTransfer.files;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
}

// Fill application form with user data and documents
function fillApplicationForm(userData, documentData) {
  // Map common form field patterns
  const fieldMappings = {
    'email|mail': userData.email,
    'first.?name|fname': userData.firstName,
    'last.?name|lname': userData.lastName,
    'phone|mobile|contact': userData.phone,
    'address|street': userData.address,
    'city': userData.city,
    'state|province': userData.state,
    'zip|postal': userData.zipCode,
    'job.?title|position': userData.jobTitle,
    'work.?auth|authorization': userData.workAuth
  };
  
  // Find and fill form fields
  const inputs = document.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"], textarea, select');
  inputs.forEach(input => {
    const label = input.previousElementSibling?.textContent?.toLowerCase() || '';
    const name = (input.name || input.id || '').toLowerCase();
    const placeholder = (input.placeholder || '').toLowerCase();
    
    for (const [pattern, value] of Object.entries(fieldMappings)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(label) || regex.test(name) || regex.test(placeholder)) {
        fillField(`#${input.id || input.name}`, value);
        break;
      }
    }
  });
  
  // Attach resume
  if (documentData.resume) {
    attachResumeToForm(documentData.resume);
  }
  
  // Attach cover letter
  if (documentData.coverLetter) {
    attachCoverLetterToForm(documentData.coverLetter);
  }
}

function attachResumeToForm(resumeData) {
  // Common resume/CV field selectors
  const selectors = [
    'input[type="file"][name*="resume"]',
    'input[type="file"][name*="cv"]',
    'input[type="file"][accept*="pdf"]',
    'input[type="file"]',
    '[data-testid*="resume"]',
    '[aria-label*="resume"]',
    '[aria-label*="cv"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      attachFileToField(selector, resumeData);
      return;
    }
  }
}

function attachCoverLetterToForm(coverLetterData) {
  // Common cover letter field selectors
  const selectors = [
    'input[type="file"][name*="cover"]',
    'input[type="file"][name*="letter"]',
    '[data-testid*="cover"]',
    '[aria-label*="cover"]',
    '[aria-label*="letter"]'
  ];
  
  for (const selector of selectors) {
    const element = document.querySelector(selector);
    if (element) {
      attachFileToField(selector, coverLetterData);
      return;
    }
  }
}

async function applyWithDocument(docType, fileId) {
  // Get document data from background
  chrome.runtime.sendMessage({
    action: 'getDocumentData',
    docType: docType,
    fileId: fileId
  }, (response) => {
    if (response.document) {
      const documentData = {
        [docType === 'resume' ? 'resume' : 'coverLetter']: response.document
      };
      fillApplicationForm({}, documentData);
    }
  });
}

// Fill job application form with selected documents
function fillJobApplicationForm(resumeId, coverLetterId) {
  const documentData = {};
  let pendingRequests = 0;
  
  if (resumeId) {
    pendingRequests++;
    chrome.runtime.sendMessage({
      action: 'getDocumentData',
      docType: 'resume',
      fileId: resumeId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting resume:', chrome.runtime.lastError);
      } else if (response && response.document) {
        console.log('Got resume document:', response.document.name);
        documentData.resume = response.document;
      }
      pendingRequests--;
      if (pendingRequests === 0) {
        attachDocumentsToForm(documentData);
      }
    });
  }
  
  if (coverLetterId) {
    pendingRequests++;
    chrome.runtime.sendMessage({
      action: 'getDocumentData',
      docType: 'coverLetter',
      fileId: coverLetterId
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.error('Error getting cover letter:', chrome.runtime.lastError);
      } else if (response && response.document) {
        console.log('Got cover letter document:', response.document.name);
        documentData.coverLetter = response.document;
      }
      pendingRequests--;
      if (pendingRequests === 0) {
        attachDocumentsToForm(documentData);
      }
    });
  }
  
  if (pendingRequests === 0) {
    attachDocumentsToForm(documentData);
  }
}

// Attach documents to the form
function attachDocumentsToForm(documentData) {
  // Find all file inputs on the page
  const fileInputs = document.querySelectorAll('input[type="file"]');
  
  let resumeAttached = false;
  let coverLetterAttached = false;
  
  fileInputs.forEach(input => {
    const label = input.previousElementSibling?.textContent?.toLowerCase() || '';
    const name = (input.name || input.id || '').toLowerCase();
    const accept = (input.accept || '').toLowerCase();
    
    // Match resume field
    if (!resumeAttached && documentData.resume && 
        (name.includes('resume') || name.includes('cv') || label.includes('resume') || label.includes('cv'))) {
      attachFileToInput(input, documentData.resume);
      resumeAttached = true;
    }
    // Match cover letter field
    else if (!coverLetterAttached && documentData.coverLetter && 
             (name.includes('cover') || name.includes('letter') || label.includes('cover') || label.includes('letter'))) {
      attachFileToInput(input, documentData.coverLetter);
      coverLetterAttached = true;
    }
  });
  
  // If no specific fields found, try generic file inputs
  if (!resumeAttached && documentData.resume && fileInputs.length > 0) {
    attachFileToInput(fileInputs[0], documentData.resume);
  }
  if (!coverLetterAttached && documentData.coverLetter && fileInputs.length > 1) {
    attachFileToInput(fileInputs[1], documentData.coverLetter);
  }
}

// Attach a single file to a file input
function attachFileToInput(input, fileData) {
  try {
    console.log('Attaching file:', fileData.name);
    
    if (!fileData.data) {
      console.error('No file data available');
      return;
    }
    
    // Handle data URL format
    let byteString, mimeString;
    if (fileData.data.includes('data:')) {
      const parts = fileData.data.split(',');
      byteString = atob(parts[1]);
      const mimeMatch = parts[0].match(/:(.*?);/);
      mimeString = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    } else {
      // If it's already base64 without the data: prefix
      byteString = atob(fileData.data);
      mimeString = fileData.type || 'application/octet-stream';
    }
    
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], fileData.name, { type: mimeString });
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    input.files = dataTransfer.files;
    input.dispatchEvent(new Event('change', { bubbles: true }));
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    console.log('File attached successfully:', fileData.name);
  } catch (error) {
    console.error('Error attaching file:', error, fileData);
  }
}

/**
 * Find and click the apply/submit button on the job application form
 */
function findAndClickApplyButton() {
  // Common apply button patterns (in priority order)
  const applySelectors = [
    // Text content patterns
    'button:contains("Apply For This Job")',
    'button:contains("Apply Now")',
    'button:contains("Submit Application")',
    'button:contains("Submit")',
    'button:contains("Apply")',
    'button:contains("Send Application")',
    'button:contains("Apply for")',
    
    // By class/id
    '[class*="apply"][class*="button"]',
    '[id*="apply"][id*="button"]',
    'button[class*="apply"]',
    'button[id*="apply"]',
    '[role="button"][aria-label*="apply" i]',
    '[role="button"][aria-label*="submit" i]',
    
    // Link-based
    'a:contains("Apply")',
    'a[href*="apply"]'
  ];

  // Try each selector
  for (const selector of applySelectors) {
    try {
      // For :contains selectors, we need custom logic
      if (selector.includes(':contains')) {
        const text = selector.match(/:contains\("([^"]+)"\)/)[1];
        const buttons = document.querySelectorAll('button, a, [role="button"]');
        
        for (const btn of buttons) {
          if (btn.textContent.includes(text) && btn.offsetParent !== null) {
            console.log(`✓ Found apply button: "${text}"`);
            btn.click();
            return { success: true, button: text };
          }
        }
      } else {
        // Regular selector
        const element = document.querySelector(selector);
        if (element && element.offsetParent !== null) {
          const buttonText = element.textContent.trim().substring(0, 50);
          console.log(`✓ Found apply button: "${buttonText}"`);
          element.click();
          return { success: true, button: buttonText };
        }
      }
    } catch (e) {
      // Selector failed, try next one
      continue;
    }
  }

  console.log('⚠ Could not find apply button on this page');
  return { success: false, message: 'Apply button not found' };
}

// Fill form with user profile information
function fillFormWithProfile(profile) {
  console.log('📝 Filling form with profile:', profile);
  
  // Get common questions answers too
  chrome.storage.local.get(['commonQuestions'], (result) => {
    const commonQuestions = result.commonQuestions || {};
    
    // Get all form inputs, textareas, selects
    const inputs = document.querySelectorAll('input, textarea, select');
    let filledCount = 0;
    
    inputs.forEach(input => {
      // Skip certain input types
      if (input.type === 'submit' || input.type === 'button' || input.type === 'hidden' || input.type === 'file') {
        return;
      }

      // Get multiple label sources
      const label = input.previousElementSibling?.textContent?.toLowerCase() || '';
      const name = (input.name || input.id || '').toLowerCase();
      const placeholder = (input.placeholder || '').toLowerCase();
      const ariaLabel = (input.getAttribute('aria-label') || '').toLowerCase();
      const dataLabel = (input.getAttribute('data-label') || '').toLowerCase();
      
      // Get label associated with radio/checkbox
      const associatedLabel = document.querySelector(`label[for="${input.id}"]`)?.textContent?.toLowerCase() || '';
      
      // Get fieldset legend for grouped fields
      const fieldsetLegend = input.closest('fieldset')?.querySelector('legend')?.textContent?.toLowerCase() || '';
      
      const searchText = label + ' ' + name + ' ' + placeholder + ' ' + ariaLabel + ' ' + dataLabel + ' ' + associatedLabel + ' ' + fieldsetLegend;

      // Handle SELECT (dropdowns)
      if (input.tagName === 'SELECT') {
        if (fillSelectField(input, profile, commonQuestions, searchText)) {
          filledCount++;
        }
        return;
      }

      // Handle RADIO buttons
      if (input.type === 'radio') {
        if (fillRadioButton(input, profile, commonQuestions, searchText)) {
          filledCount++;
        }
        return;
      }

      // Handle CHECKBOXES
      if (input.type === 'checkbox') {
        if (fillCheckbox(input, profile, commonQuestions, searchText)) {
          filledCount++;
        }
        return;
      }

      // Handle TEXT inputs and TEXTAREA
      if (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA') {
        if (fillTextField(input, profile, commonQuestions, searchText)) {
          filledCount++;
        }
        return;
      }
    });

    console.log(`✓ Filled ${filledCount} form fields`);
  });
}

/**
 * Fill a radio button
 */
function fillRadioButton(radio, profile, commonQuestions, searchText) {
  // Get all radio buttons in the same group
  const radioName = radio.name;
  const radioGroup = document.querySelectorAll(`input[type="radio"][name="${radioName}"]`);
  
  if (radioGroup.length === 0) return false;

  // Get the question/context for this radio group
  let questionText = searchText.toLowerCase();
  
  // Try to find the label/legend for this radio group
  const parentFieldset = radio.closest('fieldset');
  const parentLabel = radio.closest('label');
  
  if (parentFieldset) {
    const legend = parentFieldset.querySelector('legend');
    if (legend) {
      questionText = legend.textContent.toLowerCase() + ' ' + questionText;
    }
  }
  
  let valueToSelect = null;

  // Check common patterns
  if (questionText.includes('yes') || questionText.includes('willing') || questionText.includes('authorized') || questionText.includes('agree')) {
    // Try to find "Yes" option
    valueToSelect = findRadioOption(radioGroup, ['yes', 'true', 'agree', 'authorized', 'i am', 'i have']);
  } else if (questionText.includes('no') || questionText.includes('require') || questionText.includes('sponsorship')) {
    // Try to find "No" option for sponsorship questions
    if (profile.country && profile.country.toLowerCase().includes('united states')) {
      valueToSelect = findRadioOption(radioGroup, ['no', 'false', 'i don\'t', 'not required']);
    }
  }

  // Special handling for work location region question
  // "Which of these three locations will you be working from?"
  if (!valueToSelect && (questionText.includes('location') && questionText.includes('working from'))) {
    if (profile.country) {
      const countryLower = profile.country.toLowerCase();
      if (countryLower.includes('united states') || countryLower.includes('us') || countryLower.includes('usa') || countryLower.includes('north america') || countryLower.includes('canada')) {
        valueToSelect = findRadioOption(radioGroup, ['north america']);
      } else if (countryLower.includes('europe')) {
        valueToSelect = findRadioOption(radioGroup, ['europe']);
      } else if (countryLower.includes('south america') || countryLower.includes('brazil') || countryLower.includes('argentina')) {
        valueToSelect = findRadioOption(radioGroup, ['south america']);
      } else if (countryLower.includes('asia')) {
        valueToSelect = findRadioOption(radioGroup, ['asia']);
      }
      if (valueToSelect) {
        console.log(`✓ Matched location region: ${profile.country} → ${valueToSelect}`);
      }
    }
  }

  // Try profile-based matching
  if (!valueToSelect && profile.workAuth && (questionText.includes('auth') || questionText.includes('authorized'))) {
    valueToSelect = findRadioOption(radioGroup, [profile.workAuth.toLowerCase(), 'yes', 'true']);
    if (valueToSelect) {
      console.log(`✓ Matched workAuth: ${profile.workAuth}`);
    }
  }

  // Try FAQ matching
  if (!valueToSelect && commonQuestions) {
    for (const [question, answer] of Object.entries(commonQuestions)) {
      const questionLower = question.toLowerCase();
      if (questionText.includes(questionLower.substring(0, 15)) || 
          questionLower.substring(0, 15).split(' ').some(word => questionText.includes(word))) {
        valueToSelect = findRadioOption(radioGroup, [answer.toLowerCase()]);
        if (valueToSelect) {
          console.log(`✓ Matched FAQ radio: "${question}" → ${valueToSelect}`);
          break;
        }
      }
    }
  }

  // Default to positive option if still no match
  if (!valueToSelect) {
    valueToSelect = findRadioOption(radioGroup, ['yes', 'true', 'agree', 'authorized']);
  }

  // Select the matching radio
  if (valueToSelect) {
    const selectedRadio = Array.from(radioGroup).find(r => r.value === valueToSelect);
    if (selectedRadio) {
      selectedRadio.checked = true;
      selectedRadio.dispatchEvent(new Event('change', { bubbles: true }));
      selectedRadio.dispatchEvent(new Event('input', { bubbles: true }));
      selectedRadio.dispatchEvent(new Event('click', { bubbles: true }));
      console.log(`✓ Selected radio: ${valueToSelect}`);
      return true;
    }
  }

  return false;
}

/**
 * Find matching radio option value
 */
function findRadioOption(radioGroup, searchTerms) {
  for (const radio of radioGroup) {
    const radioText = radio.value.toLowerCase();
    const radioLabel = document.querySelector(`label[for="${radio.id}"]`)?.textContent?.toLowerCase() || '';
    const fullText = radioText + ' ' + radioLabel;

    for (const term of searchTerms) {
      if (!term) continue;
      
      // Exact match
      if (radioText === term || radioLabel === term) {
        return radio.value;
      }
      
      // Partial match
      if (fullText.includes(term)) {
        return radio.value;
      }
    }
  }
  return null;
}

/**
 * Fill a checkbox
 */
function fillCheckbox(checkbox, profile, commonQuestions, searchText) {
  // Get checkbox context
  let questionText = searchText.toLowerCase();
  const parentFieldset = checkbox.closest('fieldset');
  
  if (parentFieldset) {
    const legend = parentFieldset.querySelector('legend');
    if (legend) {
      questionText = legend.textContent.toLowerCase() + ' ' + questionText;
    }
  }

  // Check if this checkbox should be checked
  let shouldCheck = false;

  // Pattern-based matching
  if (questionText.includes('agree') || questionText.includes('accept') || questionText.includes('confirm')) {
    // Agreement checkboxes should be checked
    shouldCheck = true;
  }

  // Work authorization related
  if (!shouldCheck && (questionText.includes('auth') || questionText.includes('work') || questionText.includes('authorized'))) {
    if (profile.workAuth) {
      const checkboxLabel = document.querySelector(`label[for="${checkbox.id}"]`)?.textContent?.toLowerCase() || '';
      shouldCheck = !checkboxLabel.includes('require') && !checkboxLabel.includes('sponsorship');
    } else {
      shouldCheck = true;
    }
  }

  // Work location related
  if (!shouldCheck && (questionText.includes('location') || questionText.includes('work from'))) {
    // Try to match with profile location
    if (profile.country || profile.city) {
      const checkboxLabel = document.querySelector(`label[for="${checkbox.id}"]`)?.textContent?.toLowerCase() || '';
      const checkboxValue = checkbox.value.toLowerCase();
      
      if (profile.country && (checkboxLabel.includes(profile.country.toLowerCase()) || checkboxValue.includes(profile.country.toLowerCase()))) {
        shouldCheck = true;
      } else if (profile.city && (checkboxLabel.includes(profile.city.toLowerCase()) || checkboxValue.includes(profile.city.toLowerCase()))) {
        shouldCheck = true;
      }
    }
  }

  // FAQ matching for checkboxes
  if (!shouldCheck && commonQuestions) {
    for (const [question, answer] of Object.entries(commonQuestions)) {
      const questionLower = question.toLowerCase();
      const answerLower = answer.toLowerCase();
      
      if (questionText.includes(questionLower.substring(0, 15))) {
        shouldCheck = answerLower.includes('yes') || answerLower.includes('true') || answerLower.includes('agree');
        if (shouldCheck) {
          console.log(`✓ Matched FAQ checkbox: "${question}" → checked`);
          break;
        }
      }
    }
  }

  // Apply the checkbox state
  if (shouldCheck) {
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
    checkbox.dispatchEvent(new Event('input', { bubbles: true }));
    checkbox.dispatchEvent(new Event('click', { bubbles: true }));
    console.log(`✓ Checked checkbox: ${searchText.substring(0, 40)}`);
    return true;
  }

  return false;
}

/**
 * Fill a text input or textarea field
 */
function fillTextField(input, profile, commonQuestions, searchText) {
  // Check if field is already filled
  if (input.value && input.value.trim().length > 0) {
    return false;
  }

  let value = null;

  // Profile fields - prioritized
  // SPECIAL CASE: "Name" field should be firstName + lastName combined
  if (!value && profile.firstName && profile.lastName && (searchText.includes('name') && !searchText.includes('first') && !searchText.includes('last') && !searchText.includes('company'))) {
    value = profile.firstName + ' ' + profile.lastName;
    console.log(`✓ Filled Name field: ${value}`);
  } else if (!value && profile.companyName && (searchText.includes('company') || searchText.includes('employer') || searchText.includes('organization'))) {
    value = profile.companyName;
  } else if (!value && profile.jobTitle && (searchText.includes('job') || searchText.includes('title') || searchText.includes('position') || searchText.includes('role'))) {
    value = profile.jobTitle;
  } else if (!value && profile.firstName && (searchText.includes('first') || searchText.includes('fname') || searchText.includes('given') || searchText.includes('name') && searchText.includes('first'))) {
    value = profile.firstName;
  } else if (!value && profile.lastName && (searchText.includes('last') || searchText.includes('lname') || searchText.includes('family') || searchText.includes('surname'))) {
    value = profile.lastName;
  } else if (!value && profile.email && (searchText.includes('email') || searchText.includes('mail') || searchText.includes('e-mail'))) {
    value = profile.email;
  } else if (!value && profile.phone && (searchText.includes('phone') || searchText.includes('mobile') || searchText.includes('contact') || searchText.includes('telephone') || searchText.includes('number'))) {
    value = profile.phone;
  } else if (!value && profile.address && (searchText.includes('address') || searchText.includes('street'))) {
    value = profile.address;
  } else if (!value && profile.city && (searchText.includes('city') || (searchText.includes('location') && !searchText.includes('work location')))) {
    value = profile.city;
  } else if (!value && profile.state && (searchText.includes('state') || searchText.includes('province') || searchText.includes('region'))) {
    value = profile.state;
  } else if (!value && profile.zipCode && (searchText.includes('zip') || searchText.includes('postal') || searchText.includes('postcode'))) {
    value = profile.zipCode;
  } else if (!value && profile.country && (searchText.includes('country') || searchText.includes('nation'))) {
    value = profile.country;
  } else if (!value && profile.linkedinProfile && (searchText.includes('linkedin') || (searchText.includes('profile') && !searchText.includes('job') && !searchText.includes('company')))) {
    value = profile.linkedinProfile;
  } else if (!value && profile.workAuth && (searchText.includes('auth') || searchText.includes('sponsorship') || (searchText.includes('work') && searchText.includes('location')))) {
    value = profile.workAuth;
  }

  // Common questions - if no profile field matched
  if (!value && commonQuestions && Object.keys(commonQuestions).length > 0) {
    // Try to match common question answers
    for (const [question, answer] of Object.entries(commonQuestions)) {
      const questionLower = question.toLowerCase();
      // Try to find matching question in the search text
      if (searchText.includes(questionLower.substring(0, 20)) || 
          searchText.includes(question.toLowerCase().substring(0, 15)) ||
          questionLower.substring(0, 15).split(' ').some(word => searchText.includes(word))) {
        value = answer;
        console.log(`✓ Matched FAQ: "${question}" → "${answer.substring(0, 30)}"`);
        break;
      }
    }
  }

  // If still no value, don't fill
  if (!value) {
    return false;
  }

  // Fill the field
  input.value = value;
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
  input.dispatchEvent(new Event('blur', { bubbles: true }));

  console.log(`✓ Filled field: ${searchText.substring(0, 40).trim()} → ${value.substring(0, 20)}`);
  return true;
}

/**
 * Fill a select (dropdown) field
 */
function fillSelectField(select, profile, commonQuestions, searchText) {
  // Get all options
  const options = Array.from(select.options);
  const optionTexts = options.map(o => ({ text: o.textContent.toLowerCase().trim(), value: o.value, original: o.textContent }));

  let selectedValue = null;

  console.log(`🔍 Dropdown: "${searchText.substring(0, 60)}" with options: [${optionTexts.slice(0, 3).map(o => o.original).join(', ')}...]`);

  // Try profile-based matching first
  if (profile.country && (searchText.includes('country') || searchText.includes('nation') || searchText.includes('location') && !searchText.includes('work'))) {
    selectedValue = findBestMatch(optionTexts, [profile.country.toLowerCase(), profile.country]);
    if (selectedValue) console.log(`✓ Matched country: ${profile.country}`);
  } 
  
  if (!selectedValue && profile.state && (searchText.includes('state') || searchText.includes('province'))) {
    selectedValue = findBestMatch(optionTexts, [profile.state.toLowerCase(), profile.state]);
    if (selectedValue) console.log(`✓ Matched state: ${profile.state}`);
  } 
  
  if (!selectedValue && profile.city && searchText.includes('city')) {
    selectedValue = findBestMatch(optionTexts, [profile.city.toLowerCase()]);
    if (selectedValue) console.log(`✓ Matched city: ${profile.city}`);
  }

  // Work authorization questions
  if (!selectedValue && (searchText.includes('authorized') || searchText.includes('authorization') || searchText.includes('work in'))) {
    if (profile.workAuth) {
      selectedValue = findBestMatch(optionTexts, [profile.workAuth.toLowerCase(), 'yes', 'true']);
      if (selectedValue) console.log(`✓ Matched workAuth: ${profile.workAuth}`);
    }
    if (!selectedValue) {
      selectedValue = findBestMatch(optionTexts, ['yes', 'true', 'authorized', 'i am']);
    }
  }

  // How did you hear about us / referral
  if (!selectedValue && (searchText.includes('hear') || searchText.includes('referred') || searchText.includes('source') || searchText.includes('found'))) {
    // Try FAQ first
    if (commonQuestions && commonQuestions['How did you hear about us?']) {
      selectedValue = findBestMatch(optionTexts, [commonQuestions['How did you hear about us?'].toLowerCase()]);
      if (selectedValue) console.log(`✓ Matched from FAQ: ${commonQuestions['How did you hear about us?']}`);
    }
    // Fallback to common values
    if (!selectedValue) {
      selectedValue = findBestMatch(optionTexts, ['linkedin', 'job board', 'indeed', 'company website', 'other', 'referral', 'recommend']);
    }
  }

  // Work location questions
  if (!selectedValue && (searchText.includes('work') && searchText.includes('location'))) {
    if (profile.country) {
      const country = profile.country.toLowerCase();
      if (country.includes('united states') || country.includes('us') || country.includes('usa') || country.includes('north america')) {
        selectedValue = findBestMatch(optionTexts, ['north america', 'us', 'united states', 'usa']);
      } else if (country.includes('canada')) {
        selectedValue = findBestMatch(optionTexts, ['north america', 'canada']);
      } else if (country.includes('europe')) {
        selectedValue = findBestMatch(optionTexts, ['europe']);
      } else if (country.includes('south america') || country.includes('brazil') || country.includes('argentina')) {
        selectedValue = findBestMatch(optionTexts, ['south america']);
      } else if (country.includes('asia')) {
        selectedValue = findBestMatch(optionTexts, ['asia']);
      }
      if (selectedValue) console.log(`✓ Matched work location: ${profile.country}`);
    }
  }

  // Sponsorship / Visa questions
  if (!selectedValue && (searchText.includes('sponsorship') || searchText.includes('visa') || searchText.includes('require'))) {
    if (profile.country && profile.country.toLowerCase().includes('united states')) {
      selectedValue = findBestMatch(optionTexts, ['no', 'i don\'t require', 'don\'t require', 'not required']);
    }
    if (!selectedValue) {
      selectedValue = findBestMatch(optionTexts, ['no', 'false']);
    }
  }

  // Try common questions matching
  if (!selectedValue && commonQuestions && Object.keys(commonQuestions).length > 0) {
    for (const [question, answer] of Object.entries(commonQuestions)) {
      const questionLower = question.toLowerCase();
      const questionWords = questionLower.split(' ').filter(w => w.length > 3);
      
      // Check if any significant words from the question match the search text
      const hasMatch = questionWords.some(word => searchText.includes(word));
      
      if (hasMatch || searchText.includes(questionLower.substring(0, 15))) {
        selectedValue = findBestMatch(optionTexts, [answer.toLowerCase()]);
        if (selectedValue) {
          console.log(`✓ Matched FAQ: "${question}" → "${answer}"`);
          break;
        }
      }
    }
  }

  // If still no match and field is required, select first "positive" option
  if (!selectedValue) {
    selectedValue = findPositiveOption(optionTexts);
    if (selectedValue) console.log(`✓ Selected positive option`);
  }

  // If we found a value, select it
  if (selectedValue) {
    select.value = selectedValue;
    select.dispatchEvent(new Event('change', { bubbles: true }));
    select.dispatchEvent(new Event('input', { bubbles: true }));
    select.dispatchEvent(new Event('blur', { bubbles: true }));
    console.log(`✓ Dropdown filled: ${searchText.substring(0, 40).trim()}`);
    return true;
  }

  return false;
}

/**
 * Find a positive/affirmative option in a dropdown
 */
function findPositiveOption(optionTexts) {
  const positiveKeywords = ['yes', 'true', 'apply', 'submit', 'continue', 'confirm', 'ok'];
  
  for (const term of positiveKeywords) {
    const match = optionTexts.find(o => o.text.includes(term));
    if (match) {
      console.log(`✓ Selected positive option: ${match.original}`);
      return match.value;
    }
  }

  // If no positive keyword, just select the second option (skipping "-- Select --")
  if (optionTexts.length > 1) {
    return optionTexts[1].value;
  }

  return null;
}

// Apply with both profile and documents
function applyWithDocuments(profile, resumeId, coverLetterId) {
  console.log('applyWithDocuments called with:', { resumeId, coverLetterId, hasProfile: !!profile });
  
  let shouldClickApply = false;
  
  // Fill profile information
  if (profile && Object.keys(profile).length > 0) {
    console.log('Filling form with profile...');
    fillFormWithProfile(profile);
    shouldClickApply = false; // fillFormWithProfile already tries to click apply
  }
  
  // Fill job application form with documents
  if (resumeId || coverLetterId) {
    console.log('Filling form with documents...');
    fillJobApplicationForm(resumeId, coverLetterId);
    shouldClickApply = true; // Documents were added, click apply if not already clicked
  } else {
    console.log('No documents to fill');
  }
  
  // If documents were filled, try to click apply button
  if (shouldClickApply && (!profile || Object.keys(profile).length === 0)) {
    console.log('✓ Documents filled, looking for apply button...');
    const applyResult = findAndClickApplyButton();
    if (applyResult.success) {
      console.log('✓ Apply button clicked!');
    } else {
      console.log('⚠ Apply button not found - user may need to click manually');
    }
  }
}
// ============ AUTO-APPLY FLOW ============

/**
 * Auto-apply workflow orchestration
 * Handles multi-step forms with automatic navigation and submission
 */
async function executeAutoApplyFlow(request) {
  try {
    console.log('Starting auto-apply flow...');
    const userProfile = request.userProfile || {};
    const maxSteps = request.maxSteps || 10;
    let stepCount = 0;

    // Repeatedly fill forms and click next button
    while (stepCount < maxSteps) {
      stepCount++;
      console.log(`Auto-apply step ${stepCount}`);

      // Check if all forms are filled (indicates we're at the end)
      const forms = document.querySelectorAll('form');
      if (forms.length === 0) {
        console.log('No forms found - application may be complete');
        return { success: true, message: 'Application flow completed' };
      }

      // Fill all forms on current page
      if (window.formFillerEngine) {
        await window.formFillerEngine.fillAllForms(userProfile, {
          useAI: useAIAnswers,
          overwrite: false
        });
      } else {
        // Fallback to basic form filling
        fillFormWithProfile(userProfile);
      }

      // Wait a bit for form to process
      await delay(1000);

      // Check for submit button (final step)
      if (window.buttonNavigator) {
        const submitButton = window.buttonNavigator.findSubmitButton();
        if (submitButton && window.buttonNavigator.isClickable(submitButton)) {
          console.log('Found submit button - clicking to submit application');
          const result = await window.buttonNavigator.clickButton(submitButton, { delay: 2000 });
          return { 
            success: result.success,
            message: result.success ? 'Application submitted successfully!' : 'Error submitting application'
          };
        }

        // Click next/continue button
        const nextButton = window.buttonNavigator.findNextButton();
        if (nextButton) {
          console.log('Found next button - proceeding to next step');
          const result = await window.buttonNavigator.clickButton(nextButton, { delay: 2000 });
          if (!result.success) {
            return { success: false, message: 'Failed to click next button', step: stepCount };
          }
        } else {
          // No next button found, try to find any clickable button
          const allButtons = window.buttonNavigator.findAllButtons();
          const clickableBtn = allButtons.find(b => b.clickable && !b.text.toLowerCase().includes('cancel'));
          if (clickableBtn) {
            console.log(`Clicking button: ${clickableBtn.text}`);
            const result = await window.buttonNavigator.clickButton(clickableBtn.element, { delay: 2000 });
            if (!result.success) {
              return { success: false, message: 'Failed to click button', step: stepCount };
            }
          } else {
            console.log('No more buttons to click');
            return { success: true, message: 'Application appears to be complete', steps: stepCount };
          }
        }
      } else {
        console.log('Button navigator not loaded - cannot proceed');
        return { success: false, message: 'Button navigator module not available' };
      }

      // Wait for page transition/new form to load
      await delay(2000);
    }

    return { success: false, message: 'Max steps reached without completing application', steps: maxSteps };
  } catch (error) {
    console.error('Error in auto-apply flow:', error);
    return { success: false, error: error.message };
  }
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Manual apply flow - fill form and let user click buttons
 */
function executeManualApplyFlow(request) {
  const userProfile = request.userProfile || {};

  try {
    // Just fill the form - user will click buttons manually
    if (window.formFillerEngine) {
      window.formFillerEngine.fillAllForms(userProfile, {
        useAI: useAIAnswers,
        overwrite: false
      });
    } else {
      fillFormWithProfile(userProfile);
    }

    console.log('Form filled - waiting for user to click continue/next');
    return { success: true, message: 'Form filled successfully! Please click continue/next.' };
  } catch (error) {
    console.error('Error in manual apply flow:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Detect if a job application was successfully submitted
 * Checks for success page indicators, URL changes, and confirmation messages
 */
function detectSubmissionSuccess() {
  const indicators = {
    // Success page indicators
    successMessages: [
      'application.*received',
      'application.*submitted',
      'application.*success',
      'thank.*you',
      'confirmation',
      'submitted.*success',
      'we.*received.*your.*application',
      'application.*complete',
      'application.*sent',
      'submission.*confirmed'
    ],
    
    // URL patterns for success pages
    successUrls: [
      'confirmation',
      'success',
      'thank-you',
      'thankyou',
      'submitted',
      'application-received',
      'complete'
    ],
    
    // DOM selectors for success indicators
    successElements: [
      '.confirmation-page',
      '.success-page',
      '.thank-you-page',
      '[data-testid*="confirmation"]',
      '[data-testid*="success"]',
      '.success-message',
      '.confirmation-message',
      'h1:contains("thank")',
      'h1:contains("success")',
      'h1:contains("confirmation")'
    ]
  };
  
  // Check page text for success messages
  const pageText = document.body.innerText.toLowerCase();
  const hasSuccessMessage = indicators.successMessages.some(pattern => {
    return new RegExp(pattern, 'i').test(pageText);
  });
  
  // Check URL for success indicators
  const url = window.location.href.toLowerCase();
  const hasSuccessUrl = indicators.successUrls.some(pattern => {
    return url.includes(pattern.toLowerCase());
  });
  
  // Check for success elements
  const hasSuccessElement = indicators.successElements.some(selector => {
    try {
      return document.querySelector(selector) !== null;
    } catch (e) {
      return false;
    }
  });
  
  // Check for typical success page patterns
  const hasConfirmationText = /thank you|application received|submitted successfully|confirmation/i.test(pageText);
  const noFormElement = document.querySelectorAll('form').length === 0;
  
  const isSuccess = hasSuccessMessage || hasSuccessUrl || hasSuccessElement || (hasConfirmationText && noFormElement);
  
  if (isSuccess) {
    console.log('✅ SUCCESS DETECTED: Application appears to have been submitted successfully');
    console.log({
      successMessage: hasSuccessMessage,
      successUrl: hasSuccessUrl,
      successElement: hasSuccessElement,
      confirmationText: hasConfirmationText,
      noForm: noFormElement
    });
  }
  
  return isSuccess;
}

/**
 * Watch for submission and update status
 * Monitors page changes and DOM for submission indicators
 */
function initializeSubmissionMonitoring() {
  console.log('📍 Initializing submission monitoring...');
  
  // Check immediately on page load
  setTimeout(() => {
    if (detectSubmissionSuccess()) {
      updateSubmissionStatus('success');
    }
  }, 2000);
  
  // Monitor URL changes
  let lastUrl = window.location.href;
  setInterval(() => {
    if (window.location.href !== lastUrl) {
      console.log('🔄 URL changed, checking for success...');
      lastUrl = window.location.href;
      
      setTimeout(() => {
        if (detectSubmissionSuccess()) {
          updateSubmissionStatus('success');
        }
      }, 1000);
    }
  }, 1000);
  
  // Monitor DOM changes (page reloads, new content)
  const observer = new MutationObserver(() => {
    // Throttle checks to every 2 seconds
    clearTimeout(observer.checkTimeout);
    observer.checkTimeout = setTimeout(() => {
      if (detectSubmissionSuccess()) {
        updateSubmissionStatus('success');
      }
    }, 2000);
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true
  });
}

/**
 * Update submission status and notify popup
 */
function updateSubmissionStatus(status) {
  const statusData = {
    status: status,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    pageTitle: document.title
  };
  
  // Save to storage
  chrome.storage.local.set({
    lastSubmissionStatus: statusData
  }, () => {
    console.log('✓ Submission status saved:', statusData);
  });
  
  // Notify popup to update display
  try {
    chrome.runtime.sendMessage({
      action: 'submissionStatusUpdate',
      status: statusData
    }).catch(err => {
      // Popup may not be open, that's okay
      console.log('Popup not listening:', err);
    });
  } catch (err) {
    console.log('Could not send message to popup:', err);
  }
}

/**
 * Get current submission status
 */
function getSubmissionStatus(callback) {
  chrome.storage.local.get(['lastSubmissionStatus'], (data) => {
    callback(data.lastSubmissionStatus || null);
  });
}

// Start monitoring submission on page load
window.addEventListener('DOMContentLoaded', () => {
  // Delay to ensure page is fully loaded
  setTimeout(() => {
    initializeSubmissionMonitoring();
  }, 1000);
});