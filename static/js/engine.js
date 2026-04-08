// NLP UTILITIES 

const STOP_WORDS = new Set(['with','that','this','have','from','they','will','your','more','been','were',
 'their','than','also','into','about','when','which','there','these','those','would','could','should',
 'must','just','some','each','such','both','only','very','well','what','over','after','before','during',
 'through','between','against','without','within','using','used','work','working','worked','strong',
 'good','great','excellent','experience','years','year','and','the','for','are','was','has','had',
 'not','but','can','you','all','any','its','our','may','who','she','him','her','they','then','than']);

// Skill synonym groups for semantic matching
const SKILL_SYNONYMS = {
 'javascript': ['js','node','nodejs','react','vue','angular','typescript','ts'],
 'python': ['py','django','flask','fastapi','pandas','numpy'],
 'machine learning': ['ml','ai','deep learning','neural network','tensorflow','pytorch','keras','sklearn'],
 'sql': ['mysql','postgresql','postgres','sqlite','database','db','oracle'],
 'cloud': ['aws','azure','gcp','google cloud','amazon web services'],
 'devops': ['ci/cd','docker','kubernetes','k8s','terraform','jenkins','github actions'],
 'react': ['reactjs','react.js','jsx','redux','zustand','next.js','nextjs'],
 'java': ['spring','springboot','maven','gradle','jvm'],
 'restful': ['rest','api','rest api','graphql','grpc'],
 'agile': ['scrum','kanban','jira','sprint'],
};

function tokenize(text) {
 return text.toLowerCase()
 .replace(/[^a-z0-9\+\#\.\/\s]/g,' ')
 .split(/\s+/)
 .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

function extractNgrams(tokens, n) {
 const grams = [];
 for (let i = 0; i <= tokens.length - n; i++) {
 grams.push(tokens.slice(i, i + n).join(' '));
 }
 return grams;
}

function expandTerm(term) {
 const t = term.toLowerCase();
 const expansions = new Set([t]);
 for (const [canonical, synonyms] of Object.entries(SKILL_SYNONYMS)) {
 if (t === canonical || synonyms.includes(t)) {
 expansions.add(canonical);
 synonyms.forEach(s => expansions.add(s));
 }
 }
 return expansions;
}

function semanticMatch(jdTerm, resumeText) {
 const resumeLower = resumeText.toLowerCase();
 const expanded = expandTerm(jdTerm);
 for (const variant of expanded) {
 if (resumeLower.includes(variant)) return true;
 }
 return false;
}

// RESUME PARSER 

function parseResumeStructured(text) {
 const lines = text.split('\n').map(l => l.trim()).filter(Boolean);

 let name = '';
 for (const line of lines.slice(0, 5)) {
 if (/^[A-Z][a-z]+ [A-Z][a-z]+/.test(line) && line.length < 60 && !/@/.test(line)) {
 name = line.split('|')[0].split('—')[0].trim();
 break;
 }
 }

 const emailMatch = text.match(/[\w.+\-]+@[\w\-]+\.[a-z]{2,}/i);
 const email = emailMatch ? emailMatch[0] : '';
 const phoneMatch = text.match(/[\+\d][\d\s\-\(\)]{8,14}\d/);
 const phone = phoneMatch ? phoneMatch[0] : '';

 const sectionHeaders = {
 skills: /^(skills?|technical skills?|core skills?|tech stack|technologies|tools|competencies)/i,
 experience: /^(experience|work experience|employment|professional experience|work history)/i,
 education: /^(education|academic|qualification)/i,
 summary: /^(summary|profile|objective|about me)/i,
 certifications: /^(certifications?|certificates?|achievements?|awards?)/i,
 projects: /^(projects?|portfolio|open source)/i,
 };

 let currentSection = 'other';
 const sectionLines = { other: [] };

 for (const line of lines) {
 let matched = false;
 for (const [sec, re] of Object.entries(sectionHeaders)) {
 if (re.test(line) && line.length < 60) {
 currentSection = sec;
 if (!sectionLines[sec]) sectionLines[sec] = [];
 matched = true;
 break;
 }
 }
 if (!matched) {
 if (!sectionLines[currentSection]) sectionLines[currentSection] = [];
 sectionLines[currentSection].push(line);
 }
 }

 const skillsText = (sectionLines.skills || []).join(' ');
 const skillTokens = skillsText.split(/[,;|•\n·*\-]/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 40);
 const extractedSkills = [...new Set(skillTokens.filter(s => /[a-zA-Z]/.test(s)))];

 const yearMatches = text.match(/(\d{4})\s*[–\-—to]+\s*(present|\d{4})/gi) || [];
 let totalExp = 0;
 yearMatches.forEach(m => {
 const parts = m.match(/(\d{4})\s*[–\-—to]+\s*(present|\d{4})/i);
 if (parts) {
 const start = parseInt(parts[1]);
 const end = parts[2].toLowerCase() === 'present' ? new Date().getFullYear() : parseInt(parts[2]);
 totalExp += Math.max(0, end - start);
 }
 });

 const eduText = (sectionLines.education || []).join(' ');
 const degreeMatch = eduText.match(/(b\.?tech|b\.?e|b\.?s|m\.?tech|m\.?s|m\.?b\.?a|ph\.?d|bachelor|master|doctorate)/i);
 const degree = degreeMatch ? degreeMatch[0] : '';

 return { name: name || 'Unknown', email, phone, skills: extractedSkills, experienceYears: totalExp, degree, sections: Object.keys(sectionLines).filter(s => sectionLines[s] && sectionLines[s].length > 0), raw: text };
}

// JD DEEP ANALYZER 

function analyzeJobDescription(jdText) {
 const lines = jdText.split('\n');
 const requiredLines = [];
 const niceLines = [];
 let inNice = false;

 for (const line of lines) {
 if (/nice[\s\-]to[\s\-]have|bonus|preferred|plus|advantage/i.test(line)) inNice = true;
 else if (/required|must|requirement|responsibilities/i.test(line)) inNice = false;
 if (inNice) niceLines.push(line);
 else requiredLines.push(line);
 }

 const techPatterns = /\b(react|angular|vue|python|java|typescript|javascript|sql|nosql|aws|azure|gcp|docker|kubernetes|node|spring|django|flask|graphql|rest|api|ml|ai|tensorflow|pytorch|sklearn|redis|kafka|git|postgres|mysql|mongodb|elasticsearch|linux|css|html|scss|redux|zustand|jest|cypress|next\.?js|tailwind|swift|kotlin|flutter|rust|go|c\+\+|c#|\.net|php|ruby|rails|spark|tableau|powerbi|figma|wcag|accessibility|typescript|webpack|vite|rollup|storybook)\b/gi;
 const techMatches = (jdText.match(techPatterns) || []).map(s => s.toLowerCase());
 const uniqueTech = [...new Set(techMatches)];

 const expReqMatch = jdText.match(/(\d+)\+?\s*years?\s*(of)?\s*(experience|exp)/i);
 const requiredYears = expReqMatch ? parseInt(expReqMatch[1]) : 0;

 const jdTokens = tokenize(jdText);
 const allKeywords = [...new Set([
 ...extractNgrams(jdTokens, 2).filter(b => !b.split(' ').every(w => STOP_WORDS.has(w))),
 ...uniqueTech,
 ...jdTokens.filter(t => t.length > 3 && !STOP_WORDS.has(t))
 ])].slice(0, 40);

 return { keywords: allKeywords, techSkills: uniqueTech, requiredYears, requiredSection: requiredLines.join(' '), niceSection: niceLines.join(' ') };
}

// DEEP MATCHING ENGINE 

function deepMatch(resumeText, resumeName, jd) {
 const jdAnalysis = analyzeJobDescription(jd);
 const resumeParsed = parseResumeStructured(resumeText);
 const resumeLower = resumeText.toLowerCase();

 const matchedKeywords = jdAnalysis.keywords.filter(k => semanticMatch(k, resumeText));
 const missingKeywords = jdAnalysis.keywords.filter(k => !semanticMatch(k, resumeText));

 const matchedTech = jdAnalysis.techSkills.filter(t => semanticMatch(t, resumeText));
 const missingTech = jdAnalysis.techSkills.filter(t => !semanticMatch(t, resumeText));

 const resumeSkillsLower = resumeParsed.skills.map(s => s.toLowerCase());
 const matchedSkills = [];
 const missingSkills = [];
 for (const tech of jdAnalysis.techSkills) {
 const found = resumeSkillsLower.some(rs => {
 const expanded = expandTerm(tech);
 return [...expanded].some(e => rs.includes(e) || e.includes(rs));
 }) || semanticMatch(tech, resumeText);
 if (found) matchedSkills.push(tech);
 else missingSkills.push(tech);
 }

 const techSkillScore = jdAnalysis.techSkills.length > 0
 ? Math.round((matchedTech.length / jdAnalysis.techSkills.length) * 100)
 : Math.round((matchedKeywords.length / Math.max(jdAnalysis.keywords.length, 1)) * 100);

 let expScore = 50;
 if (jdAnalysis.requiredYears > 0 && resumeParsed.experienceYears > 0) {
 expScore = Math.min(100, Math.round((resumeParsed.experienceYears / jdAnalysis.requiredYears) * 80));
 } else if (/senior|lead|principal|architect|manager/i.test(resumeText)) {
 expScore = 75;
 } else if (/junior|intern|entry/i.test(resumeText)) {
 expScore = 35;
 }

 const roleWords = jd.toLowerCase().split(/\W+/).filter(w => w.length > 4).slice(0, 10);
 const roleMatchCount = roleWords.filter(w => resumeLower.includes(w)).length;
 const roleAlignScore = Math.min(100, Math.round((roleMatchCount / Math.max(roleWords.length, 1)) * 100) + 10);

 const softSkillsJD = /lead|mentor|manag|team|communication|collaboration|stakeholder/i.test(jd);
 const softSkillsResume = /lead|mentor|manag|team|communication|collaboration|stakeholder/i.test(resumeText);
 const leadershipScore = softSkillsJD ? (softSkillsResume ? 75 : 30) : 60;

 const overallScore = Math.min(97, Math.max(15, Math.round(
 techSkillScore * 0.45 + expScore * 0.25 + roleAlignScore * 0.20 + leadershipScore * 0.10
 )));

 const strengths = [];
 const gaps = [];

 if (matchedSkills.length > 0) strengths.push(`Matched skills: ${matchedSkills.slice(0, 5).join(', ')}`);
 if (resumeParsed.experienceYears >= jdAnalysis.requiredYears && jdAnalysis.requiredYears > 0)
 strengths.push(`Experience meets requirement: ${resumeParsed.experienceYears} yrs (required: ${jdAnalysis.requiredYears}+)`);
 if (/mentor|lead|senior/i.test(resumeText)) strengths.push('Leadership & mentoring experience evident');
 if (matchedTech.length >= 4) strengths.push(`Strong tech breadth: ${matchedTech.length}/${jdAnalysis.techSkills.length} required technologies`);
 if (/\d+%|reduced|improved|increased|delivered/i.test(resumeText)) strengths.push('Quantified impact metrics present');
 while (strengths.length < 2) strengths.push('Keyword alignment with core requirements');

 if (missingSkills.length > 0) gaps.push(`Missing skills: ${missingSkills.slice(0, 5).join(', ')}`);
 if (jdAnalysis.requiredYears > 0 && resumeParsed.experienceYears < jdAnalysis.requiredYears)
 gaps.push(`Experience gap: ${resumeParsed.experienceYears} yrs found, ${jdAnalysis.requiredYears}+ required`);
 if (missingTech.length > 3) gaps.push(`${missingTech.length} required technologies not found`);

 const label = overallScore >= 80 ? 'strong match for this role and should be prioritised for interview'
 : overallScore >= 60 ? 'good fit with a few gaps worth exploring in an interview'
 : overallScore >= 40 ? 'partial match — some key requirements are missing'
 : "limited alignment with this role's core requirements";

 const hasEmail = /@/.test(resumeText);
 const hasSections = /experience|education|skills/i.test(resumeText);
 const hasBullets = /[-•*]/.test(resumeText);
 const hasContact = hasEmail || /\d{10}|\+\d/.test(resumeText);
 const hasSummary = /summary|objective|profile/i.test(resumeText);
 const keywordMatchPct = Math.round((matchedTech.length / Math.max(jdAnalysis.techSkills.length, 1)) * 100);

 const atsScore = Math.min(96, Math.max(25, Math.round(
 (hasSections ? 20 : 0) + (hasContact ? 15 : 0) + (hasBullets ? 10 : 0) + (hasSummary ? 10 : 0) + keywordMatchPct * 0.45
 )));

 return {
 match: {
 score: overallScore,
 dimensions: { 'Technical Skills': techSkillScore, 'Experience Level': expScore, 'Role Alignment': roleAlignScore, 'Leadership & Soft Skills': leadershipScore },
 strengths: strengths.slice(0, 4),
 gaps: gaps.slice(0, 3),
 recommendation: `${resumeName} is a ${label}. ${overallScore >= 60 ? 'Recommend scheduling a technical screen to validate hands-on proficiency.' : 'Consider only if the candidate pool is limited.'}`,
 explanation: {
 matchedSkills: matchedSkills.slice(0, 10),
 missingSkills: missingSkills.slice(0, 8),
 matchedKeywords: matchedKeywords.slice(0, 12),
 missingKeywords: missingKeywords.slice(0, 8),
 experienceYears: resumeParsed.experienceYears,
 requiredYears: jdAnalysis.requiredYears,
 totalJDSkills: jdAnalysis.techSkills.length,
 matchedTechCount: matchedTech.length,
 },
 parsedResume: resumeParsed
 },
 ats: {
 atsScore,
 summary: `Resume scores ${atsScore}/100 on ATS compatibility. ${atsScore >= 70 ? 'Formatting is clean and sections are present.' : 'Several improvements could boost visibility.'}`,
 subScores: {
 'Keyword Optimization': Math.min(100, Math.round(keywordMatchPct * 1.05)),
 'Formatting & Structure': hasSections ? Math.min(100, 60 + (hasBullets ? 20 : 0) + (hasSummary ? 10 : 0)) : 35,
 'Section Completeness': hasSections ? Math.min(100, 55 + (hasSummary ? 15 : 0) + (hasContact ? 10 : 0)) : 30,
 'Readability': hasBullets ? 78 : 50,
 'Contact Info': hasContact ? 85 : 40
 },
 sections: {
 'Contact Information': hasContact,
 'Professional Summary': hasSummary,
 'Work Experience': /experience|work|employment/i.test(resumeText),
 'Education': /education|university|degree|college/i.test(resumeText),
 'Skills Section': /skills|technologies|tools/i.test(resumeText),
 'Certifications / Achievements': /certif|award|achievement/i.test(resumeText)
 },
 keywordMatchPct,
 keywords: { matched: matchedTech.slice(0, 10), missing: missingTech.slice(0, 8) },
 formattingIssues: [
 !hasSections && 'Use standard section headers (EXPERIENCE, EDUCATION, SKILLS)',
 !hasBullets && 'Use bullet points to highlight responsibilities',
 !hasContact && 'Add contact information (email and phone)',
 !hasSummary && 'Add a concise Professional Summary at the top',
 ].filter(Boolean).slice(0, 4),
 improvements: [
 missingTech.length > 0 && `Add missing keywords: ${missingTech.slice(0, 4).join(', ')}`,
 'Quantify achievements (e.g., "Reduced load time by 40%")',
 !hasSummary && 'Add a Professional Summary at the top',
 'Use standard section headers for reliable ATS parsing',
 'Tailor resume to mirror exact phrases from the job description'
 ].filter(Boolean).slice(0, 5)
 }
 };
}

function demoAnalyze(resumeText, resumeName, jd) {
 return deepMatch(resumeText, resumeName, jd);
}
