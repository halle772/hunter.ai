# 🧪 Testing the New Form Filling Features

## Quick Start Test (5 minutes)

### Step 1: Set Your Profile
1. Click the JobHunter extension icon
2. Click "Profile" tab
3. Fill in at least:
   - First Name: John
   - Last Name: Doe
   - Email: john.doe@example.com
   - Phone: (555) 123-4567
   - Country: United States
   - Work Auth: Citizen
4. Click "Save Profile"

### Step 2: Add Common Questions
1. Click "FAQ" tab
2. Add a common question:
   - Question: "How did you hear about us?"
   - Answer: "LinkedIn"
3. Click "Add Question"
4. Add another:
   - Question: "Are you willing to relocate?"
   - Answer: "Yes"
5. Click "Add Question"

### Step 3: Test on a Job Application
1. Go to any job application form (LinkedIn, Indeed, Greenhouse, etc.)
2. Click the JobHunter "Autofill & Apply" button
3. Watch as your form is automatically filled with:
   - Your profile data (Name, Email, Phone, etc.)
   - Your common question answers
   - Smart dropdown selections (Yes/No questions default to affirmative)
4. If using "Auto Apply" mode, it will submit automatically
5. If using "Manual Apply" mode, you can review before clicking submit

## Expected Results

### Profile Fields Should Fill:
- ✅ First Name → "John"
- ✅ Last Name → "Doe"
- ✅ Email → "john.doe@example.com"
- ✅ Phone → "(555) 123-4567"
- ✅ Country → "United States" (or exact match from dropdown)
- ✅ Work Authorization → "Citizen" (or best match)

### Dropdowns Should Select:
- ✅ "How did you hear about us?" → "LinkedIn" (from common questions)
- ✅ "Are you willing to relocate?" → "Yes" (from common questions)
- ✅ Unknown dropdowns → First positive option (Yes, True, Apply, Submit, etc.)

### Common Questions Used:
- ✅ Matching questions by keyword search
- ✅ Fallback to positive answers if no match
- ✅ Edit/Delete buttons working in FAQ tab

## Troubleshooting

### "Fields not filling?"
1. **Check Profile Saved** - Open popup, Profile tab, verify data is there
2. **Check Browser Console** - Press F12, look for "✓" or "❌" messages
3. **Check Field Names** - Form field labels should contain: first, last, email, phone, etc.
4. **Test with Manual Mode** - Sometimes Auto mode needs the page to fully load

### "Dropdown not selecting?"
1. Check if it's a required field (required attribute on HTML)
2. Verify dropdown options contain matching text
3. Check browser console for matching logs

### "Common questions not working?"
1. Verify in FAQ tab they're saved
2. The form field must have matching keywords
3. Try adding a question with broader keywords

## Technical Debugging

### To see detailed logs:
1. Press F12 to open Developer Tools
2. Go to Console tab
3. Look for messages starting with "✓" or "❌"

Example console output:
```
✓ Filled field: email → john.doe@example.com
✓ Filled dropdown: how did you hear about us?
✓ Filled 12 form fields
```

### Check Profile Data in Storage:
```javascript
// Paste in Console:
chrome.storage.local.get(['userProfile', 'commonQuestions'], (result) => {
  console.log('Profile:', result.userProfile);
  console.log('FAQ:', result.commonQuestions);
});
```

## Sample Test Sites

### Free Job Sites to Test:
1. **LinkedIn Jobs** - linkedin.com/jobs
2. **Indeed** - indeed.com
3. **Greenhouse** - greenhouse.io (job listings)
4. **Lever** - lever.co (job listings)
5. **Ashby** - Use test applications

### Recommended Test Flow:
1. Go to job board
2. Click "Apply"
3. Fill in first field manually to see popup
4. Click JobHunter button
5. Watch auto-fill work
6. Switch modes and test again

## Performance Notes

- Form filling takes 1-2 seconds for large forms
- Dropdowns are filled intelligently (best match or positive option)
- No network calls needed - everything is local
- Works offline once profile is saved

## Reporting Issues

If something doesn't work:
1. Note the job site (LinkedIn, Indeed, etc.)
2. Take a screenshot of the form
3. Check browser console for error messages
4. Check the field labels/names - they must match keywords
5. Try "Manual Apply" mode instead of "Auto Apply"

---

## Success Criteria ✓

Your implementation is working when:
1. ✅ Profile fields are saved and persist
2. ✅ FAQ tab shows questions after adding them
3. ✅ Form fields fill automatically on job pages
4. ✅ Dropdowns select reasonable default values
5. ✅ Common question answers are used in matching
6. ✅ No JavaScript errors in console
7. ✅ Both Manual and Auto Apply modes work
8. ✅ Edit/Delete buttons work in FAQ tab
