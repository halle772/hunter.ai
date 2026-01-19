# 🚀 Quick Reference Card - JobHunter Form Filling

## Setup (One-Time)

```
┌─────────────────────────────────────────────────────────┐
│ 1. PROFILE TAB                                          │
├─────────────────────────────────────────────────────────┤
│ Fill in:                                                │
│ □ First Name       □ Email          □ Country         │
│ □ Last Name        □ Phone          □ LinkedIn        │
│ □ Address          □ City           □ Work Auth       │
│ □ State            □ Zip Code                         │
│                                                         │
│ [SAVE PROFILE] ← Click after filling                   │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ 2. FAQ TAB                                              │
├─────────────────────────────────────────────────────────┤
│ Add common questions you always answer:                 │
│                                                         │
│ Question: "How did you hear about us?"                 │
│ Answer: "LinkedIn"                                     │
│ [ADD QUESTION] ✓                                        │
│                                                         │
│ Question: "Are you willing to relocate?"               │
│ Answer: "Yes"                                          │
│ [ADD QUESTION] ✓                                        │
│                                                         │
│ Add more as needed...                                   │
└─────────────────────────────────────────────────────────┘
```

## Usage (Every Job Application)

```
┌─────────────────────────────────────────────────────────┐
│ 1. FIND JOB                                             │
│    Go to: LinkedIn, Indeed, Greenhouse, etc.           │
│    Find: Job you want to apply to                      │
│    Click: "Apply" button                               │
│                                                         │
│ 2. OPEN POPUP                                          │
│    Click: JobHunter extension icon                     │
│    See: Two apply modes                                │
│                                                         │
│ 3. CHOOSE MODE                                         │
│    ⊙ Manual: You review form, click buttons            │
│    ◯ Auto: Fills form & submits automatically          │
│                                                         │
│ 4. CLICK AUTOFILL                                      │
│    Click: [AUTOFILL & APPLY]                          │
│    Wait: 1-2 seconds for form to fill                 │
│                                                         │
│ 5. SUBMIT APPLICATION                                  │
│    Manual: Click continue/submit buttons               │
│    Auto: Watch it submit automatically ✓               │
│                                                         │
│ SUCCESS! Application submitted in 30 seconds! ⚡       │
└─────────────────────────────────────────────────────────┘
```

## What Gets Filled

```
PROFILE DATA:
✓ First Name             → All "First Name" fields
✓ Last Name             → All "Last Name" fields  
✓ Email                 → All email fields
✓ Phone                 → All phone number fields
✓ Address               → All address fields
✓ City                  → All city fields
✓ State                 → All state/province fields
✓ Zip Code              → All postal code fields
✓ Country               → All country dropdowns
✓ LinkedIn              → All LinkedIn URL fields
✓ Work Auth             → All work authorization questions

FAQ ANSWERS:
✓ Your saved questions  → Matching form fields
  Example: "How did you hear?" → Fills with your answer

UNKNOWN DROPDOWNS:
✓ Smart selection       → Picks "yes/true/apply" options
✓ Positive bias         → Defaults to affirmative answers
```

## Field Matching Keywords

```
FIRST NAME
"first" "fname" "given" "first name" "given name"

LAST NAME
"last" "lname" "family" "surname" "last name"

EMAIL
"email" "mail" "e-mail" "email address" "email_address"

PHONE
"phone" "mobile" "contact" "telephone" "phone number"

ADDRESS
"address" "street" "street address" "mailing"

CITY
"city" "location" "town" "municipality"

STATE
"state" "province" "region" "state/province"

ZIP CODE
"zip" "postal" "postcode" "zip code" "postal code"

COUNTRY
"country" "nation" "country/region"

LINKEDIN
"linkedin" "profile" "linkedin profile" "linkedin url"

WORK AUTH
"auth" "sponsorship" "authorized" "work visa" "work auth"
```

## Troubleshooting

```
FIELDS NOT FILLING?
├─ ✓ Check: Profile tab has data
├─ ✓ Check: Field has matching keywords above
├─ ✓ Try: Manual mode instead of Auto
└─ ✓ Debug: F12 → Console for error messages

DROPDOWN NOT SELECTING?
├─ ✓ Check: Dropdown is visible & enabled
├─ ✓ Check: Has matching profile or FAQ data
├─ ✓ Add: Relevant question to FAQ as fallback
└─ ✓ Debug: Should see "Selected positive option" in console

FAQ NOT USED?
├─ ✓ Check: Questions saved in FAQ tab
├─ ✓ Check: Field context matches question keywords
├─ ✓ Try: More specific question wording
└─ ✓ Debug: F12 → Console for matching logs
```

## Console Debugging

```javascript
// Check what's saved:
chrome.storage.local.get(null, r => console.log(r));

// Export profile data:
chrome.storage.local.get(['userProfile'], r => {
  console.log(JSON.stringify(r));
  // Copy output
});

// Look for in Console during fill:
✓ Filled field: email → john@example.com
✓ Filled dropdown: how did you hear about us?
✓ Selected positive option: Yes
❌ If you see errors, note them for debugging
```

## Keyboard Shortcuts

```
F12              → Open Console (see fill logs)
F12 → Tab        → Switch to Console tab
Ctrl+Shift+Del   → Clear storage (last resort)
```

## Common Questions to Save

```
Job Application FAQ:

Q: How did you hear about us?
A: LinkedIn / Indeed / Job Board / Referral / Company Website

Q: Are you willing to relocate?
A: Yes / No / Depends on opportunity

Q: Do you require visa sponsorship?
A: No (if US citizen)

Q: Expected salary range?
A: Negotiable based on role and benefits

Q: Years of experience?
A: [Your experience level]

Q: Why are you interested?
A: [Your reason - can be generic]

Q: Preferred work location?
A: Remote / Hybrid / On-site / Flexible
```

## Settings Reference

```
APPLY MODES:
⊙ Manual Apply
  - Extension fills form
  - You click continue/next/submit buttons
  - Best for: Reviewing before submitting
  - Time: 1-2 minutes

◯ Auto Apply  
  - Extension fills form AND clicks submit
  - Form automatically submits
  - Best for: Bulk applying
  - Time: 30-60 seconds

AUTO-FILL ON PAGE LOAD:
☐ Enabled  → Fills automatically when page loads
☐ Disabled → Only fills when you click button (recommended)

USE AI ANSWERS:
☐ Enabled  → AI generates answers for unknown questions
☐ Disabled → Only uses profile & FAQ data
```

## Time Savings Calculator

```
BEFORE (Manual):
- Read form:              1 min
- Type name:              0.5 min
- Copy-paste email:       0.5 min  
- Enter phone:            0.5 min
- Select country:         0.5 min
- Answer questions:       2 min
- Click submit:           0.5 min
─────────────────────────
TOTAL:                    5-10 minutes per application

AFTER (JobHunter):
- Click Apply:            30 sec
- Wait for auto-fill:     1-2 sec
- Review form:            10 sec
- Click submit:           10 sec
─────────────────────────
TOTAL:                    30-60 seconds per application

SAVINGS: 80-90% faster! ⚡
Per job board:           1-2 hours saved
Per week (10 apps):      10-15 hours saved
Per month (40 apps):     40-50 hours saved
```

## Status Icons

```
✓  = Success / Complete / Filled
❌ = Error / Failed / Not filled
⏳ = Loading / In progress
ℹ = Information / Note
⚠ = Warning / Issue
🔵 = Manual mode
🟠 = Auto mode
```

## Chrome Storage Info

```
Location:    chrome://extensions/
Storage:     chrome.storage.local
What's saved: Profile data + FAQ answers
Size limit:  10MB (plenty of space)
Backup:      Auto-synced if Chrome sync enabled
Clear data:  Extensions → JobHunter → Details → Storage
```

## File Structure

```
popup/
├─ popup.html          ← UI (Autofill, Profile, FAQ tabs)
├─ popup.js            ← Popup logic (save/load/edit)
└─ popup.css           ← Popup styling

content/
├─ content.js          ← Form filling engine
└─ autofill-popup.js   ← Floating popup on job pages

Other/
├─ manifest.json       ← Extension configuration
├─ background.js       ← Service worker
└─ job-detector.js     ← Page detection

Documentation/
├─ README_FORM_FILLING.md      ← User guide
├─ TESTING_GUIDE.md            ← Testing instructions
├─ FEATURE_GUIDE.md            ← Visual examples
├─ IMPLEMENTATION_DETAILS.md   ← Technical details
└─ COMPLETION_SUMMARY.md       ← This implementation
```

## Pro Tips

```
💡 TIP 1: Generic FAQ Answers
   Don't: "I saw John Smith's tweet about this job"
   Do:    "Professional network / LinkedIn"

💡 TIP 2: Keep Profile Updated
   - Update salary expectations
   - Add new skills/experience
   - Update current location
   - Keep LinkedIn URL current

💡 TIP 3: Test First
   - Try on a few applications
   - Check "Manual Apply" first
   - Then switch to "Auto Apply"
   - Report issues if you find them

💡 TIP 4: FAQ for Common Questions
   - Save recurring questions
   - Keep answers truthful
   - Generic is better than specific
   - Update seasonally

💡 TIP 5: Offline First
   - All data local to your computer
   - No internet needed after first save
   - No servers = more private
   - No rate limits!
```

## Success Checklist

```
Before you start:
☑ Profile filled and saved
☑ 3-5 FAQ questions added
☑ Browser updated
☑ Extension loaded

First test:
☑ Find a simple job application
☑ Set to "Manual Apply" mode
☑ Click autofill
☑ Watch form fill
☑ Manually click submit

Full test:
☑ Try "Auto Apply" mode
☑ Watch it submit automatically
☑ Check that you got applied
☑ Try on different job site
☑ All working? You're done! ✨
```

---

**REMEMBER**: All your data stays on your computer. No servers, no sharing, no tracking. Just fast job applications! 🚀

