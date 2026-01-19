# HYBRID AUTO-APPLY SYSTEM - IMPLEMENTATION GUIDE

## Overview

This is the implementation of a hybrid auto-apply system that combines:
- **LazyApply's speed** - Automatic factual field filling, rule-based decisions
- **Jobright's intelligence** - AI-powered qualitative answers with safety gates
- **Legal safety** - Hard blocks on legal/attestation questions, confidence gates

## System Architecture

### Files Created

1. **auto-apply-brain.js** - Core business logic
   - Question classification (4 buckets)
   - Speed vs intelligence switch
   - Confidence gates
   - Memory/learning system
   - Submission rules

2. **auto-apply-prompts.js** - Prompt system
   - Master hybrid prompt (all questions)
   - Specialized prompts (behavioral, technical, motivation)
   - Confidence evaluation prompt
   - Memory adaptation prompt

## How It Works (Master Flow)

```
1. Detect Job Application Form
   ↓
2. Extract All Questions
   ↓
3. Classify Each Question (4 buckets)
   ├─ FACTUAL (Auto-Fill from profile)
   ├─ ELIGIBILITY (Use stored answer only)
   ├─ QUALITATIVE (AI-powered answer)
   └─ LEGAL_ATTESTATION (Manual review required)
   ↓
4. Count Qualitative Questions
   ├─ If ≤1: Full auto-fill + auto-submit
   └─ If >1: Auto-fill + AI answers + validation
   ↓
5. Generate Answers
   ├─ Factual: Auto-fill from profile
   ├─ Eligibility: Use stored answer
   ├─ Qualitative: Call AI with master prompt
   └─ Legal: Block + flag for manual review
   ↓
6. Validate Each AI Answer
   ├─ Check resume alignment
   ├─ Detect inflated claims
   ├─ Calculate confidence score
   └─ Flag if < 0.7
   ↓
7. Determine Submission Safety
   ├─ All required fields filled? ✓
   ├─ No unapproved legal questions? ✓
   ├─ All confidence > 0.7? ✓
   └─ Submit if all ✓
```

## Question Classification Rules

### A. FACTUAL (Auto-Fill)
**Pattern**: Name, email, phone, address, links, resume upload, location

**Action**: Always auto-fill from stored profile
```javascript
if (question.matches('name', 'email', 'phone', ...)) {
  answer = profile[fieldName];
  confidence = 1.0; // 100% confident
  requiresReview = false;
}
```

### B. ELIGIBILITY (Truth-Only)
**Pattern**: Work authorization, visa, clearance, relocation, sponsorship

**Action**: Use stored answer only, never infer
```javascript
if (question.matches('work authorization', 'visa', ...)) {
  answer = storedAnswer; // Must exist or block
  if (!storedAnswer) BLOCK_SUBMIT = true;
  confidence = 1.0; // If provided, 100% confident
  requiresReview = false;
}
```

### C. QUALITATIVE (AI Answer)
**Pattern**: Experience, skills, motivation, behavioral, open-ended

**Action**: Use master prompt with AI + confidence gate
```javascript
if (question.isOpenEnded()) {
  answer = callAI(HYBRID_MASTER_PROMPT);
  confidence = evaluateWithConfidencePrompt(answer);
  
  if (confidence < 0.7) {
    requiresReview = true; // Flag for manual review
  }
}
```

### D. LEGAL/ATTESTATION (Hard Stop)
**Pattern**: "I certify...", "I agree to...", "Background check", consent, policy

**Action**: Block auto-answer, require manual approval
```javascript
if (question.matches('certify', 'penalty of law', 'attest', ...)) {
  answer = null;
  requiresReview = true; // MANDATORY
  blockSubmit = true; // Until manually approved
}
```

## Speed vs Intelligence Switch

```javascript
const qualitativeCount = classifications
  .filter(c => c.type === 'QUALITATIVE').length;

if (qualitativeCount <= 1) {
  // Fast path: Auto-submit after answers
  autoSubmit = true;
  submissionFlow = 'FAST';
} else {
  // Safe path: Require validation
  autoSubmit = false;
  submissionFlow = 'VALIDATED';
  requiresReview = [lowConfidenceAnswers];
}
```

## AI Safety Rules (Non-Negotiable)

```javascript
// 2.4 AI USAGE RULES

function validateAIAnswer(answer, resumeData) {
  const issues = [];

  // ❌ NOT ALLOWED: Add skills not in resume
  if (answer.mentionsSkill('Expert in X') && !resume.hasSkill('X')) {
    issues.push('Skill not in resume');
  }

  // ❌ NOT ALLOWED: Inflate years of experience
  if (answer.claimsYears(8) && resume.totalYears === 3) {
    issues.push('Experience inflated by 5 years');
  }

  // ❌ NOT ALLOWED: Claim leadership if absent
  if (answer.mentions('led team') && !resume.hasLeadership()) {
    issues.push('Leadership claim without evidence');
  }

  // ❌ NOT ALLOWED: Mention tools not listed
  if (answer.mentions('Python expert') && !resume.hasSkill('Python')) {
    issues.push('Tool not in resume');
  }

  // ✅ ALLOWED: Conservative answer if insufficient data
  if (resumeData.isEmpty) {
    answer = 'Requires manual input';
  }

  return { valid: issues.length === 0, issues };
}
```

## Confidence Gate System

```javascript
// 2.5 CONFIDENCE GATE

const CONFIDENCE_THRESHOLD = 0.7;

function calculateConfidence(answer, resume, question) {
  let score = 1.0;

  // Deduct for each issue found
  if (detectSkillInflation(answer, resume)) score -= 0.2;
  if (detectExperienceInflation(answer, resume)) score -= 0.2;
  if (detectFalseClaims(answer, resume)) score -= 0.3;
  if (isVague(answer)) score -= 0.1;
  if (hasClichés(answer)) score -= 0.05;

  return Math.max(0, score);
}

// Use confidence to decide
if (confidence >= CONFIDENCE_THRESHOLD) {
  canAutoFill = true;
} else {
  requiresManualReview = true;
  flagForUser = true;
}
```

## Memory & Learning System

```javascript
// 2.6 MEMORY & LEARNING

class QuestionMemory {
  // Store similar questions and their best answers
  remember(question, answer, feedback) {
    this.store[hashQuestion(question)] = {
      answer: answer,
      feedback: feedback, // 'positive', 'negative', 'accepted', 'rejected'
      timesUsed: count,
      successRate: positiveCount / totalCount
    };
  }

  // Reuse successful answers
  findSimilar(newQuestion) {
    for (const stored of this.store) {
      if (this.isSimilar(newQuestion, stored.question)) {
        if (stored.feedback === 'positive') {
          return {
            found: true,
            answer: stored.answer,
            confidence: 0.8, // Slightly lower for adapted
            note: 'Adapted from previous success'
          };
        }
      }
    }
    return { found: false };
  }
}
```

## Submission Gate Rules

```javascript
// 2.7 SUBMISSION RULES

function canSubmit(form) {
  const blockers = [];

  // Hard block: Required fields
  if (form.requiredUnanswered.length > 0) {
    blockers.push('BLOCK: Missing required fields');
  }

  // Hard block: Unapproved legal questions
  if (form.legalQuestionsUnapproved.length > 0) {
    blockers.push('BLOCK: Legal questions require manual approval');
  }

  // Soft block: Low confidence answers
  if (form.lowConfidenceAnswers.length > 0) {
    return {
      canSubmit: false,
      reason: 'REVIEW_REQUIRED: Low confidence answers',
      answers: form.lowConfidenceAnswers,
      nextStep: 'USER_REVIEW'
    };
  }

  // Safe to submit
  if (blockers.length === 0) {
    return {
      canSubmit: true,
      reason: 'SAFE_TO_SUBMIT',
      nextStep: 'AUTO_SUBMIT'
    };
  }

  // Blocked
  return {
    canSubmit: false,
    reason: blockers.join('; '),
    nextStep: 'MANUAL_RESOLUTION'
  };
}
```

## The Master Prompt (Simplified)

```
You are helping someone apply for a job HONESTLY.

RULES:
✓ Use ONLY resume information
✓ Be truthful and specific
✓ Ground claims in real examples
✗ No exaggerating
✗ No fake skills
✗ No inflated experience
✗ No false claims

Resume: [their actual experience]
Question: [the job question]

Answer in 3-5 sentences. Be honest.
```

## Implementation Checklist

- [ ] Create auto-apply-brain.js (classification logic)
- [ ] Create auto-apply-prompts.js (AI prompts)
- [ ] Update content.js to use AutoApplyBrain
- [ ] Integrate with background.js for AI calls
- [ ] Create UI for reviewing low-confidence answers
- [ ] Add submission gate validation
- [ ] Build memory persistence
- [ ] Test with 20+ applications
- [ ] Monitor feedback for improvement

## Testing Scenarios

### Test 1: Low Qualitative Count (Fast Path)
```
Form: Name, Email, Phone, Resume + "Why interested?" (1 qualitative)
Expected: Auto-fill + AI answer + auto-submit ✓
```

### Test 2: High Qualitative Count (Safe Path)
```
Form: 5+ open-ended questions
Expected: Auto-fill + AI answers + show review UI ✓
```

### Test 3: Legal Question Present
```
Form: "I certify this information is truthful"
Expected: Block auto-submit, flag for manual ✓
```

### Test 4: Insufficient Resume Data
```
Resume: Minimal; Question: "Describe your Python expertise"
Expected: Conservative answer or "requires manual input" ✓
```

### Test 5: Memory Reuse
```
Applied to Company A, answer approved
Similar question at Company B
Expected: Suggest previous answer (confidence 0.8) ✓
```

## Key Advantages

### Speed (LazyApply)
- ✅ Factual fields: 100% automatic
- ✅ Low qualitative count: Auto-submit without review
- ✅ Memory reuse: Skip similar questions entirely

### Intelligence (Jobright)
- ✅ AI reasons about relevance to job
- ✅ Grounds answers in real resume
- ✅ Adapts to role-specific keywords
- ✅ Avoids generic clichés

### Safety (Hybrid)
- ✅ Hard blocks on legal questions
- ✅ Confidence gates prevent risky submissions
- ✅ Resume alignment validation
- ✅ User review path when unsure

## Result

A system that:
- Applies **faster** than manual
- Applies **safer** than blind submissions
- Answers **smarter** than templates
- Learns from **feedback** over time
