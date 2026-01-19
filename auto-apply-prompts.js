/**
 * MASTER PROMPTS FOR AUTO-APPLY BRAIN
 * Single powerful prompt system for all qualitative questions
 */

const AutoApplyPrompts = {
  /**
   * 3. THE ONE MASTER PROMPT (AUTO-APPLY BRAIN)
   * Handles ALL qualitative questions safely
   */
  HYBRID_AUTO_APPLY: `You are an AI assistant helping a candidate apply for a job.

STRICT RULES (NON-NEGOTIABLE):
1. Use ONLY the information provided in the resume and experience sections.
2. Do NOT exaggerate, fabricate, or infer experience not explicitly mentioned.
3. Do NOT claim leadership, certifications, or tools unless explicitly present in the resume.
4. Do NOT add skills not directly listed.
5. Keep answers professional, concise, and role-relevant (3-5 sentences max).
6. If information is insufficient, write a conservative, honest answer.
7. Prioritize truthfulness over impressiveness.

CONTEXT:
Candidate Resume Summary:
{{resume_summary}}

Key Skills (verbatim from resume):
{{skills}}

Years of Experience: {{experience_years}}

Experience Highlights:
{{experience_highlights}}

---

Job Details:
Company: {{company_name}}
Role: {{role}}
Job Description:
{{job_description}}

---

QUESTION TO ANSWER:
{{question}}

TASK:
1. Identify the question type (technical, behavioral, motivation, culture fit).
2. Check resume for relevant experience or skills.
3. Generate a truthful, specific answer aligned with the job description.
4. Ground the answer in concrete resume examples (optional if relevant).
5. Avoid clichés, buzzwords, and generic answers.
6. If information is lacking, state what you would need or give a conservative answer.

Return ONLY the answer text (no preamble, no meta-commentary).`,

  /**
   * 4. CONFIDENCE SELF-EVALUATION PROMPT (INTERNAL)
   */
  CONFIDENCE_EVALUATION: `Evaluate this generated answer for truthfulness and resume alignment.

Candidate Resume:
{{resume_summary}}

Question:
{{question}}

Generated Answer:
{{answer}}

EVALUATION CRITERIA:
1. Resume Alignment: Is every claim verifiable in the resume? (0-1)
2. Question Relevance: Does it actually answer the question? (0-1)
3. Truthfulness: Are there any exaggerations or false claims? (0-1)
4. Specificity: Are examples concrete or vague? (0-1)
5. Confidence: How confident are you this answer would be accepted? (0-1)

Return JSON ONLY (no explanation):
{
  "resume_alignment": 0.9,
  "question_relevance": 0.95,
  "truthfulness": 1.0,
  "specificity": 0.85,
  "overall_confidence": 0.92,
  "issues": ["any issues found"],
  "recommendation": "APPROVE" | "REVIEW" | "REJECT"
}`,

  /**
   * BEHAVIORAL QUESTION PROMPT
   * Specialized for "Tell us about a time when..." questions
   */
  BEHAVIORAL_QUESTION: `Answer this behavioral interview question using the STAR method (Situation, Task, Action, Result).

Resume/Experience:
{{resume_summary}}

Question:
{{question}}

REQUIREMENTS:
1. Ground answer in a REAL example from your resume.
2. Make it specific (mention actual project, tool, or scenario).
3. Highlight what YOU did, not the team.
4. Quantify results if possible (numbers, percentages, time saved).
5. Keep it to 2-3 sentences.

Return ONLY the answer (no STAR labels in output).`,

  /**
   * MOTIVATION / WHY COMPANY PROMPT
   * Specialized for "Why do you want to work here?" questions
   */
  MOTIVATION_QUESTION: `Answer "Why do you want to work at [company]?" using the candidate's background.

Candidate Background:
{{resume_summary}}

Company: {{company_name}}
Role: {{role}}
Job Description: {{job_description}}

REQUIREMENTS:
1. Show genuine interest in the company/role (not generic).
2. Connect your experience to what the company needs.
3. Be honest about what attracts you (career growth, problem domain, culture, etc.).
4. Avoid sounding desperate or overly flattering.
5. Keep to 2-3 sentences.

Return ONLY the answer.`,

  /**
   * TECHNICAL QUESTION PROMPT
   * For questions like "What's your experience with [technology]?"
   */
  TECHNICAL_QUESTION: `Answer this technical experience question based on actual resume skills.

Resume Skills: {{skills}}
Experience: {{experience_highlights}}

Question: {{question}}

REQUIREMENTS:
1. Be honest about your proficiency level (if resume shows basic, say basic).
2. Mention specific projects where you used this technology.
3. Include versions, frameworks, or context if relevant.
4. Do NOT claim expertise beyond what's in the resume.
5. 2-3 sentences max.

Return ONLY the answer.`,

  /**
   * ELIGIBILITY QUESTION PROMPT
   * For legal/eligibility questions (use stored data only, no AI inference)
   */
  ELIGIBILITY_QUESTION: `Return the candidate's pre-stored answer for this eligibility question.

Stored Profile Data:
{{profile_data}}

Question: {{question}}

REQUIREMENT:
1. Return ONLY the stored answer verbatim.
2. Do NOT interpret, rephrase, or infer.
3. If no stored answer exists, return: "Requires manual input"

Return the answer ONLY.`,

  /**
   * MEMORY ADAPTATION PROMPT
   * Adapt a previously successful answer to a similar question
   */
  MEMORY_ADAPTATION: `Adapt this previously successful answer to the new but similar question.

Original Question: {{original_question}}
Original Answer (Approved): {{original_answer}}

New Question: {{new_question}}

REQUIREMENTS:
1. Keep the core message and specific examples from the original.
2. Adjust language to match the new question's framing.
3. Do NOT add new claims or examples.
4. Do NOT inflate the adapted version.
5. Keep the same length and tone.

Return ONLY the adapted answer.`,

  /**
   * FACTUAL FIELD MAPPING
   * Simple rule-based extraction from profile
   */
  FACTUAL_FIELD_MAPPING: {
    'first name': 'profile.firstName',
    'last name': 'profile.lastName',
    'email': 'profile.email',
    'phone': 'profile.phone',
    'mobile': 'profile.phone',
    'address': 'profile.address',
    'city': 'profile.city',
    'state': 'profile.state',
    'country': 'profile.country',
    'zip': 'profile.zipCode',
    'postal code': 'profile.zipCode',
    'linkedin': 'profile.linkedinProfile',
    'portfolio': 'profile.portfolioUrl',
    'github': 'profile.githubUrl'
  }
};

/**
 * HELPER: Format prompts with data
 */
function formatPrompt(template, data) {
  let prompt = template;
  
  // Replace all {{variable}} placeholders
  const regex = /\{\{([^}]+)\}\}/g;
  prompt = prompt.replace(regex, (match, key) => {
    return data[key.trim()] || `[${key} not provided]`;
  });

  return prompt;
}

/**
 * HELPER: Prepare resume summary for AI
 */
function prepareResumeData(resumeObject) {
  return {
    summary: resumeObject.summary || 'Not provided',
    skills: (resumeObject.skills || []).join(', '),
    experience_years: resumeObject.totalYears || '0',
    experience_highlights: (resumeObject.highlights || []).join('\n'),
    companies: (resumeObject.companies || []).join(', '),
    positions: (resumeObject.positions || []).join(', ')
  };
}

// Export for use in content.js and background.js
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    AutoApplyPrompts,
    formatPrompt,
    prepareResumeData
  };
}
