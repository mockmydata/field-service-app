import { T } from './Theme';
import { Status } from '../types/types';

export const STATUS_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'Scheduled':   { color: T.accent,  bg: '#EFF6FF', icon: 'clock-outline',       label: 'Scheduled'   },
  'Enroute':     { color: T.purple,  bg: '#F5F3FF', icon: 'car-outline',          label: 'Enroute'     },
  'Arrived':     { color: T.amber,   bg: '#FFFBEB', icon: 'map-marker-check',     label: 'Arrived'     },
  'In Progress': { color: T.amber,   bg: '#FFFBEB', icon: 'lightning-bolt',       label: 'In Progress' },
  'Completed':   { color: T.green,   bg: '#F0FDF4', icon: 'check-circle-outline', label: 'Completed'   },
  'Cancelled':   { color: T.red,     bg: '#FEF2F2', icon: 'close-circle-outline', label: 'Cancelled'   },
};

export const ALL_STATUSES: Status[] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];