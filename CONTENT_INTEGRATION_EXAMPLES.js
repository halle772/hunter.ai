/**
 * ENHANCED FORM FILLING WITH AUTO-APPLY BRAIN
 * 
 * This shows how to integrate AutoApplyBrain into content.js
 * Copy and paste relevant sections into your content.js to upgrade it
 */

// ============================================================================
// ENHANCED fillFormWithProfile - Uses AutoApplyBrain for intelligent analysis
// ============================================================================

function fillFormWithProfileEnhanced(profile) {
  console.log('🧠 Starting enhanced form fill with AutoApplyBrain...');

  // Step 1: Initialize brain
  let brain;
  try {
    brain = new AutoApplyBrain();
    console.log('✓ AutoApplyBrain initialized');
  } catch (e) {
    console.log('⚠ AutoApplyBrain not available, falling back to legacy mode');
    return fillFormWithProfile(profile); // Fallback to old function
  }

  // Step 2: Collect all form fields
  const inputs = document.querySelectorAll('input, textarea, select');
  const formFields = Array.from(inputs).map((input, index) => ({
    index,
    element: input,
    text: input.placeholder || input.name || input.id || '',
    label: input.previousElementSibling?.textContent || '',
    type: input.tagName.toLowerCase()
  }));

  console.log(`📋 Found ${formFields.length} form fields`);

  // Step 3: Analyze form with brain
  const analysis = brain.analyzeForm(
    formFields.map(f => f.text + ' ' + f.label)
  );

  console.log('📊 Form Analysis:', analysis);

  // Step 4: Process each field based on classification
  formFields.forEach((field, index) => {
    const classification = analysis.classifications[index];
    const element = field.element;

    console.log(`Processing field ${index}: ${classification.type}`);

    switch (classification.type) {
      case 'FACTUAL':
        // Auto-fill profile data
        const factualAnswer = getFactualAnswer(element, profile);
        if (factualAnswer) {
          fillInput(element, factualAnswer);
          console.log(`✓ Auto-filled: ${field.text} = ${factualAnswer}`);
        }
        break;

      case 'ELIGIBILITY':
        // Use stored eligibility answer
        const storedAnswer = getStoredAnswer(element, profile);
        if (storedAnswer) {
          fillInput(element, storedAnswer);
          console.log(`✓ Filled eligibility: ${field.text} = ${storedAnswer}`);
        } else {
          console.log(`⚠ Missing eligibility answer for: ${field.text}`);
          element.dataset.requiresAnswer = 'true';
        }
        break;

      case 'QUALITATIVE':
        // Mark for AI answer
        element.dataset.needsAI = 'true';
        element.dataset.questionText = field.text;
        console.log(`⏳ Marked for AI: ${field.text}`);
        break;

      case 'LEGAL_ATTESTATION':
        // Flag for manual review
        element.dataset.requiresManualReview = 'true';
        element.style.backgroundColor = '#fff3cd'; // Yellow highlight
        console.log(`⚠ Manual review required: ${field.text}`);
        break;
    }
  });

  // Step 5: Determine submission path
  const summary = analysis.summary;
  console.log(`
📈 Form Summary:
  Total: ${summary.totalQuestions}
  Can auto-fill: ${summary.factual + summary.eligibility}
  Need AI: ${summary.qualitative}
  Manual approval: ${summary.legal}
  Submission path: ${analysis.submissionPath}
  Auto-submit: ${analysis.shouldAutoSubmit ? 'YES ✓' : 'NO ⏳'}
`);

  return analysis; // Return for next steps (AI answering, validation)
}

// ============================================================================
// Helper: Get factual answer from profile
// ============================================================================

function getFactualAnswer(element, profile) {
  const searchText = (
    element.placeholder + 
    ' ' + element.name + 
    ' ' + element.id + 
    ' ' + (element.previousElementSibling?.textContent || '')
  ).toLowerCase();

  // Name fields
  if (searchText.includes('first') || searchText.includes('fname') || searchText.includes('given')) {
    return profile.firstName;
  }
  if (searchText.includes('last') || searchText.includes('lname') || searchText.includes('family')) {
    return profile.lastName;
  }
  if (searchText.includes('full name') || searchText.includes('name')) {
    return `${profile.firstName} ${profile.lastName}`.trim();
  }

  // Contact fields
  if (searchText.includes('email')) return profile.email;
  if (searchText.includes('phone') || searchText.includes('mobile') || searchText.includes('contact')) {
    return profile.phone;
  }

  // Address fields
  if (searchText.includes('street') || searchText.includes('address')) {
    return profile.address;
  }
  if (searchText.includes('city')) return profile.city;
  if (searchText.includes('state') || searchText.includes('province')) {
    return profile.state;
  }
  if (searchText.includes('zip') || searchText.includes('postal')) {
    return profile.zipCode;
  }
  if (searchText.includes('country')) return profile.country;

  // Profile links
  if (searchText.includes('linkedin')) return profile.linkedinProfile;
  if (searchText.includes('github')) return profile.github;
  if (searchText.includes('website') || searchText.includes('portfolio')) {
    return profile.website;
  }

  // Job info
  if (searchText.includes('current title') || searchText.includes('job title')) {
    return profile.currentJobTitle;
  }
  if (searchText.includes('current company')) return profile.currentCompany;

  return null;
}

// ============================================================================
// Helper: Get stored eligibility answer
// ============================================================================

function getStoredAnswer(element, profile) {
  const searchText = (
    element.placeholder + 
    ' ' + element.name + 
    ' ' + element.id
  ).toLowerCase();

  // Work authorization
  if (searchText.includes('work') && searchText.includes('auth')) {
    return profile.workAuthorization;
  }

  // Sponsorship
  if (searchText.includes('sponsor')) {
    return profile.sponsorshipNeeded ? 'Yes, I require sponsorship' : 'No, I do not require sponsorship';
  }

  // Relocation
  if (searchText.includes('relocate') || searchText.includes('relocation')) {
    return profile.willingToRelocate ? 'Yes' : 'No';
  }

  // Clearance
  if (searchText.includes('clearance') || searchText.includes('security')) {
    return profile.securityClearance || null;
  }

  // Travel
  if (searchText.includes('travel') && searchText.includes('willing')) {
    return profile.willingToTravel ? 'Yes' : 'No';
  }

  return null;
}

// ============================================================================
// AI Answer Processing - Called after factual/eligibility filling
// ============================================================================

async function answerQualitativeQuestions(profile) {
  console.log('🤖 Processing qualitative questions with AI...');

  const aiElements = document.querySelectorAll('[data-needs-ai="true"]');
  console.log(`Found ${aiElements.length} qualitative questions`);

  if (aiElements.length === 0) {
    console.log('✓ No qualitative questions to answer');
    return;
  }

  // Initialize brain if not already done
  if (!window.brainInstance) {
    window.brainInstance = new AutoApplyBrain();
  }
  const brain = window.brainInstance;

  for (const element of aiElements) {
    const question = element.dataset.questionText;

    console.log(`\n🔍 Processing: "${question}"`);

    // Step 1: Check memory for similar answered question
    const similarAnswer = brain.findSimilarQuestion(question);
    if (similarAnswer.found) {
      console.log('📚 Found in memory with 80% confidence');
      fillInput(element, similarAnswer.answer);
      element.dataset.source = 'memory';
      element.dataset.confidence = '0.8';
      continue;
    }

    // Step 2: Call AI for new answer
    console.log('📞 Calling AI for answer...');
    let aiAnswer;
    try {
      aiAnswer = await getAIAnswer(question, profile);
    } catch (error) {
      console.log('❌ AI call failed:', error.message);
      element.dataset.needsManualAnswer = 'true';
      continue;
    }

    // Step 3: Validate AI answer
    const validation = brain.validateAIAnswer(aiAnswer, profile);
    console.log(`✔ Validation: confidence = ${validation.confidence}`);

    if (validation.issues.length > 0) {
      console.log('⚠ Issues found:', validation.issues);
    }

    // Step 4: Use answer if confident enough
    if (validation.confidence >= brain.confidenceThreshold) {
      fillInput(element, aiAnswer);
      element.dataset.source = 'ai';
      element.dataset.confidence = validation.confidence;
      console.log(`✓ Auto-filled with AI answer`);

      // Remember for future
      brain.rememberAnswer(
        brain.hashQuestion(question),
        aiAnswer,
        'accepted'
      );
    } else {
      // Flag for manual review
      element.dataset.flaggedForReview = 'true';
      element.style.backgroundColor = '#f8d7da'; // Red highlight
      console.log(`⚠ Low confidence (${validation.confidence}), flagged for review`);
    }
  }

  console.log('✓ Qualitative question processing complete');
}

// ============================================================================
// Get AI Answer - Calls background.js API
// ============================================================================

async function getAIAnswer(question, profile) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(
      {
        action: 'getAIAnswer',
        question: question,
        profile: profile,
        jobContext: extractJobContext()
      },
      (response) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        if (response.error) {
          reject(new Error(response.error));
          return;
        }

        resolve(response.answer);
      }
    );
  });
}

// ============================================================================
// Extract job context from page
// ============================================================================

function extractJobContext() {
  // Try to get job title, company, description from page
  const pageText = document.body.innerText;

  return {
    company: extractCompany(pageText),
    role: extractRole(pageText),
    description: pageText.substring(0, 2000) // First 2000 chars
  };
}

function extractCompany(text) {
  // Look for common patterns
  const patterns = [
    /applying to(?:\s+)([A-Z][A-Za-z\s]+)/i,
    /job at(?:\s+)([A-Z][A-Za-z\s]+)/i,
    /company:?\s*([A-Z][A-Za-z\s]+)/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return 'Unknown Company';
}

function extractRole(text) {
  // Look for role/job title patterns
  const patterns = [
    /(?:position|role|title):?\s*([A-Za-z\s]+)/i,
    /we.re? hiring [^.]*?\b([A-Za-z\s]+)\b(?:\s+engineer)?/i
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }

  return 'Unknown Role';
}

// ============================================================================
// Submission Gate - Check before submitting form
// ============================================================================

function validateBeforeSubmit() {
  if (!window.brainInstance) {
    return true; // No brain, allow submission
  }

  const brain = window.brainInstance;

  // Collect form state
  const formState = {
    requiredUnanswered: Array.from(
      document.querySelectorAll('[required]')
    ).filter(el => !el.value),
    
    unapprovedLegalQuestions: Array.from(
      document.querySelectorAll('[data-requires-manual-review]')
    ).filter(el => !el.dataset.approved),
    
    lowConfidenceAnswers: Array.from(
      document.querySelectorAll('[data-flagged-for-review]')
    ).filter(el => !el.dataset.approved)
  };

  // Check submission rules
  const gate = brain.canSubmit(formState);

  if (!gate.canSubmit) {
    console.log('❌ Form blocked from submission:');
    gate.blockingReasons.forEach(r => console.log(`  - ${r}`));
    
    showSubmissionBlocker(gate.blockingReasons);
    return false;
  }

  console.log('✓ Form passed submission gate');
  return true;
}

function showSubmissionBlocker(reasons) {
  const blocker = document.createElement('div');
  blocker.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #f8d7da;
    border: 2px solid #f5c6cb;
    border-radius: 5px;
    padding: 15px;
    max-width: 400px;
    z-index: 10000;
    font-family: Arial, sans-serif;
    font-size: 14px;
    color: #721c24;
  `;

  blocker.innerHTML = `
    <strong>⚠️ Cannot submit form:</strong>
    <ul style="margin: 10px 0; padding-left: 20px;">
      ${reasons.map(r => `<li>${r}</li>`).join('')}
    </ul>
  `;

  document.body.appendChild(blocker);
  setTimeout(() => blocker.remove(), 5000);
}

// ============================================================================
// Export for use
// ============================================================================

console.log('✓ Enhanced form filling module loaded');
console.log('  Functions available: fillFormWithProfileEnhanced, answerQualitativeQuestions, validateBeforeSubmit');
