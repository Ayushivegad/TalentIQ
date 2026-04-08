# TalentIQ — Enhanced Resume Screening Suite

##  Features Implemented

### 1.  Resume Parsing Module (PDF/DOC) — FULLY IMPLEMENTED
- **Backend**: `pdfplumber` (primary) → `PyPDF2` (fallback) for PDFs
- **Backend**: `python-docx` for DOCX/DOC files
- **Frontend fallback**: `pdf.js` + `mammoth.js` (if backend unavailable)
- Extracts: name, email, phone, skills list, experience years, degree, sections
- API endpoint: `POST /api/parse-resume` (single) and `POST /api/parse-resumes-batch`
- UI shows "⚙ Backend" badge on resumes parsed by Python engine

### 2.  Job Description Analysis Module — FULLY IMPLEMENTED
- Regex + NLP tokenization for 50+ tech skills
- Required vs nice-to-have section splitting
- Required years extraction
- Keyword + bigram extraction
- API endpoint: `POST /api/analyze-jd`

### 3. AI/NLP-Based Matching and Scoring Engine — FULLY IMPLEMENTED
- **TF-IDF cosine similarity** (Python backend) — real document-level semantic match
- Synonym/semantic expansion (JS→React, Python→Django, etc.)
- 5-axis weighted scoring:
  | Axis               | Weight |
  |--------------------|--------|
  | Technical Skills   | 40%    |
  | TF-IDF Similarity  | 20%    |
  | Experience Level   | 20%    |
  | Role Alignment     | 12%    |
  | Leadership & Soft  | 8%     |
- API endpoint: `POST /api/score` and `POST /api/score-batch`

### 4.  Ranking Candidates — FULLY IMPLEMENTED
- Multi-axis weighted score ranking
- Filter by score tier (Excellent/Good/Fair/Weak)
- Sort by score, ATS score, or name
- Search by name, role, or skill

### 5.  Ranked Candidate List with Explanation — FULLY IMPLEMENTED
- Detailed per-candidate breakdown:
  - **Matched skills** (X/Y required skills)
  - **Missing critical skills** listed explicitly
  - **Experience gap** analysis
  - **TF-IDF cosine similarity** score
  - Keyword match analysis (NLP)
  - Hiring recommendation paragraph
- ATS compatibility score with sub-scores and improvement suggestions

### 6.  Admin Dashboard for HR — IMPLEMENTED
- **Login page** at `/login` (Flask sessions)
- Accounts: `hr@company.com / Admin@123`, `recruiter@company.com / Recruit@123`
- Auth bar in topbar shows user role + Sign Out
- `POST /api/login`, `POST /api/logout`, `GET /api/me`
- *Note: for production, add a real database (SQLite/PostgreSQL)*

### 7.  Model Evaluation & Accuracy Report — FULLY IMPLEMENTED
- **Backend-computed metrics** via `POST /api/evaluate`
- Precision, Recall, F1, Accuracy
- Confusion matrix (TP/FP/FN/TN) with proxy qualification labels
- Score distribution histogram
- Bias & fairness checklist
- Full per-candidate breakdown table with TF-IDF column
- "⟳ Refresh Metrics" button re-fetches from Python backend
- Export as PDF or DOC

---

##  Installation & Run

```bash
pip install flask pdfplumber PyPDF2 python-docx
python app.py
```

Open http://127.0.0.1:5000

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/login | HR login |
| POST | /api/logout | HR logout |
| GET | /api/me | Current user |
| POST | /api/parse-resume | Parse single resume file |
| POST | /api/parse-resumes-batch | Parse multiple resume files |
| POST | /api/analyze-jd | Analyze job description |
| POST | /api/score | Score single resume vs JD |
| POST | /api/score-batch | Score + rank multiple resumes |
| POST | /api/evaluate | Compute evaluation metrics |
| GET | /api/health | Backend status + engines |

## Architecture

```
Frontend (Browser)          Backend (Python Flask)
─────────────────           ─────────────────────────
pdf.js / mammoth   ──────  /api/parse-resume (pdfplumber + python-docx)
engine.js (NLP)    ──────  /api/score (TF-IDF cosine similarity)
report.js          ──────  /api/evaluate (Precision/Recall/F1)
ui.js (auth)       ──────  /api/login + /api/me
```

Files changed from original:
- `app.py` — complete rewrite with all features
- `requirements.txt` — added pdfplumber, PyPDF2, python-docx
- `static/js/ui.js` — backend file parsing, auth bar, backend badge
- `static/js/api.js` — backend scoring + eval API wrappers
- `static/js/screening.js` — TF-IDF engine integration
- `static/js/report.js` — backend metrics, TF-IDF column, refresh button
- `static/js/panels.js` — TF-IDF badge, backend parser info
- `static/js/init.js` — auth + backend detection on load
- `templates/login.html` — NEW: HR login page
- `templates/index.html` — auth bar, backend badge, eval labels
