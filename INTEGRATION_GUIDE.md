# HYBRID AUTO-APPLY INTEGRATION GUIDE

## Current Status

✅ **auto-apply-brain.js** - Complete business logic class
✅ **auto-apply-prompts.js** - Master prompt templates
✅ **HYBRID_AUTOAPPLY_GUIDE.md** - Full specification

## Integration Steps

### Step 1: Import Brain in content.js

Add at the top of content.js:

```javascript
// Load AutoApplyBrain class
let AutoApplyBrain;
(async () => {
  const response = await fetch(chrome.runtime.getURL('auto-apply-brain.js'));
  const code = await response.text();
  eval(code);
})();
```

Or simpler (if manifest includes it):
```javascript
// In manifest.json, add to content_scripts:
"js": ["auto-apply-brain.js", "auto-apply-prompts.js", "content.js"]
```

### Step 2: Initialize Brain in Form Processing

In content.js, replace generic form processing with intelligent form processing:

```javascript
// BEFORE: Generic form filling
function fillFormWithProfile(profile) {
  // Naive field matching...
}

// AFTER: Intelligent form filling
function fillFormWithProfile(profile) {
  // Initialize brain
  const brain = new AutoApplyBrain();
  
  // Analyze all form questions
  const allQuestions = document.querySelectorAll('input, textarea, select');
  const analysis = brain.analyzeForm(
    Array.from(allQuestions).map(q => ({
      text: q.placeholder || q.label || q.name,
      element: q
    }))
  );

  console.log('Form Analysis:', analysis);

  // Process each question based on classification
  analysis.classifications.forEach((classification, index) => {
    const question = allQuestions[index];
    
    switch (classification.type) {
      case 'FACTUAL':
        // Auto-fill profile data
        const answer = brain.getAnswer(question.placeholder, classification);
        question.value = answer;
        triggerChangeEvents(question);
        console.log('✓ Auto-filled:', question.name, answer);
        break;

      case 'ELIGIBILITY':
        // Use stored answer only
        const storedAnswer = brain.getAnswer(question.placeholder, classification);
        if (storedAnswer) {
          question.value = storedAnswer;
          triggerChangeEvents(question);
          console.log('✓ Filled eligibility:', question.name);
        } else {
          console.log('✗ Missing eligibility answer:', question.name);
        }
        break;

      case 'QUALITATIVE':
        // Mark for AI answer
        question.dataset.needsAI = 'true';
        question.dataset.questionText = question.placeholder || question.label;
        console.log('⏳ Marked for AI:', question.name);
        break;

      case 'LEGAL_ATTESTATION':
        // Flag for manual review
        question.dataset.requiresManualReview = 'true';
        console.log('⚠ Manual review required:', question.name);
        break;
    }
  });

  // Return analysis for next steps
  return analysis;
}
```

### Step 3: AI Integration for Qualitative Questions

```javascript
async function answerQualitativeQuestions(analysis, profile) {
  const aiQuestions = Array.from(
    document.querySelectorAll('[data-needs-ai="true"]')
  );

  for (const element of aiQuestions) {
    const question = element.dataset.questionText;
    
    // Check memory first
    const memory = brain.findSimilarQuestion(question);
    if (memory.found) {
      element.value = memory.answer;
      triggerChangeEvents(element);
      console.log('✓ Reused from memory:', question);
      continue;
    }

    // Call AI if no memory
    const aiAnswer = await getAIAnswer(question, profile);
    
    // Validate answer
    const validation = brain.validateAIAnswer(aiAnswer, profile);
    
    if (validation.confidence >= brain.confidenceThreshold) {
      element.value = aiAnswer;
      triggerChangeEvents(element);
      console.log('✓ AI answered:', question, `(${validation.confidence})`);
      
      // Remember for future
      brain.rememberAnswer(brain.hashQuestion(question), aiAnswer, 'accepted');
    } else {
      console.log('⚠ Low confidence, manual review needed:', question);
      element.dataset.flaggedForReview = 'true';
    }
  }
}

async function getAIAnswer(question, profile) {
  // Use AutoApplyPrompts master prompt
  const prompt = AutoApplyPrompts.HYBRID_AUTO_APPLY
    .replace('{{resume_summary}}', profile.summary || profile.name)
    .replace('{{skills}}', profile.skills.join(', '))
    .replace('{{experience_years}}', profile.yearsExperience)
    .replace('{{experience_highlights}}', profile.experience)
    .replace('{{company_name}}', getCompanyName()) // From page context
    .replace('{{role}}', getRoleTitle()) // From page context
    .replace('{{job_description}}', getJobDescription()) // From page context
    .replace('{{question}}', question);

  // Call your AI API
  const response = await chrome.runtime.sendMessage({
    action: 'callAI',
    prompt: prompt,
    model: 'gpt-4' // or your preferred model
  });

  return response.answer;
}
```

### Step 4: Submission Gate

```javascript
function handleFormSubmit(event) {
  // Build form state
  const formState = {
    requiredUnanswered: document.querySelectorAll('[required]:value=""'),
    unapprovedLegalQuestions: document.querySelectorAll('[data-requires-manual-review]'),
    lowConfidenceAnswers: document.querySelectorAll('[data-flagged-for-review]')
  };

  // Check if safe to submit
  const gate = brain.canSubmit(formState);

  if (!gate.canSubmit) {
    event.preventDefault();
    
    if (gate.blockingReasons && gate.blockingReasons.length > 0) {
      console.log('❌ Cannot submit:', gate.blockingReasons);
      showErrorMessage(gate.blockingReasons.join('\n'));
    } else {
      console.log('⚠ Please review flagged questions');
      showReviewModal(formState.lowConfidenceAnswers);
    }
    return;
  }

  // Safe to submit
  console.log('✓ All clear, submitting form');
}
```

### Step 5: Background.js AI Integration

```javascript
// In background.js, add AI message handler
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'callAI') {
    callOpenAIAPI(request.prompt, request.model)
      .then(response => sendResponse({ answer: response }))
      .catch(error => sendResponse({ error: error.message }));
    
    return true; // Keep channel open for async response
  }
});

async function callOpenAIAPI(prompt, model = 'gpt-4') {
  const apiKey = await chrome.storage.sync.get('openaiApiKey');
  
  if (!apiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.openaiApiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a truthful job application assistant.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })
  });

  const data = await response.json();
  return data.choices[0].message.content;
}
```

### Step 6: Memory Persistence

```javascript
// In background.js, add memory storage
class PersistentMemory {
  async saveAnswer(question, answer, feedback) {
    const memory = await chrome.storage.local.get('questionMemory') || {};
    const hash = this.hashQuestion(question);
    
    if (!memory[hash]) {
      memory[hash] = [];
    }
    
    memory[hash].push({
      question,
      answer,
      feedback,
      timestamp: Date.now()
    });

    await chrome.storage.local.set({ questionMemory: memory });
  }

  async findSimilar(question) {
    const memory = await chrome.storage.local.get('questionMemory');
    const hash = this.hashQuestion(question);
    
    if (memory[hash]) {
      const positive = memory[hash]
        .filter(m => m.feedback === 'positive' || m.feedback === 'accepted')
        .sort((a, b) => b.timestamp - a.timestamp);
      
      return positive[0] ? positive[0].answer : null;
    }
    
    return null;
  }

  hashQuestion(question) {
    return question.toLowerCase().replace(/[^a-z0-9]/g, '').substring(0, 50);
  }
}

const memory = new PersistentMemory();
```

## Usage Flow Diagram

```
User lands on job form
    ↓
brain.analyzeForm(questions) → classification
    ↓
    ├─ FACTUAL → Auto-fill from profile
    ├─ ELIGIBILITY → Use stored answer
    ├─ QUALITATIVE → Check memory → Try AI
    └─ LEGAL → Flag for manual
    ↓
Count qualitative questions
    ├─ ≤1 → Can auto-submit
    └─ >1 → Require review
    ↓
Validate AI answers
    ├─ confidence ≥ 0.7 → Auto-fill
    └─ confidence < 0.7 → Flag for review
    ↓
Show submission gateway
    ├─ All clear → Auto-submit
    └─ Issues → Show manual review UI
```

## Testing Checklist

- [ ] FACTUAL: Name, email, phone auto-fill correctly
- [ ] ELIGIBILITY: Sponsorship questions use stored answers
- [ ] QUALITATIVE: AI generates coherent answers
- [ ] VALIDATION: Low-confidence answers flagged
- [ ] MEMORY: Second application reuses answers
- [ ] LEGAL: Certification questions blocked
- [ ] SPEED: ≤1 qualitative → auto-submit
- [ ] SAFETY: >1 qualitative → manual review
- [ ] ERROR: Missing API key shows clear error
- [ ] ERROR: Missing resume data handled gracefully

## Performance Tips

1. **Caching**: Store form analysis for 1 minute
2. **Batching**: Process all questions once, not per-field
3. **Memory**: Keep only successful answers (positive feedback)
4. **AI Calls**: Batch similar questions to one API call
5. **Throttling**: Limit to 1 AI call per 2 seconds

## Security Notes

1. **API Keys**: Store in chrome.storage.sync encrypted
2. **Resume Data**: Never send to non-OpenAI servers
3. **Answers**: Validate before auto-fill to prevent injection
4. **User Review**: Always show low-confidence answers
5. **Logging**: Clean logs before production (no PII)

## Next Steps

1. Update manifest.json to include brain & prompts
2. Update popup.js to show brain status
3. Add API key configuration to popup UI
4. Create test forms for validation
5. Monitor answer quality and adjust thresholds
