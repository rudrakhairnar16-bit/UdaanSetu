# SIH 2026 — UdaanSetu (SIH1608) Team Documentation Guide

**Problem Statement:** Innovation Ecosystem Platform — Research → Innovation → IPR → Mentor/Funding/Incubator → Startup → Impact

**Team:** [Your Team Name]
**Mentor:** [Mentor Name]
**Date:** August 2026

---

## PART 1: ALL DOCUMENTS TO PREPARE

### A. Core SIH Submission Documents

| # | Document | When to Submit | Format |
|---|----------|---------------|--------|
| 1 | **Problem Statement Analysis (PSA)** | Round 1 (Idea Submission) | PDF, 3-5 pages |
| 2 | **Pitch Deck** | Final Round | PPT/PDF, 15-20 slides |
| 3 | **Technical Documentation** | Final Round | PDF, 10-20 pages |
| 4 | **Business Model Canvas** | Final Round | PDF/Canvas |
| 5 | **Video Pitch** | Final Round | MP4, 3-5 minutes |
| 6 | **Source Code Repository** | Final Round | GitHub link |
| 7 | **Live Demo / Deployment** | Final Round | Working URL |

---

### B. Detailed Document Breakdown

#### 1. Problem Statement Analysis (PSA)

**What it is:** Your written analysis of the problem and proposed solution.

**How to make it:**
- Research the current innovation ecosystem in India
- Identify gaps in the current system
- Explain why the problem matters
- Present your solution approach
- Include initial architecture diagram

**Structure:**
```
1. Problem Understanding (1 page)
   - What is the problem?
   - Who is affected? (researchers, startups, mentors, investors)
   - Current pain points

2. Literature Survey / Existing Solutions (1 page)
   - Current platforms (Startup India, TDB, NITI Aayog)
   - What's missing in existing solutions

3. Proposed Solution (1-2 pages)
   - Platform overview
   - Key features
   - Technology stack

4. Expected Impact (0.5 page)
   - How many users can benefit
   - Measurable outcomes
```

**Research to do:**
- Read Startup India website and features
- Read NITI Aayog innovation reports
- Read SIH problem statement carefully
- Study TDB (Technology Development Board) programs
- Research atal tinkering labs and their ecosystem

---

#### 2. Pitch Deck (15-20 slides)

**Slide structure:**
```
Slide 1:  Title — UdaanSetu logo, team name, SIH code
Slide 2:  Problem — The gap in India's innovation ecosystem
Slide 3:  Current Landscape — What exists, what's broken
Slide 4:  Our Solution — UdaanSetu in one sentence
Slide 5:  How It Works — Research → Innovation → IPR → Startup → Impact flow
Slide 6:  Demo Walkthrough — Screenshots of the live platform
Slide 7:  Key Features — AI recommendations, Govt API integration, ML pipeline
Slide 8:  AI/ML Engine — Semantic search, risk prediction, duplicate detection
Slide 9:  Government Integration — Aadhaar eKYC, DigiLocker, Startup India, IP India, ONDC
Slide 10: Architecture — 3-tier monolith, tech stack diagram
Slide 11: Database Schema — Key entities and relationships
Slide 12: Security — RBAC, JWT, Argon2 hashing, CSP headers
Slide 13: Deployment — Docker, AWS, CI/CD pipeline
Slide 14: Business Model — Revenue streams, sustainability
Slide 15: Impact Metrics — Jobs created, farmers reached, startups funded
Slide 16: Roadmap — What's next (6-month, 1-year plan)
Slide 17: Team — Name, role, college
Slide 18: Thank You / Q&A
```

**Research to do:**
- Study winning SIH pitch decks from previous years
- Research government funding schemes (Startup India Seed Fund, MUDRA loans)
- Know your deployment numbers (we have 153 tests, 60+ API endpoints, 18 pages)

---

#### 3. Technical Documentation

**Structure:**
```
1. System Overview (2 pages)
   - Architecture diagram (3-tier: Presentation → Application → Data)
   - Component interaction flow

2. Technology Stack (1 page)
   - Frontend: Next.js 15, React 19, TypeScript, Recharts
   - Backend: FastAPI, Python 3.11, SQLAlchemy 2.0
   - ML: sentence-transformers, scikit-learn, Ollama deepseek-r1
   - Database: PostgreSQL 16
   - DevOps: Docker, GitHub Actions, Terraform (AWS)

3. API Documentation (5-8 pages)
   - All 60+ endpoints listed
   - Request/response examples
   - Authentication flow (JWT + RBAC 5 roles)

4. ML Pipeline (2 pages)
   - SemanticEngine: sentence-transformers for similarity
   - RiskEngine: GradientBoosting with 10 features
   - SuccessPredictor: Success probability scoring
   - DuplicateDetector: Finding similar records
   - Model versioning and drift detection

5. Government API Integration (2 pages)
   - Aadhaar eKYC (mock → production ready)
   - DigiLocker document verification
   - Startup India registry
   - IP India patent search
   - ONDC marketplace

6. Security (1 page)
   - 5 RBAC roles (admin, researcher, mentor, investor, incubator)
   - Password hashing (Argon2)
   - CORS configuration
   - CSP headers, HSTS

7. Deployment Guide (1 page)
   - Docker Compose setup
   - AWS infrastructure (Terraform)
   - CI/CD pipeline (GitHub Actions)
```

**Research to do:**
- Understand OAuth 2.0 flow (for Govt API swap-in)
- Study sentence-transformers documentation
- Read scikit-learn GradientBoosting docs
- Research AWS ECS Fargate deployment
- Study Terraform best practices

---

#### 4. Business Model Canvas

**Components:**
```
| Key Partners       | Key Activities    | Value Propositions  | Customer Relationships | Customer Segments |
|-------------------|-------------------|---------------------|----------------------|-------------------|
| Government depts   | Platform dev      | Single platform for | Self-service portal  | Researchers       |
| Startup India      | ML/AI engine      | full innovation     | Dedicated support    | Innovators        |
| Universities       | API integration   | lifecycle            | Community forums     | Mentors           |
| TDB/NITI Aayog     | Community mgmt    | AI-powered matching  |                      | Investors         |
|                    |                   | Govt API integration |                      | Incubators        |
|                    |                   | Data-driven insights |                      | Government bodies |

| Key Resources      | Channels          | Cost Structure      | Revenue Streams     |
|-------------------|-------------------|--------------------|--------------------|
| ML models          | Web platform      | Server costs        | SaaS subscription   |
| Govt API access    | Mobile (future)   | Development time    | Premium features    |
| Database           | API partners      | Cloud hosting       | Data analytics      |
| DevOps pipeline    | Word of mouth     | Team costs          | Government contracts|
```

---

#### 5. Video Pitch (3-5 minutes)

**Script outline:**
```
0:00-0:30 — Hook: "India loses 70% of research to implementation gaps"
0:30-1:00 — Problem: Current fragmentation in innovation ecosystem
1:00-2:00 — Solution: UdaanSetu platform walkthrough (live demo)
2:00-3:00 — Technical depth: AI/ML, Govt APIs, architecture
3:00-3:30 — Impact: Jobs, farmers, startups, patents
3:30-4:00 — Team & Vision
```

**How to make it:**
- Use OBS Studio or screen recording
- Record demo on localhost:3001
- Clear audio, minimal background noise
- Show real code commits (7 on main branch)
- Include architecture diagram

---

#### 6. Source Code Repository

**What judges look for:**
- Clean commit history (we have 7 clean commits)
- README with setup instructions
- Code quality (TypeScript, proper naming)
- Test coverage (153 backend tests)
- Documentation (API docs at /docs)
- CI/CD pipeline (.github/workflows/)
- Docker setup
- No hardcoded secrets

---

## PART 2: RESEARCH AGENDA

### Week 1: Domain Research

| Topic | Resources | Deadline |
|-------|-----------|----------|
| India's innovation ecosystem | NITI Aayog reports, Startup India data | Day 2 |
| Current pain points | Interviews with researchers/startups | Day 3 |
| Existing solutions analysis | Study Startup India, TDB portals | Day 4 |
| SIH problem statement deep dive | PS document, past winners | Day 5 |
| Government schemes research | DPIIT, MeitY schemes list | Day 7 |

### Week 2: Technical Research

| Topic | Resources | Deadline |
|-------|-----------|----------|
| ML model optimization | scikit-learn docs, papers | Day 10 |
| OAuth 2.0 for Govt APIs | RFC 6749, India Stack docs | Day 11 |
| sentence-transformers tuning | HuggingFace docs | Day 12 |
| AWS deployment best practices | AWS ECS docs, Terraform | Day 13 |
| Security hardening | OWASP Top 10, CSP docs | Day 14 |

### Week 3: Business Research

| Topic | Resources | Deadline |
|-------|-----------|----------|
| Innovation market size | India innovation report 2026 | Day 17 |
| Competitor analysis | Similar platforms globally | Day 18 |
| Revenue model research | SaaS pricing strategies | Day 19 |
| Impact measurement frameworks | SDG alignment | Day 20 |
| Government procurement process | GeM portal, tenders | Day 21 |

---

## PART 3: WHAT NOT TO DO

### ❌ Code & Development Don'ts

1. **Don't hardcode secrets** — No API keys, passwords, or tokens in code
2. **Don't skip tests** — We have 153 tests; maintain that standard
3. **Don't use `any` type excessively** — TypeScript is there for a reason
4. **Don't commit directly to main** — Always use feature branches for new work
5. **Don't ignore the demo data markers** — All records show "DEMO DATA" badge; don't hide this
6. **Don't use localhost URLs** — Use environment variables (we fixed the settings page)
7. **Don't store passwords in plain text** — Always use Argon2 hashing
8. **Don't skip error handling** — Every API call needs try/catch (we added this)
9. **Don't use inline styles for everything** — Use the CSS classes we defined
10. **Don't remove the mobile responsiveness** — Always test on small screens

### ❌ Presentation Don'ts

1. **Don't read from slides** — Judges want engagement, not a lecture
2. **Don't demo localhost:3000** — Always use the deployed URL if possible
3. **Don't show broken features** — Only demo what works perfectly
4. **Don't ignore the time limit** — Practice the 3-minute pitch multiple times
5. **Don't use jargon without explanation** — Say "AI matching" not "sentence-transformer cosine similarity"
6. **Don't skip the problem statement** — Start with WHY, not HOW
7. **Don't claim it's "AI-powered" without showing it** — Demo the ML features live
8. **Don't hide the DEMO DATA label** — It's honest and shows integrity
9. **Don't make up numbers** — Use real metrics from the platform
10. **Don't badmouth existing solutions** — Say "we complement" not "we replace"

### ❌ Team & Process Don'ts

1. **Don't work in isolation** — Daily standups, even 5 minutes
2. **Don't skip documentation** — Write as you go, not at the end
3. **Don't ignore git** — Meaningful commit messages, regular pushes
4. **Don't push broken code** — Test before push (153 tests exist for a reason)
5. **Don't forget backups** — GitHub is the backup; push regularly
6. **Don't sleep on the submission deadline** — SIH has strict deadlines
7. **Don't skip the mentor review** — Show progress weekly
8. **Don't argue on tech stack** — We chose Next.js + FastAPI; stick with it
9. **Don't add features without asking** — Discuss scope before implementing
10. **Don't forget to have fun** — It's a hackathon, not a death march

### ❌ Business Model Don'ts

1. **Don't say "we'll charge users"** — Government platforms are typically free
2. **Don't ignore sustainability** — How does this survive after SIH?
3. **Don't promise features you haven't built** — Demo what exists
4. **Don't skip the competition analysis** — Know Startup India, Atal Innovation Mission
5. **Don't forget the impact metrics** — Jobs, revenue, farmers reached

---

## PART 4: QUICK REFERENCE CARD

### Platform Stats (for pitch)
```
- 153 automated tests passing
- 60+ REST API endpoints
- 18 frontend pages
- 5 RBAC roles
- 5 Government API integrations
- 4 ML engines (Semantic, Risk, Success, Duplicate)
- 7 clean git commits
- 3-tier architecture
- Docker + CI/CD ready
- AWS Terraform deployment
```

### Key Architecture Terms
```
- Presentation Layer: Next.js 15 + React 19 + TypeScript
- Application Layer: FastAPI + Python 3.11 + SQLAlchemy 2.0
- Data Layer: PostgreSQL 16 + Redis (production)
- ML Pipeline: sentence-transformers + scikit-learn + Ollama
- DevOps: Docker + GitHub Actions + Terraform (AWS)
- Security: JWT + Argon2 + RBAC (5 roles)
```

### Demo Flow (for video/presentation)
```
1. Login as admin@udaansetu.demo / Demo@123
2. Dashboard — show pipeline flow and stats
3. Research Projects — create a project
4. Innovations — show AI recommendations
5. IPR/Patents — show lifecycle tracking
6. Startups — show impact metrics
7. Ecosystem — show mentors/schemes/incubators
8. Government APIs — demo Aadhaar eKYC
9. Analytics — show charts and ML metrics
10. Impact — show overall impact dashboard
```

### Environment Variables (for deployment)
```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret-key
CORS_ORIGINS=https://your-domain.com
AADHAAR_API_KEY=your-production-key
DIGILOCKER_CLIENT_ID=your-client-id
DIGILOCKER_CLIENT_SECRET=your-secret
STARTUP_INDIA_API_KEY=your-key
IP_INDIA_API_KEY=your-key
ONDC_SELLER_ID=your-seller-id
OLLAMA_BASE_URL=http://localhost:11434
MODEL_NAME=deepseek-r1:8b
```

---

## PART 5: TIMELINE CHECKLIST

### Week 1: Research & Documentation
- [ ] Problem Statement Analysis complete
- [ ] Literature survey done
- [ ] Domain research (innovation ecosystem)
- [ ] Existing solutions analyzed

### Week 2: Technical Polish
- [ ] All 88 UI/UX issues fixed ✅ (DONE)
- [ ] 153 tests passing ✅ (DONE)
- [ ] Deployment working
- [ ] API documentation reviewed
- [ ] ML features polished

### Week 3: Business & Presentation
- [ ] Business Model Canvas done
- [ ] Pitch deck (15-20 slides) done
- [ ] Video pitch recorded (3-5 min)
- [ ] Technical documentation finalized

### Week 4: Final Prep
- [ ] Demo rehearsed 5+ times
- [ ] All team members know their parts
- [ ] GitHub repo cleaned up
- [ ] Submission reviewed by mentor
- [ ] Everything submitted before deadline

---

*Last updated: August 19, 2026*
*Repository: https://github.com/rudrakhairnar16-bit/UdaanSetu*
