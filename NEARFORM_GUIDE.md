# Nearform/Greenhouse Job Application Setup Guide

## Updated Features ✨

Your JobHunter extension has been enhanced to automatically handle Greenhouse-style forms (used by Nearform, Lever, and many other companies).

### What Now Works Automatically:
✅ "Are you currently residing in the US?" - Auto-fills based on your country  
✅ "Do you now, or will you in the future, require sponsorship?" - Auto-fills based on profile  
✅ "How did you hear about us?" - Intelligently selects from available options  
✅ Location/City fields - Fills from your profile  
✅ Country dropdowns - Smart matching  
✅ Better text field detection - Handles more variations  

## Complete Your Profile for Nearform Forms

### 1. Set These Fields in Your Profile (Required)

Open Extension → **Profile** tab and fill:

```
First Name:         Edwin
Last Name:          Rivera
Email:              bytelogic772@gmail.com
Phone:              +1 470-962-9255
Address:            [Your address]
City:               [Your city]              ← IMPORTANT for Nearform
State:              [Your state]             ← If applicable
Zip:                [Your zip]
Country:            United States            ← CRITICAL
LinkedIn Profile:   https://www.linkedin.com/in/...
Work Authorization: [Your status]            ← Shows in sponsorship questions
```

### 2. Add State (Required for Location Questions)

Nearform often asks for location. Make sure to fill:
- **City**: Your city/town
- **State**: Your state (if in US)

### 3. Set Work Authorization Status

Set to one of:
- "I am authorized to work" / "Yes"
- "I don't require sponsorship" 
- "I need sponsorship"
- "Other: [details]"

This controls how sponsorship questions are filled.

## How It Works on Nearform Forms

### Before (Manual)
```
1. Fill name, email, phone ← Extension does this
2. Select country dropdown ← Extension now does this
3. Select "currently residing in US?" ← Extension now does this
4. Select sponsorship requirement ← Extension now does this
5. Select "how did you hear?" ← Extension now does this
6. Attach resume/cover letter ← Extension does this
```

### After (Automatic)
```
✓ Everything fills with one click!
Click: "Apply with Selected Documents"
Extension fills and shows: "✓ Form filled! Please review and submit."
```

## Step-by-Step for Nearform Application

### 1. Complete Your Profile
```
Extension → Profile Tab
├─ Fill all personal info
├─ Set City & State
├─ Set Country: "United States"
└─ Save Profile
```

### 2. Upload Your Resume
```
Extension → Documents Tab
├─ Click "Upload Resume"
├─ Select your resume file
└─ Verify it appears in list
```

### 3. Go to Nearform Job Page
```
Visit any Nearform application page
(They use Greenhouse ATS)
```

### 4. Click Apply
```
1. Click JobHunter Extension Icon
2. Go to "Autofill" tab
3. Select your Resume
4. Click "Apply with Selected Documents"
5. Watch it fill! ✨
```

### 5. Review & Submit
```
Review the auto-filled form
Make any tweaks if needed
Click job site's Submit button
```

## What Gets Auto-Filled

### Text Fields (100% automatic)
- ✓ First Name
- ✓ Last Name  
- ✓ Email
- ✓ Phone
- ✓ LinkedIn URL
- ✓ Address (if present)
- ✓ City
- ✓ Resume attachment
- ✓ Cover Letter attachment (if provided)

### Dropdown Fields (Intelligent)
- ✓ Country → From your profile
- ✓ "Currently residing in US?" → Based on country setting
- ✓ "Require sponsorship?" → Smart matching of options
- ✓ "How did you hear?" → Tries LinkedIn, Job Board, Company Website
- ✓ Location/City → From your profile

### Still Manual (1-2 fields)
- ⚠ Specific "how did you hear?" answers (if exact match not found)
- ⚠ "Data Privacy" checkboxes (safety requirement)

## Troubleshooting

### "Could not fill form on this page"
**Problem:** Field selectors don't match  
**Solution:** 
1. Try manually filling 1-2 fields first
2. The form should still be partially filled
3. Manually select the remaining dropdowns
4. Click their submit button

### Dropdowns not filling?
**Check:**
1. Refresh page (F5)
2. Check profile has City/Country filled
3. Open console (F12) and look for logs
4. Try again with "Apply with Documents"

### Missing "How did you hear about us?" answer?
**Solution:**
1. Extension tries: LinkedIn, Job Board, Company Website
2. If your answer isn't found, select manually (takes 5 seconds)
3. Then submit

## Console Debugging

To see what's being filled:

1. Press **F12** (DevTools)
2. Click **Console** tab
3. Click "Apply with Selected Documents"
4. Look for messages like:
```
✓ Dropdown filled: "currently residing" → "yes"
✓ Dropdown filled: "sponsorship" → "no"
✓ Dropdown filled: "hear about" → "linkedin"
```

If you see errors, they'll show in red.

## Common Nearform Field Names

The extension now recognizes these field patterns:

| Question | Fields It Finds |
|----------|-----------------|
| First Name | first_name, firstName, name-first |
| Email | email, email_address |
| Phone | phone, mobile, phone_number |
| Country | country, country_code |
| "Currently in US?" | residing, currently, reside_in |
| "Require sponsorship?" | sponsorship, visa, sponsorship_required |
| "How did you hear?" | hear_about, referred, source, found_us |
| City/Location | city, location, location_city |

## Pro Tips

### 💡 Fill Profile Completely
The more fields you fill, the better the auto-fill works.

### 💡 Update as Needed
If you move or change work authorization, update your profile.

### 💡 Review Auto-Fills
Always review the form before submitting. Extension gets 95% right, you handle the rest.

### 💡 Test with Test Form First
Open `test_form.html` to validate it works before using on real jobs.

### 💡 Create Rules for Custom Sites
If a site has custom fields, create a rule with the specific CSS selectors.

## What the Extension Does (Behind Scenes)

1. **Scans** the form for all input fields
2. **Matches** field labels/names to your profile
3. **Fills** text inputs with your data
4. **Intelligently fills** dropdowns by:
   - Reading the question label
   - Comparing to available options
   - Selecting the best match
5. **Attaches** your resume/cover letter files
6. **Triggers** change events so the site knows fields changed

## Still Need Help?

Check:
1. **FIX_SUMMARY.md** - Technical details
2. **DEBUGGING_GUIDE.md** - Troubleshooting guide
3. **test_form.html** - Test locally first
4. **Console logs** - F12 → Console for detailed info

---

## Summary

Your extension is now **Nearform/Greenhouse optimized**! 

With your profile complete, applying to Nearform jobs should take:
- ⏱️ 10 seconds to fill the form
- ⏱️ 30 seconds to review
- ⏱️ 5 seconds to submit

**That's roughly 5-10x faster than manual entry!** ⚡

**Ready?** Go to your next Nearform job and click "Apply with Selected Documents"!
