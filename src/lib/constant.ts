const constants = {
  ANALYZE_RESUME_PROMPT: `First, determine if this document is actually a resume. Look for:
- Professional experience, work history, or employment information
- Education background, degrees, or academic information  
- Skills, qualifications, or professional competencies
- Contact information and personal details

If this is NOT a resume (e.g., invoice, receipt, contract, article, manual, etc.), respond with:
{
  "error": "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections."
}

If this IS a resume, analyze it thoroughly and provide comprehensive feedback in this JSON format:
{
  "overallScore": "X/10",
  "strengths": [
    "strength 1", 
    "strength 2", 
    "strength 3"
  ],
  "improvements": [
    "improvement 1", 
    "improvement 2", 
    "improvement 3"
  ],
  "keywords": [
    "keyword 1", 
    "keyword 2", 
    "keyword 3"
  ],
  "summary": "Brief overall assessment",
  "performanceMetrics": {
    "formatting": X,
    "contentQuality": X,
    "keywordUsage": X,
    "atsCompatibility": X,
    "quantifiableAchievements": X
  },
  "actionItems": [
    "specific actionable item 1",
    "specific actionable item 2", 
    "specific actionable item 3"
  ],
  "proTips": [
    "professional tip 1",
    "professional tip 2",
    "professional tip 3"
  ],
  "atsChecklist": [
    "ats requirement 1",
    "ats requirement 2", 
    "ats requirement 3"
  ]
}

For performanceMetrics, rate each area 1-10 based on:

- formatting: Layout, structure, visual appeal, consistency, readability. Look for clean sections, proper spacing, consistent fonts, professional appearance
- contentQuality: Relevance, achievements, impact, clarity, completeness. Assess if content is relevant to target roles, achievements are well-described, and information is complete
- keywordUsage: Industry terms, ATS optimization, skill keywords, job relevance. Check for industry-specific terminology, technical skills, software names, methodologies, and relevant keywords
- atsCompatibility: ATS-friendly formatting, scannable structure, proper headings. Evaluate if resume uses standard section headers (Experience, Education, Skills), avoids graphics/images, has clean formatting, and is easily parsable by ATS systems
- quantifiableAchievements: Use of numbers, percentages, metrics in accomplishments. Look for specific numbers, percentages, dollar amounts, timeframes, team sizes, project scopes, and measurable results

For atsCompatibility specifically, be VERY STRICT and professional. Evaluate based on these critical ATS requirements:

FORMATTING REQUIREMENTS (Must be ATS-parsable):
- Uses standard section headings EXACTLY as: "Professional Experience" or "Work Experience", "Education", "Skills", "Summary" or "Professional Summary"
- Single-column layout (no multi-column designs that confuse parsers)
- Standard fonts only (Arial, Calibri, Georgia, Times New Roman, etc.)
- No headers, footers, text boxes, or content outside main body
- No graphics, images, icons, charts, or visual elements
- No tables (use simple bullet points instead)
- Clear date formats (MM/YYYY or Month YYYY)
- Consistent bullet point style throughout

CONTENT REQUIREMENTS (Must be keyword-optimized):
- Industry-specific keywords appear naturally in context
- Job titles match standard industry nomenclature
- Technical skills listed explicitly (not just implied)
- Acronyms spelled out on first use with acronym in parentheses
- Hard skills and soft skills clearly identifiable
- Certifications and degrees use official full names

STRUCTURE REQUIREMENTS (Must be logically organized):
- Contact information at top (name, phone, email, LinkedIn, location)
- Reverse chronological order for experience and education
- Clear job titles with company names and dates
- 3-6 bullet points per position focusing on achievements
- Consistent formatting for all entries in each section
- No unexplained gaps in employment (or gaps addressed professionally)

ACHIEVEMENT REQUIREMENTS (Must demonstrate impact):
- Action verbs start each bullet point (Led, Developed, Implemented, Managed, etc.)
- Quantified results with specific metrics (%, $, #, timeframes)
- STAR method implied (Situation, Task, Action, Result)
- Business impact clearly stated (revenue, efficiency, cost savings, user growth)

RED FLAGS TO PENALIZE HEAVILY:
- Creative/artistic resume templates
- Images, logos, or profile photos
- Colored backgrounds or decorative elements
- Unusual fonts or font sizes below 10pt
- Text in headers/footers
- Skills shown as progress bars or graphics
- Missing contact information
- Vague job descriptions without measurable results
- Inconsistent date formats
- Spelling or grammatical errors

For atsChecklist, provide 5-7 SPECIFIC, ACTIONABLE items that the candidate MUST address to improve ATS compatibility. Be precise and professional. Format as: "Issue: [specific problem] → Action: [exact fix needed]"

For actionItems, provide specific, actionable steps the user can take immediately to improve their resume.

For proTips, give professional advice that would help them in their job search and resume optimization.

Document text:
{{DOCUMENT_TEXT}}`,

  JOB_RECOMMENDER_PROMPT: `First, determine if this document is actually a resume. Look for:
- Professional experience, work history, or employment information
- Education background, degrees, or academic information  
- Skills, qualifications, or professional competencies
- Contact information and personal details

If this is NOT a resume (e.g., invoice, receipt, contract, article, manual, etc.), respond with:
{
  "error": "This document does not appear to be a resume. Please upload a proper resume containing professional experience, education, and skills sections."
}

If this IS a resume, extract the most relevant professional keywords and skills that would be useful for job matching. Focus on:
- Technical skills and technologies
- Industry-specific terminology
- Professional competencies and qualifications
- Job titles and roles mentioned
- Years of experience and expertise areas

Respond with ONLY a JSON array of 5-8 keyword strings that best represent this resume for job matching purposes.

Document text:
{{DOCUMENT_TEXT}}`,
};

export const METRIC_CONFIG = [
  {
    key: "formatting",
    label: "Formatting",
    defaultValue: 7,
    colorClass: "from-emerald-400 to-emerald-500",
    shadowClass: "group-hover/item:shadow-emerald-500/30",
    icon: "🎨",
  },
  {
    key: "contentQuality",
    label: "Content Quality",
    defaultValue: 6,
    colorClass: "from-blue-400 to-blue-500",
    shadowClass: "group-hover/item:shadow-blue-500/30",
    icon: "📝",
  },
  {
    key: "atsCompatibility",
    label: "ATS Compatibility",
    defaultValue: 6,
    colorClass: "from-violet-400 to-violet-500",
    shadowClass: "group-hover/item:shadow-violet-500/30",
    icon: "🤖",
  },
  {
    key: "keywordUsage",
    label: "Keyword Usage",
    defaultValue: 5,
    colorClass: "from-purple-400 to-purple-500",
    shadowClass: "group-hover/item:shadow-purple-500/30",
    icon: "🔍",
  },
  {
    key: "quantifiableAchievements",
    label: "Quantified Results",
    defaultValue: 4,
    colorClass: "from-orange-400 to-orange-500",
    shadowClass: "group-hover/item:shadow-orange-500/30",
    icon: "📊",
  },
];

export const buildPresenceChecklist = (text: any) => {
  const content = (text || "").toLowerCase();

  // Helper function to check for patterns
  const hasPattern = (pattern: RegExp): boolean => pattern.test(content);

  // Helper to check multiple required sections
  const hasRequiredSections = (): boolean => {
    const experienceSection = /\b(experience|work\s+history|employment|professional\s+experience)\b/.test(content);
    const educationSection = /\b(education|academic|qualifications)\b/.test(content);
    const skillsSection = /\b(skills|competencies|technical\s+skills|core\s+competencies)\b/.test(content);

    // At least 2 of these 3 sections should be present
    return [experienceSection, educationSection, skillsSection].filter(Boolean).length >= 2;
  };

  return [
    {
      label: "Uses Standard Section Headings (Experience, Education, Skills)",
      present: hasRequiredSections(),
    },
    {
      label: "Contains Complete Contact Information",
      present: hasPattern(/(@|email|e-mail)/) &&
               hasPattern(/(\d{3}[-.\s]?\d{3}[-.\s]?\d{4}|\+\d{1,3}\s?\d+|phone|mobile|cell)/),
    },
    {
      label: "Includes Industry-Relevant Keywords & Technical Skills",
      present: hasPattern(/\b(skills|technologies|competencies|proficient|expertise|knowledge)\b/) &&
               // Check for actual skill mentions
               hasPattern(/\b(java|python|javascript|react|node|sql|aws|azure|gcp|docker|kubernetes|agile|scrum|management|leadership|marketing|sales|design|engineering|development|analysis|communication)\b/),
    },
    {
      label: "Contains Quantified Achievements with Measurable Results",
      present: hasPattern(/\d+\s*%|\$\s*\d+|increased|decreased|improved|reduced|grew|generated|saved/) &&
               hasPattern(/\b\d+\s*(percent|%|users|customers|revenue|million|thousand|team|projects?|years?|months?)\b/),
    },
    {
      label: "Uses Strong Action Verbs to Start Bullet Points",
      present: hasPattern(/\b(led|managed|developed|created|implemented|designed|built|achieved|delivered|launched|improved|increased|reduced|optimized|established|coordinated|directed|supervised|analyzed|executed|spearheaded|pioneered|transformed|streamlined|enhanced|initiated|facilitated)\b/),
    },
    {
      label: "Includes Detailed Professional Experience with Job Titles",
      present: hasPattern(/\b(experience|employment|work\s+history)\b/) &&
               hasPattern(/\b(manager|director|engineer|developer|analyst|designer|consultant|specialist|coordinator|lead|senior|junior|associate|executive)\b/) &&
               hasPattern(/\d{4}|present|current/), // Has dates
    },
    {
      label: "Contains Education Section with Degree Information",
      present: hasPattern(/\b(education|academic|qualifications)\b/) &&
               hasPattern(/\b(bachelor|master|mba|phd|degree|university|college|diploma|certification|certificate|b\.s\.|m\.s\.|b\.a\.|m\.a\.)\b/),
    },
    {
      label: "Uses Clean, Simple Formatting (No Complex Graphics or Tables)",
      present: !hasPattern(/(█|▓|▒|░|●|○|◆|◇|■|□|▪|▫|★|☆)/) && // No visual bars/graphics
               !hasPattern(/\[={2,}\]|\|={2,}\|/) && // No ASCII tables
               !hasPattern(/skill\s*level|proficiency\s*level|rating/), // No skill ratings that imply graphics
    },
  ];
};

export default constants;
