'use client';

import { useState, useEffect } from 'react';
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { cn, formatCurrency, formatNumber, formatDate, GUJARAT_DISTRICTS } from '@/lib/utils';
import {
  TrendingUp,
  Users,
  IndianRupee,
  Trophy,
  FlaskConical,
  Lightbulb,
  FileText,
  Rocket,
  Globe,
  AlertTriangle,
  ArrowUpRight,
} from 'lucide-react';

const STATS = [
  { label: 'Research Projects', value: 1247, icon: FlaskConical, color: 'bg-blue-500', trend: '+12%' },
  { label: 'Innovations', value: 892, icon: Lightbulb, color: 'bg-purple-500', trend: '+8%' },
  { label: 'IPR / Patents', value: 456, icon: FileText, color: 'bg-orange-500', trend: '+15%' },
  { label: 'Startups', value: 234, icon: Rocket, color: 'bg-green-500', trend: '+22%' },
  { label: 'Mentors', value: 156, icon: Users, color: 'bg-indigo-500', trend: '+5%' },
  { label: 'Govt Schemes', value: 89, icon: Trophy, color: 'bg-yellow-500', trend: '+3%' },
];

const PIPELINE_STEPS = [
  { key: 'research', label: 'Research', icon: FlaskConical, color: 'bg-blue-100 text-blue-700', count: 1247 },
  { key: 'innovation', label: 'Innovation', icon: Lightbulb, color: 'bg-purple-100 text-purple-700', count: 892 },
  { key: 'ipr', label: 'IPR', icon: FileText, color: 'bg-orange-100 text-orange-700', count: 456 },
  { key: 'startup', label: 'Startup', icon: Rocket, color: 'bg-green-100 text-green-700', count: 234 },
  { key: 'impact', label: 'Impact', icon: Globe, color: 'bg-red-100 text-red-700', count: 78 },
];

const DISTRICT_STATS = [
  { district: 'Ahmedabad', startups: 4267, research: 423, innovation: 287 },
  { district: 'Surat', startups: 2100, research: 189, innovation: 145 },
  { district: 'Vadodara', startups: 1876, research: 167, innovation: 134 },
  { district: 'Rajkot', startups: 1234, research: 134, innovation: 98 },
  { district: 'Gandhinagar', startups: 987, research: 123, innovation: 87 },
  { district: 'Bhavnagar', startups: 567, research: 89, innovation: 67 },
  { district: 'Jamnagar', startups: 432, research: 78, innovation: 56 },
  { district: 'Junagadh', startups: 345, research: 67, innovation: 45 },
];

const AT_RISK = [
  { id: 1, title: 'Solar Cold Storage for Small Farms', type: 'Research', district: 'Ahmedabad', score: 87, level: 'High', reasons: ['Milestones overdue', 'Funding gap'] },
  { id: 2, title: 'BioChar+ Water Filter', type: 'Innovation', district: 'Rajkot', score: 72, level: 'High', reasons: ['Regulatory delay', 'Team capacity'] },
  { id: 3, title: 'GreenPack Compostable Material', type: 'Startup', district: 'Vadodara', score: 65, level: 'Medium', reasons: ['Market fit unclear'] },
  { id: 4, title: 'AI Crop Disease Detection', type: 'Research', district: 'Surat', score: 58, level: 'Medium', reasons: ['Data quality issues'] },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Gujarat Innovation Ecosystem Overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">Export Report</Button>
          <Button size="sm">Refresh Data</Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {STATS.map((stat) => (
          <Card key={stat.label} className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold mt-1">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-green-600 font-medium mt-1">{stat.trend} vs last month</p>
                </div>
                <div className={cn('p-3 rounded-xl', stat.color)}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Flow */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Innovation Lifecycle Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-2">
            {PIPELINE_STEPS.map((step, index) => (
              <React.Fragment key={step.key}>
                <div className={cn('flex items-center gap-2 rounded-lg px-4 py-2 font-medium', step.color)}>
                  <step.icon className="h-4 w-4" />
                  <span>{step.label}</span>
                  <Badge className="bg-background/50">{step.count.toLocaleString()}</Badge>
                </div>
                {index < PIPELINE_STEPS.length - 1 && (
                  <span className="text-muted-foreground">→</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* District Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Gujarat District Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>District</TableHead>
                    <TableHead className="text-right">Startups</TableHead>
                    <TableHead className="text-right">Research</TableHead>
                    <TableHead className="text-right">Innovations</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {DISTRICT_STATS.map((d) => (
                    <TableRow key={d.district}>
                      <TableCell className="font-medium">{d.district}</TableCell>
                      <TableCell className="text-right">{d.startups.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{d.research}</TableCell>
                      <TableCell className="text-right">{d.innovation}</TableCell>
                      <TableCell className="text-right font-bold">
                        {d.startups + d.research + d.innovation}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* At Risk Projects */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              At Risk Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {AT_RISK.map((project) => (
                <div key={project.id} className="p-4 bg-muted/30 rounded-lg border">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{project.title}</p>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                        <Badge variant="secondary">{project.type}</Badge>
                        <Badge variant="outline">{project.district}</Badge>
                        <Badge variant={project.level === 'High' ? 'destructive' : 'warning'}>
                          {project.level} Risk ({project.score}/100)
                        </Badge>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {project.reasons.join(' · ')}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button>
              <FlaskConical className="h-4 w-4 mr-2" />
              New Research Project
            </Button>
            <Button>
              <Lightbulb className="h-4 w-4 mr-2" />
              New Innovation
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              File IPR/Patent
            </Button>
            <Button>
              <Rocket className="h-4 w-4 mr-2" />
              Register Startup
            </Button>
            <Button variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Check Govt Schemes
            </Button>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Find Mentors
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}