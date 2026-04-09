import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Theme';

const STEPS: Record<string, { label: string; sub: string; icon: string; next: string; color: string }> = {
  'Scheduled':   { label: 'On My Way',    sub: "Notify customer you're heading over", icon: 'car-outline',          next: 'Enroute',     color: T.purple },
  'Enroute':     { label: "I've Arrived", sub: 'Mark yourself as on-site',            icon: 'map-marker-check',     next: 'Arrived',     color: T.amber  },
  'Arrived':     { label: 'Start Job',    sub: 'Begin work and set to in progress',   icon: 'lightning-bolt',       next: 'In Progress', color: T.green  },
  'In Progress': { label: 'Complete Job', sub: 'Mark this job as done',               icon: 'check-circle-outline', next: 'Completed',   color: T.green  },
};

export function TravelActionBar({ status, onAction }: { status: string; onAction: (next: string) => void }) {
  if (status === 'Completed' || status === 'Cancelled') return null;
  const step = STEPS[status];
  if (!step) return null;
  return (
    <TouchableOpacity onPress={() => onAction(step.next)} style={[s.bar, { borderLeftColor: step.color }]} activeOpacity={0.82}>
      <View style={[s.iconWrap, { backgroundColor: step.color + '18' }]}>
        <MaterialCommunityIcons name={step.icon as any} size={22} color={step.color} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[s.label, { color: step.color }]}>{step.label}</Text>
        <Text style={s.sub}>{step.sub}</Text>
      </View>
      <MaterialCommunityIcons name="chevron-right" size={20} color={step.color} />
    </TouchableOpacity>
  );
}

const s = StyleSheet.create({
  bar:      { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.border, borderLeftWidth: 4, paddingHorizontal: 14, paddingVertical: 14, gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  label:    { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  sub:      { fontSize: 12, color: T.textMuted, marginTop: 2 },
});