/**
 * JOB APPLICATION PAGE DETECTOR
 * 
 * Detects job application forms on various job boards
 * and provides context about the application
 */

class JobApplicationDetector {
  constructor() {
    this.detectedPlatforms = new Set([
      'greenhouse',
      'lever',
      'ashby',
      'workable',
      'bamboohr',
      'guidepoint',
      'linkedin',
      'indeed',
      'builtin',
      'powertofly',
      'hired',
      'angellist',
      'triplebyte'
    ]);
    
    // Mark page as analyzed to avoid multiple popups
    this.pageAnalyzed = false;
  }

  /**
   * Mark page as analyzed
   */
  markAsAnalyzed() {
    this.pageAnalyzed = true;
    // Also set in sessionStorage to persist across nav
    sessionStorage.setItem('jobhunter-page-analyzed', 'true');
    console.log('✓ Page marked as analyzed');
  }

  /**
   * Check if page has been analyzed
   */
  hasBeenAnalyzed() {
    if (this.pageAnalyzed) {
      return true;
    }
    
    // Check session storage
    const analyzed = sessionStorage.getItem('jobhunter-page-analyzed');
    if (analyzed) {
      this.pageAnalyzed = true;
      return true;
    }
    
    return false;
  }

  /**
   * Detect if current page is a job application form OR job overview page
   */
  isJobApplicationPage() {
    const url = window.location.href.toLowerCase();
    const html = document.documentElement.innerHTML.toLowerCase();

    // Check if it's an APPLICATION page
    if (this.isJobApplicationURL(url)) {
      return true;
    }

    if (this.hasJobApplicationForm()) {
      return true;
    }

    if (this.hasJobApplicationContent(html)) {
      return true;
    }

    // Check if it's a JOB OVERVIEW page
    if (this.isJobOverviewPage()) {
      return true;
    }

    return false;
  }

  /**
   * Detect if current page is a job overview/details page
   */
  isJobOverviewPage() {
    const url = window.location.href.toLowerCase();
    const html = document.documentElement.innerHTML.toLowerCase();

    // URL patterns for job overview pages
    const overviewURLPatterns = [
      // LinkedIn job details
      /linkedin\.com\/jobs\/view/,
      
      // Indeed job details
      /indeed\.com\/viewjob/,
      /indeed\.com\/jobs\?.*jk=/,
      
      // Greenhouse job details
      /greenhouse\.io\/[^/]*\/jobs\//,
      
      // Lever job details
      /lever\.co\/[^/]*\/jobs\//,
      
      // Generic job detail patterns
      /\/jobs\/\d+/,
      /\/jobs\/[a-z0-9-]+/,
      /\/job-details/,
      /\/job-opening/
    ];

    if (overviewURLPatterns.some(pattern => pattern.test(url))) {
      return true;
    }

    // Check for job posting content without form
    const hasJobDetails = this.hasJobDetailsContent();
    const hasApplyButton = this.hasApplyButtonVisible();

    // If we have job details and can apply, it's likely a job overview page
    if (hasJobDetails && hasApplyButton && !this.hasJobApplicationForm()) {
      return true;
    }

    return false;
  }

  /**
   * Check for job details content (title, company, description, etc.)
   */
  hasJobDetailsContent() {
    const jobKeywords = [
      'job title',
      'company',
      'job description',
      'responsibilities',
      'requirements',
      'qualifications',
      'salary',
      'location',
      'experience'
    ];

    const html = document.documentElement.innerHTML.toLowerCase();
    const count = jobKeywords.filter(keyword => html.includes(keyword)).length;
    
    return count >= 3;
  }

  /**
   * Check if there's a visible "Apply" button
   */
  hasApplyButtonVisible() {
    const buttons = document.querySelectorAll('button, a[role="button"], [role="button"]');
    
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      if ((text.includes('apply') || text.includes('submit')) && btn.offsetParent !== null) {
        return true;
      }
    }

    return false;
  }

  /**
   * Check URL for job application patterns
   */
  isJobApplicationURL(url) {
    const patterns = [
      // Greenhouse
      /greenhouse\.io.*\/jobs/,
      /\.greenhouse\.io\//,
      
      // Lever
      /lever\.co/,
      
      // Ashby
      /ashby\.com/,
      
      // Workable
      /apply\.workable\.com/,
      
      // BambooHR
      /hire\.withgoogle\.com/,
      
      // LinkedIn
      /linkedin\.com\/jobs\/.*\/apply/,
      /linkedin\.com\/jobs\/view/,
      
      // Indeed
      /indeed\.com.*apply/,
      /secure\.indeed\.com/,
      
      // AngelList
      /angel\.co\/jobs/,
      
      // Built In
      /builtin\.com.*apply/,
      
      // Power to Fly
      /powertofly\.com\/jobs/,
      
      // Hired
      /hired\.com.*apply/,
      
      // Generic apply URLs
      /\/apply/,
      /\/application/,
      /\/careers/,
      /jobs\/apply/
    ];

    return patterns.some(pattern => pattern.test(url));
  }

  /**
   * Check for common job application form elements
   */
  hasJobApplicationForm() {
    // Look for apply/submit button with proper text checking
    const buttons = document.querySelectorAll('button, a[role="button"], [role="button"]');
    let hasApplyButton = false;
    
    for (const btn of buttons) {
      const text = btn.textContent.toLowerCase();
      if ((text.includes('apply') || text.includes('submit')) && btn.offsetParent !== null) {
        hasApplyButton = true;
        break;
      }
    }

    // Look for form with multiple inputs
    const forms = document.querySelectorAll('form');
    const hasComplexForm = Array.from(forms).some(form => {
      const inputs = form.querySelectorAll('input, textarea, select');
      return inputs.length >= 3;
    });

    // Look for job posting with form
    const hasJobPosting = document.querySelector(
      '[data-testid*="job"], [class*="job-posting"], [class*="job-details"]'
    );

    const hasApplicationForm = document.querySelector(
      '[class*="application"], [class*="apply"], [id*="apply"]'
    );

    return hasComplexForm && (hasJobPosting || hasApplicationForm) && hasApplyButton;
  }

  /**
   * Check page content for job application indicators
   */
  hasJobApplicationContent(html) {
    const jobKeywords = [
      'job title',
      'application form',
      'apply now',
      'submit application',
      'career',
      'position',
      'qualifications',
      'requirements'
    ];

    const count = jobKeywords.filter(keyword => html.includes(keyword)).length;
    return count >= 3;
  }

  /**
   * Detect which job board platform this is
   */
  detectPlatform() {
    const url = window.location.href.toLowerCase();
    const domain = new URL(window.location.href).hostname.toLowerCase();

    if (domain.includes('greenhouse')) return 'greenhouse';
    if (domain.includes('lever')) return 'lever';
    if (domain.includes('ashby')) return 'ashby';
    if (domain.includes('workable')) return 'workable';
    if (domain.includes('bamboohr')) return 'bamboohr';
    if (domain.includes('linkedin')) return 'linkedin';
    if (domain.includes('indeed')) return 'indeed';
    if (domain.includes('angel')) return 'angellist';
    if (domain.includes('builtin')) return 'builtin';
    if (domain.includes('powertofly')) return 'powertofly';
    if (domain.includes('hired')) return 'hired';
    if (domain.includes('triplebyte')) return 'triplebyte';
    if (domain.includes('guidepoint')) return 'guidepoint';
    if (domain.includes('workopolis')) return 'workopolis';

    // Generic detection
    if (url.includes('/apply') || url.includes('/application')) {
      return 'generic';
    }

    return 'unknown';
  }

  /**
   * Extract job information from page
   */
  extractJobInfo() {
    return {
      title: this.extractJobTitle(),
      company: this.extractCompanyName(),
      url: window.location.href,
      platform: this.detectPlatform(),
      formFields: this.countFormFields()
    };
  }

  /**
   * Extract job title from page
   */
  extractJobTitle() {
    // Common selectors for job titles
    const selectors = [
      'h1',
      '[data-testid*="job-title"]',
      '[class*="job-title"]',
      '[class*="position-title"]',
      '.posting-title'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.trim();
        if (text.length > 0 && text.length < 200) {
          return text;
        }
      }
    }

    return 'Job Position';
  }

  /**
   * Extract company name from page
   */
  extractCompanyName() {
    const selectors = [
      '[data-testid*="company"]',
      '[class*="company"]',
      '[class*="company-name"]',
      '.company-name',
      '[itemprop="hiringOrganization"]'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.textContent.trim();
        if (text.length > 0 && text.length < 100) {
          return text;
        }
      }
    }

    return 'Company';
  }

  /**
   * Count form fields on page
   */
  countFormFields() {
    const inputs = document.querySelectorAll('input, textarea, select');
    return inputs.length;
  }

  /**
   * Get all form fields on page
   */
  getFormFields() {
    return Array.from(document.querySelectorAll('input, textarea, select')).map(
      (field, index) => ({
        index,
        element: field,
        type: field.tagName.toLowerCase(),
        name: field.name || field.id || `field-${index}`,
        placeholder: field.placeholder || '',
        label: this.findFieldLabel(field),
        required: field.required || false
      })
    );
  }

  /**
   * Find label for a form field
   */
  findFieldLabel(field) {
    // Check for associated label
    const label = document.querySelector(`label[for="${field.id}"]`);
    if (label) return label.textContent.trim();

    // Check previous sibling
    let sibling = field.previousElementSibling;
    while (sibling) {
      if (sibling.tagName === 'LABEL') {
        return sibling.textContent.trim();
      }
      sibling = sibling.previousElementSibling;
    }

    // Check parent
    const parent = field.closest('div, fieldset');
    if (parent) {
      const labelInParent = parent.querySelector('label');
      if (labelInParent) {
        return labelInParent.textContent.trim();
      }
    }

    // Use placeholder as fallback
    return field.placeholder || field.name || '';
  }

  /**
   * Check if page has been analyzed before
   */
  hasBeenAnalyzed() {
    return document.querySelector('[data-jobhunter-analyzed]') !== null;
  }

  /**
   * Mark page as analyzed
   */
  markAsAnalyzed() {
    const marker = document.createElement('div');
    marker.setAttribute('data-jobhunter-analyzed', 'true');
    marker.style.display = 'none';
    document.body.appendChild(marker);
  }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = JobApplicationDetector;
}

console.log('✓ Job Application Detector loaded');
