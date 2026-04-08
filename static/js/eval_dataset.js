// 
// LABELED TEST DATASET — Ground Truth for Model Evaluation
// 
// Each entry has:
// resumeText — resume content
// label — ground truth: 1 = qualified, 0 = not qualified
// reason — human-written justification for the label

const EVAL_JD = `Senior Frontend Engineer
Requirements:
- 5+ years of frontend development experience
- Expert in React, TypeScript, modern JavaScript (ES2020+)
- State management: Redux, Zustand
- CSS/SCSS, responsive design, accessibility (WCAG 2.1)
- REST APIs and GraphQL
- Testing: Jest, Cypress
- CI/CD pipelines and Git workflows
Nice to have: Next.js, Node.js`;

const EVAL_DATASET = [
 // TRUE POSITIVES (should score high, label=1) 
 {
 id: 1,
 name: "Arjun Verma",
 expectedLabel: 1,
 expectedStatus: "Recommended",
 reason: "6 yrs React+TypeScript, Redux, Jest, Cypress, CI/CD, GraphQL — meets all core requirements",
 resumeText: `Arjun Verma | arjun.verma@email.com | +91-9876543210
SUMMARY
Senior Frontend Engineer with 6 years of experience building scalable React applications.
SKILLS
React, TypeScript, Redux, Zustand, JavaScript ES2020, CSS3, SCSS, WCAG 2.1, GraphQL, REST APIs, Jest, Cypress, CI/CD, GitHub Actions, Git, Next.js, Webpack
EXPERIENCE
Senior Frontend Engineer — FinTech Corp (2021–Present)
- Led React+TypeScript rewrite of legacy app serving 500K users
- Implemented Zustand state management, reducing bundle size by 35%
- Achieved WCAG 2.1 AA compliance across all UI components
- Wrote Jest unit tests (85% coverage) and Cypress E2E suite
- Set up GitHub Actions CI/CD pipeline with automated deploys
Frontend Developer — SoftLab India (2018–2021)
- Built responsive SPAs using React, Redux, SCSS
- Integrated GraphQL APIs using Apollo Client
EDUCATION
B.Tech Computer Science — NIT Warangal (2018)`
 },
 {
 id: 2,
 name: "Sneha Patel",
 expectedLabel: 1,
 expectedStatus: "Recommended",
 reason: "7 yrs, React, TypeScript, Zustand, GraphQL, WCAG, Next.js, Cypress — strong match",
 resumeText: `Sneha Patel | sneha.p@techmail.com
SUMMARY: 7 years building design systems and frontend platforms.
CORE SKILLS: React (7yr), TypeScript, Zustand, Next.js, GraphQL, Jest, React Testing Library, WCAG 2.1 AAA, CSS3, SCSS, Storybook, CI/CD
EXPERIENCE
Lead Frontend Engineer — ProductHouse (2020–Present)
- Architected micro-frontend system used by 8 product teams
- Mentored 5 junior engineers on React best practices
- Reduced accessibility issues from 300+ to zero (WCAG 2.1 AAA)
- GraphQL schema design and Apollo Client integration
Frontend Engineer — StartupXYZ (2017–2020)
- React SPA development with TypeScript and Redux
EDUCATION: B.E. CS — BITS Pilani (2017)`
 },
 {
 id: 3,
 name: "Karan Malhotra",
 expectedLabel: 1,
 expectedStatus: "Recommended",
 reason: "5 yrs exact, React, TypeScript, Redux, Jest, Cypress, CI/CD — meets minimum bar",
 resumeText: `Karan Malhotra | karan.m@devmail.io
5 years frontend development experience
TECHNICAL SKILLS: React, TypeScript, JavaScript, Redux, CSS/SCSS, REST APIs, GraphQL, Jest, Cypress, GitHub Actions, CI/CD, Git, Webpack, Vite
WORK EXPERIENCE
Frontend Developer — Enterprise Solutions Ltd (2019–Present)
- React and TypeScript development for B2B dashboard products
- State management with Redux Toolkit
- REST API and GraphQL integrations
- Jest test coverage maintained at 80%+
- Cypress E2E testing for critical user flows
- CI/CD setup with GitHub Actions
EDUCATION: MCA — Pune University (2019)`
 },

 // FALSE POSITIVES (looks qualified but has gaps, label=0) 
 {
 id: 4,
 name: "Vikram Nair",
 expectedLabel: 0,
 expectedStatus: "Consider",
 reason: "Only 3 yrs exp, no TypeScript, no testing frameworks, no WCAG — below threshold despite React",
 resumeText: `Vikram Nair | vikram.nair@email.com
3 years experience in frontend development
SKILLS: React, JavaScript, HTML5, CSS3, Bootstrap, REST APIs, Git
EXPERIENCE
Junior Frontend Developer — WebAgency (2021–Present)
- Developed React component libraries
- Integrated REST APIs using Axios
- Basic responsive design with Bootstrap
EDUCATION: B.Sc IT — Mumbai University (2021)
Note: Currently learning TypeScript`
 },
 {
 id: 5,
 name: "Pooja Sharma",
 expectedLabel: 0,
 expectedStatus: "On Hold",
 reason: "Angular-only developer, no React, no TypeScript, no testing — wrong tech stack",
 resumeText: `Pooja Sharma | pooja.sharma@mail.com
SUMMARY: 6 years building enterprise web applications
SKILLS: Angular, AngularJS, Java, Spring Boot, HTML5, CSS, Bootstrap, MySQL, Git, Jenkins
EXPERIENCE
Senior Software Engineer — TCS (2018–Present)
- Angular 12+ SPA development for banking clients
- Java Spring Boot microservices
- Jenkins CI/CD pipelines
- MySQL database design
EDUCATION: B.Tech IT — VIT (2018)`
 },

 // TRUE NEGATIVES (correctly rejected, label=0) 
 {
 id: 6,
 name: "Rohit Gupta",
 expectedLabel: 0,
 expectedStatus: "Rejected",
 reason: "Backend Python developer, no frontend, no React, no CSS/SCSS — completely wrong role",
 resumeText: `Rohit Gupta | rohit.g@devmail.com
SUMMARY: Backend developer, 5 years Python and data engineering
SKILLS: Python, Django, FastAPI, PostgreSQL, Redis, Kafka, Docker, Kubernetes, AWS, Celery, SQLAlchemy
EXPERIENCE
Backend Engineer — DataCorp (2019–Present)
- REST API development with FastAPI and Django
- PostgreSQL schema design and query optimization
- Kafka event streaming pipelines
- Docker/Kubernetes deployment
EDUCATION: B.Tech CS — IIT Delhi (2019)`
 },
 {
 id: 7,
 name: "Meena Joshi",
 expectedLabel: 0,
 expectedStatus: "Rejected",
 reason: "QA/manual tester, no frontend development, no React or TypeScript experience",
 resumeText: `Meena Joshi | meena.j@qamail.com
QA Engineer with 4 years of manual and automated testing
SKILLS: Manual Testing, Selenium, TestNG, JIRA, SQL, Postman, API Testing, TestRail
EXPERIENCE
QA Engineer — SoftTest Ltd (2020–Present)
- Manual test case writing and execution
- Selenium WebDriver automation
- API testing with Postman
- Bug tracking in JIRA
EDUCATION: B.Sc Computer Science — Pune University (2020)`
 },
 {
 id: 8,
 name: "Deepak Rao",
 expectedLabel: 0,
 expectedStatus: "Rejected",
 reason: "Mobile iOS developer (Swift/Kotlin), no web frontend, no React/TypeScript",
 resumeText: `Deepak Rao | deepak.rao@mobiledev.com
Mobile Developer — 4 years iOS and Android
SKILLS: Swift, SwiftUI, Kotlin, Android Studio, Xcode, REST APIs, Firebase, Git, CoreData, RxSwift
EXPERIENCE
iOS Developer — MobileFirst (2020–Present)
- SwiftUI app development for App Store
- REST API integration
- CoreData local storage
- Firebase push notifications
EDUCATION: B.E. ECE — Bangalore University (2020)`
 },

 // BORDERLINE CASES (nuanced, label=0 or 1) 
 {
 id: 9,
 name: "Preethi Subramanian",
 expectedLabel: 0,
 expectedStatus: "Consider",
 reason: "4 yrs React but only 1yr TypeScript, no Cypress, no WCAG, marginal on requirements",
 resumeText: `Preethi Subramanian | preethi.s@dev.in
Frontend Developer — 4 years experience
SKILLS: React, JavaScript, TypeScript (1yr), HTML5, CSS3, SCSS, Redux, REST APIs, Jest, Git
EXPERIENCE
Frontend Developer — EcommerceCo (2020–Present)
- React SPA development
- Redux state management
- REST API integration
- Jest unit tests
EDUCATION: B.Tech — Anna University (2020)`
 },
 {
 id: 10,
 name: "Aakash Singh",
 expectedLabel: 1,
 expectedStatus: "Recommended",
 reason: "8 yrs exp, React, TypeScript, GraphQL, Next.js, WCAG — senior profile with strong breadth",
 resumeText: `Aakash Singh | aakash.singh@senior.dev
SUMMARY: 8 years of frontend engineering, led teams of 10+
CORE SKILLS: React, TypeScript, Next.js, GraphQL, Apollo, Redux Toolkit, CSS3, SCSS, WCAG 2.1, Jest, Cypress, Playwright, GitHub Actions, CI/CD, Docker, Webpack, Vite
EXPERIENCE
Principal Frontend Engineer — ScaleUp Inc (2019–Present)
- Technical lead for 4 product squads, 10 engineers
- Migrated monolith to micro-frontend architecture
- GraphQL federation setup with Apollo Studio
- Accessibility audit and WCAG 2.1 AA remediation
Senior Frontend — GrowthCo (2016–2019)
- React+TypeScript enterprise dashboard development
- Cypress E2E testing framework setup
EDUCATION: B.Tech CS — IIIT Hyderabad (2016)`
 }
];

// EVALUATION ENGINE 

/**
 * Run the model against the labeled dataset.
 * Returns full metrics: TP, FP, FN, TN, precision, recall, F1, accuracy,
 * per-class breakdown, and per-sample predictions.
 */
function runDatasetEvaluation() {
 const results = [];

 for (const sample of EVAL_DATASET) {
 // Score the resume against the eval JD
 const scored = demoAnalyze(sample.resumeText, sample.name, EVAL_JD);
 const predictedScore = scored.match.score;

 // Predicted label: score >= 60 = qualified (1), < 60 = not qualified (0)
 // We use 60 as threshold to align with "Recommended + Consider" vs lower
 const predictedLabel = predictedScore >= 60 ? 1 : 0;
 const predictedStatus =
 predictedScore >= 80 ? 'Recommended' :
 predictedScore >= 60 ? 'Consider' :
 predictedScore >= 40 ? 'On Hold' : 'Rejected';

 const isCorrect = predictedLabel === sample.expectedLabel;

 // Confusion matrix cell
 let cell;
 if (sample.expectedLabel === 1 && predictedLabel === 1) cell = 'TP';
 else if (sample.expectedLabel === 0 && predictedLabel === 1) cell = 'FP';
 else if (sample.expectedLabel === 1 && predictedLabel === 0) cell = 'FN';
 else cell = 'TN';

 results.push({
 ...sample,
 predictedScore,
 predictedLabel,
 predictedStatus,
 isCorrect,
 cell,
 matchedSkills: scored.match.explanation?.matchedSkills || [],
 missingSkills: scored.match.explanation?.missingSkills || [],
 dimensions: scored.match.dimensions || {},
 });
 }

 // Compute metrics
 const TP = results.filter(r => r.cell === 'TP').length;
 const FP = results.filter(r => r.cell === 'FP').length;
 const FN = results.filter(r => r.cell === 'FN').length;
 const TN = results.filter(r => r.cell === 'TN').length;
 const total = results.length;

 const precision = TP + FP > 0 ? TP / (TP + FP) : 0;
 const recall = TP + FN > 0 ? TP / (TP + FN) : 0;
 const f1 = precision + recall > 0 ? 2 * precision * recall / (precision + recall) : 0;
 const accuracy = total > 0 ? (TP + TN) / total : 0;
 const specificity = TN + FP > 0 ? TN / (TN + FP) : 0;
 const fpr = FP + TN > 0 ? FP / (FP + TN) : 0; // False Positive Rate
 const fnr = FN + TP > 0 ? FN / (FN + TP) : 0; // False Negative Rate
 const mcc_num = (TP * TN) - (FP * FN);
 const mcc_den = Math.sqrt((TP+FP)*(TP+FN)*(TN+FP)*(TN+FN));
 const mcc = mcc_den > 0 ? mcc_num / mcc_den : 0; // Matthews Correlation Coefficient

 const scores = results.map(r => r.predictedScore);
 const avgScore = scores.reduce((a,b)=>a+b,0)/scores.length;
 const variance = scores.reduce((a,v)=>{const d=v-avgScore;return a+d*d;},0)/scores.length;
 const stdDev = Math.sqrt(variance);

 return {
 results,
 metrics: {
 TP, FP, FN, TN, total,
 precision: Math.round(precision * 1000) / 10, // to 1 decimal
 recall: Math.round(recall * 1000) / 10,
 f1: Math.round(f1 * 1000) / 10,
 accuracy: Math.round(accuracy * 1000) / 10,
 specificity: Math.round(specificity * 1000) / 10,
 fpr: Math.round(fpr * 1000) / 10,
 fnr: Math.round(fnr * 1000) / 10,
 mcc: Math.round(mcc * 1000) / 1000,
 avgScore: Math.round(avgScore * 10) / 10,
 stdDev: Math.round(stdDev * 10) / 10,
 correctCount: results.filter(r => r.isCorrect).length,
 }
 };
}
