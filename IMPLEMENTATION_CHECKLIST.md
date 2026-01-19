# HYBRID AUTO-APPLY IMPLEMENTATION CHECKLIST

## Current Status (What's Done)

✅ **auto-apply-brain.js** - Complete 260+ line implementation
- Question classification system (4 buckets)
- Speed vs intelligence switch logic
- AI answer validation
- Confidence calculation
- Memory/learning system
- Submission gate rules

✅ **auto-apply-prompts.js** - Complete 250+ line prompt system
- Master HYBRID_AUTO_APPLY prompt
- CONFIDENCE_EVALUATION prompt
- Specialized prompts (behavioral, technical, motivation)
- Memory adaptation prompt
- Helper functions for prompt formatting

✅ **Documentation**
- HYBRID_AUTOAPPLY_GUIDE.md - Full specification
- INTEGRATION_GUIDE.md - How to integrate
- This checklist

✅ **Manifest Updated**
- Added auto-apply-brain.js and auto-apply-prompts.js to content_scripts

## Phase 1: Integration (IN PROGRESS)

### [ ] 1a. Update content.js with brain usage
**File**: [content.js](content.js)
**What**: Replace generic fillFormWithProfile with enhanced version
**How**: 
1. Add brain initialization at start of fillFormWithProfile
2. Call brain.analyzeForm() instead of manual field matching
3. Process classifications based on type (FACTUAL, ELIGIBILITY, QUALITATIVE, LEGAL)
4. Tag elements for AI answering vs auto-filling
**Reference**: See CONTENT_INTEGRATION_EXAMPLES.js for code
**Time**: 30 minutes
**Success**: Form analysis logs show correct classification

### [ ] 1b. Update content.js form submission handler
**File**: [content.js](content.js)
**What**: Add submission validation using brain.canSubmit()
**How**:
1. Before form.submit(), collect form state
2. Call brain.canSubmit(formState)
3. If blocked, show error to user
4. Only submit if gate is passed
**Reference**: validateBeforeSubmit() in CONTENT_INTEGRATION_EXAMPLES.js
**Time**: 15 minutes
**Success**: Forms blocked if required fields empty or legal questions unapproved

### [ ] 1c. Add element tagging for later steps
**File**: [content.js](content.js)
**What**: Mark elements with dataset flags during analysis
**How**:
1. FACTUAL fields: data-factual="true"
2. QUALITATIVE fields: data-needs-ai="true"
3. LEGAL fields: data-requires-manual-review="true"
4. LOW CONFIDENCE: data-flagged-for-review="true"
**Time**: 10 minutes
**Success**: Console logs show correct tagging (✓, ⏳, ⚠)

## Phase 2: AI Integration

### [ ] 2a. Update background.js with AI message handler
**File**: [background.js](background.js)
**What**: Add handler for 'getAIAnswer' action
**How**:
1. Listen for chrome.runtime.sendMessage with action='getAIAnswer'
2. Extract question, profile, jobContext from message
3. Call OpenAI API with AutoApplyPrompts.HYBRID_AUTO_APPLY
4. Return response with answer
**Reference**: See INTEGRATION_GUIDE.md Step 5
**Time**: 45 minutes
**Requires**: OpenAI API key configuration
**Success**: Qualitative questions get coherent AI answers

### [ ] 2b. Add OpenAI API integration
**File**: [background.js](background.js)
**What**: Implement callOpenAIAPI() function
**How**:
1. Get API key from chrome.storage.sync
2. Make fetch to https://api.openai.com/v1/chat/completions
3. Use system prompt: "Truthful job application assistant"
4. Handle errors (no API key, network errors, quota exceeded)
**Reference**: INTEGRATION_GUIDE.md code sample
**Time**: 30 minutes
**Config**: Need to add OpenAI API key to popup settings
**Success**: AI API calls work and return answers

### [ ] 2c. Update popup.js with API key configuration
**File**: [popup.js](popup.js)
**What**: Add UI for OpenAI API key
**How**:
1. Add settings tab with input for API key
2. Save to chrome.storage.sync
3. Show validation (can test API connection)
4. Hide key value in UI
**Time**: 30 minutes
**Success**: User can enter and save API key, extension remembers it

### [ ] 2d. Add answer quality validation
**File**: [content.js](content.js)  + **brain.js**
**What**: Validate AI answer for quality before using
**How**:
1. After AI returns answer, call brain.validateAIAnswer()
2. Check for skill inflation, experience inflation, false claims
3. Calculate confidence score
4. If confidence < 0.7, flag for manual review
5. If confidence ≥ 0.7, auto-fill
**Reference**: INTEGRATION_GUIDE.md, brain.validateAIAnswer()
**Time**: 30 minutes
**Success**: Low-confidence answers highlighted, high-confidence auto-filled

## Phase 3: Memory System

### [ ] 3a. Add memory storage to background.js
**File**: [background.js](background.js)
**What**: Implement PersistentMemory class
**How**:
1. Create class with saveAnswer() and findSimilar() methods
2. Use chrome.storage.local to persist
3. Hash questions for lookup
4. Store answer, feedback, timestamp, confidence
**Reference**: INTEGRATION_GUIDE.md Step 6
**Time**: 30 minutes
**Success**: Answered questions saved to storage

### [ ] 3b. Update content.js to use memory
**File**: [content.js](content.js)
**What**: Check memory before calling AI
**How**:
1. For each QUALITATIVE question, call brain.findSimilarQuestion()
2. If found and confidence > 0.7, auto-fill
3. Otherwise, call AI
4. After AI answer approved, call brain.rememberAnswer()
**Reference**: answerQualitativeQuestions() in CONTENT_INTEGRATION_EXAMPLES.js
**Time**: 20 minutes
**Success**: Second application reuses answers, saves API calls

### [ ] 3c. Add memory management UI
**File**: [popup.js](popup.js)
**What**: Show memory statistics and allow clearing
**How**:
1. Show: "X learned answers in memory"
2. Button to view learned answers
3. Button to clear memory
4. Show success rate per question
**Time**: 20 minutes
**Success**: User can see and manage learned answers

## Phase 4: Submission Gateway

### [ ] 4a. Create review modal for flagged answers
**File**: [content.js](content.js)
**What**: Show UI for manually approving low-confidence answers
**How**:
1. Create modal dialog
2. Show list of flagged questions
3. Show AI answer and alternatives
4. User can approve, reject, or edit
5. Store feedback for learning
**Time**: 45 minutes
**Success**: User can review and approve flagged answers

### [ ] 4b. Add legal question approval flow
**File**: [content.js](content.js)
**What**: Block submission until legal questions approved
**How**:
1. Find all [data-requires-manual-review] elements
2. Show modal asking user to confirm
3. Set data-approved="true" when confirmed
4. Only then allow form submission
**Time**: 30 minutes
**Success**: Certification questions must be manually approved

### [ ] 4c. Add submission gateway to popup
**File**: [popup.js](popup.js)
**What**: Show "Form Ready to Submit" / "Issues Found" status
**How**:
1. Detect form on current page
2. Show summary: "X factual, Y qualitative, Z legal"
3. Show submission status
4. Button to auto-submit if ready
5. Show blocking reasons if not ready
**Time**: 30 minutes
**Success**: User sees clear submission status and can click auto-submit

## Phase 5: Polish & Testing

### [ ] 5a. Add comprehensive logging
**File**: All files
**What**: Log all decisions for debugging
**How**:
1. Use console.log with ✓/✗/⏳/⚠ prefixes
2. Log classification decisions
3. Log AI calls and results
4. Log validation results
5. Make logs optional (debug mode toggle in popup)
**Time**: 15 minutes
**Success**: Console shows clear flow of processing

### [ ] 5b. Test with 10+ real job forms
**File**: N/A (testing)
**What**: Test on actual job sites
**Sites**: LinkedIn, Indeed, Greenhouse, Lever, Ashby, etc.
**Checklist**:
- [ ] Factual questions auto-fill correctly
- [ ] Eligibility questions use stored answers
- [ ] Qualitative questions get AI answers
- [ ] Legal questions are blocked
- [ ] Low-confidence answers are highlighted
- [ ] Memory reuses previous answers
- [ ] Submission gate prevents bad submissions
- [ ] No JavaScript errors in console
**Time**: 2-3 hours
**Success**: All test forms process correctly

### [ ] 5c. Performance optimization
**File**: All files
**What**: Optimize for speed
**How**:
1. Cache form analysis for 30 seconds
2. Batch AI calls (max 1 per 2 seconds)
3. Only load brain/prompts when needed
4. Minimize memory queries
**Time**: 20 minutes
**Success**: Forms process in <3 seconds

### [ ] 5d. Error handling & edge cases
**File**: All files
**What**: Handle failures gracefully
**Cases**:
- [ ] No API key configured → show error
- [ ] AI call fails → flag for manual
- [ ] Network error → retry with backoff
- [ ] Malformed form → fall back to legacy
- [ ] Storage quota exceeded → clear old memory
- [ ] Missing resume data → conservative answers
**Time**: 30 minutes
**Success**: No unhandled errors, graceful degradation

### [ ] 5e. User documentation
**File**: README.md, popup help
**What**: Document the feature
**How**:
1. Update README with hybrid auto-apply section
2. Add help text to popup UI
3. Explain confidence gates
4. Explain manual review flow
5. Show example of AI answer
**Time**: 30 minutes
**Success**: Users understand the feature

## Summary Timeline

| Phase | Tasks | Est. Time |
|-------|-------|-----------|
| 1. Integration | 4 tasks | 2 hours |
| 2. AI Integration | 4 tasks | 2 hours |
| 3. Memory | 3 tasks | 1.5 hours |
| 4. Gateway | 3 tasks | 1.5 hours |
| 5. Polish | 5 tasks | 3.5 hours |
| **TOTAL** | **19 tasks** | **~10 hours** |

## Quick Start (Minimal Path)

If you want to get something working fast, do these only:

1. ✅ Update manifest (DONE)
2. [ ] 1a. Update fillFormWithProfile (30 min)
3. [ ] 2a. Add AI handler to background.js (45 min)
4. [ ] 2c. Add API key to popup (30 min)
5. [ ] 5b. Test with one form (30 min)

**Total**: ~2 hours, basic hybrid auto-apply working

## Extended Path (Full Featured)

Do all 19 tasks for complete system with memory, gateway validation, etc.

**Total**: ~10 hours, production-ready system

## Testing Scenarios

### Scenario 1: Simple Form (Fast Path)
Form has: Name, Email, Phone, "Why interested?" (1 qualitative)
- Expected: Auto-fill factual + AI answer + auto-submit
- Verify: All fields filled, form submitted automatically

### Scenario 2: Complex Form (Safe Path)
Form has: Multiple questions (4+ qualitative)
- Expected: Auto-fill factual + flag for review
- Verify: Low-confidence answers highlighted, user must approve

### Scenario 3: Legal Question
Form has: "I certify this is truthful"
- Expected: Block submission, flag for manual
- Verify: Form cannot submit until manually approved

### Scenario 4: Memory Reuse
Apply to Company A (answer approved) → Apply to Company B (same question)
- Expected: Answer reused from memory
- Verify: No AI call made, answer auto-filled

### Scenario 5: Low Resume Match
Resume: 2 years Python
Form asks: "5+ years of Python experience required?"
- Expected: AI detects inflation, flags for review
- Verify: Question marked for manual review

## Success Criteria

- ✓ All forms process without JavaScript errors
- ✓ Factual questions auto-fill from profile
- ✓ Eligibility questions use stored answers  
- ✓ Qualitative questions get AI answers (>0.7 confidence)
- ✓ Low-confidence answers flagged for review
- ✓ Legal questions block submission
- ✓ Memory reuses successful answers
- ✓ Second application 30% faster than first
- ✓ No fake claims in AI answers
- ✓ User controls everything with clear feedback

## Next Action

Start with **Phase 1: Integration (1a)** - Update content.js to use AutoApplyBrain.classifyQuestion() and analyzeForm().
