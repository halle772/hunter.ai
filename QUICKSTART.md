# JobHunter - Quick Start Guide

## What's Fixed (v1.0.1)

✅ **Apply feature now works!** Auto-fill forms with your profile AND attach documents
✅ **Better error handling** - No more silent failures
✅ **Debug logging** - Console shows exactly what's happening
✅ **Robust file attachment** - Handles all document formats

## 5-Minute Setup

### Step 1: Set Your Profile (2 min)
```
1. Click JobHunter icon
2. Click "Profile" tab
3. Fill in your details:
   - Name, Email, Phone
   - Address, City, State, Zip
   - LinkedIn, Work Authorization
4. Click "Save Profile"
```

### Step 2: Upload Documents (2 min)
```
1. Click "Documents" tab
2. Click "Upload Resume" → Select PDF/DOC/DOCX/TXT
3. Click "Upload Cover Letter" (optional)
4. Verify files appear in list
```

### Step 3: Test It! (1 min)
```
1. Open: test_form.html in your browser
2. Click JobHunter icon
3. Go to "Autofill" tab
4. Select Resume & Cover Letter
5. Click "Apply with Selected Documents"
6. ✓ Form should fill and show success message
```

## Using It on Job Sites

### Method 1: Auto-Fill (Recommended)
```
1. Create a Rule for the site
2. Enable "Auto-fill on page load"
3. Form fills automatically when you visit
```

### Method 2: Manual Fill
```
1. Click JobHunter on the job application page
2. Click "Fill Now" button
3. Form fills with your profile
```

### Method 3: Apply with Documents
```
1. Click JobHunter on the job application page
2. Go to "Autofill" tab
3. Select your Resume & Cover Letter
4. Click "Apply with Selected Documents"
5. Form fills AND documents attach!
```

## Create Your First Rule (Optional)

```
1. Click JobHunter → Rules tab
2. Click "Add Rule"
3. Fill in:
   - Rule Name: "LinkedIn Jobs"
   - URL Pattern: "*linkedin.com*"
   - Field Mappings:
     • Selector: #firstName, Value: Your First Name
     • Selector: #email, Value: Your Email
4. Click Save
```

## If Something Doesn't Work

### Check Console Logs
```
1. Press F12 (DevTools)
2. Click "Console" tab
3. Try the Apply button again
4. Look for messages like:
   ✓ "Got profile, attempting to fill form..."
   ✗ "Error getting profile..."
```

### Most Common Issues

**"Could not fill form on this page"**
→ This site may block autofill. Try manual fill instead.

**Files not attaching**
→ Some sites use custom upload buttons. Manual upload needed.

**Profile not saving**
→ Check console for errors, try refreshing the extension

**Form fields not filling**
→ Site may use different field IDs. Create a custom rule with correct selectors.

## File Structure

```
jobhunter/
├── popup.html          Main extension UI
├── popup.js            Form logic
├── popup.css           Styling
├── content.js          Auto-fill engine
├── background.js       Storage & rules
├── manifest.json       Extension config
├── test_form.html      ← Test page (TEST HERE FIRST!)
├── icons/              Extension icons
└── docs/
    ├── README.md           Full documentation
    ├── DEBUGGING_GUIDE.md   Troubleshooting
    ├── FIX_SUMMARY.md       Technical details
    └── CHANGES.md           What changed
```

## Tips & Tricks

### 💡 Test Locally First
```
Open test_form.html before testing on real job sites
This isolates issues and lets you debug easily
```

### 💡 Check Your Profile
```
Go to Profile tab and verify all fields are saved
Some fields might be empty if not filled
```

### 💡 Inspect Form Fields
```
Right-click on a form field → Inspect
Look at the field's ID or name
Use these for CSS selectors in rules
```

### 💡 Use Browser Console
```
Press F12, go to Console
Type: document.querySelectorAll('input')
This shows all input fields on the page
```

## Keyboard Shortcuts

| Action | How |
|--------|-----|
| Open Extension | Click icon in toolbar |
| Open DevTools | F12 |
| Test Apply Feature | Open test_form.html |
| Check Logs | F12 → Console tab |
| Save Profile | Ctrl+S (in Profile tab) |

## Support

**See an error?** → Check DEBUGGING_GUIDE.md
**Need help?** → Open console (F12) and screenshot the error
**Want to customize?** → Create rules with specific CSS selectors
**Something broken?** → Check test_form.html first to isolate the issue

## What's Stored

✓ Saved locally on your device (not sent anywhere)
✓ Profile data encrypted by Chrome
✓ Documents stored in browser storage
✓ Rules synced to your Chrome account (optional)

## Next Steps

1. ✅ Set up your profile
2. ✅ Upload your documents  
3. ✅ Test with test_form.html
4. ✅ Try on LinkedIn/Indeed
5. ✅ Create rules for your favorite sites

---

**Version:** 1.0.1 (Fixed "Apply with Documents")  
**Status:** ✅ Production Ready  
**Last Updated:** January 17, 2026

**Questions?** Check the documentation files:
- FIX_SUMMARY.md - What was fixed
- DEBUGGING_GUIDE.md - How to debug
- README.md - Full feature documentation
