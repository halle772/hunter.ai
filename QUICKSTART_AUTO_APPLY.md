# Quick Start - Auto-Apply Feature

## What's New?

Your JobHunter extension now has two powerful apply modes:

### 🔵 Manual Apply Mode
- ✅ Extension **fills form fields automatically**
- ✅ Extension can **generate AI answers** for questions
- ✅ **You click** continue/next/submit buttons manually
- **Best for:** Reviewing answers, having control

### 🟢 Auto Apply Mode  
- ✅ Extension **fills fields automatically**
- ✅ Extension **clicks buttons automatically**
- ✅ Extension **navigates multi-step forms**
- ✅ **Fully automated** - set it and forget it!
- **Best for:** Applying to many jobs quickly

---

## 5-Minute Setup

### Step 1: Fill Your Profile
1. Open extension → **Profile** tab
2. Enter your: Name, Email, Phone, Address, Work Auth
3. Click **Save Profile**

### Step 2: Choose Mode
1. Open extension → **Autofill** tab
2. Select **Manual Apply** (easier to start) or **Auto Apply** (fully automatic)

### Step 3 (Optional): Enable AI
1. Open extension → **AI Settings** tab
2. Check "Enable AI Answer Generation"
3. Choose provider:
   - **OpenAI** - Best quality but costs money (~$0.01/application)
   - **Ollama** - Free! Install from ollama.ai (runs locally)
   - **HuggingFace** - Free tier available
4. Click "Test Connection" to verify

### Step 4: Start Applying!
1. Go to job application page
2. Click extension icon → "Fill Now"
3. **Manual**: Review form, click continue/next manually
4. **Auto**: Sit back and let it do the work!

---

## What Gets Filled?

The extension automatically fills:
- ✅ First name, last name, email, phone
- ✅ Address, city, state, zip, country
- ✅ LinkedIn profile, portfolio links
- ✅ Work authorization/visa status
- ✅ Open-ended questions (with AI enabled)

---

## Auto Apply Workflow

When you enable **Auto Apply**, here's what happens:

1. **Fill** - Extension fills all visible form fields
2. **Click** - Extension clicks the "Next" or "Continue" button
3. **Wait** - Waits for new form to load
4. **Repeat** - Fills the new form, clicks button again
5. **Submit** - Detects and clicks final "Submit" button
6. **Done** - Application submitted! ✅

---

## AI Settings

### Using OpenAI (Costs Money)
```
1. Get API key: https://platform.openai.com/api-keys
2. Paste in extension
3. Select GPT-3.5 (faster/cheaper) or GPT-4 (smarter)
4. Test connection
Cost: ~$0.001-0.01 per application
```

### Using Ollama (FREE - Local)
```
1. Install: https://ollama.ai
2. Run model: ollama pull llama2 && ollama serve
3. In extension: Select Ollama, endpoint: http://localhost:11434/api/generate
4. Test connection
Cost: FREE! All processing on your computer
```

### Using HuggingFace (FREE - Some Limits)
```
1. Get token: https://huggingface.co/settings/tokens
2. Paste in extension
3. Select a model (e.g., Mistral-7B)
4. Test connection
Cost: FREE tier available (with limits)
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Forms not filling | Make sure Profile tab is saved with data |
| Buttons not clicking | Try Manual mode first, check console for errors |
| AI not working | Click "Test Connection" in AI Settings |
| Extension not showing | Reload page, reload extension |

---

## Safety Tips

✅ Your profile data stays on your computer
✅ AI APIs are only called when enabled
✅ No data is ever sent to unknown servers
✅ All form data is validated before submission

---

## Tips for Best Results

1. **Start with Manual Apply** - Test it, see what it fills
2. **Complete your Profile** - More details = better fills
3. **Use Ollama for AI** - Free and no API keys needed
4. **Review in Manual Mode** - Check AI answers before auto mode
5. **Test on one job first** - Make sure it works on that site

---

## Next Steps

- ✅ Set up your profile
- ✅ Choose apply mode
- ✅ (Optional) Set up AI
- ✅ Find a job posting
- ✅ Click "Fill Now"
- ✅ Watch it work! 🎉

---

For detailed guide, see **ENHANCEMENT_GUIDE.md**
