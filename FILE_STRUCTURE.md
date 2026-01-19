# JOBHUNTER FILE STRUCTURE & ORGANIZATION

## Current Workspace Structure

```
d:\work\jobhunter\
│
├─ EXTENSION FILES (Core)
│  ├─ manifest.json              ← Extension configuration (UPDATED ✨)
│  ├─ background.js              ← Service worker (NEEDS: AI integration)
│  ├─ content.js                 ← Page injection script (NEEDS: brain integration)
│  ├─ popup.html                 ← Extension popup UI
│  ├─ popup.js                   ← Popup controller (NEEDS: API key config)
│  ├─ popup.css                  ← Popup styling
│  │
│  ├─ icons/                     ← Extension icons
│  │  ├─ icon16.png
│  │  ├─ icon48.png
│  │  └─ icon128.png
│  │
│  └─ test_form.html             ← Test form for validation
│
├─ HYBRID AUTO-APPLY SYSTEM ✨✨✨ (NEW!)
│  ├─ auto-apply-brain.js        ← Core business logic (260 lines) ✅
│  │  ├─ AutoApplyBrain class
│  │  ├─ classifyQuestion()          - 4-bucket classification
│  │  ├─ analyzeForm()               - Full form analysis
│  │  ├─ validateAIAnswer()          - Quality & honesty checks
│  │  ├─ calculateConfidence()       - Confidence scoring
│  │  ├─ rememberAnswer()            - Memory storage
│  │  ├─ findSimilarQuestion()       - Memory retrieval
│  │  └─ canSubmit()                 - Submission gate
│  │
│  ├─ auto-apply-prompts.js      ← AI prompt templates (250 lines) ✅
│  │  ├─ HYBRID_AUTO_APPLY        - Master prompt (all questions)
│  │  ├─ CONFIDENCE_EVALUATION    - Self-evaluation prompt
│  │  ├─ BEHAVIORAL_QUESTION      - STAR method template
│  │  ├─ MOTIVATION_QUESTION      - Why company/role template
│  │  ├─ TECHNICAL_QUESTION       - Hands-on experience template
│  │  ├─ ELIGIBILITY_QUESTION     - Truth-only template
│  │  ├─ MEMORY_ADAPTATION        - Reuse previous answers
│  │  └─ Helper functions
│  │
│  └─ CONTENT_INTEGRATION_EXAMPLES.js ← Ready-to-use code (400 lines) ✅
│     ├─ fillFormWithProfileEnhanced() - Enhanced form processor
│     ├─ getFactualAnswer()            - Extract from profile
│     ├─ getStoredAnswer()             - Extract stored answers
│     ├─ answerQualitativeQuestions()  - Process AI answers
│     ├─ getAIAnswer()                 - OpenAI API caller
│     ├─ extractJobContext()           - Parse job info from page
│     ├─ validateBeforeSubmit()        - Submission validation
│     └─ showSubmissionBlocker()       - UI for blocked submissions
│
├─ DOCUMENTATION (Comprehensive)
│  │
│  ├─ QUICK_REFERENCE.md         ← START HERE! (300 lines) ⭐
│  │  • 30-second summary
│  │  • Question types table
│  │  • Speed decision logic
│  │  • File map by reading level
│  │  • 10-hour implementation path
│  │  • Confidence gate rules
│  │  • Memory learning example
│  │  • Key code snippets
│  │  • Troubleshooting guide
│  │  • Success checklist
│  │
│  ├─ HYBRID_AUTOAPPLY_README.md ← User & developer guide (400 lines)
│  │  • What is it (simple explanation)
│  │  • How it works (overview)
│  │  • Key features (speed, intelligence, safety, learning)
│  │  • Files created (summary)
│  │  • How to use (for users and developers)
│  │  • Configuration (API keys, resume data)
│  │  • Performance benchmarks
│  │  • Safety & privacy
│  │  • Accuracy metrics
│  │  • Limitations
│  │  • Troubleshooting
│  │  • Future improvements
│  │  • Philosophy
│  │  • Getting started guide (5 steps)
│  │
│  ├─ HYBRID_AUTOAPPLY_GUIDE.md  ← Full specification (500+ lines)
│  │  • Overview
│  │  • System architecture
│  │  • Master flow (7 steps)
│  │  • Question classification rules (A-D)
│  │  • Speed vs intelligence switch
│  │  • AI safety rules (non-negotiable)
│  │  • Confidence gate system
│  │  • Memory & learning system
│  │  • Submission gate rules
│  │  • Master prompt
│  │  • Implementation checklist
│  │  • Testing scenarios (5 cases)
│  │  • Key advantages
│  │  • Result statement
│  │
│  ├─ INTEGRATION_GUIDE.md        ← Step-by-step integration (300+ lines)
│  │  • Step 1: Import brain in content.js
│  │  • Step 2: Initialize brain in form processing
│  │  • Step 3: AI integration for qualitative Q's
│  │  • Step 4: Submission gate
│  │  • Step 5: Background.js AI integration
│  │  • Step 6: Memory persistence
│  │  • Usage flow diagram
│  │  • Testing checklist
│  │  • Performance tips
│  │  • Security notes
│  │  • Next steps
│  │
│  ├─ IMPLEMENTATION_CHECKLIST.md ← 19-task plan (300+ lines)
│  │  • Current status (what's done)
│  │  • Phase 1: Integration (4 tasks, 2 hrs)
│  │  • Phase 2: AI Integration (4 tasks, 2 hrs)
│  │  • Phase 3: Memory System (3 tasks, 1.5 hrs)
│  │  • Phase 4: Submission Gateway (3 tasks, 1.5 hrs)
│  │  • Phase 5: Polish & Testing (5 tasks, 3.5 hrs)
│  │  • Summary timeline
│  │  • Quick start (2 hours MVP)
│  │  • Extended path (10 hours full-featured)
│  │  • Testing scenarios (5 cases)
│  │  • Success criteria
│  │  • Next action
│  │
│  ├─ VISUAL_GUIDE.md             ← Diagrams & flowcharts (500+ lines)
│  │  • System overview diagram
│  │  • Phase 1: Analysis flow
│  │  • Phase 2a: Fast track (≤1 qualitative)
│  │  • Phase 2b: Safe track (>1 qualitative)
│  │  • Phase 3: Legal gate
│  │  • Phase 4: Memory learning
│  │  • Classification rules table
│  │  • Speed vs intelligence tree
│  │  • Confidence score calculation
│  │  • Memory system flow
│  │  • Real world example (Acme Corp job)
│  │  • Key concepts summary
│  │  • File summary table
│  │
│  ├─ DELIVERY_SUMMARY.md         ← What was built (500+ lines)
│  │  • What was built (overview)
│  │  • Core system (2 files)
│  │  • Documentation (5 files)
│  │  • Integration files (2 updated)
│  │  • How it works (quick summary)
│  │  • The 4-bucket system
│  │  • Speed vs intelligence switch
│  │  • Safety system
│  │  • Learning system
│  │  • Key numbers (performance, accuracy, cost)
│  │  • What's done vs what needs implementation
│  │  • Getting started (Option A or B)
│  │  • Architecture diagram
│  │  • Files reference
│  │  • Next steps
│  │  • Summary statement
│  │
│  ├─ STATUS.md                   ← Project status (existing)
│  ├─ README.md                   ← Main documentation (existing)
│  ├─ INDEX.md                    ← File index (existing)
│  ├─ QUICKSTART.md               ← Quick start (existing)
│  ├─ FIX_SUMMARY.md              ← Previous fixes (existing)
│  ├─ DEBUGGING_GUIDE.md          ← Troubleshooting (existing)
│  ├─ NEARFORM_GUIDE.md           ← Nearform forms (existing)
│  ├─ NEARFORM_ENHANCEMENT.md     ← Form enhancements (existing)
│  ├─ CHANGES.md                  ← Change log (existing)
│  │
│  └─ Scripts
│     ├─ create_icons.py          ← Icon generator
│     └─ make_icons.py            ← Icon maker
```

## File Types & Their Purposes

### 🔧 Core Extension Files
- **manifest.json** - Extension metadata & permissions
- **background.js** - Service worker (message handling, storage, AI calls)
- **content.js** - Injected into web pages (form interaction)
- **popup.html/js/css** - Extension UI (user controls)
- **icons/** - Extension branding

### 🧠 Hybrid Auto-Apply System
- **auto-apply-brain.js** - Business logic (classification, validation, memory)
- **auto-apply-prompts.js** - AI prompts (ensures safe, honest answers)
- **CONTENT_INTEGRATION_EXAMPLES.js** - Ready-to-use integration code

### 📖 Documentation Levels

| File | Purpose | Read Time | For Whom |
|------|---------|-----------|----------|
| QUICK_REFERENCE.md | 30-second overview + quick facts | 5 min | Everyone |
| HYBRID_AUTOAPPLY_README.md | Benefits, usage, configuration | 10 min | Users & Developers |
| HYBRID_AUTOAPPLY_GUIDE.md | Complete specification | 30 min | Developers |
| INTEGRATION_GUIDE.md | How to build it | 30 min | Developers |
| VISUAL_GUIDE.md | Diagrams and flow charts | 20 min | Visual learners |
| IMPLEMENTATION_CHECKLIST.md | 19-task implementation plan | 10 min | Project managers |
| DELIVERY_SUMMARY.md | What was delivered | 15 min | Stakeholders |

## Reading Path by Goal

### 🏃 "I have 5 minutes"
1. QUICK_REFERENCE.md
2. Done!

### 📚 "I want to understand it"
1. QUICK_REFERENCE.md (5 min)
2. HYBRID_AUTOAPPLY_README.md (10 min)
3. VISUAL_GUIDE.md (20 min)
4. Total: 35 minutes

### 💻 "I want to implement it"
1. QUICK_REFERENCE.md (5 min)
2. HYBRID_AUTOAPPLY_GUIDE.md (30 min)
3. IMPLEMENTATION_CHECKLIST.md (10 min)
4. INTEGRATION_GUIDE.md (30 min)
5. CONTENT_INTEGRATION_EXAMPLES.js (copy code as needed)
6. Total: 75 minutes reading + 10 hours coding

### 🎯 "I need to explain it to someone"
1. QUICK_REFERENCE.md (quick facts)
2. VISUAL_GUIDE.md (diagrams)
3. DELIVERY_SUMMARY.md (overview)
4. HYBRID_AUTOAPPLY_README.md (benefits)

### 🚀 "I want to deploy it now"
1. QUICK_REFERENCE.md (understand the system)
2. IMPLEMENTATION_CHECKLIST.md (follow the plan)
3. Use CONTENT_INTEGRATION_EXAMPLES.js (code samples)
4. Follow INTEGRATION_GUIDE.md (detailed steps)

## Key Statistics

### Code
- **Production Code**: 500+ lines
  - auto-apply-brain.js: 260 lines
  - auto-apply-prompts.js: 250 lines
- **Example Code**: 400 lines
  - CONTENT_INTEGRATION_EXAMPLES.js: 400 lines

### Documentation
- **Total**: 2,700+ lines across 8 documents
- **Guides**: 1,500+ lines (user & developer focused)
- **Reference**: 800+ lines (quick lookup)
- **Examples**: 400+ lines (code samples)

### Implementation Time
- **Quick Start**: 2 hours (MVP)
- **Full Implementation**: 10 hours (all features)
- **Reading & Understanding**: 1-2 hours
- **Testing**: 2-3 hours

## What Each Document Answers

| Question | Document |
|----------|----------|
| What is this system? | QUICK_REFERENCE.md, HYBRID_AUTOAPPLY_README.md |
| How does it work? | HYBRID_AUTOAPPLY_GUIDE.md, VISUAL_GUIDE.md |
| How do I build it? | IMPLEMENTATION_CHECKLIST.md, INTEGRATION_GUIDE.md |
| Show me code | CONTENT_INTEGRATION_EXAMPLES.js |
| What's included? | DELIVERY_SUMMARY.md |
| I'm visual | VISUAL_GUIDE.md |
| Quick facts | QUICK_REFERENCE.md |

## Navigation Tips

### Starting Fresh?
1. Start with QUICK_REFERENCE.md (5 min)
2. Pick your path from "Reading Path by Goal" above
3. Use file map in QUICK_REFERENCE.md to jump around

### Lost?
1. Go to QUICK_REFERENCE.md
2. Find your question in "What Each Document Answers"
3. Open that document
4. Use Ctrl+F to search for your specific issue

### Implementing?
1. Print out IMPLEMENTATION_CHECKLIST.md
2. Open INTEGRATION_GUIDE.md in editor
3. Copy code from CONTENT_INTEGRATION_EXAMPLES.js
4. Refer to HYBRID_AUTOAPPLY_GUIDE.md if confused

### Explaining to Others?
1. Show them QUICK_REFERENCE.md summary
2. Show them VISUAL_GUIDE.md diagrams
3. Answer their questions with DELIVERY_SUMMARY.md
4. Direct them to full docs for deep dives

## File Dependencies

```
manifest.json
    ↓
    ├─→ auto-apply-brain.js (imported in content_scripts)
    ├─→ auto-apply-prompts.js (imported in content_scripts)
    ├─→ content.js (uses brain + prompts)
    ├─→ background.js (handles AI calls)
    └─→ popup.js (configures extension)

content.js
    ├─ Requires: auto-apply-brain.js
    ├─ Requires: auto-apply-prompts.js
    └─ Calls: background.js (via chrome.runtime.sendMessage)

background.js
    ├─ Calls: OpenAI API
    └─ Manages: chrome.storage

CONTENT_INTEGRATION_EXAMPLES.js
    └─ Provides examples for: content.js, background.js
```

## How to Navigate This Documentation

### 🎯 If you know exactly what you want:
→ Use "What Each Document Answers" table above

### 🤔 If you're not sure where to start:
→ Read QUICK_REFERENCE.md → pick your level → follow that path

### 📍 If you're lost in a document:
→ Use Ctrl+F to search for your keyword
→ Check the table of contents at the top

### 🔗 If you need to jump between docs:
→ All documents are in the workspace root
→ File names match their content
→ Start with QUICK_REFERENCE.md for orientation

## Quick File Lookup

```
"What is this?"                      → QUICK_REFERENCE.md
"Why should I use it?"               → HYBRID_AUTOAPPLY_README.md
"How does it work?"                  → HYBRID_AUTOAPPLY_GUIDE.md
"Show me pictures"                   → VISUAL_GUIDE.md
"I want to build it"                 → IMPLEMENTATION_CHECKLIST.md
"Tell me step-by-step"               → INTEGRATION_GUIDE.md
"I need code examples"               → CONTENT_INTEGRATION_EXAMPLES.js
"What was delivered?"                → DELIVERY_SUMMARY.md
"What files are there?"              → This file (FILE_STRUCTURE.md)
```

---

**Start with QUICK_REFERENCE.md, then let that guide you to the right document for your needs.**
