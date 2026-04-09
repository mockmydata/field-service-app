import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput,
  TouchableOpacity, View,
} from 'react-native';
import { Button, Dialog } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { T } from '../Theme';
import { STATUS_CFG, ALL_STATUSES } from '../JobConfig';
import { TimeInputPair } from './TimeInputPair';
import { cardStyles } from './JobAtoms';
import { Status } from '../../types/types';
import {
  parseCombinedTime, parseHM, computeDuration, validHour, validMin,
} from '../TimeHelpers';
import { Technician } from '../../navigation/screens/Staff/Staffscreen';

const card = cardStyles;

// ─── Shared dialog button styles ──────────────────────────────────────────────
export const dlgStyles = StyleSheet.create({
  title:   { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  actions: { flexDirection: 'row', gap: 10, width: '100%', paddingHorizontal: 4, paddingBottom: 8 },
  btn:     { flex: 1, borderRadius: 10 },
});

// ─── Reschedule Dialog ────────────────────────────────────────────────────────
export function RescheduleDialog({ visible, currentDate, currentStartTime, onDismiss, onSave }: {
  visible: boolean; currentDate: string; currentStartTime?: string;
  onDismiss: () => void; onSave: (date: string, startTime: string, endTime: string) => void;
}) {
  const [date, setDate]       = useState(currentDate);
  const [calOpen, setCalOpen] = useState(false);

  const pi = parseCombinedTime(currentStartTime);
  const sh = parseHM(pi.start);
  const eh = parseHM(pi.end);

  const [startHour,   setStartHour]   = useState(sh.h);
  const [startMin,    setStartMin]    = useState(sh.m);
  const [startPeriod, setStartPeriod] = useState<'AM'|'PM'>(pi.startPeriod);
  const [endHour,     setEndHour]     = useState(eh.h);
  const [endMin,      setEndMin]      = useState(eh.m);
  const [endPeriod,   setEndPeriod]   = useState<'AM'|'PM'>(pi.endPeriod);

  const [startHourErr, setStartHourErr] = useState(false);
  const [startMinErr,  setStartMinErr]  = useState(false);
  const [endHourErr,   setEndHourErr]   = useState(false);
  const [endMinErr,    setEndMinErr]    = useState(false);

  useEffect(() => {
    if (!visible) return;
    setDate(currentDate);
    const p   = parseCombinedTime(currentStartTime);
    const sh2 = parseHM(p.start);
    const eh2 = parseHM(p.end);
    setStartHour(sh2.h); setStartMin(sh2.m); setStartPeriod(p.startPeriod);
    setEndHour(eh2.h);   setEndMin(eh2.m);   setEndPeriod(p.endPeriod);
    setCalOpen(false);
    setStartHourErr(false); setStartMinErr(false);
    setEndHourErr(false);   setEndMinErr(false);
  }, [visible]);

  const startStr = startHour && startMin ? `${startHour}:${startMin.padStart(2, '0')}` : '';
  const endStr   = endHour   && endMin   ? `${endHour}:${endMin.padStart(2, '0')}`     : '';
  const duration = computeDuration(startStr, startPeriod, endStr, endPeriod);

  const prettyDate = (() => {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  })();

  const handleSave = () => {
    const she = !validHour(startHour); const sme = !validMin(startMin);
    const ehe = !validHour(endHour);   const eme = !validMin(endMin);
    setStartHourErr(she); setStartMinErr(sme);
    setEndHourErr(ehe);   setEndMinErr(eme);
    if (she || sme || ehe || eme) return;
    onSave(date, `${startHour}:${startMin.padStart(2, '0')} ${startPeriod}`, `${endHour}:${endMin.padStart(2, '0')} ${endPeriod}`);
    onDismiss();
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={rsd.kav} pointerEvents={visible ? 'auto' : 'none'}>
      <Dialog visible={visible} onDismiss={onDismiss} style={rsd.dialog}>
        <Dialog.Title style={dlgStyles.title}>Reschedule Job</Dialog.Title>
        <Dialog.Content style={{ paddingHorizontal: 16, paddingBottom: 0 }}>
          <Text style={rsd.sectionLabel}>Date</Text>
          <TouchableOpacity onPress={() => setCalOpen(v => !v)} style={[rsd.datePill, calOpen && rsd.datePillOpen]} activeOpacity={0.8}>
            <MaterialCommunityIcons name="calendar" size={18} color={T.accent} />
            <Text style={rsd.datePillText}>{prettyDate}</Text>
            <MaterialCommunityIcons name={calOpen ? 'chevron-up' : 'chevron-down'} size={18} color={T.textMuted} />
          </TouchableOpacity>
          {calOpen ? (
            <View style={rsd.calWrap}>
              <Calendar
                current={date}
                onDayPress={(day: { dateString: string }) => { setDate(day.dateString); setCalOpen(false); }}
                markedDates={{ [date]: { selected: true, selectedColor: T.accent } }}
                theme={{
                  backgroundColor: T.surface, calendarBackground: T.surface,
                  selectedDayBackgroundColor: T.accent, selectedDayTextColor: '#ffffff',
                  todayTextColor: T.accent, dayTextColor: T.textPrimary,
                  textDisabledColor: T.textMuted, monthTextColor: T.textPrimary,
                  arrowColor: T.accent, textMonthFontWeight: '700' as any,
                  textDayFontSize: 13, textMonthFontSize: 14,
                }}
              />
            </View>
          ) : (
            <View>
              <Text style={[rsd.sectionLabel, { marginTop: 20 }]}>Time Window *</Text>
              <TimeInputPair
                label="Start Time" hour={startHour} min={startMin} period={startPeriod}
                onHourChange={v => { setStartHour(v); setStartHourErr(false); }}
                onMinChange={v  => { setStartMin(v);  setStartMinErr(false);  }}
                onPeriodChange={setStartPeriod}
                hourErr={startHourErr} minErr={startMinErr}
              />
              {duration ? (
                <View style={rsd.durationBadge}>
                  <MaterialCommunityIcons name="timer-outline" size={13} color={T.green} />
                  <Text style={rsd.durationText}>{duration}</Text>
                </View>
              ) : <View style={{ height: 14 }} />}
              <TimeInputPair
                label="End Time" hour={endHour} min={endMin} period={endPeriod}
                onHourChange={v => { setEndHour(v); setEndHourErr(false); }}
                onMinChange={v  => { setEndMin(v);  setEndMinErr(false);  }}
                onPeriodChange={setEndPeriod}
                hourErr={endHourErr} minErr={endMinErr}
              />
            </View>
          )}
          <View style={{ height: 20 }} />
        </Dialog.Content>
        <Dialog.Actions style={rsd.actions}>
          <Button mode="outlined" textColor={T.textSecondary} style={[dlgStyles.btn, { borderColor: T.border }]} onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" buttonColor={T.accent} style={dlgStyles.btn} onPress={handleSave}>Save</Button>
        </Dialog.Actions>
      </Dialog>
    </KeyboardAvoidingView>
  );
}

// ─── Change Status Dialog ─────────────────────────────────────────────────────
export function ChangeStatusDialog({ visible, currentStatus, onDismiss, onSave }: {
  visible: boolean; currentStatus: Status;
  onDismiss: () => void; onSave: (s: Status) => void;
}) {
  const [selected, setSelected] = useState<Status>(currentStatus);
  useEffect(() => { if (visible) setSelected(currentStatus); }, [visible]);
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={csd.dialog}>
      <Dialog.Title style={dlgStyles.title}>Change Status</Dialog.Title>
      <Dialog.Content style={{ paddingHorizontal: 0, paddingBottom: 0 }}>
        {ALL_STATUSES.map((s, i) => {
          const cfg = STATUS_CFG[s];
          const isSelected = selected === s;
          return (
            <React.Fragment key={s}>
              {i > 0 && <View style={card.divider} />}
              <TouchableOpacity onPress={() => setSelected(s)} style={[csd.row, isSelected && { backgroundColor: cfg.color + '08' }]} activeOpacity={0.75}>
                <View style={[csd.iconWrap, { backgroundColor: cfg.color + '18' }]}>
                  <MaterialCommunityIcons name={cfg.icon as any} size={18} color={cfg.color} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[csd.label, { color: cfg.color }]}>{cfg.label}</Text>
                </View>
                <MaterialCommunityIcons name={isSelected ? 'check-circle' : 'circle-outline'} size={22} color={isSelected ? cfg.color : T.border} />
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </Dialog.Content>
      <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 }}>
        <View style={dlgStyles.actions}>
          <Button mode="outlined" textColor={T.textSecondary} style={[dlgStyles.btn, { borderColor: T.border }]} onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" buttonColor={T.accent} style={dlgStyles.btn} onPress={() => { onSave(selected); onDismiss(); }}>Save</Button>
        </View>
      </Dialog.Actions>
    </Dialog>
  );
}

// ─── Reassign Dialog ──────────────────────────────────────────────────────────
export function ReassignDialog({ visible, currentAssignee, staff, onDismiss, onSave }: {
  visible: boolean; currentAssignee?: string; staff: Technician[];
  onDismiss: () => void; onSave: (name: string) => void;
}) {
  const [selected, setSelected] = useState(currentAssignee ?? '');
  useEffect(() => { if (visible) setSelected(currentAssignee ?? ''); }, [visible]);
  return (
    <Dialog visible={visible} onDismiss={onDismiss} style={rad.dialog}>
      <Dialog.Title style={dlgStyles.title}>Reassign Job</Dialog.Title>
      <Dialog.Content style={{ paddingHorizontal: 0, paddingBottom: 0 }}>
        {staff.map((tech, i) => {
          const isSelected = selected === tech.name;
          const initials   = tech.name.split(' ').map(w => w[0]).join('');
          return (
            <React.Fragment key={tech.id}>
              {i > 0 && <View style={card.divider} />}
              <TouchableOpacity onPress={() => setSelected(tech.name)} style={[rad.row, isSelected && { backgroundColor: T.accent + '08' }]} activeOpacity={0.75}>
                <View style={[rad.avatar, isSelected && { backgroundColor: T.accent, borderColor: T.accent }]}>
                  <Text style={[rad.avatarText, isSelected && { color: '#fff' }]}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <View style={rad.nameRow}>
                    <Text style={rad.name}>{tech.name}</Text>
                    <View style={[rad.availBadge, { backgroundColor: tech.available ? T.green + '15' : T.red + '10' }]}>
                      <View style={[rad.availDot, { backgroundColor: tech.available ? T.green : T.red }]} />
                      <Text style={[rad.availText, { color: tech.available ? T.green : T.red }]}>{tech.available ? 'Available' : 'Busy'}</Text>
                    </View>
                  </View>
                  <Text style={rad.role}>{tech.role}  ·  ⭐ {tech.rating}  ·  {tech.jobs_today} jobs today</Text>
                  <View style={rad.chipRow}>
                    {tech.specialties.map(s => (
                      <View key={s} style={rad.chip}><Text style={rad.chipText}>{s}</Text></View>
                    ))}
                  </View>
                </View>
                <MaterialCommunityIcons name={isSelected ? 'check-circle' : 'circle-outline'} size={22} color={isSelected ? T.accent : T.border} />
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
        {staff.length === 0 && (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <Text style={{ fontSize: 14, color: T.textMuted }}>No staff available</Text>
          </View>
        )}
      </Dialog.Content>
      <Dialog.Actions style={{ paddingHorizontal: 16, paddingBottom: 20, paddingTop: 4 }}>
        <View style={dlgStyles.actions}>
          <Button mode="outlined" textColor={T.textSecondary} style={[dlgStyles.btn, { borderColor: T.border }]} onPress={onDismiss}>Cancel</Button>
          <Button mode="contained" buttonColor={T.accent} style={dlgStyles.btn} disabled={!selected} onPress={() => { if (selected) { onSave(selected); onDismiss(); } }}>Assign</Button>
        </View>
      </Dialog.Actions>
    </Dialog>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const rsd = StyleSheet.create({
  kav:          { flex: 1, justifyContent: 'center' },
  dialog:       { borderRadius: 20, backgroundColor: T.surface },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  datePill:     { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 11 },
  datePillOpen: { borderColor: T.accent, backgroundColor: T.accent + '08' },
  datePillText: { flex: 1, fontSize: 14, fontWeight: '700', color: T.textPrimary },
  calWrap:      { borderRadius: 12, borderWidth: 1, borderColor: T.border, overflow: 'hidden', marginTop: 8, backgroundColor: T.surface },
  durationBadge:{ flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: T.green + '12', borderWidth: 1, borderColor: T.green + '30', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, marginBottom: 10 },
  durationText: { fontSize: 12, fontWeight: '700', color: T.green },
  actions:      { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 20 },
});
const csd = StyleSheet.create({
  dialog:   { borderRadius: 20, backgroundColor: T.surface },
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  iconWrap: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  label:    { fontSize: 15, fontWeight: '700' },
});
const rad = StyleSheet.create({
  dialog:      { borderRadius: 20, backgroundColor: T.surface },
  row:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 13, gap: 12 },
  avatar:      { width: 44, height: 44, borderRadius: 22, backgroundColor: T.surfaceAlt, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: T.border },
  avatarText:  { fontSize: 15, fontWeight: '800', color: T.textSecondary },
  nameRow:     { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 1 },
  name:        { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  role:        { fontSize: 11, color: T.textMuted, marginBottom: 5 },
  availBadge:  { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  availDot:    { width: 6, height: 6, borderRadius: 3 },
  availText:   { fontSize: 10, fontWeight: '700' },
  chipRow:     { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  chip:        { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 8, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border },
  chipText:    { fontSize: 10, fontWeight: '600', color: T.textSecondary },
});