// Popup functionality
let currentRuleIndex = -1;
let allRules = [];
let isJobPage = false;
let applyMode = 'manual'; // 'manual' or 'auto'
let useAIAnswers = false;

// Document file size limits (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  // Add small delay to ensure DOM is fully ready
  setTimeout(() => {
    checkSubmissionStatus();
    checkIfJobPage();
    populateDocumentSelects();
    loadUserProfile();
    loadApplyModeSettings();
    loadAISettings();
    setupApplyModeListeners();
    setupAISettingsListeners();
  }, 100);
});

// Check and display submission status
function checkSubmissionStatus() {
  chrome.storage.local.get(['lastSubmissionStatus'], (data) => {
    if (data.lastSubmissionStatus && data.lastSubmissionStatus.status === 'success') {
      const status = data.lastSubmissionStatus;
      const statusDiv = document.getElementById('submissionStatus');
      const messageElement = document.getElementById('successMessage');
      const timeElement = document.getElementById('successTime');
      
      if (statusDiv && messageElement && timeElement) {
        // Format timestamp
        const submittedAt = new Date(status.timestamp);
        const timeString = submittedAt.toLocaleString();
        
        // Update UI
        messageElement.textContent = `Your application has been submitted successfully to ${status.pageTitle}.`;
        timeElement.textContent = `Submitted: ${timeString}`;
        
        // Show status section
        statusDiv.style.display = 'block';
        
        console.log('✅ Submission status displayed:', status);
      }
    }
  });
}

// Check for submission status updates periodically
setInterval(() => {
  checkSubmissionStatus();
}, 2000);

// Listen for submission status messages from content script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'submissionStatusUpdate') {
    console.log('📍 Submission status update received:', request.status);
    checkSubmissionStatus();
    sendResponse({ received: true });
  }
});

// Check if current page is a job application page
function checkIfJobPage() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const url = tabs[0].url;
    // Check if job-related keywords are in the URL or page
    const jobSites = ['indeed', 'linkedin', 'glassdoor', 'monster', 'dice', 'greenhouse', 'lever'];
    isJobPage = jobSites.some(site => url.includes(site));
    
    const applySection = document.getElementById('applySection');
    if (isJobPage) {
      applySection.style.display = 'block';
    }
  });
}

// Populate document select dropdowns
function populateDocumentSelects() {
  chrome.runtime.sendMessage({ action: 'getDocuments' }, (response) => {
    const documents = response.documents || {};
    
    // Populate resumes
    const resumeSelect = document.getElementById('resumeSelect');
    resumeSelect.innerHTML = '<option value="">-- No Resume --</option>';
    if (documents.resumes && documents.resumes.length > 0) {
      documents.resumes.forEach(resume => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ id: resume.id, type: 'resume' });
        option.textContent = resume.name;
        resumeSelect.appendChild(option);
      });
    }
    
    // Populate cover letters
    const coverLetterSelect = document.getElementById('coverLetterSelect');
    coverLetterSelect.innerHTML = '<option value="">-- No Cover Letter --</option>';
    if (documents.coverLetters && documents.coverLetters.length > 0) {
      documents.coverLetters.forEach(letter => {
        const option = document.createElement('option');
        option.value = JSON.stringify({ id: letter.id, type: 'coverLetter' });
        option.textContent = letter.name;
        coverLetterSelect.appendChild(option);
      });
    }
  });
}

// Apply button click
setTimeout(() => {
  const applyBtn = document.getElementById('applyBtn');
  if (applyBtn) {
    applyBtn.addEventListener('click', async () => {
      const applyStatus = document.getElementById('applyStatus');
      const resumeSelect = document.getElementById('resumeSelect');
      const coverLetterSelect = document.getElementById('coverLetterSelect');
      
      applyStatus.textContent = '⏳ Filling form...';
      applyStatus.style.color = '#1976d2';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      try {
        // Get user profile
        chrome.runtime.sendMessage({ action: 'getUserProfile' }, (profileResponse) => {
          if (chrome.runtime.lastError) {
            console.error('Error getting profile:', chrome.runtime.lastError);
            applyStatus.textContent = '❌ Error getting profile data';
            applyStatus.style.color = '#d32f2f';
            return;
          }
          
          const profile = profileResponse.profile || {};
          console.log('Got profile, attempting to fill form...');
          
          // Get selected documents
          let resumeId = null;
          let coverLetterId = null;
          
          if (resumeSelect.value) {
            const resumeData = JSON.parse(resumeSelect.value);
            resumeId = resumeData.id;
          }
          
          if (coverLetterSelect.value) {
            const letterData = JSON.parse(coverLetterSelect.value);
            coverLetterId = letterData.id;
          }
          
          // Send to content script to fill form with profile and documents
          chrome.tabs.sendMessage(tab.id, {
            action: 'applyWithDocuments',
            profile: profile,
            resumeId: resumeId,
            coverLetterId: coverLetterId
          }, (response) => {
            if (chrome.runtime.lastError) {
              applyStatus.textContent = '❌ Could not fill form on this page';
              applyStatus.style.color = '#d32f2f';
            } else if (response && response.success) {
              applyStatus.textContent = '✓ Form filled! Please review and submit.';
              applyStatus.style.color = '#388e3c';
            } else {
              applyStatus.textContent = '❌ Could not fill form on this page';
              applyStatus.style.color = '#d32f2f';
            }
            setTimeout(() => applyStatus.textContent = '', 3000);
          });
        });
      } catch (error) {
        applyStatus.textContent = '❌ Could not fill form on this page';
        applyStatus.style.color = '#d32f2f';
        setTimeout(() => applyStatus.textContent = '', 3000);
      }
    });
  }
}, 500);

// Tab switching - deferred initialization
setTimeout(() => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  if (tabBtns && tabBtns.length > 0) {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const tab = btn.getAttribute('data-tab');
        
        // Update active tab button
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // Update active tab content
        document.querySelectorAll('.tab-content').forEach(content => {
          content.classList.remove('active');
        });
        const tabContent = document.getElementById(tab);
        if (tabContent) {
          tabContent.classList.add('active');
        }
        
        if (tab === 'rules') {
          loadRules();
        } else if (tab === 'documents') {
          loadDocumentStatus();
          populateDocumentSelects();
        } else if (tab === 'profile') {
          loadUserProfile();
        }
      });
    });
  }
}, 500);

// Profile Management
function loadUserProfile() {
  chrome.runtime.sendMessage({ action: 'getUserProfile' }, (response) => {
    const profile = response.profile || {};
    document.getElementById('companyName').value = profile.companyName || '';
    document.getElementById('jobTitle').value = profile.jobTitle || '';
    document.getElementById('firstName').value = profile.firstName || '';
    document.getElementById('lastName').value = profile.lastName || '';
    document.getElementById('email').value = profile.email || '';
    document.getElementById('phone').value = profile.phone || '';
    document.getElementById('address').value = profile.address || '';
    document.getElementById('city').value = profile.city || '';
    document.getElementById('state').value = profile.state || '';
    document.getElementById('zipCode').value = profile.zipCode || '';
    document.getElementById('country').value = profile.country || '';
    document.getElementById('linkedinProfile').value = profile.linkedinProfile || '';
    document.getElementById('workAuth').value = profile.workAuth || '';
  });
}

// Profile buttons - deferred initialization
setTimeout(() => {
  const saveProfileBtn = document.getElementById('saveProfileBtn');
  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      const profile = {
        companyName: document.getElementById('companyName').value,
        jobTitle: document.getElementById('jobTitle').value,
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        city: document.getElementById('city').value,
        state: document.getElementById('state').value,
        zipCode: document.getElementById('zipCode').value,
        country: document.getElementById('country').value,
        linkedinProfile: document.getElementById('linkedinProfile').value,
        workAuth: document.getElementById('workAuth').value
      };
      
      chrome.runtime.sendMessage({ 
        action: 'saveUserProfile', 
        profile: profile 
      }, (response) => {
        const statusEl = document.getElementById('profileStatus');
        if (response && response.success) {
          statusEl.textContent = '✓ Profile saved successfully';
          statusEl.style.color = '#388e3c';
          setTimeout(() => statusEl.textContent = '', 2000);
        } else {
          statusEl.textContent = '❌ Error saving profile';
          statusEl.style.color = '#d32f2f';
        }
      });
    });
  }

  const loadFromChromeBtn = document.getElementById('loadFromChromeBtn');
  if (loadFromChromeBtn) {
    loadFromChromeBtn.addEventListener('click', () => {
      const statusEl = document.getElementById('profileStatus');
      statusEl.textContent = '⏳ Loading Chrome autofill data...';
      statusEl.style.color = '#1976d2';
      
      chrome.runtime.sendMessage({ action: 'getChromeAutofillData' }, (response) => {
        if (response && response.data) {
          const data = response.data;
          if (data.firstName) document.getElementById('firstName').value = data.firstName;
          if (data.lastName) document.getElementById('lastName').value = data.lastName;
          if (data.email) document.getElementById('email').value = data.email;
          if (data.phone) document.getElementById('phone').value = data.phone;
          if (data.address) document.getElementById('address').value = data.address;
          if (data.city) document.getElementById('city').value = data.city;
          if (data.state) document.getElementById('state').value = data.state;
          if (data.zipCode) document.getElementById('zipCode').value = data.zipCode;
          if (data.country) document.getElementById('country').value = data.country;
          if (data.companyName) document.getElementById('companyName').value = data.companyName;
          if (data.jobTitle) document.getElementById('jobTitle').value = data.jobTitle;
          
          statusEl.textContent = '✓ Chrome data loaded. Don\'t forget to save!';
          statusEl.style.color = '#388e3c';
          setTimeout(() => statusEl.textContent = '', 2000);
        } else {
          statusEl.textContent = '⚠ No Chrome autofill data found';
          statusEl.style.color = '#f57c00';
        }
      });
    });
  }
}, 500);

// Document handling
function loadDocumentStatus() {
  chrome.runtime.sendMessage({ action: 'getDocuments' }, (response) => {
    const documents = response.documents || {};
    updateDocumentsList('resume', documents.resumes || []);
    updateDocumentsList('coverLetter', documents.coverLetters || []);
  });
}

function updateDocumentsList(docType, files) {
  const listId = docType === 'resume' ? 'resumesList' : 'coverLettersList';
  const listDiv = document.getElementById(listId);
  listDiv.innerHTML = '';
  
  if (!files || files.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'document-item empty';
    empty.textContent = 'No files uploaded';
    listDiv.appendChild(empty);
    return;
  }
  
  files.forEach((file) => {
    const item = document.createElement('div');
    item.className = 'document-item';
    
    const fileDate = new Date(file.uploadedAt).toLocaleDateString();
    
    item.innerHTML = `
      <div class="document-info">
        <div class="file-name">${file.name}</div>
        <div class="file-meta">
          <span class="file-size">${formatFileSize(file.size)}</span>
          <span class="file-date">${fileDate}</span>
        </div>
      </div>
      <div class="document-actions">
        <button class="download-document" data-id="${file.id}" data-type="${docType}">Download</button>
        <button class="delete-document" data-id="${file.id}" data-type="${docType}">Delete</button>
      </div>
    `;
    
    item.querySelector('.download-document').addEventListener('click', () => {
      downloadDocument(docType, file.id, file.name);
    });
    
    item.querySelector('.delete-document').addEventListener('click', () => {
      deleteDocument(docType, file.id);
    });
    
    listDiv.appendChild(item);
  });
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function downloadDocument(docType, fileId, fileName) {
  chrome.runtime.sendMessage({ 
    action: 'getDocumentData', 
    docType: docType,
    fileId: fileId
  }, (response) => {
    if (response.document && response.document.data) {
      const link = document.createElement('a');
      link.href = response.document.data;
      link.download = fileName;
      link.click();
    }
  });
}

function deleteDocument(docType, fileId) {
  if (confirm('Delete this file?')) {
    chrome.runtime.sendMessage({ 
      action: 'deleteDocument', 
      docType: docType,
      fileId: fileId
    }, (response) => {
      if (response.success) {
        loadDocumentStatus();
      }
    });
  }
}

// Document upload buttons - deferred initialization
setTimeout(() => {
  const resumeUploadBtn = document.getElementById('resumeUploadBtn');
  if (resumeUploadBtn) {
    resumeUploadBtn.addEventListener('click', () => {
      document.getElementById('resumeInput').click();
    });
  }

  const resumeInput = document.getElementById('resumeInput');
  if (resumeInput) {
    resumeInput.addEventListener('change', (e) => {
      handleDocumentUpload(e.target.files[0], 'resume', e.target);
    });
  }

  const coverLetterUploadBtn = document.getElementById('coverLetterUploadBtn');
  if (coverLetterUploadBtn) {
    coverLetterUploadBtn.addEventListener('click', () => {
      document.getElementById('coverLetterInput').click();
    });
  }

  const coverLetterInput = document.getElementById('coverLetterInput');
  if (coverLetterInput) {
    coverLetterInput.addEventListener('change', (e) => {
      handleDocumentUpload(e.target.files[0], 'coverLetter', e.target);
    });
  }
}, 500);

function handleDocumentUpload(file, docType, inputElement) {
  if (!file) return;
  
  // Validate file
  if (!ALLOWED_TYPES.includes(file.type) && !file.name.endsWith('.txt') && !file.name.endsWith('.pdf') && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
    alert('❌ Invalid file type. Allowed: PDF, DOC, DOCX, TXT');
    return;
  }
  
  if (file.size > MAX_FILE_SIZE) {
    alert('❌ File too large. Maximum size: 5MB');
    return;
  }
  
  // Read file as base64
  const reader = new FileReader();
  reader.onload = (e) => {
    chrome.runtime.sendMessage({
      action: 'saveDocument',
      docType: docType,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        data: e.target.result
      }
    }, (response) => {
      inputElement.value = '';
      if (response.success) {
        loadDocumentStatus();
      } else {
        alert('❌ ' + response.error);
      }
    });
  };
  
  reader.onerror = () => {
    alert('❌ Error reading file');
  };
  
  reader.readAsDataURL(file);
}

// Autofill button - deferred initialization
setTimeout(() => {
  const autofillBtn = document.getElementById('autofillBtn');
  if (autofillBtn) {
    autofillBtn.addEventListener('click', async () => {
      const status = document.getElementById('status');
      status.textContent = 'Filling form...';
      
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      try {
        // Get user profile
        chrome.runtime.sendMessage({ action: 'getUserProfile' }, (profileResponse) => {
          const profile = profileResponse.profile || {};
          
          // Send to content script to fill form
          chrome.tabs.sendMessage(tab.id, { 
            action: 'fillFormWithProfile',
            profile: profile
          }, (response) => {
            if (chrome.runtime.lastError) {
              status.textContent = 'Could not fill form on this page';
              status.style.color = '#d32f2f';
            } else if (response && response.success) {
              status.textContent = '✓ Form filled successfully!';
              status.style.color = '#388e3c';
            } else {
              status.textContent = 'Could not fill form on this page';
              status.style.color = '#d32f2f';
            }
            setTimeout(() => status.textContent = '', 3000);
          });
        });
      } catch (error) {
        status.textContent = 'Could not fill form on this page';
        status.style.color = '#d32f2f';
        setTimeout(() => status.textContent = '', 3000);
      }
    });
  }
}, 500);

// Auto-fill on load setting
// Load the setting from background script's stored state
setTimeout(() => {
  chrome.runtime.sendMessage({ action: 'getRules' }, (response) => {
    // Initialization - autoFillOnLoad checkbox will be set to false by default
    const checkbox = document.getElementById('autoFillOnLoad');
    if (checkbox) {
      checkbox.checked = false;
    }
  });

  const autoFillCheckbox = document.getElementById('autoFillOnLoad');
  if (autoFillCheckbox) {
    autoFillCheckbox.addEventListener('change', (e) => {
      chrome.runtime.sendMessage({ 
        action: 'setAutoFillOnLoad', 
        enabled: e.target.checked 
      });
    });
  }
}, 500);

// Rules management
async function loadRules() {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage({ action: 'getRules' }, (response) => {
      allRules = response.rules || [];
      displayRules();
      resolve();
    });
  });
}

function displayRules() {
  const rulesList = document.getElementById('rulesList');
  rulesList.innerHTML = '';
  
  if (allRules.length === 0) {
    rulesList.innerHTML = '<p style="color: #999; text-align: center; padding: 20px;">No rules yet. Add one to get started!</p>';
    return;
  }
  
  allRules.forEach((rule, index) => {
    const ruleEl = document.createElement('div');
    ruleEl.className = 'rule-item';
    ruleEl.innerHTML = `
      <div class="rule-info">
        <div class="rule-name">${rule.name}</div>
        <div class="rule-pattern">${rule.urlPattern} • ${rule.fieldMappings.length} fields</div>
      </div>
      <div class="rule-actions">
        <button class="btn btn-secondary btn-small edit-rule" data-index="${index}">Edit</button>
        <button class="btn btn-danger btn-small delete-rule" data-index="${index}">Delete</button>
      </div>
    `;
    rulesList.appendChild(ruleEl);
  });
  
  // Add event listeners
  document.querySelectorAll('.edit-rule').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      editRule(parseInt(btn.getAttribute('data-index')));
    });
  });
  
  document.querySelectorAll('.delete-rule').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      deleteRule(parseInt(btn.getAttribute('data-index')));
    });
  });
}

function editRule(index) {
  currentRuleIndex = index;
  const rule = allRules[index];
  
  document.getElementById('ruleName').value = rule.name;
  document.getElementById('urlPattern').value = rule.urlPattern;
  document.getElementById('ruleEnabled').checked = rule.enabled;
  
  // Display field mappings
  const fieldMappingsDiv = document.getElementById('fieldMappings');
  fieldMappingsDiv.innerHTML = '';
  
  rule.fieldMappings.forEach((mapping, i) => {
    addFieldMappingDisplay(mapping.selector, mapping.value, i);
  });
  
  document.getElementById('deleteRuleBtn').style.display = 'block';
  openRuleModal();
}

function addRule() {
  currentRuleIndex = -1;
  
  document.getElementById('ruleName').value = '';
  document.getElementById('urlPattern').value = '*';
  document.getElementById('ruleEnabled').checked = true;
  document.getElementById('fieldMappings').innerHTML = '';
  
  document.getElementById('deleteRuleBtn').style.display = 'none';
  openRuleModal();
}

function addFieldMappingDisplay(selector = '', value = '', index = null) {
  const fieldMappings = document.getElementById('fieldMappings');
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'field-mapping';
  fieldDiv.innerHTML = `
    <input type="text" placeholder="CSS selector (e.g., #email, input[name='firstName'])" value="${selector}" class="field-selector">
    <input type="text" placeholder="Value to fill" value="${value}" class="field-value">
    <button type="button" class="btn btn-danger btn-small remove-field">Remove</button>
  `;
  fieldMappings.appendChild(fieldDiv);
  
  fieldDiv.querySelector('.remove-field').addEventListener('click', () => {
    fieldDiv.remove();
  });
}

// Rules UI - deferred initialization
setTimeout(() => {
  const addFieldBtn = document.getElementById('addFieldBtn');
  if (addFieldBtn) {
    addFieldBtn.addEventListener('click', () => {
      addFieldMappingDisplay();
    });
  }

  const addRuleBtn = document.getElementById('addRuleBtn');
  if (addRuleBtn) {
    addRuleBtn.addEventListener('click', () => {
      addRule();
    });
  }

  const saveRuleBtn = document.getElementById('saveRuleBtn');
  if (saveRuleBtn) {
    saveRuleBtn.addEventListener('click', async () => {
      const name = document.getElementById('ruleName').value.trim();
      const urlPattern = document.getElementById('urlPattern').value.trim() || '*';
      const enabled = document.getElementById('ruleEnabled').checked;
      
      if (!name) {
        alert('Please enter a rule name');
        return;
      }
      
      // Collect field mappings
      const fieldMappings = [];
      document.querySelectorAll('.field-mapping').forEach(fieldDiv => {
        const selector = fieldDiv.querySelector('.field-selector').value.trim();
        const value = fieldDiv.querySelector('.field-value').value.trim();
        
        if (selector && value) {
          fieldMappings.push({ selector, value });
        }
      });
      
      if (fieldMappings.length === 0) {
        alert('Please add at least one field mapping');
        return;
      }
      
      const newRule = { name, urlPattern, enabled, fieldMappings };
      
      if (currentRuleIndex >= 0) {
        allRules[currentRuleIndex] = newRule;
      } else {
        allRules.push(newRule);
      }
      
      // Save to storage
      chrome.runtime.sendMessage({ action: 'saveRules', rules: allRules }, () => {
        closeRuleModal();
        loadRules();
      });
    });
  }

  const deleteRuleBtn = document.getElementById('deleteRuleBtn');
  if (deleteRuleBtn) {
    deleteRuleBtn.addEventListener('click', () => {
      if (currentRuleIndex >= 0 && confirm('Delete this rule?')) {
        allRules.splice(currentRuleIndex, 1);
        chrome.runtime.sendMessage({ action: 'saveRules', rules: allRules }, () => {
          closeRuleModal();
          loadRules();
        });
      }
    });
  }

  const cancelRuleBtn = document.getElementById('cancelRuleBtn');
  if (cancelRuleBtn) {
    cancelRuleBtn.addEventListener('click', () => {
      closeRuleModal();
    });
  }

  const closeBtn = document.querySelector('.close');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeRuleModal();
    });
  }
}, 500);

function openRuleModal() {
  document.getElementById('ruleModal').classList.add('active');
}

function closeRuleModal() {
  document.getElementById('ruleModal').classList.remove('active');
  currentRuleIndex = -1;
}

// Close modal when clicking outside
window.addEventListener('click', (event) => {
  const modal = document.getElementById('ruleModal');
  if (event.target === modal) {
    closeRuleModal();
  }
});
// ============ APPLY MODE SETTINGS ============

function loadApplyModeSettings() {
  chrome.storage.local.get(['applyMode', 'useAIAnswers'], (result) => {
    applyMode = result.applyMode || 'manual';
    useAIAnswers = result.useAIAnswers || false;
    
    // Set radio button
    document.getElementById(`${applyMode}ApplyMode`).checked = true;
    document.getElementById('useAIAnswers').checked = useAIAnswers;
    
    updateApplyModeStatus();
  });
}

function setupApplyModeListeners() {
  // Apply mode radio buttons
  const manualMode = document.getElementById('manualApplyMode');
  const autoMode = document.getElementById('autoApplyMode');
  const useAICheckbox = document.getElementById('useAIAnswers');
  
  if (manualMode) {
    manualMode.addEventListener('change', () => {
      applyMode = 'manual';
      chrome.storage.local.set({ applyMode });
      updateApplyModeStatus();
      notifyContentScript();
    });
  }
  
  if (autoMode) {
    autoMode.addEventListener('change', () => {
      applyMode = 'auto';
      chrome.storage.local.set({ applyMode });
      updateApplyModeStatus();
      notifyContentScript();
    });
  }
  
  if (useAICheckbox) {
    useAICheckbox.addEventListener('change', () => {
      useAIAnswers = useAICheckbox.checked;
      chrome.storage.local.set({ useAIAnswers });
      updateApplyModeStatus();
      notifyContentScript();
    });
  }
}

function updateApplyModeStatus() {
  const status = document.getElementById('applyModeStatus');
  if (!status) return;
  
  if (applyMode === 'manual') {
    status.innerHTML = '🔵 <strong>Manual Mode:</strong> You control button clicks. Extension fills form fields.';
  } else {
    status.innerHTML = '🟢 <strong>Auto Mode:</strong> Extension fills fields AND clicks buttons automatically.';
  }
  
  if (useAIAnswers) {
    status.innerHTML += ' <br>🤖 AI answer generation is <strong>ENABLED</strong>.';
  }
}

// ============ AI SETTINGS ============

function loadAISettings() {
  chrome.storage.local.get('aiSettings', (result) => {
    const settings = result.aiSettings || {};
    
    // Set provider and fields
    document.getElementById('aiProvider').value = settings.provider || 'openai';
    document.getElementById('aiEnabled').checked = settings.enabled || false;
    
    // OpenAI fields
    document.getElementById('openaiKey').value = settings.apiKey || '';
    document.getElementById('openaiModel').value = settings.model || 'gpt-3.5-turbo';
    
    // Ollama fields
    document.getElementById('ollamaEndpoint').value = settings.endpoint || 'http://localhost:11434/api/generate';
    document.getElementById('ollamaModel').value = settings.ollamaModel || 'llama2';
    
    // HuggingFace fields
    document.getElementById('hfKey').value = settings.hfKey || '';
    document.getElementById('hfModel').value = settings.hfModel || 'mistralai/Mistral-7B-Instruct-v0.1';
    
    updateAISettingsVisibility();
  });
}

function setupAISettingsListeners() {
  const aiProvider = document.getElementById('aiProvider');
  const aiEnabled = document.getElementById('aiEnabled');
  const saveAIBtn = document.getElementById('saveAIBtn');
  const testAIBtn = document.getElementById('testAIBtn');
  
  if (aiProvider) {
    aiProvider.addEventListener('change', updateAISettingsVisibility);
  }
  
  if (saveAIBtn) {
    saveAIBtn.addEventListener('click', saveAISettings);
  }
  
  if (testAIBtn) {
    testAIBtn.addEventListener('click', testAIConnection);
  }
}

function updateAISettingsVisibility() {
  const provider = document.getElementById('aiProvider').value;
  
  document.getElementById('openaiSettings').style.display = provider === 'openai' ? 'block' : 'none';
  document.getElementById('ollamaSettings').style.display = provider === 'ollama' ? 'block' : 'none';
  document.getElementById('huggingfaceSettings').style.display = provider === 'huggingface' ? 'block' : 'none';
}

function saveAISettings() {
  const provider = document.getElementById('aiProvider').value;
  const enabled = document.getElementById('aiEnabled').checked;
  
  let settings = {
    provider,
    enabled
  };
  
  if (provider === 'openai') {
    settings.apiKey = document.getElementById('openaiKey').value;
    settings.model = document.getElementById('openaiModel').value;
  } else if (provider === 'ollama') {
    settings.endpoint = document.getElementById('ollamaEndpoint').value;
    settings.ollamaModel = document.getElementById('ollamaModel').value;
  } else if (provider === 'huggingface') {
    settings.apiKey = document.getElementById('hfKey').value;
    settings.hfModel = document.getElementById('hfModel').value;
    settings.model = document.getElementById('hfModel').value;
  }
  
  chrome.storage.local.set({ aiSettings: settings }, () => {
    const status = document.getElementById('aiStatus');
    status.textContent = '✓ AI Settings saved successfully!';
    status.style.color = '#388e3c';
    setTimeout(() => {
      status.textContent = '';
    }, 3000);
  });
}

async function testAIConnection() {
  const status = document.getElementById('aiStatus');
  status.textContent = '⏳ Testing AI connection...';
  status.style.color = '#1976d2';
  
  try {
    const result = await chrome.runtime.sendMessage({
      action: 'testAIConnection'
    });
    
    if (result.success) {
      status.textContent = '✓ AI connection successful! Sample response: ' + result.answer.substring(0, 50) + '...';
      status.style.color = '#388e3c';
    } else {
      status.textContent = '❌ AI connection failed: ' + result.error;
      status.style.color = '#d32f2f';
    }
  } catch (error) {
    status.textContent = '❌ Error testing AI: ' + error.message;
    status.style.color = '#d32f2f';
  }
  
  setTimeout(() => {
    status.textContent = '';
  }, 5000);
}

function notifyContentScript() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'updateApplyMode',
        applyMode,
        useAIAnswers
      }).catch(() => {
        // Ignore errors - content script might not be loaded yet
      });
    }
  });
}

// ==================== COMMON QUESTIONS ====================

// Load and display common questions
function loadCommonQuestions() {
  chrome.storage.local.get(['commonQuestions'], (result) => {
    const commonQuestions = result.commonQuestions || {};
    const questionsList = document.getElementById('commonQuestionsList');
    
    if (!questionsList) return;
    
    questionsList.innerHTML = '';
    
    if (Object.keys(commonQuestions).length === 0) {
      questionsList.innerHTML = '<p class="info" style="text-align: center; padding: 20px;">No questions saved yet. Add one below!</p>';
      return;
    }
    
    Object.entries(commonQuestions).forEach(([question, answer]) => {
      const questionDiv = document.createElement('div');
      questionDiv.className = 'question-item';
      questionDiv.style.cssText = `
        background: #f5f5f5;
        padding: 12px;
        margin: 8px 0;
        border-radius: 4px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 10px;
      `;
      
      const contentDiv = document.createElement('div');
      contentDiv.style.flex = '1';
      
      const questionEl = document.createElement('h4');
      questionEl.style.cssText = 'margin: 0 0 5px 0; font-size: 14px;';
      questionEl.textContent = question;
      
      const answerEl = document.createElement('p');
      answerEl.style.cssText = 'margin: 0; font-size: 13px; color: #666; word-break: break-word;';
      answerEl.textContent = answer.substring(0, 100) + (answer.length > 100 ? '...' : '');
      
      contentDiv.appendChild(questionEl);
      contentDiv.appendChild(answerEl);
      
      const buttonsDiv = document.createElement('div');
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.gap = '5px';
      
      const editBtn = document.createElement('button');
      editBtn.textContent = '✎ Edit';
      editBtn.style.cssText = `
        padding: 5px 10px;
        background: #1976d2;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      `;
      editBtn.addEventListener('click', () => editCommonQuestion(question, answer));
      
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = '🗑 Delete';
      deleteBtn.style.cssText = `
        padding: 5px 10px;
        background: #d32f2f;
        color: white;
        border: none;
        border-radius: 3px;
        cursor: pointer;
        font-size: 12px;
      `;
      deleteBtn.addEventListener('click', () => deleteCommonQuestion(question));
      
      buttonsDiv.appendChild(editBtn);
      buttonsDiv.appendChild(deleteBtn);
      
      questionDiv.appendChild(contentDiv);
      questionDiv.appendChild(buttonsDiv);
      questionsList.appendChild(questionDiv);
    });
  });
}

// Edit a common question
function editCommonQuestion(oldQuestion, oldAnswer) {
  const newQuestion = prompt('Edit question:', oldQuestion);
  if (newQuestion === null) return;
  
  const newAnswer = prompt('Edit answer:', oldAnswer);
  if (newAnswer === null) return;
  
  chrome.storage.local.get(['commonQuestions'], (result) => {
    const commonQuestions = result.commonQuestions || {};
    
    // Delete old question if question text changed
    if (oldQuestion !== newQuestion) {
      delete commonQuestions[oldQuestion];
    }
    
    // Save new question
    commonQuestions[newQuestion] = newAnswer;
    
    chrome.storage.local.set({ commonQuestions }, () => {
      loadCommonQuestions();
      showCommonQuestionStatus('✓ Question updated', '#388e3c');
    });
  });
}

// Delete a common question
function deleteCommonQuestion(question) {
  if (!confirm(`Delete question: "${question}"?`)) return;
  
  chrome.storage.local.get(['commonQuestions'], (result) => {
    const commonQuestions = result.commonQuestions || {};
    delete commonQuestions[question];
    
    chrome.storage.local.set({ commonQuestions }, () => {
      loadCommonQuestions();
      showCommonQuestionStatus('✓ Question deleted', '#388e3c');
    });
  });
}

// Show status message
function showCommonQuestionStatus(message, color = '#1976d2') {
  const statusEl = document.getElementById('commonQuestionStatus');
  if (!statusEl) return;
  
  statusEl.textContent = message;
  statusEl.style.color = color;
  setTimeout(() => {
    statusEl.textContent = '';
  }, 3000);
}

// Setup common questions UI
setTimeout(() => {
  loadCommonQuestions();
  
  const addQuestionBtn = document.getElementById('addQuestionBtn');
  if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', () => {
      const questionInput = document.getElementById('newQuestionInput');
      const answerInput = document.getElementById('newAnswerInput');
      
      if (!questionInput || !answerInput) return;
      
      const question = questionInput.value.trim();
      const answer = answerInput.value.trim();
      
      if (!question || !answer) {
        showCommonQuestionStatus('❌ Please fill in both question and answer', '#d32f2f');
        return;
      }
      
      chrome.storage.local.get(['commonQuestions'], (result) => {
        const commonQuestions = result.commonQuestions || {};
        
        if (commonQuestions[question]) {
          if (!confirm(`Question "${question}" already exists. Overwrite?`)) return;
        }
        
        commonQuestions[question] = answer;
        
        chrome.storage.local.set({ commonQuestions }, () => {
          questionInput.value = '';
          answerInput.value = '';
          loadCommonQuestions();
          showCommonQuestionStatus('✓ Question added', '#388e3c');
        });
      });
    });
  }
}, 100);