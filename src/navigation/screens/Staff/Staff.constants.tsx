import { T } from '../Home';

export interface Technician {
  id: number;
  name: string;
  role: string;
  specialties: string[];
  phone: string;
  email: string;
  available: boolean;
  jobs_today: number;
  rating: number;
  years_experience: number;
}

export const ROLE_CFG: Record<string, { color: string; bg: string }> = {
  'Lead Technician':  { color: T.accent,  bg: '#EFF6FF' },
  'Field Technician': { color: T.green,   bg: '#F0FDF4' },
  'Supervisor':       { color: '#7C3AED', bg: '#F5F3FF' },
};

export const getRoleCfg = (role: string) =>
  ROLE_CFG[role] ?? { color: T.textSecondary, bg: T.surfaceAlt };

export const ALL_SPECIALTIES = ['HVAC', 'Electrical', 'Plumbing', 'Roofing', 'General', 'Elevators', 'Security'];
export const ALL_ROLES = ['Lead Technician', 'Field Technician', 'Supervisor'];