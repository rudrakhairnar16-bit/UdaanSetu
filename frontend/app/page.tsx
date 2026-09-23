'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from './lib/auth';
import { Icon } from './components/ui/Icon';

const JOURNEY_STAGES = [
  {
    id: 1,
    title: 'Research',
    subtitle: 'Lab to Proof-of-Concept',
    tag: 'TRL 1-3',
    actor: 'Researcher / Faculty',
    desc: 'University labs and R&D institutions publish breakthroughs, patents, and scientific prototypes with verifiable methodology.',
    deliverable: 'Research Paper, Lab Prototype, Initial Patent Filing',
    gate: 'Faculty Endorsement & Peer Indexing',
    icon: 'research',
    color: '#0284c7',
  },
  {
    id: 2,
    title: 'Govt Challenge',
    subtitle: 'Department Demand',
    tag: 'Need Stated',
    actor: 'Govt Officer / Ministry',
    desc: 'State departments publish real-world civic, agricultural, healthcare, and infrastructure problem statements with defined KPIs.',
    deliverable: 'Challenge Brief, Technical Criteria, District Allocation',
    gate: 'Departmental Budget & Scope Sign-off',
    icon: 'building',
    color: '#0369a1',
  },
  {
    id: 3,
    title: 'Discovery & Match',
    subtitle: 'AI Semantic Match',
    tag: 'Cosine/TF-IDF',
    actor: 'UdaanSetu Engine',
    desc: 'Automated semantic and vector matching connects the best-suited startups and researchers to active department challenges.',
    deliverable: 'Ranked Shortlist, Match Score Matrix (0-100%)',
    gate: 'Similarity & Eligibility Threshold (>70%)',
    icon: 'sparkles',
    color: '#0f766e',
  },
  {
    id: 4,
    title: 'AI Validation',
    subtitle: 'Risk & Overlap Scan',
    tag: 'ML Scored',
    actor: 'AI Risk Engine',
    desc: 'ML models score delivery risk, detect IP overlaps, and evaluate financial/technical readiness with explainable feature weights.',
    deliverable: 'AI Risk Report, Duplicate Cluster Analysis, 95% CI',
    gate: 'Risk Index <= 45% & Zero IP Duplicate Flag',
    icon: 'cpu',
    color: '#047857',
  },
  {
    id: 5,
    title: 'Evaluation',
    subtitle: 'Domain Review',
    tag: 'Blind Scoring',
    actor: 'Expert Evaluators',
    desc: 'Independent academic, technical, and industry panels conduct double-blind evaluations across feasibility and cost.',
    deliverable: 'Rubric Scores, Technical Feasibility Scorecard',
    gate: 'Consensus Approval (>= 75/100 Average Score)',
    icon: 'check',
    color: '#b45309',
  },
  {
    id: 6,
    title: 'Pilot Deployment',
    subtitle: 'Field Sandbox',
    tag: 'Controlled Trial',
    actor: 'Startup + Department',
    desc: 'Controlled deployment in designated districts or facility environments with baseline data collection and milestones.',
    deliverable: 'Pilot MoU, Site Setup, Baseline KPI Capture',
    gate: 'District Collector / Chief Engineer Pilot Consent',
    icon: 'play',
    color: '#c2410c',
  },
  {
    id: 7,
    title: 'Validation',
    subtitle: 'Performance Proof',
    tag: 'Field Telemetry',
    actor: 'Third-Party Validator',
    desc: 'On-site verification of KPIs (uptime, efficiency, cost savings) by certified third-party testing agencies and validators.',
    deliverable: 'Performance Audit Report, Telemetry Logs, Proof-of-Value',
    gate: 'Formal Validator Performance Certification',
    icon: 'shield',
    color: '#15803d',
  },
  {
    id: 8,
    title: 'Milestone Payment',
    subtitle: 'Escrow Release',
    tag: 'Proof-Linked',
    actor: 'Finance / Treasury',
    desc: 'Disbursement of pilot milestone funds linked strictly to validator proof, preventing non-performing grant loss.',
    deliverable: 'Disbursement Voucher, Bank UTR Reference, Audit Record',
    gate: 'Milestone Verification & Automated Escrow Trigger',
    icon: 'credit-card',
    color: '#0d9488',
  },
  {
    id: 9,
    title: 'Procurement',
    subtitle: 'GeM-Aligned Onboarding',
    tag: 'SIH Highway',
    actor: 'Procurement Officer',
    desc: 'Validated solutions transition into government e-Marketplace (GeM) compatible procurement structures with transparent purchase order milestones.',
    deliverable: 'GeM Contract Reference, Purchase Order, Service SLA',
    gate: 'GeM Criteria Compliance & Departmental Sanction',
    icon: 'scale',
    color: '#4338ca',
  },
  {
    id: 10,
    title: 'Scale-Up',
    subtitle: 'Multi-District Rollout',
    tag: 'Statewide',
    actor: 'State Innovation Mission',
    desc: 'Scale validated innovations across districts in Maharashtra and participating states with mission policy support.',
    deliverable: 'State Expansion Plan, Capacity Training, Support Desk',
    gate: 'State Level Apex Committee Sanction',
    icon: 'journey',
    color: '#6d28d9',
  },
  {
    id: 11,
    title: 'Impact',
    subtitle: 'Measurable Outcomes',
    tag: 'SDG Tracked',
    actor: 'Citizens & State',
    desc: 'Long-term quantification of societal benefit: citizen lives touched, carbon reduced, funds saved, and jobs generated.',
    deliverable: 'Public Impact Dashboard, SDG Audit, Longitudinal Study',
    gate: 'Annual CAG / Third-Party Social Impact Audit',
    icon: 'sparkles',
    color: '#0284c7',
  },
];

const PROBLEM_GAP_STAGES = [
  { step: '01', title: 'Research / Innovation', tag: 'Lab Discovery', icon: '🔬', desc: 'Academic breakthrough' },
  { step: '02', title: 'IPR / Funding', tag: 'Patent & Grants', icon: '📜', desc: 'IP protection & funding' },
  { step: '03', title: 'Startup Formation', tag: 'Incubation', icon: '🚀', desc: 'Enterprise creation' },
  { step: '04', title: 'Govt Challenge', tag: 'Demand Stated', icon: '🏛️', desc: 'Public problem defined' },
  { step: '05', title: 'Evaluation', tag: 'Scoring', icon: '🎯', desc: 'Double-blind rubric review' },
  { step: '06', title: 'Pilot Sandbox', tag: 'Field Trial', icon: '⚙️', desc: 'District live deployment' },
  { step: '07', title: 'Validation', tag: 'Certification', icon: '✅', desc: 'Third-party KPI audit' },
  { step: '08', title: 'Procurement', tag: 'GeM Onboarding', icon: '📋', desc: 'Public purchase order' },
  { step: '09', title: 'Real-World Impact', tag: 'Scale-Up', icon: '📈', desc: 'Societal & economic outcome' },
];

const CORE_PROBLEM_AREAS = [
  {
    title: 'Fragmented Innovation Journey',
    desc: 'Disjointed handoffs between research labs, incubators, state departments, and funding bodies cause promising innovations to stall in the "valley of death".',
    icon: '⚡',
    badge: 'Disconnect',
    color: '#dc2626',
  },
  {
    title: 'Difficult Startup Discovery',
    desc: 'Government departments struggle with manual, siloed registries to identify capable, verified deep-tech startups tailored to specific departmental needs.',
    icon: '🔍',
    badge: 'Discovery Gap',
    color: '#ea580c',
  },
  {
    title: 'Limited Innovation-Challenge Link',
    desc: 'Public problem statements rarely reach relevant academic labs and specialized startups due to the lack of an integrated demand-supply bridge.',
    icon: '🔗',
    badge: 'Siloed Needs',
    color: '#d97706',
  },
  {
    title: 'Manual / Disconnected Evaluation',
    desc: 'Ad-hoc evaluation workflows, subjective scoring, and lack of double-blind review mechanisms introduce administrative delays and selection bias.',
    icon: '⚖️',
    badge: 'Subjectivity',
    color: '#ca8a04',
  },
  {
    title: 'Pilot & Milestone Tracking Gaps',
    desc: 'Field sandbox pilots lack real-time IoT/telemetry monitoring, structured progress milestones, and verifiable stage gates.',
    icon: '⏱️',
    badge: 'Oversight Gap',
    color: '#0284c7',
  },
  {
    title: 'Difficulty Validating Outcomes',
    desc: 'Absence of standardized, certified third-party testing protocols makes it difficult to objectively verify pilot efficacy before procurement.',
    icon: '📊',
    badge: 'Validation Gap',
    color: '#0d9488',
  },
  {
    title: 'Procurement Readiness Challenges',
    desc: 'Traditional public procurement rules present steep hurdles for early startups, with risk aversion, complex tenders, and opaque GeM pathways.',
    icon: '🛡️',
    badge: 'Procurement Hurdle',
    color: '#4338ca',
  },
  {
    title: 'Limited Visibility to Real-World Impact',
    desc: 'No unified system tracks the journey from initial lab breakthrough to quantified citizen lives touched, carbon reduced, and public funds saved.',
    icon: '🌐',
    badge: 'Impact Blindspot',
    color: '#7c3aed',
  },
];

const EVALUATOR_FAST_TRACK = [
  {
    q: '1. What is the Problem?',
    a: "India's research, innovation, and startup ecosystem is fragmented across multiple stages and stakeholders. Ideas face difficulty moving from research to IPR, funding, startups, government challenges, pilots, validation, and public procurement.",
    tag: 'Problem Context',
    color: '#b91c1c',
    bg: '#fef2f2',
    border: '#fecaca',
  },
  {
    q: '2. What is UdaanSetu?',
    a: 'UdaanSetu is a unified national platform prototype connecting research breakthroughs, startups, government challenges, and procurement officers into one traceable, evidence-based innovation-to-impact ecosystem.',
    tag: 'Platform Identity',
    color: '#0369a1',
    bg: '#f0f9ff',
    border: '#bae6fd',
  },
  {
    q: '3. How Does UdaanSetu Solve It?',
    a: 'By bridging all fragmented stages into an integrated 11-stage highway: automated discovery, AI risk scoring, double-blind evaluation, sandbox pilots, third-party validation, proof-linked milestone escrow, and GeM onboarding.',
    tag: 'Solution Architecture',
    color: '#047857',
    bg: '#f0fdf4',
    border: '#bbf7d0',
  },
  {
    q: '4. What Makes It Technically Different?',
    a: 'Deterministic & vector AI matching, explainable ML risk scoring (Benchmark: 92.0% accuracy, 0.940 ROC-AUC), duplicate IP clustering, tamper-evident audit trails, and strict third-party validator telemetry gates.',
    tag: 'Technical Edge',
    color: '#6d28d9',
    bg: '#f5f3ff',
    border: '#ddd6fe',
  },
];

const AI_CAPABILITIES = [
  {
    title: 'AI Smart Matcher',
    tag: 'Cosine & Vector Similarity',
    badge: 'Deterministic & Heuristic Fallback',
    what: 'Matches research breakthroughs and startups to active government challenges and certified domain mentors.',
    why: 'Eliminates departmental search friction and ensures the highest-capability innovators are discovered immediately.',
    action: 'Generates instant match shortlists with transparent similarity scores (0-100%) and keyword overlap matrices.',
    metric: '150+ Seed & Benchmark Records',
    icon: 'sparkles',
  },
  {
    title: 'Risk & Success Predictor',
    tag: 'Logistic Regression & 95% CI',
    badge: 'Benchmark Baseline (92.0%)',
    what: 'Computes multidimensional delivery risk across team experience, funding run-rate, milestone lag, and sector readiness.',
    why: 'Prevents public fund wastage by flagging high-risk initiatives before costly field pilots are approved.',
    action: 'Highlights specific risk drivers with explainable feature weights so founders can mitigate issues proactively.',
    metric: 'Benchmark ROC-AUC: 0.940',
    icon: 'shield',
  },
  {
    title: 'Duplicate & IP Overlap Detection',
    tag: 'Levenshtein & TF-IDF Clustering',
    badge: 'Multi-Corpus Cluster Engine',
    what: 'Scans new submissions against the state innovation repository and national patent databases to find overlaps.',
    why: 'Prevents fraudulent double-funding and accidental intellectual property duplication across departments.',
    action: 'Groups submissions into similarity clusters with dynamic threshold controls (50%-90% cutoff).',
    metric: 'Cross-Corpus Deduplication',
    icon: 'cpu',
  },
  {
    title: 'Explainable AI Decision Engine',
    tag: 'Feature Importance & Audit Trail',
    badge: 'Zero Black-Box Scoring',
    what: 'Deconstructs every AI recommendation into transparent contributing factors with positive and negative weight bars.',
    why: 'Maintains government transparency and compliance with public accountability standards.',
    action: 'Enables procurement officers and evaluators to see exactly why a project scored high or low.',
    metric: '100% Explainable Breakdown',
    icon: 'command',
  },
  {
    title: 'AI Challenge Compiler',
    tag: 'NLP Requirement Synthesis',
    badge: 'Domain-to-KPI Translation',
    what: 'Translates unstructured departmental problem statements into structured technical requirements and evaluation criteria.',
    why: 'Standardizes procurement language so startups clearly understand pilot success conditions.',
    action: 'Outputs draft challenge rubrics, KPI targets, and required proof-of-performance benchmarks.',
    metric: 'Standardized KPI Generation',
    icon: 'building',
  },
];

const WORKFLOW_ACTORS = [
  {
    role: 'Researcher & Academic',
    icon: '🔬',
    desc: 'Publishes lab research, files patents, applies for translational grants, and monitors commercialization readiness.',
    keyAction: 'Publish breakthrough -> Enter Discovery',
  },
  {
    role: 'Startup & Innovator',
    icon: '🚀',
    desc: 'Applies to government challenges, deploys pilots, uploads proof-of-performance telemetry, and accesses GeM contracts.',
    keyAction: 'Apply to challenge -> Deploy field pilot',
  },
  {
    role: 'Government Department',
    icon: '🏛️',
    desc: 'Posts state problem statements, reviews AI matching candidates, funds district sandboxes, and awards purchase orders.',
    keyAction: 'Post problem statement -> Fund pilot sandbox',
  },
  {
    role: 'Evaluator & Validator',
    icon: '⚖️',
    desc: 'Conducts blind peer scoring, validates field pilot telemetry on-site, and issues verifiable milestone certifications.',
    keyAction: 'Conduct blind review -> Sign validation report',
  },
  {
    role: 'Procurement Officer',
    icon: '📋',
    desc: 'Executes GeM onboarding, verifies milestone triggers, disburses escrow payments, and manages statewide contracts.',
    keyAction: 'Release milestone escrow -> Onboard to GeM',
  },
  {
    role: 'Auditor & State Mission',
    icon: '🔍',
    desc: 'Maintains immutable audit trails, tracks real-world SDG impact metrics, and monitors state innovation fund allocation.',
    keyAction: 'Inspect audit trail -> Quantify SDG impact',
  },
];

const DEMO_ACCOUNTS = [
  { role: 'Admin (Full Access)', email: 'admin@udaansetu.gov.in', icon: '⚡', desc: 'Full governance, AI retraining, audit inspection, and user management.' },
  { role: 'Govt Officer (Challenges)', email: 'rajesh.patil@maharashtra.gov.in', icon: '🏛️', desc: 'Department challenges, pilot authorizations, and department metrics.' },
  { role: 'Procurement Officer (GeM)', email: 'meera.sharma@maharashtra.gov.in', icon: '📋', desc: 'Purchase orders, GeM milestone escrow releases, and contract SLAs.' },
  { role: 'Evaluator (Peer Review)', email: 'vikram.patil@ieee.org', icon: '🎯', desc: 'Blind rubric evaluations, technical scoring, and candidate filtering.' },
  { role: 'Validator (Field Testing)', email: 'anjali.kulkarni@ncssc.in', icon: '✅', desc: 'Pilot milestone telemetry audits and performance certifications.' },
  { role: 'Researcher (IIT/Lab)', email: 'arun.joshi@iitb.ac.in', icon: '🔬', desc: 'Research records, patent filings, and translational milestone tracking.' },
];

export default function LandingPage() {
  const { user, login, loading } = useAuth();
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState(JOURNEY_STAGES[0]);
  const [email, setEmail] = useState('admin@udaansetu.gov.in');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials or API server.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickFill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword('');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-canvas, #f8fafc)', color: 'var(--text-main, #0f172a)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      
      {/* 1. TOP GLOBAL NAVIGATION HEADER */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
        padding: '0 24px',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #012348 0%, #0284c7 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 800,
            fontSize: 20,
            boxShadow: '0 4px 10px rgba(1,35,72,0.2)',
          }}>
            ↗
          </div>
          <div>
            <div style={{ fontSize: 18, fontWeight: 800, letterSpacing: '-0.02em', color: '#012348', display: 'flex', alignItems: 'center', gap: 8 }}>
              UdaanSetu
              <span className="hide-on-mobile" style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 12, background: 'var(--saffron-50, #fef3c7)', color: 'var(--saffron-800, #92400e)', border: '1px solid var(--saffron-200, #fde68a)' }}>
                MAHARASHTRA MODEL (SIH26136)
              </span>
            </div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #64748b)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              From Research to Impact
            </div>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 20 }} className="hide-on-mobile">
          <a href="#problem" style={{ fontSize: 13, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
            Problem Statement
          </a>
          <a href="#intelligence" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none' }}>
            AI Intelligence
          </a>
          <a href="#journey" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none' }}>
            Innovation Journey
          </a>
          <a href="#workflow" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none' }}>
            Ecosystem
          </a>
          <a href="#procurement" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none' }}>
            SIH26136 Highway
          </a>
          <a href="#workspace" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none' }}>
            Workspace Login
          </a>
        </nav>

        {/* Action Header Buttons & Mobile Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <a
            href="#problem"
            className="hide-on-mobile"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 8,
              border: '1px solid var(--border-subtle, #cbd5e1)',
              background: '#ffffff',
              color: '#012348',
              textDecoration: 'none',
              transition: 'all 0.15s ease',
            }}
          >
            Problem Context
          </a>
          <a
            href="#workspace"
            style={{
              fontSize: 13,
              fontWeight: 600,
              padding: '8px 16px',
              borderRadius: 8,
              background: '#012348',
              color: '#ffffff',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(1,35,72,0.25)',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Enter Workspace</span>
            <span>→</span>
          </a>

          {/* Landing Page Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(prev => !prev)}
            id="landing-hamburger-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 38,
              height: 38,
              borderRadius: 8,
              border: '1px solid var(--border-subtle, #cbd5e1)',
              background: mobileMenuOpen ? 'var(--saffron-100, #fef3c7)' : '#ffffff',
              color: '#012348',
              cursor: 'pointer',
            }}
            aria-label="Toggle navigation menu"
            title="Toggle Menu"
          >
            <Icon name={mobileMenuOpen ? 'close' : 'menu'} size={18} strokeWidth={2} />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{
          position: 'sticky',
          top: 68,
          zIndex: 99,
          background: 'rgba(255, 255, 255, 0.98)',
          backdropFilter: 'blur(16px)',
          borderBottom: '2px solid var(--border-subtle, #cbd5e1)',
          padding: '16px 24px',
          boxShadow: '0 12px 24px rgba(0,0,0,0.08)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <a
            href="#problem"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 700, color: '#0284c7', textDecoration: 'none', padding: '6px 0' }}
          >
            Problem Statement
          </a>
          <a
            href="#intelligence"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none', padding: '6px 0' }}
          >
            AI Intelligence & Risk Scoring
          </a>
          <a
            href="#journey"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none', padding: '6px 0' }}
          >
            11-Stage Innovation Journey
          </a>
          <a
            href="#workflow"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none', padding: '6px 0' }}
          >
            Multi-Stakeholder Ecosystem
          </a>
          <a
            href="#procurement"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-main, #334155)', textDecoration: 'none', padding: '6px 0' }}
          >
            SIH26136 Procurement Highway
          </a>
          <a
            href="#workspace"
            onClick={() => setMobileMenuOpen(false)}
            style={{ fontSize: 14, fontWeight: 700, color: '#012348', textDecoration: 'none', padding: '6px 0' }}
          >
            → Workspace Login
          </a>
        </div>
      )}

      {/* 2. HERO SECTION */}
      <section style={{
        position: 'relative',
        background: 'linear-gradient(175deg, #012348 0%, #011b3b 60%, #022a54 100%)',
        color: '#ffffff',
        padding: '88px 32px 80px',
        overflow: 'hidden',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
      }}>
        {/* Subtle Ambient Light */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(800px 500px at 75% 20%, rgba(2,132,199,0.18), transparent 70%), radial-gradient(600px 400px at 20% 80%, rgba(212,136,15,0.14), transparent 60%)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', boxShadow: '0 0 8px #22c55e' }} />
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#e2e8f0' }}>
              National Innovation & Procurement Platform Prototype · SIH26136
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(36px, 5.5vw, 64px)',
            fontWeight: 900,
            lineHeight: 1.08,
            letterSpacing: '-0.03em',
            maxWidth: 960,
            marginBottom: 20,
          }}>
            From Research to Impact
          </h1>

          <div style={{
            fontSize: 'clamp(18px, 2.2vw, 24px)',
            fontWeight: 700,
            color: '#93c5fd',
            marginBottom: 16,
            letterSpacing: '-0.01em',
          }}>
            One idea. One journey. One ecosystem.
          </div>

          <p style={{
            fontSize: 16,
            lineHeight: 1.6,
            color: '#cbd5e1',
            maxWidth: 780,
            marginBottom: 36,
          }}>
            UdaanSetu connects university research, high-growth startups, government challenges, AI validation, pilot deployments, and GeM procurement into a single, transparent, evidence-based national highway.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'center', marginBottom: 54 }}>
            <a
              href="#problem"
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 26px',
                borderRadius: 10,
                background: '#0284c7',
                color: '#ffffff',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(2,132,199,0.4)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Explore Problem & Solution</span>
              <span>↓</span>
            </a>

            <a
              href="#workspace"
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.12)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.25)',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>Launch Workspace</span>
              <span>→</span>
            </a>

            <a
              href="#journey"
              style={{
                fontSize: 14,
                fontWeight: 600,
                padding: '12px 20px',
                borderRadius: 10,
                color: '#94a3b8',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>Track 11-Stage Highway</span>
              <span>↓</span>
            </a>
          </div>

          {/* Live Platform Telemetry Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            padding: 20,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Journey Architecture</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>11 Verified Stages</div>
              <div style={{ fontSize: 12, color: '#38bdf8', marginTop: 2 }}>From TRL-1 to Multi-District Scale</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>AI ML Benchmark</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>92.0% Baseline Accuracy</div>
              <div style={{ fontSize: 12, color: '#4ade80', marginTop: 2 }}>0.940 Cross-Validated ROC-AUC</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Procurement Path</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>GeM-Aligned Prototype</div>
              <div style={{ fontSize: 12, color: '#facc15', marginTop: 2 }}>Proof-Linked Escrow Model</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Governance & RBAC</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginTop: 4 }}>11 Granular Roles</div>
              <div style={{ fontSize: 12, color: '#e2e8f0', marginTop: 2 }}>Append-Only System Audit Trail</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. DEDICATED SIH26136 PROBLEM STATEMENT & GAP ANALYSIS */}
      <section id="problem" style={{
        background: '#ffffff',
        padding: '88px 32px',
        borderBottom: '1px solid #e2e8f0',
        position: 'relative',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          
          {/* SIH Official Badge & Problem Title Header */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #bae6fd',
            borderRadius: 16,
            padding: '28px 32px',
            marginBottom: 44,
            boxShadow: '0 4px 16px rgba(2,132,199,0.06)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 24,
            alignItems: 'center',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: '#012348',
                  color: '#ffffff',
                }}>
                  SMART INDIA HACKATHON 2026
                </span>
                <span style={{
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                  padding: '4px 10px',
                  borderRadius: 6,
                  background: '#fef3c7',
                  color: '#92400e',
                  border: '1px solid #fde68a',
                }}>
                  Problem Statement ID: SIH26136
                </span>
              </div>
              <h2 style={{ fontSize: 26, fontWeight: 900, color: '#012348', letterSpacing: '-0.02em', margin: '4px 0 8px' }}>
                Startup friendly Public Procurement Mechanism
              </h2>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#0369a1' }}>
                Official National SIH Challenge · Addressed by UdaanSetu
              </div>
            </div>

            <div style={{
              background: '#ffffff',
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              padding: '16px 20px',
              fontSize: 13,
              lineHeight: 1.55,
              color: '#334155',
            }}>
              <div style={{ fontWeight: 800, color: '#012348', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯</span>
                <span>Evaluator Briefing:</span>
              </div>
              <div>
                UdaanSetu directly solves SIH26136 by replacing disconnected bureaucratic silos with an evidence-based, AI-orchestrated highway from lab innovation to GeM public procurement.
              </div>
            </div>
          </div>

          {/* Problem Statement Narrative */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: 24,
            marginBottom: 48,
          }}>
            <div style={{
              background: 'var(--surface-canvas, #f8fafc)',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: 28,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>⚠️</span>
                <span>The Innovation Dilemma</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#012348', marginBottom: 12 }}>
                Fragmented Innovation & Startup Ecosystem
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#475569', margin: 0 }}>
                India's research, innovation and startup ecosystem is fragmented across multiple stages and stakeholders. Innovative ideas often face difficulty moving from research and innovation to IPR support, funding, startup formation, government challenges, pilot deployment, validation, procurement and real-world impact.
              </p>
            </div>

            <div style={{
              background: 'var(--surface-canvas, #f8fafc)',
              borderRadius: 14,
              border: '1px solid #e2e8f0',
              padding: 28,
              boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#d97706', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🏛️</span>
                <span>The Procurement Bottleneck</span>
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#012348', marginBottom: 12 }}>
                Public Sector Discovery & Scale-Up Gap
              </h3>
              <p style={{ fontSize: 14, lineHeight: 1.65, color: '#475569', margin: 0 }}>
                The public procurement side also needs a structured mechanism to discover eligible startups, evaluate solutions, manage pilots, track milestones, validate outcomes and support transparent scale-up without exposing public funds to unverified performance risk.
              </p>
            </div>
          </div>

          {/* VISUAL FLOW OF THE GAP */}
          <div style={{
            background: 'linear-gradient(180deg, #012348 0%, #01162d 100%)',
            borderRadius: 16,
            padding: '36px 28px',
            color: '#ffffff',
            marginBottom: 48,
            boxShadow: '0 10px 30px rgba(1,35,72,0.2)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                THE TRADITIONAL GAP VS. CONNECTED ECOSYSTEM
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', margin: 0 }}>
                Bridging the 9 Fragmented Stages of Innovation
              </h3>
              <p style={{ fontSize: 14, color: '#cbd5e1', maxWidth: 640, margin: '8px auto 0' }}>
                Historically, ideas fail at the uncoordinated handoffs between stages. UdaanSetu bridges every transition into a single verified sequence.
              </p>
            </div>

            {/* Horizontal Stage Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(115px, 1fr))',
              gap: 8,
              position: 'relative',
              alignItems: 'stretch',
            }}>
              {PROBLEM_GAP_STAGES.map((st, idx) => (
                <div
                  key={idx}
                  style={{
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    borderRadius: 10,
                    padding: '14px 10px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 18, marginBottom: 4 }}>{st.icon}</div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', marginBottom: 2 }}>{st.step}</div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#ffffff', lineHeight: 1.25, marginBottom: 6 }}>
                      {st.title}
                    </div>
                  </div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#94a3b8', background: 'rgba(255,255,255,0.08)', padding: '2px 4px', borderRadius: 4 }}>
                    {st.tag}
                  </div>
                </div>
              ))}
            </div>

            {/* UdaanSetu Connecting Statement */}
            <div style={{
              marginTop: 28,
              background: 'rgba(2,132,199,0.15)',
              border: '1px solid rgba(56,189,248,0.3)',
              borderRadius: 12,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              textAlign: 'center',
            }}>
              <span style={{ fontSize: 20 }}>⚡</span>
              <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.01em' }}>
                "UdaanSetu connects these fragmented stages into one intelligent, traceable innovation-to-impact ecosystem."
              </div>
            </div>
          </div>

          {/* 8 CORE PROBLEM AREAS */}
          <div style={{ marginBottom: 48 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                Systemic Bottlenecks
              </div>
              <h3 style={{ fontSize: 28, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', margin: 0 }}>
                The 8 Core Problem Areas Addressed
              </h3>
              <p style={{ fontSize: 14, color: '#64748b', maxWidth: 640, margin: '8px auto 0' }}>
                Understanding the key pain points in startup discovery, evaluation, pilot management, and public procurement.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {CORE_PROBLEM_AREAS.map((prob, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#ffffff',
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    padding: 22,
                    boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                      <span style={{ fontSize: 20 }}>{prob.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 6, background: '#fef2f2', color: prob.color, border: '1px solid #fecaca' }}>
                        {prob.badge}
                      </span>
                    </div>
                    <h4 style={{ fontSize: 15, fontWeight: 800, color: '#012348', marginBottom: 8, lineHeight: 1.3 }}>
                      {prob.title}
                    </h4>
                    <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.5, margin: 0 }}>
                      {prob.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* UDAANSETU SOLUTION STATEMENT */}
          <div style={{
            background: 'linear-gradient(135deg, #0284c7 0%, #012348 100%)',
            borderRadius: 16,
            padding: '32px 36px',
            color: '#ffffff',
            boxShadow: '0 8px 24px rgba(2,132,199,0.25)',
            marginBottom: 48,
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 24,
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#bae6fd', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                THE UDAANSETU SOLUTION
              </div>
              <h3 style={{ fontSize: 22, fontWeight: 900, color: '#ffffff', lineHeight: 1.3, margin: '0 0 8px' }}>
                "UdaanSetu brings research, innovation, startups, government challenges, AI-assisted evaluation, pilots, validation, milestone workflows and procurement into one connected platform."
              </h3>
              <div style={{ fontSize: 13, color: '#e0f2fe' }}>
                An end-to-end evidence-based governance framework built for the Government of Maharashtra and national scalability.
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <a
                href="#intelligence"
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: '#ffffff',
                  color: '#012348',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                Explore AI Subsystems ↓
              </a>
              <a
                href="#journey"
                style={{
                  padding: '10px 20px',
                  borderRadius: 8,
                  background: 'rgba(255,255,255,0.15)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.3)',
                  fontSize: 13,
                  fontWeight: 700,
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                View 11 Stages ↓
              </a>
            </div>
          </div>

          {/* 4-POINT EVALUATOR FAST TRACK */}
          <div>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>
                10-Second Evaluator Summary
              </div>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', margin: 0 }}>
                Key Evaluator Takeaways
              </h3>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {EVALUATOR_FAST_TRACK.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    background: item.bg,
                    border: `1px solid ${item.border}`,
                    borderRadius: 12,
                    padding: 22,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span style={{ fontSize: 10, fontWeight: 800, color: item.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      {item.tag}
                    </span>
                    <h4 style={{ fontSize: 16, fontWeight: 800, color: '#012348', margin: '8px 0 10px' }}>
                      {item.q}
                    </h4>
                    <p style={{ fontSize: 13, color: '#334155', lineHeight: 1.55, margin: 0 }}>
                      {item.a}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>

      {/* 4. AI INTELLIGENCE SECTION */}
      <section id="intelligence" style={{ background: '#ffffff', padding: '80px 32px', borderBottom: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 54 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0f766e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Native Machine Learning Subsystems
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', marginBottom: 12 }}>
              AI Innovation Intelligence
            </h2>
            <p style={{ fontSize: 15, color: '#64748b', maxWidth: 700, margin: '0 auto' }}>
              Production-tested ML models actively power discovery, risk reduction, duplicate detection, and procurement intelligence across the state.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 24,
          }}>
            {AI_CAPABILITIES.map((cap, idx) => (
              <div
                key={idx}
                style={{
                  borderRadius: 14,
                  border: '1px solid #e2e8f0',
                  background: 'var(--surface-canvas, #f8fafc)',
                  padding: 28,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#e0f2fe', color: '#0369a1' }}>
                      {cap.tag}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#047857', background: '#dcfce7', padding: '4px 8px', borderRadius: 6 }}>
                      {cap.badge}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 20, fontWeight: 800, color: '#012348', marginBottom: 14 }}>
                    {cap.title}
                  </h3>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>WHAT IT DOES</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, marginTop: 2 }}>{cap.what}</div>
                  </div>

                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>WHY IT MATTERS</div>
                    <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.5, marginTop: 2 }}>{cap.why}</div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.04em' }}>ACTION ENABLED</div>
                    <div style={{ fontSize: 13, color: '#0369a1', lineHeight: 1.5, marginTop: 2, fontWeight: 600 }}>{cap.action}</div>
                  </div>
                </div>

                <div style={{ paddingTop: 14, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#475569' }}>{cap.metric}</span>
                  <a href="#workspace" style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
                    Inspect Model →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. INNOVATION JOURNEY VISUALIZER */}
      <section id="journey" style={{ padding: '80px 32px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            End-to-End Progression
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', marginBottom: 12 }}>
            The 11-Stage Innovation Highway
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 680, margin: '0 auto' }}>
            An innovation enters UdaanSetu at any readiness level and progresses through an integrated, proof-gated journey toward real-world societal impact.
          </p>
        </div>

        {/* Horizontal Pipeline Selector */}
        <div style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 16,
          marginBottom: 32,
          borderBottom: '1px solid var(--border-subtle, #e2e8f0)',
        }}>
          {JOURNEY_STAGES.map((stage) => {
            const isSelected = selectedStage.id === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                style={{
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: isSelected ? '1px solid #0284c7' : '1px solid #e2e8f0',
                  background: isSelected ? '#eff6ff' : '#ffffff',
                  color: isSelected ? '#0284c7' : '#334155',
                  fontWeight: 700,
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 2px 8px rgba(2,132,199,0.15)' : 'none',
                }}
              >
                <span style={{
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: isSelected ? '#0284c7' : '#f1f5f9',
                  color: isSelected ? '#ffffff' : '#64748b',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 10,
                  fontWeight: 800,
                }}>
                  {stage.id}
                </span>
                <span>{stage.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Stage Inspection Card */}
        <div style={{
          borderRadius: 16,
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
          padding: 36,
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: 36,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <span style={{
                padding: '4px 10px',
                borderRadius: 8,
                background: `${selectedStage.color}15`,
                color: selectedStage.color,
                fontWeight: 800,
                fontSize: 12,
              }}>
                STAGE {selectedStage.id} OF 11
              </span>
              <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', background: '#f1f5f9', padding: '4px 10px', borderRadius: 8 }}>
                {selectedStage.tag}
              </span>
            </div>

            <h3 style={{ fontSize: 26, fontWeight: 800, color: '#012348', marginBottom: 6 }}>
              {selectedStage.title}
            </h3>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#0284c7', marginBottom: 16 }}>
              {selectedStage.subtitle}
            </div>

            <p style={{ fontSize: 15, lineHeight: 1.6, color: '#475569', marginBottom: 24 }}>
              {selectedStage.desc}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>Primary Actor:</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: '#0284c7', background: '#e0f2fe', padding: '4px 12px', borderRadius: 20 }}>
                {selectedStage.actor}
              </span>
            </div>
          </div>

          {/* Verification & Deliverables Gate */}
          <div style={{
            background: 'var(--surface-canvas, #f8fafc)',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 8 }}>
                Required Deliverable
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#012348', marginBottom: 20 }}>
                {selectedStage.deliverable}
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: '0.05em', marginBottom: 8 }}>
                Mandatory Verification Gate
              </div>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#15803d', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <span>✓</span>
                <span>{selectedStage.gate}</span>
              </div>
            </div>

            <div style={{ marginTop: 24, paddingTop: 16, borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 12, color: '#64748b' }}>Audit Log Reference Enabled</span>
              <a href="#workspace" style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textDecoration: 'none' }}>
                View in Workspace →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* 5. END-TO-END WORKFLOW (ECOSYSTEM PARTICIPANTS) */}
      <section id="workflow" style={{ padding: '80px 32px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 54 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Multi-Stakeholder Collaboration
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Connected Ecosystem Workflow
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 680, margin: '0 auto' }}>
            UdaanSetu brings researchers, startups, government departments, domain evaluators, and procurement officers into one synchronized workflow.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: 20,
        }}>
          {WORKFLOW_ACTORS.map((actor, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <span style={{ fontSize: 28, width: 44, height: 44, borderRadius: 10, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {actor.icon}
                </span>
                <div>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#012348', margin: 0 }}>
                    {actor.role}
                  </h3>
                </div>
              </div>

              <p style={{ fontSize: 13, lineHeight: 1.55, color: '#475569', marginBottom: 16 }}>
                {actor.desc}
              </p>

              <div style={{ fontSize: 12, fontWeight: 700, color: '#0369a1', background: '#f0f9ff', padding: '8px 12px', borderRadius: 8, border: '1px solid #e0f2fe' }}>
                ⚡ {actor.keyAction}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 6. SIH26136 ALIGNMENT (THE PROCUREMENT HIGHWAY) */}
      <section id="procurement" style={{ background: '#012348', color: '#ffffff', padding: '80px 32px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              SIH Problem Statement Alignment
            </div>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#ffffff', letterSpacing: '-0.02em', marginBottom: 12 }}>
              The SIH26136 Public Procurement Highway
            </h2>
            <p style={{ fontSize: 15, color: '#cbd5e1', maxWidth: 720, margin: '0 auto' }}>
              Directly addressing the gap between startup innovation and public procurement with a proof-backed, zero-leakage workflow.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 16,
          }}>
            {[
              { num: '01', title: 'Challenge Publication', text: 'Department defines municipal, health, or agro problem with specific metric goals.' },
              { num: '02', title: 'Startup Discovery', text: 'AI semantic search identifies the top matching innovators across state databases.' },
              { num: '03', title: 'AI & Peer Screening', text: 'Risk model scores technical viability and double-blind evaluators grade feasibility.' },
              { num: '04', title: 'Controlled District Pilot', text: 'Designated district sandbox pilot is initiated with IoT and telemetry monitoring.' },
              { num: '05', title: 'Validator Certification', text: 'Third-party agency audits KPI outcomes and certifies field performance.' },
              { num: '06', title: 'Milestone Escrow Payout', text: 'Automated treasury disbursement released strictly upon validator verification.' },
              { num: '07', title: 'GeM Procurement Onboarding', text: 'Validated solution transitions into Government e-Marketplace (GeM) purchase order catalogue.' },
              { num: '08', title: 'Multi-District Scaleout', text: 'Successful solution expands across districts under state innovation mission guidelines.' },
            ].map((step, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  border: '1px solid rgba(255,255,255,0.12)',
                  padding: 22,
                }}
              >
                <div style={{ fontSize: 22, fontWeight: 900, color: '#38bdf8', marginBottom: 8 }}>
                  {step.num}
                </div>
                <div style={{ fontSize: 15, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>
                  {step.title}
                </div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5 }}>
                  {step.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. TRUST, SECURITY & AUDIT ARCHITECTURE */}
      <section style={{ padding: '80px 32px', maxWidth: 1240, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
            Institutional Trust
          </div>
          <h2 style={{ fontSize: 32, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', marginBottom: 12 }}>
            Trust, Security & Transparency Architecture
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', maxWidth: 680, margin: '0 auto' }}>
            Built strictly for government accountability with end-to-end provenance and verifiable proof.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: 24,
        }}>
          {[
            {
              title: '11 Granular Roles (RBAC)',
              desc: 'Enforced permissions ensuring evaluators, validators, startups, and officers only access permitted workflow stages.',
              icon: 'shield',
            },
            {
              title: 'Append-Only System Audit Trail',
              desc: 'Every stage transition, rubric score, and payment release is logged permanently with database timestamps.',
              icon: 'command',
            },
            {
              title: 'Explainable AI Decision Support',
              desc: 'Human-in-the-loop governance: AI assists decision makers with explainable weights, not black-box automation.',
              icon: 'cpu',
            },
            {
              title: 'Evidence-Based Milestone Gates',
              desc: 'Zero public fund releases without certified third-party validator telemetry and on-site proof documentation.',
              icon: 'check',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              style={{
                borderRadius: 14,
                border: '1px solid #e2e8f0',
                background: '#ffffff',
                padding: 26,
                boxShadow: '0 2px 6px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#f0f9ff', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <Icon name={item.icon as any} size={18} />
              </div>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: '#012348', marginBottom: 8 }}>
                {item.title}
              </h3>
              <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.55 }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 8. WORKSPACE & DEMO LOGIN ACCESS */}
      <section id="workspace" style={{ background: '#f1f5f9', padding: '80px 32px', borderTop: '1px solid #e2e8f0' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#0284c7', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Direct Platform Access
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, color: '#012348', letterSpacing: '-0.02em', marginBottom: 8 }}>
              Enter UdaanSetu Workspace
            </h2>
            <p style={{ fontSize: 14, color: '#64748b' }}>
              Sign in with your registered government or startup credentials, or use a quick role demo account below.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 1fr',
            gap: 32,
            background: '#ffffff',
            borderRadius: 16,
            border: '1px solid #e2e8f0',
            boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            padding: 36,
          }}>
            {/* Quick Demo Accounts Selection */}
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: '#012348', marginBottom: 6 }}>
                Quick Role Demo Accounts
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
                Click any role to populate credentials and test role-specific views:
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {DEMO_ACCOUNTS.map((acc, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleQuickFill(acc)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 10,
                      border: email === acc.email ? '1px solid #0284c7' : '1px solid #e2e8f0',
                      background: email === acc.email ? '#f0f9ff' : '#ffffff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 18 }}>{acc.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#012348' }}>{acc.role}</div>
                        <div style={{ fontSize: 11, color: '#64748b' }}>{acc.email}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: email === acc.email ? '#0284c7' : '#94a3b8' }}>
                      {email === acc.email ? 'Active' : 'Select'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Login Form */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <form onSubmit={handleLogin}>
                <div style={{ fontSize: 18, fontWeight: 800, color: '#012348', marginBottom: 16 }}>
                  Sign In to Workspace
                </div>

                {error && (
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#b91c1c',
                    fontSize: 12,
                    fontWeight: 600,
                    marginBottom: 16,
                  }}>
                    {error}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Work Email / Department ID
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#334155', marginBottom: 6 }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (configured in environment / seed)"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: 8,
                      border: '1px solid #cbd5e1',
                      fontSize: 14,
                      outline: 'none',
                    }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: 8,
                    background: '#012348',
                    color: '#ffffff',
                    fontSize: 14,
                    fontWeight: 700,
                    border: 'none',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(1,35,72,0.25)',
                  }}
                >
                  {submitting ? 'Authenticating...' : 'Sign In & Launch Workspace →'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 9. FINAL CTA SECTION */}
      <section style={{
        background: 'linear-gradient(135deg, #012348 0%, #0284c7 100%)',
        color: '#ffffff',
        padding: '72px 32px',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, letterSpacing: '-0.02em', marginBottom: 14 }}>
            Move an innovation forward.
          </h2>
          <p style={{ fontSize: 16, color: '#e0f2fe', lineHeight: 1.6, marginBottom: 32 }}>
            Whether you are a university researcher with a patent, a startup deploying a district pilot, or a government officer solving public challenges — UdaanSetu is your unified national highway.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
            <a
              href="#workspace"
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 28px',
                borderRadius: 10,
                background: '#ffffff',
                color: '#012348',
                textDecoration: 'none',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              Explore Innovation
            </a>
            <a
              href="#workspace"
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 10,
                background: 'rgba(255,255,255,0.15)',
                color: '#ffffff',
                border: '1px solid rgba(255,255,255,0.3)',
                textDecoration: 'none',
              }}
            >
              Post a Challenge
            </a>
            <a
              href="#workspace"
              style={{
                fontSize: 14,
                fontWeight: 700,
                padding: '12px 24px',
                borderRadius: 10,
                background: '#012348',
                color: '#ffffff',
                textDecoration: 'none',
              }}
            >
              Enter Workspace
            </a>
          </div>
        </div>
      </section>

      {/* 10. GLOBAL FOOTER */}
      <footer style={{
        background: '#01162d',
        color: '#94a3b8',
        padding: '48px 32px 32px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff' }}>UdaanSetu</div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>
              From Research to Impact · Smart India Hackathon SIH26136 Prototype
            </div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 2 }}>
              State Innovation Mission & Public Procurement Ecosystem Architecture
            </div>
          </div>

          <div style={{ display: 'flex', gap: 20, fontSize: 12, flexWrap: 'wrap' }}>
            <a href="#problem" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Problem Statement (SIH26136)</a>
            <a href="#intelligence" style={{ color: '#94a3b8', textDecoration: 'none' }}>AI Intelligence</a>
            <a href="#journey" style={{ color: '#94a3b8', textDecoration: 'none' }}>Innovation Highway</a>
            <a href="#workflow" style={{ color: '#94a3b8', textDecoration: 'none' }}>Ecosystem</a>
            <a href="#procurement" style={{ color: '#94a3b8', textDecoration: 'none' }}>Procurement</a>
            <a href="#workspace" style={{ color: '#38bdf8', textDecoration: 'none', fontWeight: 600 }}>Workspace</a>
          </div>
        </div>
      </footer>
    </div>
  );
}