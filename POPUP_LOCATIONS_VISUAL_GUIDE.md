# 🎯 Popup Display Locations - Visual Guide

## Where the Popup Appears Now

### 1️⃣ Job Overview Pages
LinkedIn, Indeed, Greenhouse, Lever, etc. job details pages

```
┌─────────────────────────────────────────────────┐
│ Job Title: Senior Engineer                      │
│ Company: Acme Corp                              │
│ Location: San Francisco, CA                     │
│ Salary: $150K - $200K                           │
│                                                 │
│ About the role:                                 │
│ We're looking for...                            │
│                                                 │
│ Requirements:                                   │
│ • 5+ years experience                           │
│ • Node.js, React                                │
│ • ...                                           │
│                                                 │
│ [Apply Now Button]                              │
│                                                 │
│   ┌────────────────────────────┐  ← POPUP HERE
│   │ 🎯 JobHunter       [-] [×] │
│   ├────────────────────────────┤
│   │    📋 Job Overview        │
│   │                            │
│   │ Acme Corp                  │
│   │ Senior Engineer            │
│   │                            │
│   │ Ready to apply? Click the  │
│   │ button to proceed.         │
│   │                            │
│   │ [🚀 Go to Application]    │
│   │                            │
│   │ ✓ Ready to apply           │
│   └────────────────────────────┘
└─────────────────────────────────────────────────┘
```

### 2️⃣ Application Form Pages
Pages with actual application forms (textboxes, dropdowns, etc.)

```
┌─────────────────────────────────────────────────┐
│                                                 │
│ APPLICATION FORM FOR:                           │
│ Senior Engineer at Acme Corp                    │
│                                                 │
│ ┌─────────────────────────────┐  ← POPUP HERE
│ │ 🎯 JobHunter    [-] [×]    │
│ ├─────────────────────────────┤
│ │   📝 Application Form      │
│ │                             │
│ │ Acme Corp                   │
│ │ Senior Engineer             │
│ │                             │
│ │ Form Fields:                │
│ │ 8 fields                    │
│ │ 📝 5 inputs                 │
│ │ 📄 2 textareas              │
│ │ 📋 1 select                 │
│ │                             │
│ │ [⚡ Autofill Form]         │
│ │                             │
│ │ ✓ Ready to autofill         │
│ └─────────────────────────────┘
│                                                 │
│ First Name *                                    │
│ [_________________]                             │
│                                                 │
│ Last Name *                                     │
│ [_________________]                             │
│                                                 │
│ Email *                                         │
│ [_________________]                             │
│                                                 │
│ Phone                                           │
│ [_________________]                             │
│                                                 │
│ Resume *                                        │
│ [Upload File]                                   │
│                                                 │
│ Cover Letter                                    │
│ [_________________]                             │
│                                                 │
│ Years of Experience                             │
│ [Select...       ▼]                             │
│                                                 │
│ Tell us about yourself (optional)               │
│ [___________________________]                   │
│ [___________________________]                   │
│                                                 │
│ [Submit Application] [Cancel]                   │
│                                                 │
└─────────────────────────────────────────────────┘
```

## How to Identify Page Types

### Job Overview Page
- Shows job title, company, description
- Has an "Apply Now" or "Apply" button
- NO form inputs visible
- Single job posting displayed

### Application Form Page
- Shows form with input fields
- Has text boxes, dropdowns, file uploads
- May have multi-step form
- Form for applying to a specific job

## Popup Behavior

| Page Type | Badge | Button | Icon | Status |
|-----------|-------|--------|------|--------|
| **Overview** | 📋 Job Overview | Go to Application | 🚀 | Ready to apply |
| **Application** | 📝 Application Form | Autofill Form | ⚡ | Ready to autofill |

## User Workflow

### Typical Journey:

```
1. User browses job listing on LinkedIn
   ↓
2. Clicks on job title to view details
   ↓
3. JobHunter popup appears (overview page)
   ↓
4. User clicks "🚀 Go to Application"
   ↓
5. Page navigates to application form
   ↓
6. JobHunter popup updates (application page)
   ↓
7. User clicks "⚡ Autofill Form"
   ↓
8. Form fields auto-fill with profile data
   ↓
9. Apply button auto-clicks
   ↓
10. Application submitted ✓
```

## Supported Platforms

✅ LinkedIn Jobs
✅ Indeed
✅ Greenhouse
✅ Lever
✅ Ashby
✅ Workable
✅ Built In
✅ Generic job sites

The popup will appear on ANY page that has:
- Job posting information (title, company, description)
- OR job application form with fields
- AND a visible apply/submit button
