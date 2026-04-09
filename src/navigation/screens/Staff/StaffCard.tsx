import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Home';
import { Technician, getRoleCfg } from './Staff.constants';

export function StaffCard({ tech, onPress }: { tech: Technician; onPress: () => void }) {
  const cfg      = getRoleCfg(tech.role);
  const initials = tech.name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={stc.container}>
      <View style={[stc.accentBar, { backgroundColor: cfg.color }]} />
      <View style={[stc.avatar, { backgroundColor: cfg.color + '1A' }]}>
        <Text style={[stc.avatarText, { color: cfg.color }]}>{initials}</Text>
      </View>
      <View style={stc.body}>
        <View style={stc.topRow}>
          <Text style={stc.name} numberOfLines={1}>{tech.name}</Text>
          <View style={[stc.roleBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[stc.roleBadgeText, { color: cfg.color }]}>{tech.role}</Text>
          </View>
        </View>
        <View style={stc.statsRow}>
          <View style={stc.stat}>
            <MaterialCommunityIcons name="star" size={11} color={T.amber} />
            <Text style={stc.statText}>{tech.rating}</Text>
          </View>
          <View style={stc.statDot} />
          <Text style={stc.statText}>{tech.years_experience} yrs exp</Text>
          <View style={stc.statDot} />
          <Text style={stc.statText}>{tech.jobs_today} jobs today</Text>
        </View>
        <View style={stc.specialtyRow}>
          {tech.specialties.slice(0, 3).map(s => (
            <View key={s} style={stc.specialtyChip}>
              <Text style={stc.specialtyText}>{s}</Text>
            </View>
          ))}
          {tech.specialties.length > 3 && (
            <View style={stc.specialtyChip}>
              <Text style={stc.specialtyText}>+{tech.specialties.length - 3}</Text>
            </View>
          )}
        </View>
        <View style={stc.footerRow}>
          <TouchableOpacity
            onPress={e => { e.stopPropagation(); Linking.openURL(`tel:${tech.phone}`); }}
            style={stc.contactChip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={stc.contactChipText}>📞 {tech.phone}</Text>
          </TouchableOpacity>
          <View style={[stc.availBadge, { backgroundColor: tech.available ? T.green + '15' : T.red + '10' }]}>
            <View style={[stc.availDot, { backgroundColor: tech.available ? T.green : T.red }]} />
            <Text style={[stc.availText, { color: tech.available ? T.green : T.red }]}>
              {tech.available ? 'Available' : 'Busy'}
            </Text>
          </View>
        </View>
      </View>
      <View style={stc.chevron}>
        <Text style={stc.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

const stc = StyleSheet.create({
  container:       { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  accentBar:       { width: 4, alignSelf: 'stretch' },
  avatar:          { width: 46, height: 46, borderRadius: 23, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  avatarText:      { fontSize: 16, fontWeight: '800' },
  body:            { flex: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 4, gap: 5 },
  topRow:          { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name:            { flex: 1, fontSize: 14, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.2 },
  roleBadge:       { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  roleBadgeText:   { fontSize: 10, fontWeight: '700' },
  statsRow:        { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stat:            { flexDirection: 'row', alignItems: 'center', gap: 3 },
  statText:        { fontSize: 11, color: T.textSecondary },
  statDot:         { width: 3, height: 3, borderRadius: 1.5, backgroundColor: T.textMuted },
  specialtyRow:    { flexDirection: 'row', gap: 4, flexWrap: 'wrap' },
  specialtyChip:   { backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8 },
  specialtyText:   { fontSize: 10, color: T.textSecondary, fontWeight: '600' },
  footerRow:       { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2, flexWrap: 'wrap' },
  contactChip:     { backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  contactChipText: { fontSize: 11, color: T.textSecondary, fontWeight: '500' },
  availBadge:      { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  availDot:        { width: 6, height: 6, borderRadius: 3 },
  availText:       { fontSize: 10, fontWeight: '700' },
  chevron:         { justifyContent: 'center', paddingRight: 12, paddingLeft: 4 },
  chevronText:     { fontSize: 22, color: T.textMuted, fontWeight: '300' },
});