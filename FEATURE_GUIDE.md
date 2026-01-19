# Feature Overview - Visual Guide

## 1. Profile Tab (Setup)
```
┌─────────────────────────────────────────────┐
│           JobHunter Autofill                │
├─────────────────────────────────────────────┤
│ [Autofill] [Profile] [FAQ] [Docs] [AI]     │
├─────────────────────────────────────────────┤
│ PROFILE TAB                                 │
│                                             │
│ Personal Information:                       │
│ First Name:  [John_______________]         │
│ Last Name:   [Doe________________]         │
│ Email:       [john@example.com_____]       │
│ Phone:       [(555) 123-4567_____]         │
│ Address:     [123 Main St_________]        │
│ City:        [New York__________]          │
│ State:       [NY_________________]         │
│ Zip Code:    [10001______________]         │
│ Country:     [United States______]         │
│ LinkedIn:    [linkedin.com/in/..._]        │
│ Work Auth:   [Citizen____________]         │
│                                             │
│ [Save Profile] [Load from Chrome]          │
│                                             │
└─────────────────────────────────────────────┘
```

## 2. FAQ Tab (Setup)
```
┌─────────────────────────────────────────────┐
│           JobHunter Autofill                │
├─────────────────────────────────────────────┤
│ [Autofill] [Profile] [FAQ] [Docs] [AI]     │
├─────────────────────────────────────────────┤
│ FAQ TAB                                     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Saved Questions:                        │ │
│ ├─────────────────────────────────────────┤ │
│ │ ▶ How did you hear about us?            │ │
│ │   Answer: LinkedIn                      │ │
│ │   [✎ Edit] [🗑 Delete]                  │ │
│ ├─────────────────────────────────────────┤ │
│ │ ▶ Are you willing to relocate?          │ │
│ │   Answer: Yes                           │ │
│ │   [✎ Edit] [🗑 Delete]                  │ │
│ ├─────────────────────────────────────────┤ │
│ │ ▶ Do you require visa sponsorship?      │ │
│ │   Answer: No                            │ │
│ │   [✎ Edit] [🗑 Delete]                  │ │
│ └─────────────────────────────────────────┘ │
│                                             │
│ Add New Question:                           │
│ [How did you find this job?____________]   │
│ [My friend referred me____________]        │
│                                             │
│ [+ Add Question]                            │
│                                             │
│ ✓ Question added                            │
│                                             │
└─────────────────────────────────────────────┘
```

## 3. Auto-fill on Job Page (Execution)
```
Job Application Form:
┌─────────────────────────────────────────┐
│ APPLICATION FORM                        │
├─────────────────────────────────────────┤
│ First Name: [____________]             │
│ Last Name:  [____________]             │
│ Email:      [____________]             │
│ Phone:      [____________]             │
│ Country:    [-- Select --]             │
│ How did you hear about us? [-- Select--]│
│ Willing to relocate? [-- Select --]    │
│                                        │
│ [APPLY]                                │
└─────────────────────────────────────────┘
              ↓
         User clicks extension icon
              ↓
┌─────────────────────────────────────────┐
│ 🧲 Autofill & Apply Popup              │
├─────────────────────────────────────────┤
│ ⊙ Manual Apply (I click buttons)        │
│ ◯ Auto Apply (Fill & submit)            │
│                                        │
│ [AUTOFILL & APPLY]                     │
└─────────────────────────────────────────┘
              ↓
         Extension reads from storage
              ↓
    Profile: { firstName: "John", ... }
    FAQ: { "How did you hear": "LinkedIn"}
              ↓
         Fills all fields:
              ↓
Job Application Form (FILLED):
┌─────────────────────────────────────────┐
│ APPLICATION FORM                        │
├─────────────────────────────────────────┤
│ First Name: [John]                     │ ✓
│ Last Name:  [Doe]                      │ ✓
│ Email:      [john@example.com]         │ ✓
│ Phone:      [(555) 123-4567]           │ ✓
│ Country:    [▼ United States]          │ ✓
│ How did you hear? [▼ LinkedIn]         │ ✓
│ Willing to relocate? [▼ Yes]           │ ✓
│                                        │
│ [APPLY]                                │
└─────────────────────────────────────────┘
              ↓
    If Manual: User reviews & clicks
    If Auto: Extension auto-clicks
              ↓
         Job application submitted!
```

## 4. Field Matching Algorithm
```
Form Field Analysis:
┌────────────────────────────────────────────────────────┐
│ INPUT TYPE EMAIL                                       │
│ name="email_address"                                   │
│ placeholder="your.email@company.com"                   │
│ aria-label="Email"                                     │
│ <label>Email Address</label>                           │
└────────────────────────────────────────────────────────┘
                    ↓
    Searches Profile For Match:
    ┌────────────────────────────────────────┐
    │ "email" found in:                      │
    │ - label "Email"                        │
    │ - name "email_address"                 │
    │ - aria-label "Email"                   │
    │ - placeholder "email@..."              │
    └────────────────────────────────────────┘
                    ↓
          Profile Match Found:
          email: "john@example.com"
                    ↓
                    ↓
          Field Filled! ✓
                    ↓
            Triggers Events:
    - input (for React/Vue detection)
    - change (for form validation)
    - blur (for field completion)
```

## 5. Dropdown Selection Logic
```
Form Dropdown:
┌──────────────────────────────┐
│ How did you hear about us?  │
│ ▼                            │
│ -- Select --                 │
│ LinkedIn                     │
│ Indeed                       │
│ Job Board                    │
│ Company Website              │
│ Other                        │
└──────────────────────────────┘
            ↓
    Extension Checks:
    1. Profile data match?
       country, state, workAuth...
       ✗ No match
    2. FAQ match?
       "How did you hear about us?" → "LinkedIn"
       ✓ FOUND! (exact match)
            ↓
    Dropdown Set To:
    LinkedIn ✓
            ↓
    Events Triggered:
    - change, input, blur
```

## 6. Unknown Dropdown Handling
```
Form Dropdown (Unknown):
┌──────────────────────────────┐
│ Select your experience level │
│ ▼                            │
│ -- Choose --                 │
│ Intern                       │
│ Junior (0-2 yrs)            │
│ Mid (2-5 yrs)               │
│ Senior (5+ yrs)             │
│ Staff/Principal             │
└──────────────────────────────┘
            ↓
    Profile Check?
    (experience field not in profile)
    ✗ No match
            ↓
    FAQ Check?
    (no matching question)
    ✗ No match
            ↓
    Select "Positive" Option:
    Positive keywords:
    - yes, true, apply, submit
    - continue, confirm, ok
    - agree, accept
    
    ✗ No positive keyword found
    
    Default to 2nd option:
    "Junior (0-2 yrs)" ✓
            ↓
    User can edit if wrong!
```

## 7. Data Flow Architecture
```
Storage:
┌────────────────────────────────────┐
│  chrome.storage.local              │
├────────────────────────────────────┤
│ userProfile: {                     │
│   firstName: "John",               │
│   lastName: "Doe",                 │
│   email: "john@example.com",       │
│   ...                              │
│ }                                  │
├────────────────────────────────────┤
│ commonQuestions: {                 │
│   "How did you hear about us?":   │
│   "LinkedIn",                      │
│   ...                              │
│ }                                  │
├────────────────────────────────────┤
│ applyMode: "auto" or "manual"      │
│ useAIAnswers: true/false           │
└────────────────────────────────────┘
           ↑
           │
    ┌──────┴──────┐
    │             │
 Popup UI    Content Script
(popup.js)  (content.js)
    │             │
    └──────┬──────┘
           ↓
    Job Application
    Form in Browser
```

## 8. User Journey

### Quick Setup (First Time)
```
1. Open popup
   ↓
2. Go to Profile tab
   ↓
3. Fill in your information
   ↓
4. Click "Save Profile"
   ↓
5. Go to FAQ tab
   ↓
6. Add common questions you answer repeatedly
   ↓
7. Done! Now go apply to jobs
```

### Job Application (Every Time)
```
1. Find job on LinkedIn/Indeed/etc
   ↓
2. Click "Apply"
   ↓
3. See application form
   ↓
4. Click JobHunter extension icon
   ↓
5. Choose mode:
   - Manual: You review & click
   - Auto: Extension submits
   ↓
6. Click "Autofill & Apply"
   ↓
7. Form fills automatically
   ↓
8. Submit application!
```

## 9. Features Comparison

### Before (Manual):
```
Time per application: 5-10 minutes
- Read form
- Manually type name
- Copy-paste email
- Find phone number
- Select country
- Answer questions
- Click submit
```

### After (With JobHunter):
```
Time per application: 30-60 seconds
- One click: "Autofill & Apply"
- Form fills automatically
- Click submit (or auto-submit)
- Done!

80% time savings! ⚡
```

## 10. Example Profile Setup

```
PERSONAL INFORMATION:
┌────────────────────────────────────┐
│ First Name      │ John              │
│ Last Name       │ Doe               │
│ Email           │ john@example.com  │
│ Phone           │ (555) 123-4567    │
│ Address         │ 123 Main St       │
│ City            │ New York          │
│ State           │ NY                │
│ Zip Code        │ 10001             │
│ Country         │ United States     │
│ LinkedIn        │ linkedin.com/..   │
│ Work Auth       │ Citizen           │
└────────────────────────────────────┘

COMMON QUESTIONS:
┌─────────────────────────────────────┐
│ Q: How did you hear about us?       │
│ A: LinkedIn                         │
├─────────────────────────────────────┤
│ Q: Are you willing to relocate?     │
│ A: Yes, open to opportunities       │
├─────────────────────────────────────┤
│ Q: Do you require sponsorship?      │
│ A: No, I'm a US Citizen             │
├─────────────────────────────────────┤
│ Q: Expected salary range?           │
│ A: Negotiable based on role         │
└─────────────────────────────────────┘
```

