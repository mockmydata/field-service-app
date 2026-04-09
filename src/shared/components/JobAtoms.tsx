import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Theme';
import { STATUS_CFG } from '../JobConfig';

// ── Card ──────────────────────────────────────────────────────────────────────
export function Card({ children }: { children: React.ReactNode }) {
  return <View style={card.shell}>{children}</View>;
}
export function CardDivider() {
  return <View style={card.divider} />;
}
export function CardLabel({ text }: { text: string }) {
  return <Text style={card.label}>{text}</Text>;
}
export const cardStyles = StyleSheet.create({
  shell:      { backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  divider:    { height: 1, backgroundColor: T.border },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:      { fontSize: 11, fontWeight: '700', color: T.textMuted, letterSpacing: 0.8 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
});
const card = cardStyles;

// ── InfoLine ──────────────────────────────────────────────────────────────────
export function InfoLine({ icon, label, value, onPress, first }: {
  icon: string; label: string; value?: string | null; onPress?: () => void; first?: boolean;
}) {
  if (!value) return null;
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <>
      {!first && <CardDivider />}
      <Wrap onPress={onPress} activeOpacity={0.7} style={il.row}>
        <View style={il.iconWrap}>
          <MaterialCommunityIcons name={icon as any} size={20} color={T.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={il.label}>{label}</Text>
          <Text style={[il.value, onPress && { color: T.accent }]}>{value}</Text>
        </View>
        {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />}
      </Wrap>
    </>
  );
}
const il = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  iconWrap: { width: 24, alignItems: 'center' },
  label:    { fontSize: 11, color: T.textMuted, fontWeight: '600', marginBottom: 2 },
  value:    { fontSize: 14, color: T.textPrimary, lineHeight: 20 },
});

// ── StatusBadge ───────────────────────────────────────────────────────────────
export function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_CFG[status] ?? STATUS_CFG['Scheduled'];
  return (
    <View style={[sb.wrap, { backgroundColor: cfg.bg }]}>
      <MaterialCommunityIcons name={cfg.icon as any} size={12} color={cfg.color} />
      <Text style={[sb.text, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}
const sb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  text: { fontSize: 11, fontWeight: '700' },
});

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name, size = 44 }: { name: string; size?: number }) {
  const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
  return (
    <View style={[av.circle, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[av.text, { fontSize: size * 0.35 }]}>{initials}</Text>
    </View>
  );
}
export const avatarStyles = StyleSheet.create({
  circle: { backgroundColor: T.accent + '18', borderWidth: 1.5, borderColor: T.accent + '30', alignItems: 'center', justifyContent: 'center' },
  text:   { fontWeight: '800', color: T.accent },
});
const av = avatarStyles;

// ── Chip ──────────────────────────────────────────────────────────────────────
export function Chip({ icon, label, color = T.textSecondary, bg = T.surfaceAlt }: {
  icon?: string; label: string; color?: string; bg?: string;
}) {
  return (
    <View style={[ch.wrap, { backgroundColor: bg, borderColor: color + '35' }]}>
      {icon && <MaterialCommunityIcons name={icon as any} size={11} color={color} />}
      <Text style={[ch.text, { color }]}>{label}</Text>
    </View>
  );
}
const ch = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 20, borderWidth: 1 },
  text: { fontSize: 11, fontWeight: '600' },
});