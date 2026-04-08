// STATE 
let resumes = [];
let candidates = [];
let enableATS = true;
let selCand = null;
let dTab = 'match';
let modalResume = null;
let running = false;

const SAMPLE_JD = `Senior Frontend Engineer

We are looking for a skilled Senior Frontend Engineer to join our product team.

Requirements:
- 5+ years of experience in frontend development
- Expert knowledge of React, TypeScript, and modern JavaScript (ES2020+)
- Experience with state management (Redux, Zustand, or similar)
- Proficiency in CSS/SCSS, responsive design, and accessibility (WCAG 2.1)
- Familiarity with REST APIs and GraphQL
- Experience with testing frameworks (Jest, Cypress)
- Strong understanding of web performance optimization
- Experience with CI/CD pipelines and Git workflows

Nice to have:
- Experience with Next.js or Remix
- Knowledge of Node.js / backend development
- Contributions to open-source projects

Responsibilities:
- Build and maintain high-quality web applications
- Collaborate with designers and backend engineers
- Mentor junior developers`;

const SAMPLE_RESUMES = [
 {name:"Priya Sharma",role:"Frontend Developer",source:"sample",text:"Priya Sharma — priya.sharma@email.com\nSUMMARY: Frontend Developer with 6 years experience in React.\nSKILLS: React, TypeScript, Redux, JavaScript, HTML5, CSS3/SCSS, Next.js, Jest, Cypress, GraphQL, REST APIs, Git, CI/CD, WCAG 2.1\nEXPERIENCE:\nSenior Frontend Developer — TechCorp India (2021–Present)\n- Led migration of jQuery app to React+TypeScript, reducing bundle size by 40%\n- Implemented CI/CD pipeline with GitHub Actions and Cypress E2E tests\n- Mentored 3 junior developers\nFrontend Developer — Startup XYZ (2018–2021)\n- Built responsive web apps using React, Redux, and SCSS\nEDUCATION: B.Tech CS — IIT Bombay (2018)\nOPEN SOURCE: Contributor to react-aria (3 merged PRs)"},
 {name:"Rahul Mehta",role:"Full Stack Developer",source:"sample",text:"Rahul Mehta | rahul.mehta@dev.io\n4 years full-stack development\nTECH STACK: Node.js, Express, React, MongoDB, PostgreSQL, Docker, AWS\nFull Stack Developer at WebAgency (2020-present)\n- Built React frontends, used basic Redux, CSS modules and Bootstrap\n- Developed REST APIs using Node.js and Express\nSkills: JavaScript, React (2 yrs), Node.js, Python (basic), SQL, Docker\nEducation: MCA from Mumbai University 2020"},
 {name:"Ananya Krishnan",role:"UI/UX Developer",source:"sample",text:"Ananya Krishnan | Bangalore\n7 years experience in design systems.\nCore Skills: React, TypeScript (5 yrs), Zustand, styled-components, Figma, Storybook, WCAG 2.1 AAA, Jest, React Testing Library, Playwright, GraphQL, Next.js\nLead UI Engineer — DesignFirst Co. (2020–Present)\n- Architected company-wide design system used by 12 product teams\n- Reduced accessibility violations from 200+ to 0\n- Implemented Next.js SSR, improving LCP by 55%\n- Managed team of 4 engineers\nEducation: B.E. Electronics — NIT Trichy (2017)"},
];

// helpers
const sc = s => s>=80?"#006644":s>=60?"#974F0C":s>=40?"#FF991F":"#BF2600";
const scBg = s => s>=80?"var(--success-bg)":s>=60?"var(--warn-bg)":s>=40?"#FFF7EC":"var(--danger-bg)";
const scBd = s => s>=80?"var(--success-border)":s>=60?"var(--warn-border)":s>=40?"#FFD08A":"var(--danger-border)";
const scBar = s => s>=80?"#36B37E":s>=60?"#FF991F":s>=40?"#FFAB00":"#FF5630";
const sl = s => s>=80?"Excellent":s>=60?"Good":s>=40?"Fair":"Poor";
const al = s => s>=80?"ATS Friendly":s>=60?"Mostly Compatible":s>=40?"Needs Work":"ATS Risk";
function esc(s){return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function isHdr(t){return /^[A-Z][A-Z\s&\/\-:]{3,}$/.test(t)||/^(SUMMARY|SKILLS|EXPERIENCE|EDUCATION|CERTIFICATIONS|PROJECTS|OPEN SOURCE|CORE SKILLS|TECH STACK|WORK HISTORY|PROFILE|CONTACT|ACHIEVEMENTS|LANGUAGES|REFERENCES|PUBLICATIONS)[\s:]*/i.test(t);}
const sleep = ms => new Promise(r=>setTimeout(r,ms));
function avatarColor(name){const colors=['#0052CC','#00B8D9','#36B37E','#FF991F','#6554C0','#FF7452','#00A3BF','#57D9A3'];const i=name.charCodeAt(0)%colors.length;return colors[i];}