# JobHunter - Rule-Based Autofill Chrome Extension

A fast and efficient Chrome extension for automatically filling form fields based on customizable rules and profiles.

## Features

- **Rule-Based Autofill**: Create rules that automatically fill form fields on specific websites
- **URL Pattern Matching**: Use wildcards to match URLs (e.g., `*linkedin.com*`, `*.indeed.com`)
- **CSS Selectors**: Target form fields using CSS selectors
- **User Profile Management**: Save your personal information and reuse across applications
- **Document Upload**: Store resumes and cover letters for quick application
- **Apply with Documents**: Auto-fill forms with your profile AND attach your documents
- **Quick Fill Button**: Manually trigger autofill on demand
- **Auto-fill on Page Load**: Optionally auto-fill forms when pages load
- **Easy Rule Management**: Create, edit, and delete rules via an intuitive popup UI
- **Chrome Autofill Integration**: Import data from Chrome's autofill settings

## Installation

1. Clone or download this extension folder
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon will appear in your toolbar

## Usage

### Create Your First Rule

1. Click the extension icon in your toolbar
2. Go to the "Rules" tab
3. Click "Add Rule"
4. Fill in:
   - **Rule Name**: A descriptive name (e.g., "LinkedIn Jobs")
   - **URL Pattern**: The website pattern (e.g., `*linkedin.com*` or `*`)
   - **Field Mappings**: Map CSS selectors to values
     - Selector: `#email` or `input[name='firstName']`
     - Value: The text to fill

### Example Rules

**LinkedIn Job Application**
- Rule Name: LinkedIn Jobs
- URL Pattern: `*linkedin.com*`
- Field Mappings:
  - Selector: `#firstName`, Value: `John`
  - Selector: `#lastName`, Value: `Doe`
  - Selector: `#email`, Value: `john@example.com`

**Indeed Application**
- Rule Name: Indeed Jobs
- URL Pattern: `*indeed.com*`
- Field Mappings:
  - Selector: `input[name='fullName']`, Value: `John Doe`
  - Selector: `input[name='email']`, Value: `john@example.com`

### Auto-fill Methods

1. **Manual**: Click the extension icon and click "Fill Now"
2. **Auto on Load**: Enable "Auto-fill on page load" to automatically fill matching forms

## How It Works

- **Background Script** (`background.js`): Manages rules and storage
- **Content Script** (`content.js`): Executes on every page to autofill forms
- **Popup UI** (`popup.html/js/css`): Interface for rule management
- **Manifest** (`manifest.json`): Extension configuration

## Storage

Rules are saved in Chrome's synchronized storage, so they sync across devices where you're logged in to Chrome.

## Tips

- Test your CSS selectors in the browser console first using `document.querySelector()` or `document.querySelectorAll()`
- Use `*` as URL pattern to apply a rule to all websites
- Enable/disable rules without deleting them
- Rules are evaluated in order, so create more specific patterns first

## Keyboard Shortcuts

Coming soon: Custom keyboard shortcuts for quick autofill

## Version

1.0.0 - Initial release
