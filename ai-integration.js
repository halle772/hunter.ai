/**
 * AI INTEGRATION MODULE
 * Handles OpenAI, Ollama, and other LLM integrations
 * Generates intelligent answers for job application questions
 */

class AIIntegration {
  constructor() {
    this.apiProvider = 'openai'; // 'openai', 'ollama', 'huggingface'
    this.apiKey = '';
    this.apiEndpoint = '';
    this.model = 'gpt-3.5-turbo';
    this.enabled = false;
    this.loadSettings();
  }

  async loadSettings() {
    try {
      const { aiSettings = {} } = await chrome.storage.local.get('aiSettings');
      this.apiProvider = aiSettings.provider || 'openai';
      this.apiKey = aiSettings.apiKey || '';
      this.apiEndpoint = aiSettings.endpoint || '';
      this.model = aiSettings.model || 'gpt-3.5-turbo';
      this.enabled = aiSettings.enabled || false;
      console.log('AI settings loaded:', { provider: this.apiProvider, enabled: this.enabled });
    } catch (error) {
      console.error('Error loading AI settings:', error);
    }
  }

  async saveSettings(settings) {
    try {
      await chrome.storage.local.set({ aiSettings: settings });
      this.apiProvider = settings.provider;
      this.apiKey = settings.apiKey;
      this.apiEndpoint = settings.endpoint;
      this.model = settings.model;
      this.enabled = settings.enabled;
      console.log('AI settings saved');
    } catch (error) {
      console.error('Error saving AI settings:', error);
    }
  }

  /**
   * Generate an answer for a form question
   * @param {string} question - The question text
   * @param {string} label - The field label
   * @param {object} userProfile - User's profile data
   * @param {string} jobDescription - Job description context
   * @returns {Promise<string>} - Generated answer
   */
  async generateAnswer(question, label, userProfile = {}, jobDescription = '') {
    if (!this.enabled || !this.apiKey) {
      console.warn('AI is not enabled or API key is missing');
      return '';
    }

    try {
      const prompt = this.buildPrompt(question, label, userProfile, jobDescription);
      
      switch (this.apiProvider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'ollama':
          return await this.callOllama(prompt);
        case 'huggingface':
          return await this.callHuggingFace(prompt);
        default:
          return '';
      }
    } catch (error) {
      console.error('Error generating answer:', error);
      return '';
    }
  }

  /**
   * Build a prompt for the AI model
   */
  buildPrompt(question, label, userProfile, jobDescription) {
    const context = `
You are a professional job application assistant. Generate a concise, professional answer to the following question for a job application.

User Profile:
- Name: ${userProfile.firstName} ${userProfile.lastName}
- Email: ${userProfile.email}
- Phone: ${userProfile.phone}
- Experience: ${userProfile.experience || 'Not specified'}
- Skills: ${userProfile.skills || 'Not specified'}

Question: ${question}
Field Label: ${label}

${jobDescription ? `Job Description Context:\n${jobDescription}\n` : ''}

Generate a professional, honest answer suitable for a job application. Keep it concise (1-2 sentences max for text fields).
Answer:`;

    return context.trim();
  }

  /**
   * Call OpenAI API
   */
  async callOpenAI(prompt) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are a professional job application assistant. Generate concise, professional answers for job applications.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 500
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.choices[0].message.content.trim();
      return answer;
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw error;
    }
  }

  /**
   * Call Ollama API (local)
   */
  async callOllama(prompt) {
    try {
      const endpoint = this.apiEndpoint || 'http://localhost:11434/api/generate';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          prompt: prompt,
          stream: false,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.statusText}`);
      }

      const data = await response.json();
      const answer = data.response.trim();
      return answer;
    } catch (error) {
      console.error('Ollama API error:', error);
      throw error;
    }
  }

  /**
   * Call HuggingFace API
   */
  async callHuggingFace(prompt) {
    try {
      const response = await fetch(
        `https://api-inference.huggingface.co/models/${this.model}`,
        {
          headers: { Authorization: `Bearer ${this.apiKey}` },
          method: 'POST',
          body: JSON.stringify({ inputs: prompt })
        }
      );

      if (!response.ok) {
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      }

      const result = await response.json();
      const answer = result[0].generated_text.trim();
      return answer;
    } catch (error) {
      console.error('HuggingFace API error:', error);
      throw error;
    }
  }

  /**
   * Test API connection
   */
  async testConnection() {
    try {
      const testPrompt = 'What is your name?';
      const answer = await this.generateAnswer(testPrompt, 'test', {}, '');
      return { success: true, answer };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate answers for multiple questions
   */
  async generateAnswers(questions, userProfile = {}, jobDescription = '') {
    const answers = {};

    for (const question of questions) {
      try {
        const answer = await this.generateAnswer(
          question.text,
          question.label,
          userProfile,
          jobDescription
        );
        answers[question.id] = answer;
        
        // Add delay to avoid rate limiting
        await this.delay(500);
      } catch (error) {
        console.error(`Error generating answer for question: ${question.text}`, error);
        answers[question.id] = '';
      }
    }

    return answers;
  }

  /**
   * Validate answer before submission
   */
  validateAnswer(answer, fieldType) {
    if (!answer || answer.trim().length === 0) {
      return { valid: false, reason: 'Answer is empty' };
    }

    if (fieldType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        valid: emailRegex.test(answer),
        reason: emailRegex.test(answer) ? 'Valid email' : 'Invalid email format'
      };
    }

    if (fieldType === 'phone') {
      const phoneRegex = /^[\d\-\+\(\)\s]{10,}$/;
      return {
        valid: phoneRegex.test(answer),
        reason: phoneRegex.test(answer) ? 'Valid phone' : 'Invalid phone format'
      };
    }

    if (answer.length > 5000) {
      return { valid: false, reason: 'Answer is too long' };
    }

    return { valid: true, reason: 'Valid answer' };
  }

  /**
   * Extract job description from page
   */
  extractJobDescription() {
    // Common selectors for job descriptions
    const selectors = [
      '[data-testid="jobDescription"]',
      '.job-description',
      '.job-details',
      '[class*="description"]',
      'article',
      'main'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (element) {
        const text = element.innerText;
        if (text.length > 100) {
          return text.substring(0, 2000); // Limit to 2000 chars
        }
      }
    }

    return '';
  }

  /**
   * Helper: delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Create global instance
window.aiIntegration = new AIIntegration();
