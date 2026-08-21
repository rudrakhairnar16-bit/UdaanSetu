'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function SettingsPage() {
  return (
    <div className="space-y-6 max-w-4xl">
      <div><h1 className="text-3xl font-bold">Settings</h1><p className="text-muted-foreground">Platform information and account details</p></div>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[['Name', 'Demo Administrator'], ['Email', 'admin@udaansetu.demo'], ['Role', 'Admin'], ['District', 'Ahmedabad'], ['Organization', 'UdaanSetu Platform']].map(([label, value]) => (
            <div key={label} className="flex gap-4"><span className="text-sm text-muted-foreground w-32">{label}</span><span className="text-sm font-medium">{value}</span></div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Platform</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[['Version', '2.0.0'], ['Problem Focus', 'SIH1608 — Gujarat Innovation Ecosystem'], ['State', 'Gujarat'], ['Districts', '33 districts'], ['API Docs', 'http://localhost:8080/docs'], ['Environment', 'Demo / Prototype'], ['Data Notice', 'All records are DEMO DATA. Not government data.'], ['DPIIT Startups (Gujarat)', '17,179 recognized (Jan 2026)']].map(([label, value]) => (
            <div key={label} className="flex gap-4"><span className="text-sm text-muted-foreground w-40">{label}</span><span className="text-sm font-medium">{value}</span></div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Innovation Lifecycle</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['Research', 'Innovation', 'IPR/Patent', 'Mentor/Funding/Incubator', 'Startup', 'Impact'].map((step, i) => (
              <div key={step} className="flex items-center gap-2">
                <Badge variant="secondary">{step}</Badge>
                {i < 5 && <span className="text-muted-foreground">→</span>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Demo Credentials</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Role</TableHead><TableHead>Email</TableHead><TableHead>Password</TableHead></TableRow></TableHeader>
            <TableBody>
              {[['Admin', 'admin@udaansetu.demo', 'Demo@123'], ['Researcher', 'researcher@udaansetu.demo', 'Demo@123'], ['Mentor', 'mentor@udaansetu.demo', 'Demo@123'], ['Investor', 'investor@udaansetu.demo', 'Demo@123'], ['Incubator', 'incubator@udaansetu.demo', 'Demo@123']].map(([role, email, pass]) => (
                <TableRow key={role}><td className="font-medium">{role}</td><td className="font-mono text-sm">{email}</td><td className="font-mono text-sm">{pass}</td></TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Gujarat Startup Policy 2020</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[['Interest Subsidy', '12% for 5 years'], ['Stamp Duty', '100% exemption'], ['Patent Filing', 'Up to ₹10 lakhs reimbursement'], ['Seed Funding', 'Up to ₹40 lakhs'], ['DPIIT Recognized Startups', '17,179 (Jan 2026)'], ['Top Sectors', 'Software 26%, FoodTech 10%, Healthcare 10%'], ['Growth (2024)', '22% jump — 4,030 new startups']].map(([label, value]) => (
            <div key={label} className="flex gap-4"><span className="text-sm text-muted-foreground w-40">{label}</span><span className="text-sm font-medium">{value}</span></div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}