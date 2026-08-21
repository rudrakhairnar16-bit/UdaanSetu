import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  if (amount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (amount >= 100000) {
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  if (amount >= 1000) {
    return `₹${(amount / 1000).toFixed(0)}K`;
  }
  return `₹${amount}`;
}

export function formatNumber(num: number): string {
  if (num >= 100000) {
    return `${(num / 100000).toFixed(1)}L`;
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(0)}K`;
  }
  return num.toString();
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export const GUJARAT_DISTRICTS = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar',
  'Bhavnagar', 'Jamnagar', 'Junagadh', 'Anand', 'Bharuch',
  'Navsari', 'Morbi', 'Botad', 'Gir Somnath', 'Devbhoomi Dwarka',
  'Porbandar', 'Kutch', 'Patan', 'Mehsana', 'Sabarkantha',
  'Banaskantha', 'Aravalli', 'Mahisagar', 'Chhota Udaipur',
  'Narmada', 'Tapi', 'Valsad', 'Dang', 'Dahod',
  'Amreli', 'Surendranagar', 'Panchmahal', 'Kheda', 'Ahmedabad Rural',
] as const;

export const GUJARAT_SECTORS = [
  'AgriTech', 'FoodTech', 'HealthTech', 'FinTech', 'EdTech',
  'CleanTech', 'Textiles', 'Pharma', 'Chemicals', 'Automotive',
  'IT Services', 'AI/ML', 'IoT', 'SaaS', 'E-Commerce',
  'Manufacturing', 'Biotech', 'Renewable Energy', 'Logistics', 'Tourism',
] as const;

export const ENTITY_TYPES = [
  'research', 'innovation', 'ipr', 'startup', 'milestone',
  'mentor', 'scheme', 'incubator', 'funding_request',
] as const;

export const ENTITY_STAGES: Record<string, string[]> = {
  research: ['Draft', 'Concept', 'Lab Testing', 'Prototype', 'Field Trial', 'Validation', 'Completed'],
  innovation: ['Concept', 'Prototype', 'Validation', 'IPR Screening', 'Ready for Market'],
  ipr: ['Idea', 'Screening', 'Filed', 'Examination', 'Granted', 'Rejected'],
  startup: ['Idea', 'Pre-seed', 'Seed', 'Series A', 'Series B', 'Growth'],
  mentor: ['Available', 'Busy', 'On Leave'],
  scheme: ['Open', 'Closed', 'Upcoming'],
  incubator: ['Open', 'Full', 'Selective'],
  funding_request: ['Submitted', 'Under Review', 'Approved', 'Rejected', 'Funded'],
  milestone: ['Pending', 'In Progress', 'Done', 'Overdue'],
};

export const USER_ROLES = ['admin', 'researcher', 'mentor', 'investor', 'incubator'] as const;