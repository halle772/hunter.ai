# Visual UI Guide - Auto-Apply Feature

## Extension Popup Layout

```
┌─────────────────────────────────────────┐
│         JobHunter Autofill              │ ← Header with logo
├─────────────────────────────────────────┤
│ [Autofill] [Profile] [Documents] [AI] [Rules] │ ← Tabs
├─────────────────────────────────────────┤
│                                         │
│           AUTOFILL TAB                  │
│                                         │
│  Quick Autofill                         │
│  ┌─────────────────────────────────┐   │
│  │     [Fill Now Button]           │   │ ← Green button
│  └─────────────────────────────────┘   │
│  Status: ✓ Ready                       │
│                                         │
│  Apply Mode                             │
│  ┌─────────────────────────────────┐   │
│  │ ◉ Manual Apply                  │   │ ← Radio button selected
│  │   I fill fields, you click      │   │
│  │                                 │   │
│  │ ○ Auto Apply                    │   │ ← Radio button
│  │   Fill all fields and submit    │   │
│  └─────────────────────────────────┘   │
│  Status: 🔵 Manual Mode Active         │
│                                         │
│  Settings                               │
│  ☑ Auto-fill on page load              │ ← Checkbox
│  ☑ Use AI to generate answers          │ ← Checkbox
│                                         │
│  Apply with Document                    │
│  Resume: [Select Resume ▼]              │
│  Cover Letter: [Select Letter ▼]        │
│  ┌─────────────────────────────────┐   │
│  │  [Apply with Documents]         │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Profile Tab Layout

```
┌─────────────────────────────────────────┐
│       Profile Tab Content               │
├─────────────────────────────────────────┤
│                                         │
│  Personal Information                   │
│                                         │
│  First Name: [John          ]           │
│  Last Name:  [Doe           ]           │
│  Email:      [john@mail.com ]           │
│  Phone:      [(555) 123-4567]           │
│  Address:    [123 Main St   ]           │
│  City:       [New York      ]           │
│  State:      [NY            ]           │
│  Zip Code:   [10001         ]           │
│  Country:    [United States ]           │
│  LinkedIn:   [https://link.in/...]      │
│  Work Auth:  [Citizen       ▼]          │
│                                         │
│  [Save Profile] [Load from Chrome]      │ ← Buttons
│  Status: ✓ Profile saved                │
│                                         │
└─────────────────────────────────────────┘
```

## AI Settings Tab Layout

```
┌─────────────────────────────────────────┐
│      AI Settings Tab Content            │
├─────────────────────────────────────────┤
│                                         │
│  AI Settings                            │
│                                         │
│  ☑ Enable AI Answer Generation          │ ← Toggle
│                                         │
│  AI Provider:                           │
│  [OpenAI (GPT-3.5 / GPT-4)  ▼]         │ ← Dropdown
│                                         │
│  ┌─ OpenAI Settings ─────────────────┐  │
│  │                                   │  │
│  │ OpenAI API Key:                   │  │
│  │ [sk-••••••••••••••••••] (hidden)  │  │
│  │ Get key from OpenAI API           │  │
│  │                                   │  │
│  │ Model:                            │  │
│  │ [GPT-3.5 Turbo ▼]                │  │
│  │ Options:                          │  │
│  │ - GPT-3.5 Turbo (Fast & Cheap)    │  │
│  │ - GPT-4 (Smarter)                 │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌─ Ollama Settings (hidden by default)┐ │
│  │                                   │  │
│  │ Endpoint:                         │  │
│  │ [http://localhost:11434/api/gen]  │  │
│  │ Make sure Ollama is running       │  │
│  │                                   │  │
│  │ Model:                            │  │
│  │ [llama2             ]             │  │
│  │                                   │  │
│  └───────────────────────────────────┘  │
│                                         │
│  [Test Connection] [Save AI Settings]   │ ← Buttons
│  Status: ✓ OpenAI connection OK         │
│                                         │
└─────────────────────────────────────────┘
```

## Documents Tab Layout

```
┌─────────────────────────────────────────┐
│    Documents Tab Content                │
├─────────────────────────────────────────┤
│                                         │
│  Resumes                                │
│  [+ Add Resume]                         │
│  ┌─────────────────────────────────┐   │
│  │ My Resume.pdf      [×]          │   │ ← Delete button
│  │ Resume 2024.docx   [×]          │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Cover Letters                          │
│  [+ Add Cover Letter]                   │
│  ┌─────────────────────────────────┐   │
│  │ Cover Letter.pdf   [×]          │   │ ← Delete button
│  │ Generic Letter.doc [×]          │   │
│  └─────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

## Rules Tab Layout

```
┌─────────────────────────────────────────┐
│       Rules Tab Content                 │
├─────────────────────────────────────────┤
│                                         │
│  Autofill Rules                         │
│  [Add Rule]                             │
│                                         │
│  LinkedIn Jobs                          │ ← Rule name
│  Pattern: linkedin.com/jobs/*           │
│  ☑ Enabled                              │
│  [Edit] [Delete]                        │
│                                         │
│  Indeed                                 │ ← Rule name
│  Pattern: indeed.com/viewjob/*          │
│  ☑ Enabled                              │
│  [Edit] [Delete]                        │
│                                         │
│  Glassdoor (disabled)                   │ ← Rule name
│  Pattern: glassdoor.com/job/*/          │
│  ○ Disabled                             │
│  [Edit] [Delete]                        │
│                                         │
│  ┌─ Rule Modal (when editing) ────────┐ │
│  │                                   │ │
│  │ Rule Name:                        │ │
│  │ [My Custom Rule        ]          │ │
│  │                                   │ │
│  │ URL Pattern:                      │ │
│  │ [linkedin.com or * for all]       │ │
│  │                                   │ │
│  │ ☑ Enabled                         │ │
│  │                                   │ │
│  │ Field Mappings:                   │ │
│  │ first_name     → firstName        │ │
│  │ last_name      → lastName         │ │
│  │ email_address  → email            │ │
│  │ [+ Add Field]                     │ │
│  │                                   │ │
│  │ [Save] [Delete] [Cancel]          │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

---

## How Modes Look in UI

### Manual Apply Mode Selected

```
Apply Mode

◉ Manual Apply
  I fill fields, you click continue/next

○ Auto Apply
  Fill all fields and submit automatically

🔵 Manual Mode:
You control button clicks. Extension fills form fields.
```

### Auto Apply Mode Selected

```
Apply Mode

○ Manual Apply
  I fill fields, you click continue/next

◉ Auto Apply
  Fill all fields and submit automatically

🟢 Auto Mode:
Extension fills fields AND clicks buttons automatically.
🤖 AI answer generation is ENABLED.
```

---

## Status Indicators

### Top of Extension

```
Status: ✓ Ready                    ← Green text when ready
Status: ⏳ Filling form...         ← Blue text while working
Status: ✓ Form filled!            ← Green text on success
Status: ❌ Could not fill form     ← Red text on error
```

### AI Settings

```
Connection: ✓ OpenAI connection OK         ← Green - working
Connection: ⏳ Testing connection...       ← Blue - testing
Connection: ❌ Failed: Invalid API Key     ← Red - error
```

### Apply Mode

```
Status: 🔵 Manual Mode Active      ← Blue indicator
Status: 🟢 Auto Mode Active        ← Green indicator
```

---

## Color Scheme

```
Primary Colors:
- Header background: Gradient (667eea to 764ba2)
- Buttons: #667eea (purple/blue)
- Success: #388e3c (green)
- Error: #d32f2f (red)
- Info: #1976d2 (blue)

Secondary Colors:
- Text: #333 (dark gray)
- Border: #ddd (light gray)
- Background: #f5f5f5 (off-white)
- Hover: #f0f4ff (light purple)
```

---

## Tab Navigation

```
┌──────────────────────────────────────────────────────────┐
│  [Autofill]▀ [Profile] [Documents] [AI Settings] [Rules] │
└──────────────────────────────────────────────────────────┘
   ↑ Active tab (shows content below)

Each tab shows different content:
- Autofill: Quick fill, apply mode, settings
- Profile: Personal information form
- Documents: Resume and cover letter uploads
- AI Settings: AI configuration and testing
- Rules: Custom autofill rules per website
```

---

## Interactive Elements

### Buttons
```
[Primary Button]     ← Blue, full width for main actions
[Secondary Button]   ← Gray, for secondary actions
[Danger Button]      ← Red, for delete/risky actions
[Small Button]       ← Inline button for add/remove
```

### Input Fields
```
[Regular Text Field        ]  ← Standard input
[Email Field        ]         ← For emails
[Password Field     ]         ← Hidden input
[Select Dropdown   ▼]         ← Dropdown menu
[Radio Button] Label          ← Single selection
☑ Checkbox         Label      ← Multiple selection
```

### Messages
```
✓ Success message              ← Green, checkmark
❌ Error message               ← Red, X mark
⏳ Loading message...          ← Blue, hourglass
ℹ Info message                 ← Blue, info icon
```

---

## Responsive Design

```
Desktop (400px width):
┌──────────────────────────┐
│   Full popup shown        │
│   All tabs accessible     │
│   Buttons full width      │
└──────────────────────────┘

Mobile/Narrow (300px width):
┌──────────────┐
│ Simplified   │
│ layout       │
│ Scrollable   │
└──────────────┘
```

---

## Key UI Interactions

### Toggle Apply Mode
```
User clicks radio button
    ↓
UI updates selected state
    ↓
Saves to chrome.storage
    ↓
Notifies content script
    ↓
Status message updates
```

### Test AI Connection
```
User clicks "Test Connection"
    ↓
UI shows "⏳ Testing..."
    ↓
background.js runs test
    ↓
Shows "✓ Connection OK" or "❌ Failed"
    ↓
Auto-hides message after 5 seconds
```

### Save Settings
```
User changes AI provider
    ↓
User clicks "Save AI Settings"
    ↓
Validates input
    ↓
Shows "⏳ Saving..."
    ↓
Stores in chrome.storage
    ↓
Shows "✓ Settings saved"
    ↓
Auto-hides message after 3 seconds
```

---

## Accessibility Features

```
✓ Labels for all inputs
✓ Keyboard navigation (Tab key)
✓ Color-coded status (+ icons, not just color)
✓ Clear radio button labels
✓ Proper form structure
✓ ARIA labels for accessibility
✓ Button hover states
✓ Focus indicators
```

---

This visual guide helps you understand the UI layout and interactions
when using the auto-apply feature!
