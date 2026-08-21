'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { TrendingUp, Users, DollarSign, Trophy, FlaskConical, Lightbulb, Globe } from 'lucide-react';

const COLORS = ['#16a34a', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const MOCK_ANALYTICS = {
  totalRecords: 2837,
  avgResearchProgress: 52,
  totalFundingRequired: 45600000,
  totalStartupRevenue: 12500000,
  totalJobsCreated: 1234,
  totalFarmersReached: 15670,
  byKind: { research: 1247, innovation: 892, ipr: 456, startup: 234, mentor: 156, scheme: 89, incubator: 23 },
  bySector: { AgriTech: 678, CleanTech: 234, HealthTech: 189, FinTech: 156, AI_ML: 145, EdTech: 123, Biotech: 98, FoodTech: 87, Textiles: 76, Pharma: 65, Other: 286 },
  byDistrict: {
    Ahmedabad: { research: 423, innovation: 287, ipr: 156, startup: 67, mentor: 45, scheme: 23, incubator: 8 },
    Surat: { research: 189, innovation: 145, ipr: 89, startup: 45, mentor: 32, scheme: 15, incubator: 4 },
    Vadodara: { research: 167, innovation: 134, ipr: 78, startup: 38, mentor: 28, scheme: 12, incubator: 3 },
    Rajkot: { research: 134, innovation: 98, ipr: 67, startup: 32, mentor: 22, scheme: 10, incubator: 2 },
    Gandhinagar: { research: 123, innovation: 87, ipr: 56, startup: 29, mentor: 19, scheme: 8, incubator: 2 },
    Bhavnagar: { research: 89, innovation: 67, ipr: 45, startup: 22, mentor: 15, scheme: 8, incubator: 1 },
    Others: { research: 83, innovation: 74, ipr: 65, startup: 21, mentor: 15, scheme: 13, incubator: 3 },
  },
};

const kindData = Object.entries(MOCK_ANALYTICS.byKind)
  .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
  .sort((a, b) => b.value - a.value);

const sectorData = Object.entries(MOCK_ANALYTICS.bySector)
  .map(([name, value]) => ({ name, value }))
  .sort((a, b) => b.value - a.value);

const districtData = Object.entries(MOCK_ANALYTICS.byDistrict)
  .map(([district, counts]) => ({
    district,
    total: Object.values(counts).reduce((a: number, b: number) => a + b, 0),
    ...counts,
  }))
  .sort((a: any, b: any) => b.total - a.total);

const statCards = [
  { label: 'Total Records', value: MOCK_ANALYTICS.totalRecords.toLocaleString(), icon: Globe, color: 'text-gujarat-600' },
  { label: 'Avg Research Progress', value: MOCK_ANALYTICS.avgResearchProgress + '%', icon: TrendingUp, color: 'text-blue-600' },
  { label: 'Funding Required', value: formatCurrency(MOCK_ANALYTICS.totalFundingRequired), icon: DollarSign, color: 'text-yellow-600' },
  { label: 'Startup Revenue', value: formatCurrency(MOCK_ANALYTICS.totalStartupRevenue), icon: DollarSign, color: 'text-green-600' },
  { label: 'Jobs Created', value: formatNumber(MOCK_ANALYTICS.totalJobsCreated), icon: Users, color: 'text-purple-600' },
  { label: 'Farmers Reached', value: formatNumber(MOCK_ANALYTICS.totalFarmersReached), icon: Users, color: 'text-orange-600' },
  { label: 'Avg Risk Score', value: '34%', icon: Trophy, color: 'text-red-600' },
];

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Platform Analytics</h1>
          <p className="text-muted-foreground">Gujarat Innovation Ecosystem - Data-driven insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export CSV</Button>
          <Button variant="outline">Refresh</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {statCards.map(function(stat) {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <Icon className={cn('h-8 w-8', stat.color)} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5" />
              Records by Type
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={kindData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {kindData.map(function(_, i) {
                    return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Records by Sector
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100}>
                  {sectorData.map(function(_, i) {
                    return <Cell key={i} fill={COLORS[i % COLORS.length]} />;
                  })}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            District Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 font-medium">District</th>
                  <th className="pb-2 font-medium text-right">Research</th>
                  <th className="pb-2 font-medium text-right">Innovation</th>
                  <th className="pb-2 font-medium text-right">IPR</th>
                  <th className="pb-2 font-medium text-right">Startup</th>
                  <th className="pb-2 font-medium text-right">Mentor</th>
                  <th className="pb-2 font-medium text-right">Scheme</th>
                  <th className="pb-2 font-medium text-right">Incubator</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {districtData.map(function(d: any) {
                  return (
                    <tr key={d.district} className="border-b hover:bg-muted/30">
                      <td className="py-2 font-medium">{d.district}</td>
                      <td className="py-2 text-right">{d.research}</td>
                      <td className="py-2 text-right">{d.innovation}</td>
                      <td className="py-2 text-right">{d.ipr}</td>
                      <td className="py-2 text-right">{d.startup}</td>
                      <td className="py-2 text-right">{d.mentor}</td>
                      <td className="py-2 text-right">{d.scheme}</td>
                      <td className="py-2 text-right">{d.incubator}</td>
                      <td className="py-2 text-right font-bold">{d.total}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            ML Model Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <p className="text-sm text-green-800 font-medium">Risk Prediction Model</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {[
                ['Accuracy', '75.2%', 'text-green-700'],
                ['Precision', '72.1%', 'text-blue-700'],
                ['Recall', '68.4%', 'text-purple-700'],
                ['F1 Score', '70.1%', 'text-yellow-700'],
                ['AUC-ROC', '82.3%', 'text-red-700'],
                ['Samples', '2,000', 'text-gray-700'],
              ].map(function(item) {
                return (
                  <div key={item[0]} className="p-2 bg-white rounded">
                    <p className="text-xs text-muted-foreground">{item[0]}</p>
                    <p className={cn('font-bold', item[2])}>{item[1]}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800 font-medium">Semantic Search Engine</p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div className="p-2 bg-white rounded">
                <p className="text-xs text-muted-foreground">Model</p>
                <p className="font-bold text-blue-700">all-MiniLM-L6-v2</p>
              </div>
              <div className="p-2 bg-white rounded">
                <p className="text-xs text-muted-foreground">Corpus Size</p>
                <p className="font-bold text-gray-700">2,837 docs</p>
              </div>
            </div>
            <div className="mt-3 p-3 bg-green-100 rounded flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-green-600" />
              <span className="text-sm font-medium text-green-800">Ready for queries</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
