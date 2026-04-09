import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as TextInputNative,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, TextInput as PaperInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { T, ALL_STATUSES, STATUS_CFG } from '../Home';
import { useJobContext } from '../../../shared/context/JobContext';
import { Status } from '../../../types/types';
import { TimeWindowModal } from '../../../shared/components/TimeWindowModal';
import { DatePickerModal } from '../../../shared/components/DatePickerModal';
import { CustomerPickerModal } from '../../../shared/components/CustomerPickerModal';
import { AssigneePickerModal } from '../../../shared/components/AssigneePickerModal';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function prettyDate(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric',
  });
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function AddJobScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { addJob } = useJobContext();
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High' | ''>('');
  const [title,            setTitle]            = useState('');
  const [status,           setStatus]           = useState<Status>('Scheduled');
  const [dateKey,          setDateKey]          = useState(toKey(new Date()));
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [assignee,         setAssignee]         = useState('');
  const [saving,           setSaving]           = useState(false);

  const [datePickerOpen,     setDatePickerOpen]     = useState(false);
  const [timeWindowOpen,     setTimeWindowOpen]     = useState(false);
  const [customerPickerOpen, setCustomerPickerOpen] = useState(false);
  const [assigneePickerOpen, setAssigneePickerOpen] = useState(false);

  // ── Time state ──
  const [startHour,   setStartHour]   = useState('');
  const [startMin,    setStartMin]    = useState('');
  const [startPeriod, setStartPeriod] = useState<'AM'|'PM'>('AM');
  const [endHour,     setEndHour]     = useState('');
  const [endMin,      setEndMin]      = useState('');
  const [endPeriod,   setEndPeriod]   = useState<'AM'|'PM'>('AM');

  const timeLabel = startHour && startMin
    ? `${startHour}:${startMin.padStart(2,'0')} ${startPeriod}${endHour && endMin ? ` – ${endHour}:${endMin.padStart(2,'0')} ${endPeriod}` : ''}`
    : null;

  const timeString = timeLabel ?? undefined;

  const handleSave = async () => {
   
      if (!title.trim())       { Alert.alert('Required', 'Job title is required.');        return; }
      if (!selectedCustomer)   { Alert.alert('Required', 'Please select a customer.');     return; }
      if (!assignee)           { Alert.alert('Required', 'Please assign a technician.');   return; }
      if (!startHour || !startMin) { Alert.alert('Required', 'Please set a start time.'); return; }
      if (!endHour || !endMin)     { Alert.alert('Required', 'Please set an end time.');   return; }


    setSaving(true);
    try {
      await addJob({
        title:        title.trim(),
        location:     selectedCustomer.address,
        customerName: selectedCustomer.name,
        time:         timeString,
        assignee:     assignee || undefined,
        status,
        
        date:         dateKey,
        notes:        '',
        photos:       [],
      });
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to create job. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Job" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Status */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Status</Text>
            <View style={s.chipRow}>
              {ALL_STATUSES.map(st => {
                const cfg = STATUS_CFG[st]; const isActive = status === st;
                return (
                  <TouchableOpacity key={st} onPress={() => setStatus(st)}
                    style={[s.chip, isActive && { backgroundColor: cfg.color, borderColor: cfg.color }]}>

                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>{cfg.icon}  {st}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={s.section}>
      <Text style={s.sectionLabel}>Priority</Text>
      <View style={s.chipRow}>
        {(['Low', 'Medium', 'High'] as const).map(p => {
          const color = p === 'High' ? T.red : p === 'Medium' ? T.amber : T.green;
          const isActive = priority === p;
          return (
            <TouchableOpacity
              key={p}
              onPress={() => setPriority(prev => prev === p ? '' : p)}
              style={[s.chip, isActive && { backgroundColor: color, borderColor: color }]}
              activeOpacity={0.8}
            >
              <MaterialCommunityIcons name="flag-outline" size={13} color={isActive ? '#fff' : color} />
              <Text style={[s.chipText, isActive && { color: '#fff' }]}>{p}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>

          {/* Title */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>
            <PaperInput label="Job Title *" value={title} onChangeText={setTitle} mode="outlined" style={s.input} returnKeyType="done" />
          </View>

          {/* Date */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Date *</Text>
            <TouchableOpacity
              style={[s.pickerRow, s.pickerRowFilled]}
              onPress={() => setDatePickerOpen(true)}
              activeOpacity={0.8}
            >
              <View style={s.pickerSelected}>
                <View style={[s.pickerAvatar, { backgroundColor: T.accent + '20' }]}>
                  <MaterialCommunityIcons name="calendar" size={18} color={T.accent} />
                </View>
                <Text style={[s.pickerName, { flex: 1 }]}>{prettyDate(dateKey)}</Text>
                <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Time */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Time Window *</Text>
            <TouchableOpacity
              style={[s.pickerRow, timeLabel ? s.pickerRowFilled : s.pickerRowError]}
              onPress={() => setTimeWindowOpen(true)}
              activeOpacity={0.8}
            >
              {timeLabel ? (
                <View style={s.pickerSelected}>
                  <View style={[s.pickerAvatar, { backgroundColor: T.accent + '20' }]}>
                    <MaterialCommunityIcons name="clock-outline" size={18} color={T.accent} />
                  </View>
                  <Text style={[s.pickerName, { flex: 1 }]}>{timeLabel}</Text>
                  <TouchableOpacity
                    onPress={() => { setStartHour(''); setStartMin(''); setEndHour(''); setEndMin(''); }}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.pickerPlaceholder}>
                  <MaterialCommunityIcons name="clock-outline" size={20} color={T.textMuted} />
                  <Text style={s.pickerPlaceholderText}>Set time window…</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Customer */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Customer *</Text>
            <TouchableOpacity
              style={[s.pickerRow, !!selectedCustomer && s.pickerRowFilled]}
              onPress={() => setCustomerPickerOpen(true)}
              activeOpacity={0.8}
            >
              {selectedCustomer ? (
                <View style={s.pickerSelected}>
                  <View style={s.pickerAvatar}>
                    <Text style={s.pickerAvatarText}>
                      {selectedCustomer.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.pickerName}>{selectedCustomer.name}</Text>
                    <Text style={s.pickerSub} numberOfLines={1}>📍 {selectedCustomer.address}</Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedCustomer(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.pickerPlaceholder}>
                  <MaterialCommunityIcons name="account-search-outline" size={20} color={T.textMuted} />
                  <Text style={s.pickerPlaceholderText}>Select or add a customer…</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Assignee */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Assigned To *</Text>
            <TouchableOpacity style={[s.pickerRow, assignee ? s.pickerRowFilled : s.pickerRowError]}
              onPress={() => setAssigneePickerOpen(true)}
              activeOpacity={0.8}
            >
              {assignee ? (
                <View style={s.pickerSelected}>
                  <View style={[s.pickerAvatar, { backgroundColor: T.accent + '20' }]}>
                    <Text style={[s.pickerAvatarText, { color: T.accent }]}>
                      {assignee.split(' ').map((w: string) => w[0]).join('')}
                    </Text>
                  </View>
                  <Text style={[s.pickerName, { flex: 1 }]}>{assignee}</Text>
                  <TouchableOpacity onPress={() => setAssignee('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                    <MaterialCommunityIcons name="close-circle" size={18} color={T.textMuted} />
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={s.pickerPlaceholder}>
                  <MaterialCommunityIcons name="account-outline" size={20} color={T.textMuted} />
                  <Text style={s.pickerPlaceholderText}>Select a technician…</Text>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
                </View>
              )}
            </TouchableOpacity>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button onPress={() => navigation.goBack()} textColor={T.textSecondary} style={s.cancelBtn} disabled={saving}>Cancel</Button>
        <Button mode="contained" onPress={handleSave} buttonColor={T.accent} style={s.saveBtn} contentStyle={s.saveBtnContent} loading={saving} disabled={saving}>
          Add Job
        </Button>
      </View>

      <DatePickerModal
        visible={datePickerOpen}
        dateKey={dateKey}
        onDismiss={() => setDatePickerOpen(false)}
        onSelect={setDateKey}
      />

      <TimeWindowModal
        visible={timeWindowOpen}
        startHour={startHour} startMin={startMin} startPeriod={startPeriod}
        endHour={endHour} endMin={endMin} endPeriod={endPeriod}
        onDismiss={() => setTimeWindowOpen(false)}
        onSave={(sh, sm, sp, eh, em, ep) => {
          setStartHour(sh); setStartMin(sm); setStartPeriod(sp);
          setEndHour(eh);   setEndMin(em);   setEndPeriod(ep);
        }}
      />

      <CustomerPickerModal
        visible={customerPickerOpen}
        onDismiss={() => setCustomerPickerOpen(false)}
        onSelect={c => { setSelectedCustomer(c); setCustomerPickerOpen(false); }}
        onAddNew={() => { setCustomerPickerOpen(false); navigation.navigate('AddCustomer'); }}
      />

      <AssigneePickerModal
        visible={assigneePickerOpen}
        selected={assignee}
        onDismiss={() => setAssigneePickerOpen(false)}
        onSelect={setAssignee}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:                 { flex: 1, backgroundColor: T.bg },
  appbar:               { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:          { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:               { padding: 16 },
  section:              { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  sectionLabel:         { fontSize: 11, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  chipRow:              { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:                 { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipText:             { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:                { marginBottom: 4, backgroundColor: T.surface },
  footer:               { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.surface },
  cancelBtn:            { flex: 1, borderRadius: 10 },
  saveBtn:              { flex: 2, borderRadius: 10 },
  saveBtnContent:       { paddingVertical: 4 },
  pickerRow:            { borderWidth: 1.5, borderColor: T.border, borderRadius: 12, backgroundColor: T.surfaceAlt, overflow: 'hidden' },
  pickerRowFilled:      { borderColor: T.accent + '60', backgroundColor: T.accent + '08' },
  pickerPlaceholder:    { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 },
  pickerPlaceholderText:{ flex: 1, fontSize: 14, color: T.textMuted },
  pickerSelected:       { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  pickerAvatar:         { width: 36, height: 36, borderRadius: 18, backgroundColor: T.accent + '20', justifyContent: 'center', alignItems: 'center' },
  pickerAvatarText:     { fontSize: 13, fontWeight: '800', color: T.accent },
  pickerName:           { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  pickerSub:            { fontSize: 12, color: T.textSecondary, marginTop: 1 },
  pickerRowError: { borderColor: T.red + '60', backgroundColor: T.red + '06' },
});
