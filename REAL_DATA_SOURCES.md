# Real Data Sources for UdaanSetu ML Training

**Purpose:** Replace synthetic demo data with real datasets to improve ML model accuracy.

---

## OVERVIEW: What Data We Need

Our platform has 4 ML engines, each requiring specific data:

| ML Model | Data Needed | Current State | Target |
|----------|-------------|---------------|--------|
| **RiskEngine** | Research project outcomes (success/fail) | Synthetic (2000 samples) | 10,000+ real records |
| **SemanticEngine** | Text descriptions of innovations | Demo data | Real research papers/startup data |
| **SuccessPredictor** | Startup success/failure history | Synthetic | Real startup outcomes |
| **DuplicateDetector** | Similar project descriptions | Demo data | Real innovation records |

---

## PART 1: RISK ENGINE DATA (Priority #1)

### What the model needs (10 features per record):
```
1. progress              — 0-100% completion
2. milestones_total      — Number of milestones
3. milestones_overdue    — Overdue milestones count
4. milestones_done       — Completed milestones count
5. days_since_creation   — Age of project in days
6. stage_encoded         — Current stage (0-6: draft → completed)
7. has_funding           — 0 or 1
8. funding_ratio         — received / required
9. sector_encoded        — Sector index (0-9)
10. district_encoded     — District index (0-19)
```

### Target variable:
```
risk_label — 0 (success) or 1 (at-risk/failed)
```

### Where to get this data:

#### Source 1: Startup India Data Portal
- **URL:** https://www.startupindia.gov.in/content/dsih/en/reports.html
- **What:** List of recognized startups with registration dates, sectors, stages
- **How to access:** Free download (CSV format)
- **Data available:**
  - Startup name, sector, stage, registration date
  - City/district, state
  - Founder count, DPIIT recognition status
- **Limitation:** No success/failure labels — need to cross-reference

#### Source 2: Ministry of Commerce (DPIIT)
- **URL:** https://dpiit.gov.in/sites/default/files/FAQ_on_Startup_India.pdf
- **What:** Startup recognition data, patent filings
- **How to access:** RTI request or public reports

#### Source 3: CRISIL Startup Report
- **URL:** https://www.crisil.com/en/what-we-do/research-and-ratings/startup-ratings.html
- **What:** Startup performance data, success rates
- **How to access:** Paid subscription (~₹50,000/year) or university access
- **Alternative:** Ask your mentor if they have institutional access

#### Source 4: IIM/B-School Research Datasets
- **What:** Research papers with startup success data
- **Where to look:**
  - IIM Ahmedabad case studies
  - IIT Bombay research papers
  - NITIE Mumbai startup datasets
- **How to access:** Academic email request to professors

#### Source 5: Kaggle Datasets (FREE)
- **URL:** https://www.kaggle.com/datasets
- **Search terms:**
  - "Indian startups funding"
  - "startup success prediction"
  - "innovation project management"
  - "venture capital India"
- **Recommended datasets:**
  - `Indian Startups Dataset` (2024) — 5000+ records
  - `Startup Funding India` — funding history
  - `Global Startup Ecosystem` — success/failure labels

### How to convert to our format:
```python
# Example: Converting Startup India CSV to our training format
import pandas as pd
import numpy as np

df = pd.read_csv('startup_india_data.csv')

training_data = []
for _, row in df.iterrows():
    record = {
        'progress': calculate_progress(row),        # 0-100
        'milestones_total': row['milestone_count'],
        'milestones_overdue': row['overdue_count'],
        'milestones_done': row['completed_count'],
        'days_since_creation': (now - row['created_date']).days,
        'stage_encoded': stage_map[row['current_stage']],
        'has_funding': 1 if row['funding_amount'] > 0 else 0,
        'funding_ratio': row['funding_received'] / max(1, row['funding_required']),
        'sector_encoded': sector_map[row['sector']],
        'district_encoded': district_map[row['district']],
        'risk_label': 1 if row['status'] in ['failed', 'dormant', 'closed'] else 0
    }
    training_data.append(record)
```

---

## PART 2: SEMANTIC ENGINE DATA (Priority #2)

### What the model needs:
```
- Text descriptions of research projects, innovations, patents
- Each with: title, description, kind, sector, district
- Used for: similarity search, recommendations, duplicate detection
```

### Where to get this data:

#### Source 1: ICPSR (Inter-university Consortium for Political and Social Research)
- **URL:** https://www.icpsr.umich.edu/web/pages/
- **What:** Research project metadata
- **How to access:** Free academic account

#### Source 2: Semantic Scholar API (FREE)
- **URL:** https://api.semanticscholar.org/
- **What:** 200M+ research paper abstracts
- **How to access:** Free API key
- **Data available:**
  - Paper title, abstract, authors
  - Citations, references
  - Field of study
- **Example API call:**
```python
import requests

def get_research_papers(field, limit=1000):
    url = "https://api.semanticscholar.org/graph/v1/paper/search"
    papers = []
    for offset in range(0, limit, 100):
        resp = requests.get(url, params={
            'query': field,
            'offset': offset,
            'limit': 100,
            'fields': 'title,abstract,year,fieldsOfStudy,citationCount'
        })
        papers.extend(resp.json()['data'])
    return papers
```

#### Source 3: arXiv API (FREE)
- **URL:** https://arxiv.org/help/api/user-manual
- **What:** 2M+ research papers in STEM
- **How to access:** Free, no API key needed
- **Data available:**
  - Title, abstract, authors
  - Categories (cs.AI, physics, etc.)
  - Submission date
- **Example:**
```python
import arxiv

search = arxiv.Search(
    query="artificial intelligence agriculture",
    max_results=1000,
    sort_by=arxiv.SortCriterion.SubmittedDate
)

papers = []
for result in arxiv.Client().results(search):
    papers.append({
        'title': result.title,
        'description': result.summary,
        'sector': 'AI/Agriculture',
        'kind': 'research'
    })
```

#### Source 4: Google Patents Public Datasets (FREE)
- **URL:** https://console.cloud.google.com/bigquery/bqconsole
- **What:** 100M+ patent records
- **How to access:** Free via Google BigQuery (1TB/month free)
- **Data available:**
  - Patent title, abstract, claims
  - Filing date, grant date
  - Inventor names, assignee
  - Classification codes (CPC/IPC)
- **Query example:**
```sql
SELECT
  title, abstract, filing_date, grant_date,
  inventor_name, assignee_organization,
  patent_number
FROM `patents-public-data.patents.publications`
WHERE country_code = 'IN'
  AND filing_date >= '2020-01-01'
LIMIT 10000
```

#### Source 5: Kaggle Datasets (FREE)
- **URL:** https://www.kaggle.com/datasets
- **Search terms:**
  - "patent dataset India"
  - "research paper abstracts"
  - "innovation project descriptions"
  - "startup pitch deck text"
- **Recommended:**
  - `Patent Examination Research Dataset` — 500K+ patents
  - `Research Paper Metadata` — 100K+ papers

### How to convert to our format:
```python
# Example: Converting arXiv data to semantic engine format
def convert_to_semantic_format(papers):
    records = []
    for paper in papers:
        records.append({
            'title': paper['title'],
            'description': paper['abstract'],
            'kind': 'research',  # or 'innovation', 'ipr'
            'sector': map_category(paper['categories'][0]),
            'district': 'Unknown',  # arXiv doesn't have location
            'meta': {
                'institution': paper.get('authors', [''])[0],
                'year': paper.get('year', 2024)
            }
        })
    return records
```

---

## PART 3: SUCCESS PREDICTOR DATA (Priority #3)

### What the model needs:
```
- Startup outcomes (success/failure/still operating)
- Features: funding, team size, sector, geography, founding year
- Labels: 0 (failed) or 1 (successful/exited)
```

### Where to get this data:

#### Source 1: Tracxn (Free tier available)
- **URL:** https://www.tracxn.com/
- **What:** 300K+ Indian startups with status
- **How to access:** Free tier gives 50 searches/month
- **Data available:**
  - Startup name, founded date
  - Funding rounds, total funding
  - Employee count, status (active/acquired/closed)
  - Sector, sub-sector

#### Source 2: Crunchbase (Paid, but free academic access)
- **URL:** https://www.crunchbase.com/
- **What:** 1M+ companies globally
- **How to access:**
  - Free: Limited search (10 results/day)
  - Academic: Free for .edu emails (apply at crunchbase.com/academic)
  - Paid: $49/month for API access
- **Data available:**
  - Funding history, investors
  - Acquisition/IPO status
  - Founders, key employees
  - Revenue estimates

#### Source 3: YOUR OWN PLATFORM DATA (Best source!)
- **What:** As users create records on UdaanSetu, collect their outcomes
- **How:** Add a "project status" field that users update
- **Advantage:** Exact format, no conversion needed
- **Implementation:**
```python
# Add to database model
class Record:
    # ... existing fields ...
    outcome: str  # 'active', 'success', 'failed', 'dormant'
    outcome_date: datetime  # when outcome was recorded
    outcome_reason: str  # why it succeeded/failed
```

#### Source 4: Government of India Reports (FREE)
- **URL:** https://www.investindia.gov.in/sector/startup
- **What:** Annual startup ecosystem reports
- **Data available:**
  - Sector-wise success rates
  - Funding trends
  - Geographic distribution
  - Job creation numbers

#### Source 5: NASSCOM Startup Reports (FREE)
- **URL:** https://nasscom.in/knowledge-center/reports
- **What:** Indian tech startup data
- **Data available:**
  - 10,000+ tech startups
  - Sector breakdown
  - Success/failure rates
  - Funding data

---

## PART 4: GOVERNMENT API REAL DATA

### Replace mock endpoints with real APIs:

#### 1. Aadhaar eKYC (UIDAI)
- **Real API:** https://uidai.gov.in/en/ecosystem/authentication-devices-documents/ekyc-architecture.html
- **How to get access:**
  1. Register at https://resident.uidai.gov.in/
  2. Apply as a "KYC Agency" (your college/organization can apply)
  3. Get API key and sub-AID
- **Cost:** ₹1-3 per verification
- **Timeline:** 2-4 weeks for approval

#### 2. DigiLocker
- **Real API:** https://developers.digilocker.gov.in/
- **How to get access:**
  1. Register at https://developers.digilocker.gov.in/
  2. Create an app (select "Education" or "Government" category)
  3. Get Client ID and Client Secret
- **Cost:** Free
- **Timeline:** 1-2 weeks

#### 3. Startup India
- **Real API:** https://www.startupindia.gov.in/content/dsih/en/about-us/startup-india-hub.html
- **How to get access:**
  1. Email startup-india@investindia.gov.in
  2. Request API access for academic research
  3. Include your SIH problem statement
- **Cost:** Free for research
- **Timeline:** 2-4 weeks

#### 4. IP India
- **Real API:** https://ipindiaonline.gov.in/
- **How to get access:**
  1. Register at https://ipindiaonline.gov.in/
  2. Apply for "API Access" under "E-Services"
  3. Submit SIH problem statement as justification
- **Cost:** Free
- **Timeline:** 3-4 weeks

#### 5. ONDC
- **Real API:** https://ondc.org/
- **How to get access:**
  1. Register at https://seller-app.ondc.org/
  2. Create a buyer/seller app
  3. Get API credentials
- **Cost:** Free
- **Timeline:** 1-2 weeks

---

## PART 5: DATA COLLECTION PIPELINE

### Step-by-step process:

```
Week 1: Collect raw data
├── Download Startup India CSV (5000+ records)
├── Query Semantic Scholar API (1000+ papers)
├── Query arXiv API (1000+ papers)
├── Search Kaggle for patent datasets
└── Download NASSCOM reports

Week 2: Process and clean
├── Convert to our schema format
├── Label success/failure (for RiskEngine)
├── Clean text descriptions (for SemanticEngine)
├── Remove duplicates
└── Split into train/test sets

Week 3: Train models
├── RiskEngine: Train on real data
├── SemanticEngine: Build real corpus
├── SuccessPredictor: Train on startup outcomes
└── Compare accuracy with synthetic models

Week 4: Integrate
├── Update API endpoints to use new models
├── Test with real user data
├── Monitor model performance
└── Document data sources
```

### Data collection script:
```python
# scripts/collect_real_data.py

import pandas as pd
import requests
import arxiv
from datetime import datetime

class DataCollector:
    def __init__(self):
        self.output_dir = Path("data/real")
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def collect_startup_india(self):
        """Download Startup India data."""
        # Download from: https://www.startupindia.gov.in/content/dsih/en/reports.html
        df = pd.read_csv("data/raw/startup_india.csv")
        processed = self._process_startup_data(df)
        processed.to_csv(self.output_dir / "startups.csv", index=False)

    def collect_research_papers(self):
        """Collect research papers from Semantic Scholar."""
        papers = []
        fields = ["agriculture", "clean energy", "healthcare",
                  "education", "AI", "IoT", "biotech"]

        for field in fields:
            url = "https://api.semanticscholar.org/graph/v1/paper/search"
            resp = requests.get(url, params={
                'query': field,
                'limit': 200,
                'fields': 'title,abstract,year,fieldsOfStudy'
            })
            papers.extend(resp.json()['data'])

        df = pd.DataFrame(papers)
        df.to_csv(self.output_dir / "research_papers.csv", index=False)

    def collect_patents(self):
        """Collect Indian patents from Google BigQuery."""
        # Requires: pip install google-cloud-bigquery
        from google.cloud import bigquery

        client = bigquery.Client()
        query = """
            SELECT title, abstract, filing_date, patent_number,
                   inventor_name, assignee_organization
            FROM `patents-public-data.patents.publications`
            WHERE country_code = 'IN'
            AND filing_date >= '2020-01-01'
            LIMIT 5000
        """
        df = client.query(query).to_dataframe()
        df.to_csv(self.output_dir / "patents.csv", index=False)

    def _process_startup_data(self, df):
        """Convert raw data to our training format."""
        # Map sectors to our categories
        sector_map = {
            'Agriculture': 0, 'Healthcare': 1, 'Education': 2,
            'Fintech': 3, 'E-commerce': 4, 'AI/ML': 5,
            'CleanTech': 6, 'IoT': 7, 'Biotech': 8, 'Other': 9
        }

        # Calculate training features
        df['progress'] = df['status'].map({
            'Active': 70, 'Acquired': 100, 'Closed': 30
        }).fillna(50)

        df['risk_label'] = df['status'].map({
            'Active': 0, 'Acquired': 0, 'Closed': 1
        }).fillna(0)

        return df
```

---

## PART 6: WHERE TO DOWNLOAD NOW

### Immediate downloads (today):

| Source | URL | What You Get | Time |
|--------|-----|--------------|------|
| **Kaggle - Indian Startups** | https://www.kaggle.com/datasets/anjali1604/indian-startups | 5000+ startup records | 5 min |
| **Kaggle - Startup Funding** | https://www.kaggle.com/datasets/siddharthmdas/startup-funding-india | Funding data | 5 min |
| **Semantic Scholar** | https://api.semanticscholar.org/ | Research paper abstracts | 10 min |
| **arXiv** | https://arxiv.org/ | STEM papers | 10 min |
| **Google Patents** | https://console.cloud.google.com | Patent data (BigQuery) | 30 min |
| **Startup India Reports** | https://www.startupindia.gov.in/reports.html | Official reports | 15 min |

### API keys to apply for:

| Service | Apply At | Timeline |
|---------|----------|----------|
| DigiLocker | developers.digilocker.gov.in | 1-2 weeks |
| UIDAI | uidai.gov.in | 2-4 weeks |
| Startup India | Email request | 2-4 weeks |
| ONDC | seller-app.ondc.org | 1-2 weeks |
| Crunchbase | crunchbase.com/academic | Instant (.edu) |

---

## PART 7: DATA QUALITY CHECKLIST

Before training, verify:

- [ ] No duplicate records
- [ ] No missing critical fields (title, description, sector)
- [ ] Consistent sector names (standardize to our 10 categories)
- [ ] Dates in ISO format (YYYY-MM-DD)
- [ ] Labels are correct (risk_label = 0 or 1)
- [ ] No data leakage (test set not in training set)
- [ ] Balanced classes (50/50 success/failure ideally)
- [ ] Text descriptions are clean (no HTML, no special chars)
- [ ] Numerical features are normalized (0-1 or z-score)
- [ ] Geographic data is consistent (district names match)

---

## PART 8: EXPECTED RESULTS

With real data:

| Model | Current Accuracy | Expected Accuracy | Training Time |
|-------|-----------------|-------------------|---------------|
| RiskEngine | ~75% (synthetic) | 85-90% (real) | 5-10 min |
| SemanticEngine | ~70% (demo data) | 80-85% (real) | 30-60 min |
| SuccessPredictor | ~65% (synthetic) | 75-80% (real) | 5-10 min |

---

*Created: August 19, 2026*
*For: UdaanSetu (SIH1608) Team*
