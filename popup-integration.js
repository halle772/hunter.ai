/**
 * POPUP INTEGRATION FOR content.js
 * 
 * Add this to content.js to detect job application pages
 * and show the autofill popup
 */

// Global references
let detector;
let popup;

/**
 * Initialize popup system on page load
 */
function initializePopupSystem() {
  console.log('🚀 Initializing popup system...');

  // Create detector
  if (typeof JobApplicationDetector !== 'undefined') {
    detector = new JobApplicationDetector();
  } else {
    console.warn('JobApplicationDetector not loaded');
    return;
  }

  // Check if this is a job application or job overview page
  if (!detector.isJobApplicationPage()) {
    console.log('ℹ️ Not a job page');
    return;
  }

  // Determine if this is an overview page or application page
  const isOverviewPage = detector.isJobOverviewPage();
  const isApplicationPage = detector.hasJobApplicationForm();

  console.log(`📍 Page Type: ${isOverviewPage ? 'Job Overview' : 'Job Application'}`);

  // Mark as analyzed
  if (detector.hasBeenAnalyzed()) {
    console.log('ℹ️ Page already analyzed, skipping');
    return;
  }

  detector.markAsAnalyzed();

  // Extract job info
  const jobInfo = detector.extractJobInfo();
  console.log('📋 Job Info:', jobInfo);

  // Get form fields (may be empty on overview page)
  const formFields = detector.getFormFields();
  console.log(`📝 Found ${formFields.length} form fields`);

  // Create popup with page type context
  if (typeof AutofillPopup !== 'undefined') {
    popup = new AutofillPopup(jobInfo, formFields);
    popup.isOverviewPage = isOverviewPage;
    popup.show();
    console.log(`✓ Popup shown for ${isOverviewPage ? 'overview' : 'application'} page`);
  } else {
    console.warn('AutofillPopup not loaded');
  }
}

/**
 * Handle autofill action from popup
 * Strategy: Use AI for as much as possible, act like a person
 */
function handleAutofillAction() {
  console.log('⚡ Starting intelligent AI-powered autofill...');

  if (!detector) {
    console.error('Detector not initialized');
    return;
  }

  // Get profile from storage
  chrome.storage.sync.get(['profile', 'documents', 'apiKey'], (data) => {
    const profile = data.profile || {};
    const apiKey = data.apiKey;
    const formFields = detector.getFormFields();

    // Initialize brain if available
    if (typeof AutoApplyBrain === 'undefined') {
      console.warn('AutoApplyBrain not loaded, using AI-first approach with fallback');
      aiFirstFormFill(formFields, profile);
      return;
    }

    // Use AutoApplyBrain for intelligent analysis
    const brain = new AutoApplyBrain();
    const analysis = brain.analyzeForm(
      formFields.map(f => f.label || f.name)
    );

    console.log('📊 Analysis:', analysis);

    const jobInfo = detector.extractJobInfo();
    let aiFieldCount = 0;

    // Process each field - AI-first strategy
    formFields.forEach((field, index) => {
      const classification = analysis.classifications[index];
      
      // Only auto-fill essential contact info immediately
      if (shouldAutoFillBasicInfo(field)) {
        fillBasicContactInfo(field, profile);
      } else {
        // Mark for AI processing
        markForAI(field, classification);
      }
    });

    console.log(`✓ Form prepared - ${formFields.length} fields to fill`);

    // Show status
    if (popup) {
      popup.showStatus(`Filling ${formFields.length} fields...`, 'info');
      popup.updateProgress(10);
    }

    // Now fill ALL remaining fields with AI answers
    getAIAnswersForAllFields(formFields, jobInfo, profile, apiKey);
  });
}

/**
 * Get AI answers for all marked fields and fill them
 */
async function getAIAnswersForAllFields(formFields, jobInfo, profile, apiKey) {
  console.log(`🤖 Starting to fill ${formFields.length} total fields...`);
  
  let completed = 0;
  const totalFields = formFields.length;

  // Process EVERY field - auto-fill basic ones, AI-fill the rest
  for (const field of formFields) {
    try {
      // Skip if already filled with basic info
      if (field.element.value && field.element.value.length > 0) {
        completed++;
        console.log(`⏭️  Skipping (already filled): ${field.label || field.name}`);
        continue;
      }

      const fieldQuestion = field.label || field.name || field.placeholder || '';
      
      // Get answer (AI or fallback)
      const answer = await getAIAnswer(fieldQuestion, jobInfo, profile, apiKey);
      
      if (answer && answer.length > 0) {
        field.element.value = answer;
        triggerChangeEvents(field.element);
        
        // Mark as filled with green
        field.element.style.backgroundColor = '#f0f8f0';
        field.element.style.borderLeft = '4px solid #4caf50';
        field.element.dataset.needsAI = 'false'; // Mark as processed
        
        completed++;
        console.log(`✓ Filled: ${fieldQuestion} = "${answer.substring(0, 50)}..."`);
      } else {
        console.warn(`⚠️  No answer generated for: ${fieldQuestion}`);
      }

      // Update progress
      const progress = Math.min(Math.round((completed / totalFields) * 100), 99);
      if (popup) {
        popup.updateProgress(progress);
        popup.showStatus(`Filling field ${completed}/${totalFields}...`, 'info');
      }
    } catch (error) {
      console.error(`❌ Error filling field: ${field.label || field.name}`, error);
    }
  }

  console.log(`✓ Autofill complete! ${completed}/${totalFields} fields filled`);
  
  if (popup) {
    popup.updateProgress(100);
    popup.showStatus(`✓ Filled ${completed}/${totalFields} fields!`, 'success');
  }
}

/**
 * Get AI answer for a single field
 */
async function getAIAnswer(fieldQuestion, jobInfo, profile, apiKey) {
  // Try to use Claude API via background script
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'getAIAnswer',
        question: fieldQuestion,
        jobInfo: jobInfo,
        profile: profile,
        apiKey: apiKey
      },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn('Message error, using fallback:', chrome.runtime.lastError.message);
          // Fallback to simple AI-like response
          const fallbackAnswer = generateFallbackAnswer(fieldQuestion, jobInfo, profile);
          resolve(fallbackAnswer);
          return;
        }

        if (response && response.answer) {
          resolve(response.answer);
        } else {
          // Fallback if API didn't return answer
          const fallbackAnswer = generateFallbackAnswer(fieldQuestion, jobInfo, profile);
          resolve(fallbackAnswer);
        }
      }
    );
  });
}

/**
 * Generate a thoughtful fallback answer when API is not available
 */
function generateFallbackAnswer(fieldQuestion, jobInfo, profile) {
  const question = fieldQuestion.toLowerCase();
  
  // Priority 1: Use profile data if available
  if (question.includes('linkedin')) {
    return profile.linkedinProfile || 'https://linkedin.com/in/profile';
  }
  if (question.includes('github')) {
    return profile.github || 'https://github.com/username';
  }
  if (question.includes('portfolio') || question.includes('website')) {
    return profile.website || 'https://yourportfolio.com';
  }
  if (question.includes('phone')) {
    return profile.phone || '+1 (555) 000-0000';
  }
  if (question.includes('country')) {
    return profile.country || 'United States';
  }
  if (question.includes('location') || question.includes('city')) {
    return profile.city || 'New York';
  }
  if (question.includes('address')) {
    return profile.address || '123 Main St';
  }
  if (question.includes('state') || question.includes('province')) {
    return profile.state || 'NY';
  }
  if (question.includes('zip') || question.includes('postal')) {
    return profile.zipCode || '10001';
  }
  
  // Priority 2: Address location/residency
  if (question.includes('residing') || question.includes('currently') || question.includes('based')) {
    return 'Yes';
  }
  if (question.includes('reloca') || question.includes('willing') || question.includes('move')) {
    return 'Yes, I am willing to relocate';
  }
  if (question.includes('sponsor') || question.includes('visa')) {
    return 'No, I do not require visa sponsorship';
  }
  
  // Priority 3: Experience/background questions
  if (question.includes('experience') || question.includes('background')) {
    return `I have solid professional experience in software development and engineering. I've worked on various projects involving problem-solving, collaboration, and delivering quality results. I'm excited to bring this experience to the ${jobInfo.title} position at ${jobInfo.company}.`;
  }
  
  // Priority 4: Motivation/interest questions
  if (question.includes('interest') || question.includes('motivation') || question.includes('why')) {
    return `I'm very interested in this ${jobInfo.title} opportunity at ${jobInfo.company}. Your company's mission and work in this space align well with my career goals, and I'm excited about the chance to contribute and grow with your team.`;
  }
  
  // Priority 5: Skills questions
  if (question.includes('skill') || question.includes('strength')) {
    return `I have strong technical skills, excellent communication abilities, and a proven track record of learning new technologies quickly. I'm particularly interested in developing expertise relevant to this ${jobInfo.title} role.`;
  }
  
  // Priority 6: Goals/future questions
  if (question.includes('goal') || question.includes('future') || question.includes('achieve')) {
    return `I aim to develop deep expertise in my field while contributing meaningfully to impactful projects. I'm looking forward to growing professionally with ${jobInfo.company}.`;
  }
  
  // Priority 7: Availability/start date
  if (question.includes('available') || question.includes('start') || question.includes('notice')) {
    return 'I am available to start immediately.';
  }
  
  // Priority 8: Work authorization
  if (question.includes('work') && (question.includes('auth') || question.includes('legal'))) {
    return 'I have the right to work in the United States.';
  }
  
  // Priority 9: General questions
  if (question.includes('tell') || question.includes('about') || question.includes('describe')) {
    return `I'm a dedicated professional with a strong background in relevant areas. I'm enthusiastic about this opportunity at ${jobInfo.company} and believe my skills and experience make me a great fit for the ${jobInfo.title} role.`;
  }
  
  // Default thoughtful response
  return `I'm very interested in this opportunity and believe my background aligns well with this ${jobInfo.title} position at ${jobInfo.company}.`;
}

/**
 * Check if field should get basic auto-filled info
 * Only for essential contact info that's truly personal
 */
function shouldAutoFillBasicInfo(field) {
  const searchText = (
    (field.label || '') + ' ' +
    (field.name || '') + ' ' +
    (field.placeholder || '')
  ).toLowerCase();

  // Only auto-fill these essential fields
  return (
    searchText.includes('first name') ||
    searchText.includes('last name') ||
    searchText.includes('email') ||
    searchText.includes('phone')
  );
}

/**
 * Fill only essential contact info - everything else needs AI
 */
function fillBasicContactInfo(field, profile) {
  const searchText = (
    (field.label || '') + ' ' +
    (field.name || '') + ' ' +
    (field.placeholder || '')
  ).toLowerCase();

  let value = null;

  if (searchText.includes('first name')) value = profile.firstName;
  else if (searchText.includes('last name')) value = profile.lastName;
  else if (searchText.includes('email')) value = profile.email;
  else if (searchText.includes('phone')) value = profile.phone;

  if (value) {
    field.element.value = value;
    triggerChangeEvents(field.element);
    console.log(`✓ Auto-filled basic info: ${field.label || field.name}`);
  }
}

/**
 * AI-first form fill strategy
 */
function aiFirstFormFill(formFields, profile) {
  console.log('🤖 Using AI-first approach for all fields');

  formFields.forEach(field => {
    const searchText = (
      (field.label || '') + ' ' +
      (field.name || '') + ' ' +
      (field.placeholder || '')
    ).toLowerCase();

    // Only auto-fill basic contact
    if (searchText.includes('first name')) {
      field.element.value = profile.firstName || '';
      triggerChangeEvents(field.element);
    } else if (searchText.includes('last name')) {
      field.element.value = profile.lastName || '';
      triggerChangeEvents(field.element);
    } else if (searchText.includes('email')) {
      field.element.value = profile.email || '';
      triggerChangeEvents(field.element);
    } else if (searchText.includes('phone')) {
      field.element.value = profile.phone || '';
      triggerChangeEvents(field.element);
    } else {
      // Mark everything else for AI
      field.element.dataset.needsAI = 'true';
      field.element.dataset.questionText = field.label || field.name;
      field.element.style.borderLeft = '3px solid #667eea';
    }
  });
}

/**
 * Mark field for AI answer - intelligent personalization
 * AI will generate thoughtful, contextual responses
 */
function markForAI(field, classification) {
  field.element.dataset.needsAI = 'true';
  field.element.dataset.questionText = field.label || field.name;
  field.element.dataset.fieldType = classification.type;
  
  // Visual indicator - blue for AI-generated content
  field.element.style.borderLeft = '4px solid #667eea';
  field.element.style.backgroundColor = '#f0f4ff';
  
  console.log(`🤖 Marked for AI: ${field.label || field.name} (${classification.type})`);
}

/**
 * Mark field for manual review - things that need human judgment
 */
function markForManual(field, classification) {
  field.element.dataset.requiresManualReview = 'true';
  field.element.style.borderLeft = '4px solid #ff9800';
  field.element.style.backgroundColor = '#fff3e0';
  console.log(`⚠️ Manual review required: ${field.label || field.name}`);
}

/**
 * Trigger change events on input
 */
function triggerChangeEvents(element) {
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Handle messages from popup/background
 */
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'startAutofill') {
    console.log('📨 Received startAutofill message');
    handleAutofillAction();
    sendResponse({ success: true });
  } else if (request.action === 'analyzeForm') {
    console.log('📨 Received analyzeForm message');
    // Could return analysis data
    sendResponse({ success: true });
  }
});

/**
 * Initialize on page load
 */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(initializePopupSystem, 500);
  });
} else {
  setTimeout(initializePopupSystem, 500);
}

console.log('✓ Popup integration loaded');
