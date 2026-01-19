# JobHunter Debugging & Testing Guide

## Overview
This guide helps you test and debug the JobHunter extension's "Apply with Documents" feature.

## Quick Setup Steps

### 1. Set Up Your Profile
1. Click the JobHunter extension icon
2. Go to the **Profile** tab
3. Fill in your personal information (First Name, Last Name, Email, Phone, Address, City, State, Zip, Country, LinkedIn, Work Authorization)
4. Click **Save Profile**

### 2. Upload Documents
1. Go to the **Documents** tab
2. Upload a Resume (PDF, DOC, DOCX, or TXT)
3. Upload a Cover Letter (optional, same formats)
4. Verify files appear in the list

### 3. Test Form Filling

#### Using the Test Form
1. Open this test form in Chrome: `test_form.html` (open in browser)
2. Click the JobHunter extension icon
3. Go to the **Autofill** tab
4. Select your Resume from "Select Resume" dropdown
5. Select your Cover Letter from "Select Cover Letter" dropdown (optional)
6. Click **"Apply with Selected Documents"**

#### Expected Results
- Profile fields should auto-fill:
  - First Name, Last Name, Email, Phone
  - Address, City, State, Zip, Country
  - LinkedIn Profile, Work Authorization
- File inputs should be populated with your uploaded documents
- A success message should appear: "✓ Form filled! Please review and submit."

### 4. Troubleshooting

#### Issue: "Could not fill form on this page"
**Possible Causes:**
1. Content script not injected into the page
2. Extension doesn't have permission for the page
3. Form field selectors don't match

**Solutions:**
1. Check browser console for errors (F12 → Console tab)
2. Ensure the page is not a chrome:// or file:// URL
3. Try on a different website (tested on indeed.com, linkedin.com, etc.)

#### Issue: Profile data not appearing
1. Verify you saved the profile (check Profile tab)
2. Open DevTools (F12) → Application tab → Storage → Local Storage
3. Look for `userProfile` key - it should contain your data
4. If missing, re-save your profile

#### Issue: Documents not uploading
1. Check file size is under 5MB
2. Ensure file format is allowed: PDF, DOC, DOCX, TXT
3. Check browser console for upload errors
4. Try a different file format

#### Issue: Files not attaching to form
1. Check browser console (F12 → Console) for "attachFileToInput" errors
2. Verify the file input exists on the page (right-click → Inspect)
3. Some websites block file input manipulation - use manual upload instead
4. Check if the file input is hidden or requires a different interaction

### 5. Browser Console Debugging

Open DevTools (F12) and go to the **Console** tab while testing:

**Look for these success logs:**
```javascript
Got profile, attempting to fill form...
fillFormWithProfile called
applyWithDocuments called with: {...}
Filling form with documents...
Got resume document: filename.pdf
Got cover letter document: filename.docx
Attaching file: filename.pdf
File attached successfully: filename.pdf
```

**If you see errors:**
```javascript
Error getting profile: {...}
Error getting resume: {...}
attachFileToInput error: Could not parse file data
```
These indicate where the process failed.

### 6. Advanced Testing

#### Test with Rules
1. Go to the **Rules** tab
2. Create a rule for the test form:
   - Rule Name: "Test Form"
   - URL Pattern: "*test*" or "*"
   - Add field mappings:
     - Selector: `#firstName`, Value: `John`
     - Selector: `#email`, Value: `john@example.com`
3. The "Fill Now" button should use this rule automatically

#### Test Auto-fill on Load
1. Enable "Auto-fill on page load" checkbox in Settings
2. Create a rule for a website
3. Reload the page - form should auto-fill

#### Test Different Job Sites
Tested and working on:
- LinkedIn Job Application forms
- Indeed Application pages
- Greenhouse Job Boards
- Lever Application Forms
- Custom job application websites with standard form fields

### 7. Extension Files Reference

- **popup.html** - Extension UI (profile, documents, rules, autofill)
- **popup.js** - UI logic and message handling
- **content.js** - Injected into web pages, performs actual form filling
- **background.js** - Service worker, handles storage and message routing
- **manifest.json** - Extension configuration and permissions

### 8. Permissions Used

The extension requests:
- **storage** - Save your profile, documents, and rules
- **activeTab** - Interact with the current tab
- **scripting** - Inject content script
- **<all_urls>** - Work on any website

### 9. Getting Help

If "Apply" still doesn't work after troubleshooting:

1. **Check Console Errors** (F12 → Console)
   - Copy full error messages

2. **Check Form Structure**
   - Right-click on form fields → Inspect
   - Look for input IDs and names (should match field selectors)

3. **Verify Data Storage**
   - F12 → Application → Local Storage
   - Check `userProfile` and `documents` keys exist

4. **Test Manual Fields**
   - Try filling a single text input field
   - Check if focus/change events are firing
   - Try entering text manually, then use extension

### 10. Performance Notes

- Profile auto-fill is instant (< 100ms)
- Document retrieval may take 1-2 seconds
- File attachment depends on page reactivity
- Large PDFs (> 2MB) may take longer to process

---

**Version:** 1.0.0  
**Last Updated:** January 17, 2026
