# HYBRID AUTO-APPLY VISUAL GUIDE

## System Overview Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    JOBHUNTER HYBRID AUTO-APPLY                      │
│              Combining LazyApply Speed + Jobright Safety             │
└─────────────────────────────────────────────────────────────────────┘

┌─ PHASE 1: ANALYSIS ────────────────────────────────────────────────┐
│                                                                     │
│  User lands on job form (LinkedIn, Greenhouse, Lever, etc)        │
│           ↓                                                        │
│  Extension loads and injects content.js                           │
│           ↓                                                        │
│  ┌─────────────────────────────────────┐                         │
│  │   AutoApplyBrain.analyzeForm()      │                         │
│  │                                     │                         │
│  │  For each question:                 │                         │
│  │  ├─ Extract text from DOM          │                         │
│  │  ├─ Find labels and placeholders   │                         │
│  │  ├─ Pattern match against 4 buckets│                         │
│  │  └─ Classify & store result        │                         │
│  └─────────────────────────────────────┘                         │
│           ↓                                                        │
│  Output: analysis = {                                            │
│    classifications: [                                            │
│      {type: 'FACTUAL', ...},          ← Name, email, phone      │
│      {type: 'ELIGIBILITY', ...},      ← Sponsorship, relocation│
│      {type: 'QUALITATIVE', ...},      ← Why interested         │
│      {type: 'LEGAL_ATTESTATION', ...} ← I certify              │
│    ],                                                            │
│    summary: {total: 4, factual: 1, eligibility: 1, qual: 1, legal: 1}
│  }                                                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─ PHASE 2: FAST TRACK (≤1 QUALITATIVE) ────────────────────────────┐
│                                                                    │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐│
│  │  FACTUAL        │  │  ELIGIBILITY     │  │  QUALITATIVE     ││
│  │  (30 seconds)   │  │  (30 seconds)    │  │  (2-3 seconds)   ││
│  ├──────────────────┤  ├──────────────────┤  ├──────────────────┤│
│  │ Name: ___JOHN___ │  │ Sponsor: __ NO __│  │ Why: __ WAIT ___│
│  │ Email:_J@X.COM__ │  │ Relocate:__ NO __│  │ ________________│
│  │ Phone:555-0123__ │  │ Travel:___ YES __│  │ ________________│
│  │ City: ___NYC____ │  │                  │  │ (AI in progress)│
│  │ (AUTO-FILLED)   │  │ (STORED ANSWERS) │  │                  │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘
│       ↓                       ↓                       ↓           │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │              All fields filled, let's submit!              │  │
│  │                                                            │  │
│  │  ✓ Factual fields auto-filled                            │  │
│  │  ✓ Eligibility answers verified                          │  │
│  │  ✓ AI answer validated (confidence: 0.85)               │  │
│  │  ✓ No legal questions blocking                           │  │
│  │  ✓ All confidence scores > 0.7                           │  │
│  │                                                            │  │
│  │  STATUS: 🟢 SAFE TO AUTO-SUBMIT                          │  │
│  │                                                            │  │
│  │  [AUTO-SUBMIT BUTTON] ← Form submitted automatically!    │  │
│  └────────────────────────────────────────────────────────────┘  │
│  Result: Application submitted in < 30 seconds                   │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌─ PHASE 2B: SAFE TRACK (>1 QUALITATIVE) ───────────────────────────┐
│                                                                   │
│  3 qualitative questions found, needs validation                 │
│           ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Question 1: "Describe your Python experience"             ││
│  │                                                             ││
│  │  AI Generated:                                              ││
│  │  "I've worked with Python for 3 years in data analysis... ││
│  │   Used pandas, numpy, matplotlib for visualization...      ││
│  │   Led optimization project that reduced processing time..."││
│  │                                                             ││
│  │  Validation Results:                                        ││
│  │  ├─ Skill inflation? NO ✓                                 ││
│  │  ├─ Experience inflation? NO ✓                            ││
│  │  ├─ False claims? NO ✓                                    ││
│  │  ├─ Too generic? NO ✓                                     ││
│  │  └─ Confidence: 0.92 ✓                                    ││
│  │                                                             ││
│  │  → AUTO-FILL (confidence > 0.7)                            ││
│  └─────────────────────────────────────────────────────────────┘│
│           ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Question 2: "Tell us about your leadership experience"    ││
│  │                                                             ││
│  │  AI Generated:                                              ││
│  │  "I don't have specific team management experience..."      ││
│  │                                                             ││
│  │  Validation Results:                                        ││
│  │  ├─ Skill inflation? NO ✓                                 ││
│  │  ├─ Experience inflation? NO ✓                            ││
│  │  ├─ False claims? NO ✓                                    ││
│  │  ├─ Too generic? YES ✗ (2 clichés detected)              ││
│  │  └─ Confidence: 0.62 ✗ (< 0.7 threshold)                ││
│  │                                                             ││
│  │  → FLAG FOR REVIEW (confidence < 0.7)                      ││
│  └─────────────────────────────────────────────────────────────┘│
│           ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Question 3: "What attracted you to this role?"            ││
│  │  [Memory Found: Similar question from Company A]            ││
│  │  [Previous answer: "Interested in your ML pipeline work..."]││
│  │  [Reuse with 80% confidence]                               ││
│  │  → AUTO-FILL (memory source)                               ││
│  └─────────────────────────────────────────────────────────────┘│
│           ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              REVIEW MODAL (1 flagged answer)                ││
│  │                                                             ││
│  │  ⚠️  Please review this low-confidence answer:             ││
│  │                                                             ││
│  │  Q: Tell us about your leadership experience              ││
│  │  A: I don't have specific team management experience...   ││
│  │                                                             ││
│  │  Confidence: 62% (Below 70% threshold)                     ││
│  │  Issues: Generic answer, lacks specifics                   ││
│  │                                                             ││
│  │  Your options:                                              ││
│  │  [✓ Approve] [✗ Reject] [✏️  Edit]                         ││
│  │                                                             ││
│  │  (User clicks [✏️ Edit], writes better answer)             ││
│  │                                                             ││
│  │  [✓ APPROVE & SUBMIT]                                      ││
│  └─────────────────────────────────────────────────────────────┘│
│           ↓                                                       │
│  Result: Application submitted with user approval, 2-3 minutes  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ PHASE 3: LEGAL GATE (IF LEGAL QUESTIONS) ────────────────────────┐
│                                                                   │
│  Found: "I certify this information is truthful"                 │
│           ↓                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │            LEGAL ATTESTATION REQUIRED                       ││
│  │                                                             ││
│  │  This form contains a legal certification requirement:      ││
│  │                                                             ││
│  │  "I certify under penalty of law that all information      ││
│  │   provided in this application is truthful and complete."  ││
│  │                                                             ││
│  │  This question CANNOT be auto-filled or auto-answered.     ││
│  │  You must manually review and explicitly approve.          ││
│  │                                                             ││
│  │  Do you approve? [YES, I UNDERSTAND] [CANCEL]             ││
│  │                                                             ││
│  │  (User clicks YES)                                          ││
│  │                                                             ││
│  │  Status: ✅ Manual approval recorded                        ││
│  │  Field marked: data-approved="true"                        ││
│  │  Now form can submit                                        ││
│  └─────────────────────────────────────────────────────────────┘│
│           ↓                                                       │
│  Result: Form submission allowed only after manual certification │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ PHASE 4: MEMORY LEARNING ────────────────────────────────────────┐
│                                                                   │
│  After submission:                                                │
│           ↓                                                       │
│  brain.rememberAnswer(questionHash, answer, feedback)            │
│           ↓                                                       │
│  Stored in chrome.storage.local:                                 │
│  {                                                               │
│    "h7f8x9k2": {                                                │
│      question: "Describe your Python experience",               │
│      answer: "I've worked with Python for 3 years...",         │
│      feedback: "accepted",                                       │
│      timestamp: 1699564800000,                                  │
│      timesUsed: 1,                                              │
│      confidence: 0.92                                            │
│    },                                                            │
│    "m3n2p5q1": {                                                │
│      question: "What attracted you to this role?",              │
│      answer: "Interested in your ML pipeline work...",          │
│      feedback: "accepted",                                       │
│      timestamp: 1699564900000,                                  │
│      timesUsed: 2,                                              │
│      confidence: 0.85                                            │
│    }                                                             │
│  }                                                               │
│                                                                  │
│  Six months later, apply to Company B:                          │
│  → Similar "Python experience" question found in memory         │
│  → Reuse answer with 80% confidence (no AI call!)              │
│  → Save 3 seconds, maintain quality                             │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ CLASSIFICATION RULES ────────────────────────────────────────────┐
│                                                                   │
│  FACTUAL (30-40% of questions)                                   │
│  ├─ Patterns: name, email, phone, address, linkedin, github     │
│  ├─ Action: Auto-fill from profile                              │
│  ├─ Speed: < 0.1s                                               │
│  └─ Confidence: 100%                                             │
│                                                                  │
│  ELIGIBILITY (15-20% of questions)                               │
│  ├─ Patterns: work auth, visa, sponsorship, relocation, travel  │
│  ├─ Action: Use stored answer only                              │
│  ├─ Speed: < 0.1s                                               │
│  └─ Confidence: 100% (if pre-answered)                          │
│                                                                  │
│  QUALITATIVE (40-50% of questions)                               │
│  ├─ Patterns: experience, skills, why interested, behavioral    │
│  ├─ Action: AI-powered answer                                   │
│  ├─ Speed: 1-3s                                                 │
│  └─ Confidence: 0-100% (validated)                              │
│                                                                  │
│  LEGAL_ATTESTATION (5-10% of questions)                         │
│  ├─ Patterns: certify, penalty of law, attest, consent          │
│  ├─ Action: Manual approval required                            │
│  ├─ Speed: User decides                                         │
│  └─ Confidence: 100% (user's explicit choice)                   │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ SPEED VS INTELLIGENCE DECISION TREE ──────────────────────────────┐
│                                                                    │
│                      Count Qualitative Questions                   │
│                              │                                     │
│                    ┌─────────┴──────────┐                          │
│                    │                    │                          │
│                ≤ 1 Question         > 1 Question                  │
│                    │                    │                          │
│        ┌───────────┴──────────┐  ┌──────┴──────────────┐           │
│        │                      │  │                     │           │
│    FAST PATH              SAFE PATH            Check Quality      │
│        │                      │                     │             │
│    Auto-fill          Auto-fill & AI      Validate all answers   │
│    Get AI Answer      Show review modal    Confidence gate 0.7   │
│    Auto-submit        User approves                             │
│                       User submits          Flag low-confidence  │
│        │                      │                     │             │
│   10-30 sec              2-3 minutes          User decides       │
│    ✓ Fast            ✓ Reviewed              ✓ Safe              │
│    ✓ Reviewed        ✓ Multiple Q's          ✓ Quality           │
│                                                                    │
└────────────────────────────────────────────────────────────────────┘

┌─ CONFIDENCE SCORE CALCULATION ────────────────────────────────────┐
│                                                                  │
│  Starting confidence: 1.0 (100%)                                │
│                                                                  │
│  Deductions:                                                    │
│  ├─ Skill inflation detected    → -0.2 (confidence -= 0.2)    │
│  ├─ Experience inflation        → -0.2 (confidence -= 0.2)    │
│  ├─ False claims detected       → -0.3 (confidence -= 0.3)    │
│  ├─ Generic/vague answer        → -0.1 (confidence -= 0.1)    │
│  ├─ Excessive clichés (>3)      → -0.05 (confidence -= 0.05)  │
│  └─ Each issue compounds...                                    │
│                                                                  │
│  Examples:                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Question: "Describe Python experience"                  │  │
│  │ Answer: "Expert in Python with 5+ years..."             │  │
│  │                                                          │  │
│  │ Resume says: "Python, 3 years, pandas, numpy"           │  │
│  │                                                          │  │
│  │ Checks:                                                  │  │
│  │ ❌ Claims "expert" (inflation flag)     -0.2            │  │
│  │ ❌ Claims 5 years but resume says 3     -0.2            │  │
│  │ ✓ No false projects claimed                             │  │
│  │ ✓ Skills match resume                                   │  │
│  │                                                          │  │
│  │ Final: 1.0 - 0.2 - 0.2 = 0.6 confidence (LOW)         │  │
│  │ Result: FLAG FOR REVIEW                                 │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                  │
│  Threshold: 0.7 (70%)                                           │
│  ├─ Above: Auto-fill                                           │
│  └─ Below: Flag for user review                               │  │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘

┌─ MEMORY SYSTEM FLOW ──────────────────────────────────────────────┐
│                                                                   │
│  First Application (Company A):                                  │
│                                                                   │
│  Q: "Describe your Python experience"                            │
│  → No memory hit                                                 │
│  → Call AI: "I've worked with Python for 3 years..."            │
│  → Validate: confidence 0.92                                     │
│  → Auto-fill                                                     │
│  → User approves & submits                                      │
│  → brain.rememberAnswer(hash, answer, "accepted")              │
│  → Save to chrome.storage.local                                │
│                                                                   │
│  ───────────────────────────────────────────────────────        │
│                                                                   │
│  Second Application (Company B, 6 months later):                │
│                                                                   │
│  Q: "Tell us about your Python proficiency"                     │
│  → brain.findSimilarQuestion()                                  │
│  → Find in memory: hash match 85% similar                       │
│  → Retrieve: "I've worked with Python for 3 years..."           │
│  → confidence: 0.8 (80%, slightly lower than original)          │
│  → Auto-fill (no AI call needed!)                              │
│  → Save 2-3 seconds, maintained quality                        │
│                                                                   │
│  Result: Second application 30% faster, same quality             │
│          Third application 50% faster (more memory hits)         │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘

┌─ REAL WORLD EXAMPLE ──────────────────────────────────────────────┐
│                                                                   │
│  Apply to Acme Corp (Senior Python Developer)                   │
│                                                                   │
│  Form Fields:                            Classification:        │
│  1. First Name                       →   FACTUAL (auto-fill)   │
│  2. Email                            →   FACTUAL (auto-fill)   │
│  3. Phone                            →   FACTUAL (auto-fill)   │
│  4. Are you authorized to work in US? →  ELIGIBILITY (stored) │
│  5. Require sponsorship?             →   ELIGIBILITY (stored)  │
│  6. Describe your Python experience  →   QUALITATIVE (AI)      │
│  7. Why interested in this role?     →   QUALITATIVE (AI)      │
│  8. Describe a complex problem...    →   QUALITATIVE (AI)      │
│  9. I certify information is true    →   LEGAL (manual)        │
│                                                                  │
│  Processing:                                                    │
│                                                                  │
│  ✓ Fields 1-3: Auto-filled (< 0.5s)                           │
│  ✓ Fields 4-5: Stored answers (< 0.5s)                        │
│  ⏳ Field 6: AI answer (2s) → confidence 0.89 → auto-fill      │
│  ⏳ Field 7: Memory hit! → reuse (0.5s) → confidence 0.8      │
│  ⏳ Field 8: AI answer (2s) → confidence 0.76 → auto-fill      │
│  ⚠ Field 9: Legal attestation → wait for user approval         │
│                                                                  │
│  Summary:                                                        │
│  • 3 qualitative questions > 1 → SAFE PATH (show review)      │
│  • All confidence > 0.7 → No blocking issues                   │
│  • User reviews (2 min) and approves legal question             │
│  • Application submitted in ~3 minutes                          │
│  • Total time saved vs manual: 15-20 minutes                  │
│                                                                  │
│  If apply to Acme Corp again (6 months later):                │
│  • All fields reuse from memory                                │
│  • No AI calls (memory hits)                                   │
│  • Form filled in < 1 minute                                   │
│  • 66% faster than first application                           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

## Key Concepts at a Glance

### 🎯 Question Classification
Every question is one of 4 types - classify, then handle appropriately.

### ⚡ Speed Switch
≤1 qualitative = full auto (fast), >1 qualitative = require review (safe).

### 🤖 AI with Safety Rails
Uses OpenAI but validates all answers against resume - no lying.

### 💪 Confidence Gating
Each answer gets 0-1.0 confidence score - shows user if < 0.7.

### 🧠 Memory Learning
Remembers successful answers, reuses them on similar questions.

### ✔️ Submission Gate
Won't submit if required fields empty, legal questions unapproved, or low confidence.

## File Summary

| File | Lines | Purpose |
|------|-------|---------|
| auto-apply-brain.js | 260 | Classification, validation, memory, submission rules |
| auto-apply-prompts.js | 250 | AI prompts with strict safety rules |
| HYBRID_AUTOAPPLY_GUIDE.md | 500 | Full specification |
| INTEGRATION_GUIDE.md | 300 | How to integrate |
| CONTENT_INTEGRATION_EXAMPLES.js | 400 | Ready-to-use code |
| IMPLEMENTATION_CHECKLIST.md | 300 | 19-task plan |
| HYBRID_AUTOAPPLY_README.md | 400 | User/dev guide |
| DELIVERY_SUMMARY.md | 300 | What was built |

Total: 2,700+ lines of production code + documentation
