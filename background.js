// Rule-based autofill engine
class AutofillEngine {
  constructor() {
    this.rules = [];
    this.autoFillOnLoad = false;
    this.documents = {};
    this.userProfile = {};
    this.loadRules();
    this.loadSettings();
    this.loadDocuments();
    this.loadUserProfile();
  }

  async loadRules() {
    const { rules = [] } = await chrome.storage.sync.get('rules');
    this.rules = rules;
  }

  async loadSettings() {
    const { autoFillOnLoad = false } = await chrome.storage.sync.get('autoFillOnLoad');
    this.autoFillOnLoad = autoFillOnLoad;
  }

  async loadDocuments() {
    try {
      const { documents = {} } = await chrome.storage.local.get('documents');
      this.documents = documents || {};
      console.log('Loaded documents:', this.documents);
    } catch (error) {
      console.error('Error loading documents:', error);
      this.documents = {};
    }
  }

  async loadUserProfile() {
    try {
      const { userProfile = {} } = await chrome.storage.local.get('userProfile');
      this.userProfile = userProfile || {};
      console.log('Loaded user profile:', this.userProfile);
    } catch (error) {
      console.error('Error loading user profile:', error);
      this.userProfile = {};
    }
  }

  async saveRules(rules) {
    this.rules = rules;
    await chrome.storage.sync.set({ rules });
  }

  async setAutoFillOnLoad(enabled) {
    this.autoFillOnLoad = enabled;
    await chrome.storage.sync.set({ autoFillOnLoad: enabled });
  }

  async saveUserProfile(profile) {
    this.userProfile = profile;
    await chrome.storage.local.set({ userProfile: profile });
    return true;
  }

  getUserProfile() {
    return this.userProfile;
  }

  async saveDocument(docType, file) {
    if (!this.documents) {
      this.documents = {};
    }
    
    // Initialize array if needed
    if (!this.documents[docType]) {
      this.documents[docType] = [];
    }
    
    // Create unique ID for the file
    const fileId = 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    
    const fileObj = {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      data: file.data,
      uploadedAt: new Date().toISOString()
    };
    
    // Add to array
    this.documents[docType].push(fileObj);
    await chrome.storage.local.set({ documents: this.documents });
    
    return {
      id: fileId,
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: fileObj.uploadedAt
    };
  }

  async deleteDocument(docType, fileId) {
    if (!this.documents[docType]) {
      return false;
    }
    
    const index = this.documents[docType].findIndex(f => f.id === fileId);
    if (index > -1) {
      this.documents[docType].splice(index, 1);
      await chrome.storage.local.set({ documents: this.documents });
      return true;
    }
    return false;
  }

  getDocuments() {
    const docs = {};
    
    if (this.documents.resume) {
      docs.resumes = this.documents.resume.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt
      }));
    } else {
      docs.resumes = [];
    }
    
    if (this.documents.coverLetter) {
      docs.coverLetters = this.documents.coverLetter.map(f => ({
        id: f.id,
        name: f.name,
        size: f.size,
        type: f.type,
        uploadedAt: f.uploadedAt
      }));
    } else {
      docs.coverLetters = [];
    }
    
    return docs;
  }

  getDocumentData(docType, fileId) {
    if (!this.documents || !this.documents[docType]) {
      return null;
    }
    
    const doc = this.documents[docType].find(f => f.id === fileId);
    console.log('getDocumentData:', { docType, fileId, found: !!doc });
    return doc || null;
  }

  // Match rule against current URL
  matchesUrl(rule, url) {
    if (rule.urlPattern === '*') return true;
    if (rule.urlPattern.startsWith('*')) {
      return url.includes(rule.urlPattern.slice(1));
    }
    return url.includes(rule.urlPattern);
  }

  // Get applicable rules for current page
  getApplicableRules(url) {
    return this.rules.filter(rule => rule.enabled && this.matchesUrl(rule, url));
  }

  // Apply rules to fill form fields
  async autofill(url) {
    const rules = this.getApplicableRules(url);
    
    for (const rule of rules) {
      for (const mapping of rule.fieldMappings) {
        const elements = document.querySelectorAll(mapping.selector);
        
        elements.forEach(element => {
          if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.value = mapping.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
            element.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (element.tagName === 'SELECT') {
            element.value = mapping.value;
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
        });
      }
    }
  }
}

// Initialize engine
const autofillEngine = new AutofillEngine();

// Listen for messages from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'checkAutoFill') {
    sendResponse({ shouldAutofill: autofillEngine.autoFillOnLoad });
    return true;
  }
  
  if (request.action === 'autofill') {
    autofillEngine.autofill(request.url).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'getRules') {
    sendResponse({ rules: autofillEngine.rules });
    return true;
  }
  
  if (request.action === 'saveRules') {
    autofillEngine.saveRules(request.rules).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (request.action === 'setAutoFillOnLoad') {
    autofillEngine.setAutoFillOnLoad(request.enabled).then(() => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (request.action === 'saveDocument') {
    autofillEngine.saveDocument(request.docType, request.file).then((fileData) => {
      sendResponse({ 
        success: true, 
        file: fileData
      });
    }).catch((error) => {
      sendResponse({ success: false, error: error.message });
    });
    return true;
  }

  if (request.action === 'deleteDocument') {
    autofillEngine.deleteDocument(request.docType, request.fileId).then((success) => {
      sendResponse({ success: success });
    });
    return true;
  }

  if (request.action === 'getDocuments') {
    sendResponse({ documents: autofillEngine.getDocuments() });
    return true;
  }

  if (request.action === 'getDocumentData') {
    // Reload documents from storage to ensure fresh data
    autofillEngine.loadDocuments().then(() => {
      const data = autofillEngine.getDocumentData(request.docType, request.fileId);
      console.log('Returning document data:', data ? 'Found' : 'Not found');
      sendResponse({ document: data });
    });
    return true;
  }

  if (request.action === 'saveUserProfile') {
    autofillEngine.saveUserProfile(request.profile).then((success) => {
      sendResponse({ success: success });
    });
    return true;
  }

  if (request.action === 'getUserProfile') {
    sendResponse({ profile: autofillEngine.getUserProfile() });
    return true;
  }

  if (request.action === 'getChromeAutofillData') {
    // Extract data from common Chrome autofill patterns
    const data = {};
    
    // Get form data from Chrome's autofill (if accessible)
    // Note: Chrome restricts direct access to autofill data for security
    // This is a basic approach using accessible data
    chrome.storage.local.get('userProfile', (result) => {
      if (result.userProfile) {
        sendResponse({ data: result.userProfile });
      } else {
        // Return empty data if no profile found
        sendResponse({ data: {} });
      }
    });
    return true;
  }

  if (request.action === 'testAIConnection') {
    testAIConnection().then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (request.action === 'getApplyMode') {
    chrome.storage.local.get(['applyMode', 'useAIAnswers'], (result) => {
      sendResponse({
        applyMode: result.applyMode || 'manual',
        useAIAnswers: result.useAIAnswers || false
      });
    });
    return true;
  }
});

// Test AI Connection
async function testAIConnection() {
  try {
    const { aiSettings = {} } = await chrome.storage.local.get('aiSettings');
    
    if (!aiSettings.enabled) {
      return { success: false, error: 'AI is not enabled' };
    }

    // Simple test prompt
    const testPrompt = 'What is your name as an AI assistant? Answer in one sentence.';

    if (aiSettings.provider === 'openai') {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${aiSettings.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiSettings.model || 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: testPrompt
            }
          ],
          max_tokens: 100
        })
      });

      if (!response.ok) {
        return { success: false, error: `OpenAI API error: ${response.statusText}` };
      }

      const data = await response.json();
      const answer = data.choices[0].message.content.trim();
      return { success: true, answer };
    } else if (aiSettings.provider === 'ollama') {
      const endpoint = aiSettings.endpoint || 'http://localhost:11434/api/generate';
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: aiSettings.ollamaModel || 'llama2',
          prompt: testPrompt,
          stream: false
        })
      });

      if (!response.ok) {
        return { success: false, error: `Ollama API error: ${response.statusText}` };
      }

      const data = await response.json();
      return { success: true, answer: data.response.trim() };
    } else {
      return { success: false, error: 'Unknown AI provider' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}

