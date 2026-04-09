import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { T } from '../Theme';
import { clampHour, clampMin } from '../TimeHelpers';

export function TimeInputPair({
  label, hour, min, period,
  onHourChange, onMinChange, onPeriodChange,
  hourErr, minErr,
}: {
  label: string;
  hour: string; min: string; period: 'AM'|'PM';
  onHourChange: (v: string) => void;
  onMinChange:  (v: string) => void;
  onPeriodChange: (p: 'AM'|'PM') => void;
  hourErr: boolean; minErr: boolean;
}) {
  return (
    <View style={tp.pair}>
      <Text style={tp.label}>{label}</Text>
      <View style={tp.row}>
        <View style={tp.unit}>
          <TextInput
            style={[tp.input, hourErr && tp.inputErr]}
            value={hour}
            onChangeText={v => onHourChange(clampHour(v.replace(/\D/g, '').slice(0, 2)))}
            placeholder="9" placeholderTextColor={T.textMuted}
            keyboardType="numeric" maxLength={2} returnKeyType="next"
          />
          <Text style={tp.unitLabel}>HR</Text>
          {hourErr && <Text style={tp.errText}>1–12</Text>}
        </View>
        <Text style={tp.colon}>:</Text>
        <View style={tp.unit}>
          <TextInput
            style={[tp.input, minErr && tp.inputErr]}
            value={min}
            onChangeText={v => onMinChange(clampMin(v.replace(/\D/g, '').slice(0, 2)))}
            placeholder="00" placeholderTextColor={T.textMuted}
            keyboardType="numeric" maxLength={2} returnKeyType="done"
          />
          <Text style={tp.unitLabel}>MIN</Text>
          {minErr && <Text style={tp.errText}>0–59</Text>}
        </View>
        <View style={tp.periodRow}>
          {(['AM', 'PM'] as const).map(p => (
            <TouchableOpacity key={p} onPress={() => onPeriodChange(p)}
              style={[tp.periodBtn, period === p && tp.periodBtnActive]} activeOpacity={0.8}>
              <Text style={[tp.periodText, period === p && tp.periodTextActive]}>{p}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
}

const tp = StyleSheet.create({
  pair:            { marginBottom: 4 },
  label:           { fontSize: 11, color: T.textMuted, fontWeight: '600', marginBottom: 6 },
  row:             { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  unit:            { alignItems: 'center', gap: 3 },
  input:           { width: 62, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 13, fontSize: 20, color: T.textPrimary, fontWeight: '700', textAlign: 'center' },
  inputErr:        { borderColor: T.red, backgroundColor: '#FEF2F2' },
  unitLabel:       { fontSize: 9, fontWeight: '700', color: T.textMuted, letterSpacing: 0.5 },
  colon:           { fontSize: 24, fontWeight: '700', color: T.textMuted, marginTop: 10, paddingHorizontal: 2 },
  periodRow:       { flexDirection: 'row', gap: 6, marginTop: 2 },
  periodBtn:       { paddingHorizontal: 12, paddingVertical: 11, borderRadius: 10, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border },
  periodBtnActive: { backgroundColor: T.accent, borderColor: T.accent },
  periodText:      { fontSize: 13, fontWeight: '700', color: T.textMuted },
  periodTextActive:{ color: '#fff' },
  errText:         { fontSize: 10, color: T.red, marginTop: 3 },
});