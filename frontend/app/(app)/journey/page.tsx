'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { api, challenges, pilots, validations, procurements, analytics } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Icon } from '../../components/ui/Icon';
import { Modal } from '../../components/Modal';
import { StageBadge } from '../../components/StageBadge';

interface StageDefinition {
  id: number;
  name: string;
  shortName: string;
  tagline: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  roleContext: string;
  description: string;
}

const JOURNEY_STAGES: StageDefinition[] = [
  {
    id: 1,
    name: 'Research & Innovation',
    shortName: 'Research',
    tagline: 'Lab to Prototype',
    icon: 'research',
    color: '#0284c7',
    bgColor: '#f0f9ff',
    borderColor: '#bae6fd',
    roleContext: 'Researchers & Innovators',
    description: 'Academic lab discoveries, patented IP, student projects, and early prototype concepts.',
  },
  {
    id: 2,
    name: 'Government Challenge',
    shortName: 'Govt Challenge',
    tagline: 'Problem Statement',
    icon: 'government',
    color: '#d97706',
    bgColor: '#fffbeb',
    borderColor: '#fde68a',
    roleContext: 'Departments & Line Ministries',
    description: 'Structured departmental problem statements with defined KPIs, timelines, and budgets.',
  },
  {
    id: 3,
    name: 'Discovery & Matching',
    shortName: 'Discovery',
    tagline: 'AI Semantic Match',
    icon: 'sparkles',
    color: '#7c3aed',
    bgColor: '#f5f3ff',
    borderColor: '#ddd6fe',
    roleContext: 'Startups & Incubators',
    description: 'Semantic capability matching projecting startup solutions onto open challenge requirements.',
  },
  {
    id: 4,
    name: 'AI Validation & Screening',
    shortName: 'AI Validation',
    tagline: 'Eligibility & Risk Check',
    icon: 'cpu',
    color: '#2563eb',
    bgColor: '#eff6ff',
    borderColor: '#bfdbfe',
    roleContext: 'Automated ML Engine',
    description: 'Automated eligibility verification, risk prediction, and NLP duplicate/overlap detection.',
  },
  {
    id: 5,
    name: 'Expert Evaluation',
    shortName: 'Evaluation',
    tagline: 'Committee Scoring',
    icon: 'audit',
    color: '#9333ea',
    bgColor: '#faf5ff',
    borderColor: '#e9d5ff',
    roleContext: 'Domain Experts & Evaluators',
    description: 'Multi-criterion weighted scoring matrix with mandatory conflict-of-interest declarations.',
  },
  {
    id: 6,
    name: 'Pilot Deployment',
    shortName: 'Pilot',
    tagline: 'Field Testing',
    icon: 'startup',
    color: '#ea580c',
    bgColor: '#fff7ed',
    borderColor: '#fed7aa',
    roleContext: 'Govt Officer & Startup',
    description: 'Controlled live deployments with phased milestones, scope clauses, and SLA tracking.',
  },
  {
    id: 7,
    name: 'Performance Validation',
    shortName: 'Validation',
    tagline: 'Empirical Proof',
    icon: 'shield',
    color: '#059669',
    bgColor: '#ecfdf5',
    borderColor: '#a7f3d0',
    roleContext: 'Independent 3rd Party',
    description: 'Objective empirical audit against baseline targets, cyber security standards, and cost metrics.',
  },
  {
    id: 8,
    name: 'Milestone Payment',
    shortName: 'Payments',
    tagline: 'Direct Escrow Release',
    icon: 'dashboard',
    color: '#16a34a',
    bgColor: '#f0fdf4',
    borderColor: '#bbf7d0',
    roleContext: 'Finance & Treasury',
    description: 'Automated tranche release upon validator signoff and verified deliverables.',
  },
  {
    id: 9,
    name: 'Public Procurement',
    shortName: 'Procurement',
    tagline: 'GeM & State Orders',
    icon: 'government',
    color: '#0891b2',
    bgColor: '#ecfeff',
    borderColor: '#a5f3fc',
    roleContext: 'Procurement Authority',
    description: 'Streamlined public procurement pathways via GeM direct purchase or single-tender justification.',
  },
  {
    id: 10,
    name: 'Statewide Scale',
    shortName: 'Scale-Up',
    tagline: '36 Districts Rollout',
    icon: 'scale',
    color: '#4f46e5',
    bgColor: '#eef2ff',
    borderColor: '#c7d2fe',
    roleContext: 'State Government',
    description: 'Replication across all districts and multiple departments with dedicated scale-up budgets.',
  },
  {
    id: 11,
    name: 'Real-world Impact',
    shortName: 'Citizen Impact',
    tagline: 'Verified Outcomes',
    icon: 'impact',
    color: '#dc2626',
    bgColor: '#fef2f2',
    borderColor: '#fecaca',
    roleContext: 'Citizens & State Economy',
    description: 'Measured societal return: citizens served, cost savings, response time reductions, and job creation.',
  },
];

// HERO DEMO STEPS SPECIFICATION (Primary WaterLens Technologies Demo)
interface HeroStep {
  stepNumber: number;
  stageName: string;
  badge: string;
  title: string;
  subtitle: string;
  responsibleRole: string;
  summary: string;
  keyDetails: { label: string; value: string; isHighlight?: boolean }[];
  evidenceChecklist?: { label: string; verified: boolean }[];
  metricsGrid?: { label: string; target: string; observed: string; status: 'passed' | 'pending' }[];
  ctaLabel: string;
  ctaNextStep: number;
  deepLinkRoute: string;
  deepLinkLabel: string;
}

const HERO_DEMO_STEPS: HeroStep[] = [
  {
    stepNumber: 1,
    stageName: 'Government Challenge',
    badge: 'Stage 2 of 11',
    title: 'Smart Water Metering for Municipal Corporations',
    subtitle: 'Department of Urban Development &middot; Govt of Maharashtra &middot; Challenge #2',
    responsibleRole: 'Dr. Rajesh Patil (Govt Officer, Urban Development)',
    summary: 'Maharashtra major cities face 25-40% Non-Revenue Water (NRW) losses due to underground leaks and unmetered off-takes. Mumbai and Pune lose 260+ MLD of treated drinking water daily. The Department of Urban Development published an open challenge seeking IoT-based telemetry and SCADA-integrated acoustic leak detection.',
    keyDetails: [
      { label: 'Department', value: 'Department of Urban Development, Maharashtra' },
      { label: 'Budget Range', value: '₹1.00 Cr – ₹3.00 Cr (Phase 1 Pilot: ₹12.00 Lakh)' },
      { label: 'Pilot Municipality', value: 'Pune Municipal Corporation (Vadgaon circle)' },
      { label: 'Target KPI', value: 'Reduce NRW losses from 30% to under 15%', isHighlight: true },
      { label: 'Timeline', value: '24 Weeks total (Pilot duration: 16 weeks)' },
      { label: 'Eligibility Criteria', value: 'DPIIT-registered startup, DPDP Act 2023 compliant' },
    ],
    evidenceChecklist: [
      { label: 'GFR-compliant problem statement sanctioned by Secretary', verified: true },
      { label: 'Target district municipal council resolution approved', verified: true },
      { label: 'Open application window published on state portal', verified: true },
    ],
    ctaLabel: 'Discover Matched Innovations',
    ctaNextStep: 2,
    deepLinkRoute: '/challenges',
    deepLinkLabel: 'Inspect Challenge Specs',
  },
  {
    stepNumber: 2,
    stageName: 'AI Startup Discovery',
    badge: 'Stage 3 of 11',
    title: 'WaterLens Technologies Identified via Semantic Vector Match',
    subtitle: '384-Dim Embedding Alignment &middot; Startup Record #2 &middot; Match Score: 94.2%',
    responsibleRole: 'AI Neural Matching Engine (all-MiniLM-L6-v2)',
    summary: 'The AI Semantic Matcher projected open challenge requirements against registered Maharashtra startup capability vectors. WaterLens Technologies achieved a top rank with 94.2% semantic similarity across acoustic leak frequency analysis and SCADA protocol integration.',
    keyDetails: [
      { label: 'Matched Innovation', value: 'WaterLens Technologies Pvt Ltd (Mumbai & Pune)', isHighlight: true },
      { label: 'Founder & Team', value: 'Neha Joshi (VJTI Alumni, 45 Engineers)' },
      { label: 'TRL Level', value: 'TRL-7 (Validated Field Prototype)' },
      { label: 'Technical Match (+92%)', value: 'LoRaWAN & NB-IoT pressure sensors + edge AI' },
      { label: 'Relevance Fit (+96%)', value: 'Acoustic pipe leak detection tailored for municipal mains' },
      { label: 'Deployment Fit (+90%)', value: 'Previous pilot track record in Thane Municipal Corp' },
    ],
    evidenceChecklist: [
      { label: 'DPIIT startup registration certification verified', verified: true },
      { label: 'Hardware prototype bill of materials submitted', verified: true },
      { label: 'Acoustic telemetry waveform benchmark validated in lab', verified: true },
    ],
    ctaLabel: 'Review AI Command Intelligence',
    ctaNextStep: 3,
    deepLinkRoute: '/ai-command?innovation_id=2',
    deepLinkLabel: 'Open in AI Command Center',
  },
  {
    stepNumber: 3,
    stageName: 'AI Validation & Screening',
    badge: 'Stage 4 of 11',
    title: 'Multi-Factor Risk Prediction & Patent Overlap Clearance',
    subtitle: 'Gradient Boosting Decision Tree &middot; Failure Risk: Low (24/100) &middot; Success: 86.4%',
    responsibleRole: 'Automated ML Screening Pipeline',
    summary: 'The ML Risk Engine evaluated project telemetry across 5 dimensions (Technical, Financial, Deployment, Data, Scalability). WaterLens scored a Low Risk profile (24/100) with 86.4% predicted success probability. Agglomerative clustering confirmed 0 patent overlap clusters in the state repository.',
    keyDetails: [
      { label: 'Overall Failure Risk', value: 'Low (24 / 100) — On Track', isHighlight: true },
      { label: 'Success Probability', value: '86.4% (95% CI: [78.5% – 89.9%])' },
      { label: 'Duplicate / IP Overlap', value: 'Clean (0 duplicate clusters at 75% similarity)' },
      { label: 'Technical Risk (18%)', value: 'Low · SCADA API tested with Pune PMC server' },
      { label: 'Data & Privacy (15%)', value: 'Low · AES-256 encrypted, DPDP Act 2023 compliant' },
      { label: 'SHAP Top Factor (38%)', value: 'Milestone velocity and field sensor reliability' },
    ],
    evidenceChecklist: [
      { label: 'TreeSHAP explainability weight breakdown calculated', verified: true },
      { label: 'Agglomerative patent distance matrix verified distinct', verified: true },
      { label: 'Automated eligibility rules pass (DPIIT, Turnover, GST)', verified: true },
    ],
    ctaLabel: 'Send for Expert Evaluation',
    ctaNextStep: 4,
    deepLinkRoute: '/ai-command?tab=risk&innovation_id=2',
    deepLinkLabel: 'View Risk Model SHAP Weights',
  },
  {
    stepNumber: 4,
    stageName: 'Expert Evaluation',
    badge: 'Stage 5 of 11',
    title: 'Independent Expert Committee Evaluation & Scoring',
    subtitle: 'Composite Score: 8.4 / 10.0 &middot; Evaluator: Dr. Vikram Patil (IEEE Senior Member)',
    responsibleRole: 'Dr. Vikram Patil (Evaluator / IEEE Senior Member)',
    summary: 'An authorized independent domain expert reviewed the application and AI assessment. Following a mandatory conflict-of-interest check, the evaluator awarded an overall 8.4/10.0 score across technical feasibility, impact potential, cost efficiency, and scalability, officially sanctioning the innovation for pilot deployment.',
    keyDetails: [
      { label: 'Evaluator Decision', value: 'Approved for Pilot Deployment (Score: 8.4/10)', isHighlight: true },
      { label: 'Technical Feasibility', value: '8.0 / 10.0 (High architectural maturity)' },
      { label: 'Impact Potential', value: '9.0 / 10.0 (Projected 340 MLD water savings)' },
      { label: 'Cost Efficiency', value: '7.0 / 10.0 (TCO 40% lower than imported systems)' },
      { label: 'Scalability Potential', value: '8.0 / 10.0 (Replicable across all 36 districts)' },
      { label: 'Mandatory Condition', value: 'Pre-deployment CERT-In information security audit' },
    ],
    evidenceChecklist: [
      { label: 'Conflict of interest self-declaration filed by evaluator', verified: true },
      { label: 'Criterion-by-criterion scoring rationale recorded in audit log', verified: true },
      { label: 'Evaluation committee recommendation signed and archived', verified: true },
    ],
    ctaLabel: 'Initialize Pilot Deployment',
    ctaNextStep: 5,
    deepLinkRoute: '/evaluations',
    deepLinkLabel: 'View Evaluation Matrix',
  },
  {
    stepNumber: 5,
    stageName: 'Pilot Deployment',
    badge: 'Stage 6 of 11',
    title: 'Pune Municipal Corporation Live Field Pilot Deployment',
    subtitle: 'Pilot #3 &middot; Vadgaon & Warje Circles &middot; Budget: ₹12.00 Lakh &middot; 24 Weeks',
    responsibleRole: 'Dr. Rajesh Patil (Govt Officer) & Neha Joshi (Startup Lead)',
    summary: 'WaterLens Technologies deployed 25 IoT acoustic monitoring stations across 18 km of municipal pipeline in Pune. Real-time telemetry is continuously streamed to the PMC SCADA dashboard, measuring water flow, acoustic leak harmonics, and pressure differentials 24/7.',
    keyDetails: [
      { label: 'Pilot Status', value: 'In Progress (Phase 1 Telemetry Active)', isHighlight: true },
      { label: 'Deployment Area', value: 'Pune Municipal Corporation (Zone 4 Network)' },
      { label: 'Installed Stations', value: '25 IoT acoustic stations + 4 SCADA gateways' },
      { label: 'Budget Allocated', value: '₹12,00,000 (Tranche 1: ₹4.0L, Tranche 2: ₹8.0L)' },
      { label: 'Budget Utilized', value: '₹4,00,000 (33.3% spend with verified escrow)' },
      { label: 'Operational Uptime', value: '99.4% unbroken MQTT transmission over 60 days' },
    ],
    evidenceChecklist: [
      { label: 'Site deployment permit signed by Pune Municipal Commissioner', verified: true },
      { label: 'Live SCADA gateway API handshake verified', verified: true },
      { label: 'Daily acoustic leak log repository streaming to state cloud', verified: true },
    ],
    ctaLabel: 'Inspect Performance Validation',
    ctaNextStep: 6,
    deepLinkRoute: '/pilots',
    deepLinkLabel: 'Inspect Pilot Milestones',
  },
  {
    stepNumber: 6,
    stageName: 'Performance Validation',
    badge: 'Stage 7 of 11',
    title: 'Independent Performance Audit & Outcome Certification',
    subtitle: 'National Centre for Social Security Systems &middot; Validator: Anjali Kulkarni',
    responsibleRole: 'Anjali Kulkarni (Independent Validator, NCSSS)',
    summary: 'An accredited independent validator conducted on-site telemetry verification and pressure differential checks. Observed performance exceeded all baseline targets: Non-Revenue Water leakage was reduced by 16.8% (exceeding the 15.0% target), with zero false positives across 42 identified pipe fissures.',
    keyDetails: [
      { label: 'Validation Outcome', value: 'Empirically Validated & Certified', isHighlight: true },
      { label: 'Validator Recommendation', value: 'Proceed to Public Procurement & GeM Onboarding' },
      { label: 'Security Audit', value: 'CERT-In empaneled audit pass (0 high vulnerabilities)' },
      { label: 'Data Quality Check', value: '100% telemetry data consistency verified against meters' },
    ],
    metricsGrid: [
      { label: 'NRW Loss Reduction', target: '15.0%', observed: '16.8%', status: 'passed' },
      { label: 'SCADA Telemetry Uptime', target: '99.0%', observed: '99.4%', status: 'passed' },
      { label: 'Leak Detection Time', target: '< 30 min', observed: '18 min', status: 'passed' },
      { label: 'False Positive Ratio', target: '< 5.0%', observed: '1.2%', status: 'passed' },
    ],
    evidenceChecklist: [
      { label: 'Independent NABL meter calibration certificate attached', verified: true },
      { label: 'Field telemetry raw CSV stream checksum verified', verified: true },
      { label: 'Validator outcome rationale digitally signed and timestamped', verified: true },
    ],
    ctaLabel: 'Authorize Milestone Payment',
    ctaNextStep: 7,
    deepLinkRoute: '/validation',
    deepLinkLabel: 'View Validation Certificate',
  },
  {
    stepNumber: 7,
    stageName: 'Milestone Payment Workflow',
    badge: 'Stage 8 of 11',
    title: 'Proof-Linked Milestone Escrow Release Workflow',
    subtitle: 'Directorate of Accounts &middot; Tranche 1: Released &middot; Tranche 2: Approved',
    responsibleRole: 'Treasury & Directorate of Accounts, Govt of Maharashtra',
    summary: 'UdaanSetu implements a proof-linked milestone release model. Tranche 1 (₹4.0 Lakh) was released upon initial sensor deployment. Tranche 2 (₹8.0 Lakh) has been sanctioned for release following successful independent performance validation and PMC engineering sign-off.',
    keyDetails: [
      { label: 'Total Pilot Sanction', value: '₹12,00,000 (INR Twelve Lakhs)' },
      { label: 'Tranche 1 (₹4,00,000)', value: 'Completed & Released (Txn: MH-PAY-2026-0814)', isHighlight: true },
      { label: 'Tranche 2 (₹8,00,000)', value: 'Sanctioned for Release (Proof Verified by NCSSS)', isHighlight: true },
      { label: 'Payment Mechanism', value: 'Proof-linked milestone release model' },
      { label: 'Audit Trail', value: 'Immutable ledger entry linked to validation ID #1' },
      { label: 'Govt Fiscal Year', value: 'FY 2026-27 (Urban Development Head: 2217)' },
    ],
    evidenceChecklist: [
      { label: 'Milestone 1 invoice & sensor delivery challan verified', verified: true },
      { label: 'Milestone 2 independent validation certificate linked', verified: true },
      { label: 'Department sanction order issued by Finance Department', verified: true },
    ],
    ctaLabel: 'Prepare Public Procurement',
    ctaNextStep: 8,
    deepLinkRoute: '/journey',
    deepLinkLabel: 'Inspect Escrow Tranches',
  },
  {
    stepNumber: 8,
    stageName: 'Public Procurement & GeM Fast-Track',
    badge: 'Stage 9 of 11',
    title: 'GeM Fast-Track Onboarding & GFR Rule 149/165 Eligibility',
    subtitle: 'Directorate of Supplies & Disposals &middot; Meera Sharma (Procurement Officer)',
    responsibleRole: 'Meera Sharma (Procurement Officer, DSD Maharashtra)',
    summary: 'Having completed pilot validation under a government challenge, WaterLens qualifies for fast-track listing on the Government e-Marketplace (GeM) and direct government procurement under GFR Rule 149 and Maharashtra Startup Procurement Policy without prior turnover/experience barriers.',
    keyDetails: [
      { label: 'GeM Readiness Score', value: '91% (Fast-Track Eligible)', isHighlight: true },
      { label: 'Procurement Channel', value: 'GeM Direct Purchase / GFR Rule 149 (< ₹50 Lakh)' },
      { label: 'Rate Contract Price', value: '₹48,000 per IoT station + ₹12,000/yr AMC' },
      { label: 'Turnover Exemption', value: 'Granted under Maharashtra DPIIT Startup Order' },
      { label: 'EMD / Bid Security', value: '100% Exempt for validated challenge winners' },
      { label: 'Sanction Authority', value: 'Directorate of Supplies & Disposals, Mumbai' },
    ],
    evidenceChecklist: [
      { label: 'GeM catalogue product listing specification draft prepared', verified: true },
      { label: 'Single-tender justification docket archived per GFR 165', verified: true },
      { label: 'Municipal rate contract template approved by legal cell', verified: true },
    ],
    ctaLabel: 'Evaluate Statewide Scale-Up',
    ctaNextStep: 9,
    deepLinkRoute: '/procurement',
    deepLinkLabel: 'Open Procurement Workspace',
  },
  {
    stepNumber: 9,
    stageName: 'Statewide Scale-Up',
    badge: 'Stage 10 of 11',
    title: 'Statewide Replication Across 36 Maharashtra Districts',
    subtitle: 'State Innovation Committee &middot; Scale Score: 0.86 (High Confidence)',
    responsibleRole: 'State Innovation Committee & District Collectors',
    summary: 'The Scale-Up Predictor projected high suitability for statewide rollout based on pilot success (40%), milestone completion (40%), and budget efficiency (20%). The State Innovation Committee sanctioned phased expansion across Mumbai, Thane, Nashik, and Nagpur municipal networks.',
    keyDetails: [
      { label: 'Scale Recommendation', value: 'Scale to 36 Districts (Score: 0.86 / High)', isHighlight: true },
      { label: 'Phase 1 Rollout (Current)', value: 'Pune Municipal Corporation (18 km mains)' },
      { label: 'Phase 2 Expansion (Q3)', value: 'Mumbai (MCGM), Thane (TMC), Nagpur (NMC)' },
      { label: 'Phase 3 Statewide (Q4)', value: 'All 27 Municipal Corporations in Maharashtra' },
      { label: 'Total Pipeline Coverage', value: '1,450 km drinking water distribution network' },
      { label: 'Estimated State Budget', value: '₹8.50 Crore statewide innovation allocation' },
    ],
    evidenceChecklist: [
      { label: 'Multi-factor scale prediction model output recorded', verified: true },
      { label: 'Municipal Corporation inter-agency MOU drafted', verified: true },
      { label: 'State cabinet note for statewide smart water mission approved', verified: true },
    ],
    ctaLabel: 'View Verified Citizen Impact',
    ctaNextStep: 10,
    deepLinkRoute: '/ai-command?tab=pilot_scale&innovation_id=2',
    deepLinkLabel: 'Inspect Scale-Up Model',
  },
  {
    stepNumber: 10,
    stageName: 'Real-world Citizen & Economic Impact',
    badge: 'Stage 11 of 11',
    title: 'Empirical Outcomes: 340 MLD Water Saved Annually',
    subtitle: 'Impact Registry &middot; 1.2M Citizens Benefiting &middot; ₹4.8 Cr Annual Savings',
    responsibleRole: 'Citizens of Maharashtra & Urban Development Department',
    summary: 'The complete journey from academic research to public procurement demonstrates tangible societal and economic impact: 340 MLD of drinking water conserved annually, ₹4.8 Crore saved in energy/pumping costs, and reliable 24x7 water pressure delivered to 1.2 million citizens across pilot zones.',
    keyDetails: [
      { label: 'Annual Water Conserved', value: '340 MLD (Million Litres per Day)', isHighlight: true },
      { label: 'Citizens Benefited', value: '1,200,000+ residents with 24x7 tap supply', isHighlight: true },
      { label: 'Direct Energy Savings', value: '₹4.80 Crore / year in pumping power' },
      { label: 'Municipal Deployment', value: '3 Municipal Corporations active' },
      { label: 'Jobs Created by Startup', value: '45 high-tech engineering jobs in Maharashtra' },
      { label: 'Core Product Narrative', value: 'From Research to Impact.', isHighlight: true },
    ],
    evidenceChecklist: [
      { label: 'Annual municipal water audit signed by Chief Hydrogeologist', verified: true },
      { label: 'Citizen grievance reduction metrics recorded on MeeSeva portal', verified: true },
      { label: 'Final SIH26136 innovation lifecycle milestone certified', verified: true },
    ],
    ctaLabel: 'Restart Hero Journey Demo',
    ctaNextStep: 1,
    deepLinkRoute: '/impact',
    deepLinkLabel: 'Explore Impact Analytics',
  },
];

export default function InnovationJourneyPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<'hero' | 'board'>('hero');
  const [heroStep, setHeroStep] = useState<number>(1);
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Dynamic backend data
  const [journeyData, setJourneyData] = useState<any>({
    challenges: [],
    pilots: [],
    validations: [],
    procurements: [],
    funnel: [],
    metrics: null,
  });

  const [inspectItem, setInspectItem] = useState<any>(null);
  const [filterSector, setFilterSector] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cList, pList, vList, prList, fnl, imp] = await Promise.all([
          challenges.list(),
          pilots.list(),
          validations.list().catch(() => []),
          procurements.list().catch(() => []),
          analytics.pipelineFunnel().catch(() => ({ funnel: [] })),
          analytics.impact().catch(() => null),
        ]);

        setJourneyData({
          challenges: cList || [],
          pilots: pList || [],
          validations: vList || [],
          procurements: prList || [],
          funnel: fnl?.funnel || [],
          metrics: imp || null,
        });
      } catch (err) {
        console.error('Failed to load journey data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentHero = useMemo(() => {
    return HERO_DEMO_STEPS.find(s => s.stepNumber === heroStep) || HERO_DEMO_STEPS[0];
  }, [heroStep]);

  // Combined journey items across stages for board view
  const combinedItems = useMemo(() => {
    const list: any[] = [];
    (journeyData.challenges || []).forEach((c: any) => {
      list.push({
        id: `CH-${c.id}`,
        rawId: c.id,
        type: 'Challenge',
        title: c.title,
        department: c.department_id ? `Dept #${c.department_id}` : 'Urban Development',
        sector: c.sector || 'Urban Infra',
        district: c.district || 'Maharashtra',
        currentStage: c.status === 'draft' ? 2 : c.status === 'open' ? 3 : c.status === 'evaluating' ? 5 : 6,
        budget: c.budget_range || '₹10L - ₹25L',
        status: c.status,
        description: c.description,
      });
    });

    (journeyData.pilots || []).forEach((p: any) => {
      list.push({
        id: `PL-${p.id}`,
        rawId: p.id,
        type: 'Pilot Project',
        title: `Pilot for Challenge #${p.challenge_id} (Startup #${p.startup_id})`,
        department: 'Dept of Health / IT',
        sector: 'Healthcare & AI',
        district: 'Pune / Mumbai',
        currentStage: p.status === 'proposed' ? 6 : p.status === 'in_progress' ? 7 : p.status === 'completed' ? 9 : 8,
        budget: p.budget ? `₹${p.budget}` : '₹15,00,000',
        status: p.status,
        description: p.scope || 'Deploying automated telemetry and performance testing unit.',
      });
    });

    return list;
  }, [journeyData]);

  const filteredItems = useMemo(() => {
    return combinedItems.filter(item => {
      const matchStage = selectedStage === null || item.currentStage === selectedStage;
      const matchSector = filterSector === 'All' || item.sector.toLowerCase().includes(filterSector.toLowerCase());
      const matchSearch = searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.district.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStage && matchSector && matchSearch;
    });
  }, [combinedItems, selectedStage, filterSector, searchTerm]);

  return (
    <div style={{ paddingBottom: 60 }}>
      {/* ── TOP BANNER: HERO STORY HEADER ── */}
      <div style={{
        background: 'linear-gradient(135deg, #012348 0%, #011a38 50%, #013158 100%)',
        borderRadius: 16,
        padding: '28px 32px',
        color: '#ffffff',
        marginBottom: 24,
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 12px 32px rgba(1,35,72,.18)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 12px',
              background: 'rgba(243,174,57,.15)',
              border: '1px solid rgba(243,174,57,.3)',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 700,
              color: '#fde68a',
              letterSpacing: '.06em',
              marginBottom: 8,
            }}>
              <Icon name="sparkles" size={13} />
              END-TO-END INNOVATION JOURNEY DEMO
            </div>
            <h1 style={{
              fontSize: 24,
              fontWeight: 800,
              color: '#ffffff',
              margin: '0 0 6px',
              fontFamily: 'var(--font-display)',
              letterSpacing: '-0.02em',
            }}>
              From Research to Real-World Impact
            </h1>
            <p style={{ fontSize: 13, color: '#c8f3ff', margin: 0, maxWidth: 680 }}>
              Follow the complete connected journey of <strong>WaterLens Technologies</strong> through government challenge publication, AI vector matching, multi-factor risk screening, expert evaluation, PMC live pilot deployment, empirical performance validation, proof-linked milestone escrow, and statewide scale rollout.
            </p>
          </div>

          {/* View Mode Toggle */}
          <div style={{ display: 'flex', gap: 8, background: 'rgba(255,255,255,.08)', padding: 6, borderRadius: 10, border: '1px solid rgba(255,255,255,.15)' }}>
            <button
              onClick={() => setViewMode('hero')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'hero' ? 'linear-gradient(135deg, #f3ae39 0%, #d4880f 100%)' : 'transparent',
                color: viewMode === 'hero' ? '#012348' : '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="sparkles" size={14} />
              Hero Demo Walkthrough
            </button>
            <button
              onClick={() => setViewMode('board')}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: 'none',
                background: viewMode === 'board' ? 'rgba(255,255,255,.2)' : 'transparent',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <Icon name="command" size={14} />
              11-Stage Pipeline Board
            </button>
          </div>
        </div>

        {/* Persistent Demo Identity Bar */}
        <div style={{
          padding: '10px 16px',
          background: 'rgba(255,255,255,.06)',
          border: '1px solid rgba(255,255,255,.12)',
          borderRadius: 10,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          fontSize: 12,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <span><strong style={{ color: '#92eaFF' }}>Challenge:</strong> #2 Smart Water Metering</span>
            <span>&bull;</span>
            <span><strong style={{ color: '#92eaFF' }}>Innovation:</strong> WaterLens Technologies (#2)</span>
            <span>&bull;</span>
            <span><strong style={{ color: '#92eaFF' }}>Lead:</strong> Neha Joshi</span>
            <span>&bull;</span>
            <span><strong style={{ color: '#92eaFF' }}>Pilot Circle:</strong> Pune Municipal Corp</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: '#fde68a', fontWeight: 700 }}>Demo Step {heroStep} of 10</span>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODE 1: HERO DEMO WALKTHROUGH (10-STEP CONTINUOUS JOURNEY)     */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'hero' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* 10-Step Interactive Horizontal Stepper */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 14,
            padding: '16px 20px',
            boxShadow: 'var(--shadow-xs)',
            overflowX: 'auto',
          }}>
            <div style={{ display: 'flex', gap: 6, minWidth: 960 }}>
              {HERO_DEMO_STEPS.map((s) => {
                const isActive = s.stepNumber === heroStep;
                const isCompleted = s.stepNumber < heroStep;

                return (
                  <button
                    key={s.stepNumber}
                    onClick={() => setHeroStep(s.stepNumber)}
                    style={{
                      flex: 1,
                      padding: '10px 8px',
                      borderRadius: 10,
                      border: `1px solid ${isActive ? '#f3ae39' : isCompleted ? '#bbf7d0' : 'var(--border-soft)'}`,
                      background: isActive ? 'var(--green-50, #fef7e8)' : isCompleted ? '#f0fdf4' : 'var(--surface-soft)',
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all .15s ease',
                    }}
                  >
                    <div style={{
                      width: 22,
                      height: 22,
                      borderRadius: '50%',
                      background: isActive ? '#d97706' : isCompleted ? '#16a34a' : '#9ca3af',
                      color: '#ffffff',
                      fontSize: 11,
                      fontWeight: 800,
                      margin: '0 auto 4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {isCompleted ? '✓' : s.stepNumber}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: isActive ? 800 : 600, color: isActive ? '#78350f' : 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {s.stageName}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Step Content Card */}
          <div style={{
            background: 'var(--surface)',
            border: '1px solid var(--border-soft)',
            borderRadius: 16,
            padding: '28px 32px',
            boxShadow: 'var(--shadow-sm)',
            display: 'grid',
            gridTemplateColumns: '1.8fr 1.2fr',
            gap: 28,
          }}>
            {/* Left Column: Narrative, Problem, Solution, Details */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{
                  padding: '3px 10px',
                  borderRadius: 12,
                  background: 'rgba(212,136,15,.12)',
                  border: '1px solid rgba(212,136,15,.3)',
                  color: 'var(--green-700, #b37209)',
                  fontSize: 11,
                  fontWeight: 800,
                }}>
                  {currentHero.badge} &middot; Step {currentHero.stepNumber} of 10
                </span>
                <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>
                  Role: <strong>{currentHero.responsibleRole}</strong>
                </span>
              </div>

              <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
                {currentHero.title}
              </h2>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16, fontWeight: 500 }}>
                {currentHero.subtitle}
              </div>

              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, margin: '0 0 20px' }}>
                {currentHero.summary}
              </p>

              {/* Key Specifications Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
                {currentHero.keyDetails.map((kd, idx) => (
                  <div key={idx} style={{
                    background: kd.isHighlight ? 'var(--green-50, #fef7e8)' : 'var(--surface-soft)',
                    border: `1px solid ${kd.isHighlight ? 'var(--green-300)' : 'var(--border-soft)'}`,
                    padding: '10px 14px',
                    borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 11, color: 'var(--text-tertiary)', fontWeight: 600 }}>{kd.label}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: kd.isHighlight ? 'var(--green-900)' : 'var(--text-primary)', marginTop: 2 }}>
                      {kd.value}
                    </div>
                  </div>
                ))}
              </div>

              {/* Step 6 Specific: Target vs Observed Metrics Grid */}
              {currentHero.metricsGrid && (
                <div style={{ background: 'var(--surface-soft)', padding: 16, borderRadius: 12, border: '1px solid var(--border-soft)', marginBottom: 20 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
                    Empirical Target vs. Observed Telemetry:
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, textAlign: 'center' }}>
                    {currentHero.metricsGrid.map((mg, i) => (
                      <div key={i} style={{ background: '#ffffff', padding: 10, borderRadius: 8, border: '1px solid #bbf7d0' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600 }}>{mg.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Target: {mg.target}</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#16a34a', marginTop: 2 }}>
                          {mg.observed} ✓
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Evidence & Action Navigation */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div style={{ background: 'var(--surface-soft)', padding: 20, borderRadius: 14, border: '1px solid var(--border-soft)' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', marginBottom: 12 }}>
                  Verified Gate Deliverables &amp; Evidence:
                </div>

                <div style={{ display: 'grid', gap: 10, marginBottom: 20 }}>
                  {currentHero.evidenceChecklist?.map((ev, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 12 }}>
                      <span style={{
                        width: 18,
                        height: 18,
                        borderRadius: '50%',
                        background: ev.verified ? '#16a34a' : '#d97706',
                        color: '#fff',
                        fontSize: 10,
                        fontWeight: 800,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        marginTop: 1,
                      }}>
                        {ev.verified ? '✓' : '○'}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                        {ev.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Direct Page Deep Link */}
                <div style={{ paddingTop: 14, borderTop: '1px solid var(--border-soft)', marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                    Workspace Link:
                  </div>
                  <Link href={currentHero.deepLinkRoute} style={{ textDecoration: 'none' }}>
                    <div style={{
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'var(--surface)',
                      border: '1px solid var(--border-soft)',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}>
                      <span>{currentHero.deepLinkLabel}</span>
                      <Icon name="arrow-right" size={14} />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Bottom Next Step Progression Buttons */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                <button
                  onClick={() => setHeroStep(prev => Math.max(1, prev - 1))}
                  disabled={heroStep === 1}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border-soft)',
                    color: 'var(--text-primary)',
                    fontWeight: 700,
                    fontSize: 13,
                    cursor: heroStep === 1 ? 'not-allowed' : 'pointer',
                    opacity: heroStep === 1 ? 0.5 : 1,
                  }}
                >
                  &larr; Previous Stage
                </button>

                <button
                  onClick={() => setHeroStep(currentHero.ctaNextStep)}
                  style={{
                    padding: '12px',
                    borderRadius: 10,
                    background: 'linear-gradient(135deg, #012348 0%, #013158 100%)',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: 13,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(1,35,72,.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <span>{currentHero.ctaLabel}</span>
                  <Icon name="arrow-right" size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* MODE 2: 11-STAGE PIPELINE BOARD VIEW                           */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {viewMode === 'board' && (
        <div style={{ display: 'grid', gap: 20 }}>
          {/* Stage Filter Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(11, 1fr)', gap: 8, overflowX: 'auto' }}>
            {JOURNEY_STAGES.map((st) => {
              const isSelected = selectedStage === st.id;
              return (
                <button
                  key={st.id}
                  onClick={() => setSelectedStage(isSelected ? null : st.id)}
                  style={{
                    background: isSelected ? st.bgColor : 'var(--surface)',
                    border: `1px solid ${isSelected ? st.borderColor : 'var(--border-soft)'}`,
                    borderRadius: 10,
                    padding: '12px 6px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: isSelected ? st.color : 'var(--surface-soft)',
                    color: isSelected ? '#fff' : 'var(--text-tertiary)',
                    fontSize: 10,
                    fontWeight: 800,
                    margin: '0 auto 4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    {st.id}
                  </div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: isSelected ? st.color : 'var(--text-primary)' }}>
                    {st.shortName}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Filtered Records List */}
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border-soft)', borderRadius: 14, padding: 22, boxShadow: 'var(--shadow-xs)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                Active Innovation Journey Records ({filteredItems.length})
              </h3>
              {selectedStage && (
                <button onClick={() => setSelectedStage(null)} style={{ fontSize: 12, color: 'var(--green-700)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  Clear Filter
                </button>
              )}
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    background: 'var(--surface-soft)',
                    border: '1px solid var(--border-soft)',
                    borderRadius: 10,
                    padding: '14px 18px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: 'var(--surface)', border: '1px solid var(--border-soft)' }}>
                        {item.id}
                      </span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        {item.title}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      {item.department} &middot; {item.sector} &middot; Budget: {item.budget}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '4px 10px', borderRadius: 20, background: 'var(--green-50)', color: 'var(--green-700)', fontSize: 11, fontWeight: 700, border: '1px solid var(--green-200)' }}>
                      Stage {item.currentStage} of 11
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
