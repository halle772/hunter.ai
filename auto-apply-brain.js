/**
 * AUTO-APPLY BRAIN
 * Unified Business Logic: LazyApply (speed) + Jobright (intelligence)
 * Classifies questions, applies rules, generates safe answers
 */

class AutoApplyBrain {
  constructor() {
    this.questionMemory = {}; // Store past answers for similar questions
    this.confidenceThreshold = 0.7;
    this.qualitativeQuestionLimit = 1; // Switch point for auto-submit
  }

  /**
   * 2.2 QUESTION CLASSIFICATION
   * Every question must fall into exactly ONE bucket
   */
  classifyQuestion(question, label = '') {
    const q = question.toLowerCase();
    const l = label.toLowerCase();
    const text = q + ' ' + l;

    // A. FACTUAL (Auto-Fill from profile)
    const factualPatterns = [
      'first name', 'last name', 'full name', 'email', 'phone',
      'mobile', 'contact', 'address', 'city', 'state', 'country',
      'zip', 'postal', 'linkedin', 'portfolio', 'github',
      'resume', 'cv', 'upload', 'file', 'attachment',
      'location', 'willing to relocate'
    ];

    if (factualPatterns.some(p => text.includes(p))) {
      return {
        type: 'FACTUAL',
        reason: 'Auto-fillable profile field',
        action: 'AUTO_FILL'
      };
    }

    // B. ELIGIBILITY (Truth-Only, stored answers)
    const eligibilityPatterns = [
      'work authorization', 'visa', 'authorized', 'eligible',
      'citizenship', 'relocation', 'background check',
      'clearance', 'security clearance', 'sponsorship',
      'legal right', 'work permit', 'residency',
      'drug test', 'require sponsorship'
    ];

    if (eligibilityPatterns.some(p => text.includes(p))) {
      return {
        type: 'ELIGIBILITY',
        reason: 'Legal/eligibility question',
        action: 'USE_STORED_ONLY'
      };
    }

    // D. LEGAL / ATTESTATION (Hard Stop)
    const legalPatterns = [
      'certify', 'penalty of law', 'attest', 'declare under',
      'background check', 'consent', 'acknowledgment',
      'agree to', 'terms and conditions', 'policy',
      'legal', 'liable', 'truthfulness'
    ];

    if (legalPatterns.some(p => text.includes(p))) {
      return {
        type: 'LEGAL_ATTESTATION',
        reason: 'Legal/certification requirement',
        action: 'MANUAL_REVIEW_REQUIRED'
      };
    }

    // C. QUALITATIVE (AI Answer)
    // Default to qualitative if not caught above
    return {
      type: 'QUALITATIVE',
      reason: 'Open-ended question requiring reasoning',
      action: 'AI_ANSWER'
    };
  }

  /**
   * 2.3 SPEED vs INTELLIGENCE SWITCH
   */
  shouldAutoSubmit(questions, classifications) {
    const qualitativeCount = classifications.filter(
      c => c.type === 'QUALITATIVE'
    ).length;

    if (qualitativeCount <= this.qualitativeQuestionLimit) {
      return {
        autoSubmit: true,
        reason: 'Low qualitative question count',
        riskLevel: 'LOW'
      };
    }

    return {
      autoSubmit: false,
      reason: 'Multiple qualitative questions require validation',
      riskLevel: 'MEDIUM'
    };
  }

  /**
   * 2.4 AI USAGE RULES
   * Validates AI-generated answers against resume
   */
  validateAIAnswer(answer, resumeData, question) {
    const issues = [];

    // Check for inflated claims
    if (this.detectSkillInflation(answer, resumeData)) {
      issues.push('Potential skill inflation detected');
    }

    if (this.detectExperienceInflation(answer, resumeData)) {
      issues.push('Potential experience inflation detected');
    }

    if (this.detectFalseClaims(answer, resumeData)) {
      issues.push('Claims not supported by resume');
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      confidence: this.calculateConfidence(issues.length)
    };
  }

  /**
   * 2.5 CONFIDENCE GATE
   */
  calculateConfidence(issueCount) {
    // Confidence formula: fewer issues = higher confidence
    const confidence = Math.max(0, 1 - (issueCount * 0.2));
    return Math.round(confidence * 100) / 100;
  }

  requiresManualReview(classification, confidence) {
    // Hard blocks
    if (classification.type === 'LEGAL_ATTESTATION') return true;
    if (classification.action === 'MANUAL_REVIEW_REQUIRED') return true;

    // Confidence gate
    if (classification.type === 'QUALITATIVE' && confidence < this.confidenceThreshold) {
      return true;
    }

    return false;
  }

  /**
   * 2.6 MEMORY & LEARNING
   */
  rememberAnswer(questionHash, answer, feedback) {
    this.questionMemory[questionHash] = {
      answer: answer,
      feedback: feedback,
      timestamp: new Date(),
      timesUsed: (this.questionMemory[questionHash]?.timesUsed || 0) + 1
    };
  }

  findSimilarQuestion(currentQuestion) {
    const currentHash = this.hashQuestion(currentQuestion);
    
    // Look for similar questions with good feedback
    for (const [hash, memory] of Object.entries(this.questionMemory)) {
      if (this.questionsSimilar(currentQuestion, memory.answer)) {
        if (memory.feedback === 'positive' || memory.feedback === 'accepted') {
          return {
            found: true,
            answer: memory.answer,
            confidence: 0.8 // Slightly lower confidence for adapted answers
          };
        }
      }
    }

    return { found: false };
  }

  questionsSimilar(q1, q2) {
    const keywords1 = q1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    const keywords2 = q2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
    
    const overlap = keywords1.filter(k => keywords2.includes(k)).length;
    return overlap / Math.min(keywords1.length, keywords2.length) > 0.6;
  }

  hashQuestion(question) {
    let hash = 0;
    for (let i = 0; i < question.length; i++) {
      hash = ((hash << 5) - hash) + question.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * 2.7 SUBMISSION RULES
   */
  canSubmit(formState) {
    const issues = [];

    // Check required fields
    if (formState.requiredUnanswered.length > 0) {
      issues.push(`Missing required fields: ${formState.requiredUnanswered.join(', ')}`);
    }

    // Check unapproved legal questions
    if (formState.legalQuestionsUnapproved.length > 0) {
      issues.push(`Legal questions require approval`);
    }

    // Check minimum confidence
    if (formState.lowConfidenceAnswers.length > 0) {
      issues.push(`${formState.lowConfidenceAnswers.length} low-confidence answer(s) need review`);
    }

    return {
      canSubmit: issues.length === 0,
      issues: issues,
      blockingReasons: issues.filter(i => 
        i.includes('Missing required') || i.includes('Legal') || i.includes('unapproved')
      )
    };
  }

  // Helper methods for validation
  detectSkillInflation(answer, resumeData) {
    // Look for superlatives and unverified claims
    const redFlags = ['expert', 'master', 'proficient', 'advanced', 'guru'];
    const hasRedFlag = redFlags.some(flag => answer.toLowerCase().includes(flag));
    
    if (hasRedFlag) {
      // Check if these skills are actually in resume with proof
      const skillsInResume = resumeData.skills || [];
      const answeredSkills = this.extractSkills(answer);
      const unverifiedSkills = answeredSkills.filter(s => 
        !skillsInResume.some(rs => rs.toLowerCase().includes(s.toLowerCase()))
      );
      
      return unverifiedSkills.length > 0;
    }

    return false;
  }

  detectExperienceInflation(answer, resumeData) {
    // Check for experience claims not in resume
    const yearsPattern = /(\d+)\+?\s*years/gi;
    const yearsInAnswer = answer.match(yearsPattern);
    const yearsInResume = (resumeData.totalExperience || '0 years').match(yearsPattern);

    if (yearsInAnswer && yearsInResume) {
      const answerYears = parseInt(yearsInAnswer[0]);
      const resumeYears = parseInt(yearsInResume[0]);
      return answerYears > resumeYears + 2; // Allow small discrepancy
    }

    return false;
  }

  detectFalseClaims(answer, resumeData) {
    // Check for claims that directly contradict resume
    const companies = resumeData.companies || [];
    const positions = resumeData.positions || [];
    
    // Look for company claims
    const companiesInAnswer = this.extractCompanyNames(answer);
    const uncheckedCompanies = companiesInAnswer.filter(c =>
      !companies.some(rc => rc.toLowerCase().includes(c.toLowerCase()))
    );

    return uncheckedCompanies.length > 0;
  }

  extractSkills(text) {
    // Simple skill extraction - in real impl, use NLP
    const skillKeywords = ['python', 'java', 'javascript', 'react', 'node', 'sql', 'aws'];
    return skillKeywords.filter(skill => text.toLowerCase().includes(skill));
  }

  extractCompanyNames(text) {
    // Simple company extraction
    const words = text.split(/\s+/);
    return words.filter(w => w.length > 3 && w[0] === w[0].toUpperCase());
  }
}

// Export for use in content.js and background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AutoApplyBrain;
}
