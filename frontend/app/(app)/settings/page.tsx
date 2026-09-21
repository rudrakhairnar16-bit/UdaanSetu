'use client';

import { useAuth } from '../../lib/auth';

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Settings</h1>
        <p style={{ fontSize: 13, color: 'var(--gray-500)' }}>Platform information and account details</p>
      </div>

      <div style={{ display: 'grid', gap: 20, maxWidth: 700 }}>
        {/* Account */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Account</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Name', user?.name],
              ['Email', user?.email],
              ['Role', user?.role],
              ['District', user?.district],
              ['Organization', user?.organization],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', width: 120, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{value || '—'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Platform info */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Platform</h3>
          <div style={{ display: 'grid', gap: 10 }}>
            {[
              ['Version', '0.2.0'],
              ['Problem Focus', 'SIH1608 — Innovation Ecosystem Platform'],
              ['API Docs', typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:8000/docs` : '/docs'],
              ['Environment', 'Demo / Prototype'],
              ['Data Notice', 'All records are DEMO DATA. Not government data.'],
            ].map(([label, value]) => (
              <div key={label} style={{ display: 'flex', gap: 12 }}>
                <span style={{ fontSize: 13, color: 'var(--gray-500)', width: 120, flexShrink: 0 }}>{label}</span>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Lifecycle */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Innovation Lifecycle</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['Research', 'Innovation', 'IPR/Patent', 'Mentor/Funding/Incubator', 'Startup', 'Impact'].map((step, i) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span className={`flow-badge flow-${step.toLowerCase().split('/')[0]}`}>{step}</span>
                {i < 5 && <span style={{ color: '#d1d5db' }}>→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* Demo credentials */}
        <div className="card">
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 14 }}>Seeded Role Profiles</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Demonstration accounts seeded for evaluation. Passwords are managed securely via environment configuration and local seed scripts.
          </p>
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>Role</th><th>Email</th><th>Authentication Policy</th></tr>
              </thead>
              <tbody>
                {[
                  ['Admin', 'admin@udaansetu.gov.in', 'Configured via local seed / DEMO.md'],
                  ['Govt Officer', 'rajesh.patil@maharashtra.gov.in', 'Configured via local seed / DEMO.md'],
                  ['Procurement Officer', 'meera.sharma@maharashtra.gov.in', 'Configured via local seed / DEMO.md'],
                  ['Evaluator', 'vikram.patil@ieee.org', 'Configured via local seed / DEMO.md'],
                  ['Validator', 'anjali.kulkarni@ncssc.in', 'Configured via local seed / DEMO.md'],
                  ['Researcher', 'arun.joshi@iitb.ac.in', 'Configured via local seed / DEMO.md'],
                ].map(([role, email, status]) => (
                  <tr key={role}>
                    <td style={{ fontWeight: 600 }}>{role}</td>
                    <td style={{ fontFamily: 'monospace', fontSize: 13 }}>{email}</td>
                    <td><span className="badge badge-primary">{status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
