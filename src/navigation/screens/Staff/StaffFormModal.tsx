import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, Modal, Portal, TextInput as PaperInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { T } from '../Home';
import { Technician, ALL_ROLES, ALL_SPECIALTIES, getRoleCfg } from './Staff.constants';

interface Props {
  visible:   boolean;
  initial?:  Technician;
  onDismiss: () => void;
  onSave:    (data: Omit<Technician, 'id' | 'jobs_today' | 'rating'>) => void;
}

export function StaffFormModal({ visible, initial, onDismiss, onSave }: Props) {
  const insets = useSafeAreaInsets();
  const isEdit = !!initial;

  const [name,        setName]        = useState(initial?.name              ?? '');
  const [role,        setRole]        = useState(initial?.role              ?? 'Field Technician');
  const [phone,       setPhone]       = useState(initial?.phone             ?? '');
  const [email,       setEmail]       = useState(initial?.email             ?? '');
  const [years,       setYears]       = useState(String(initial?.years_experience ?? ''));
  const [available,   setAvailable]   = useState(initial?.available         ?? true);
  const [specialties, setSpecialties] = useState<string[]>(initial?.specialties ?? []);

  React.useEffect(() => {
    if (visible) {
      setName(initial?.name ?? '');
      setRole(initial?.role ?? 'Field Technician');
      setPhone(initial?.phone ?? '');
      setEmail(initial?.email ?? '');
      setYears(String(initial?.years_experience ?? ''));
      setAvailable(initial?.available ?? true);
      setSpecialties(initial?.specialties ?? []);
    }
  }, [visible, initial?.id]);

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required.'); return; }
    onSave({
      name: name.trim(), role,
      phone: phone.trim(), email: email.trim(),
      years_experience: parseInt(years, 10) || 0,
      available, specialties,
    });
    onDismiss();
  };

  return (
    <Portal>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={fm.kav}
        pointerEvents={visible ? 'auto' : 'none'}
      >
        <Modal
          visible={visible}
          onDismiss={onDismiss}
          dismissable={false}
          contentContainerStyle={[fm.container, { paddingBottom: Math.max(insets.bottom, 16) }]}
        >
          <View style={fm.header}>
            <View style={fm.headerIcon}>
              <Text style={fm.headerIconText}>{isEdit ? '✏️' : '👷'}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={fm.title}>{isEdit ? 'Edit Staff' : 'Add Staff'}</Text>
              <Text style={fm.subtitle}>{isEdit ? 'Update details below' : 'Fill in the details below'}</Text>
            </View>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            bounces={false}
            keyboardShouldPersistTaps="handled"
            style={fm.scroll}
          >
            <Text style={fm.sectionLabel}>Role</Text>
            <View style={fm.chipRow}>
              {ALL_ROLES.map(r => {
                const cfg      = getRoleCfg(r);
                const isActive = role === r;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[fm.chip, isActive && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  >
                    <Text style={[fm.chipText, isActive && { color: '#fff' }]}>{r}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={fm.sectionLabel}>Details</Text>
            <PaperInput label="Full Name *"      value={name}  onChangeText={setName}  mode="outlined" style={fm.input} dense returnKeyType="next" />
            <PaperInput label="Phone"            value={phone} onChangeText={setPhone} mode="outlined" style={fm.input} dense keyboardType="phone-pad" returnKeyType="next" />
            <PaperInput label="Email"            value={email} onChangeText={setEmail} mode="outlined" style={fm.input} dense keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            <PaperInput label="Years Experience" value={years} onChangeText={setYears} mode="outlined" style={fm.input} dense keyboardType="numeric" returnKeyType="done" />

            <Text style={fm.sectionLabel}>Availability</Text>
            <View style={fm.chipRow}>
              {([true, false] as const).map(v => (
                <TouchableOpacity
                  key={String(v)}
                  onPress={() => setAvailable(v)}
                  style={[
                    fm.chip,
                    available === v && { backgroundColor: v ? T.green : T.red, borderColor: v ? T.green : T.red },
                  ]}
                >
                  <Text style={[fm.chipText, available === v && { color: '#fff' }]}>
                    {v ? 'Available' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={fm.sectionLabel}>Specialties</Text>
            <View style={fm.chipRow}>
              {ALL_SPECIALTIES.map(s => {
                const isActive = specialties.includes(s);
                return (
                  <TouchableOpacity
                    key={s}
                    onPress={() => toggleSpecialty(s)}
                    style={[fm.chip, isActive && { backgroundColor: T.accent, borderColor: T.accent }]}
                  >
                    <Text style={[fm.chipText, isActive && { color: '#fff' }]}>{s}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 8 }} />
          </ScrollView>

          <View style={fm.footer}>
            <Button onPress={onDismiss} textColor={T.textSecondary} style={fm.footerBtn}>Cancel</Button>
            <Button
              mode="contained"
              onPress={handleSave}
              buttonColor={T.accent}
              style={fm.footerBtn}
              contentStyle={fm.saveBtnContent}
            >
              {isEdit ? 'Save Changes' : 'Add Staff'}
            </Button>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </Portal>
  );
}

const fm = StyleSheet.create({
  kav:            { flex: 1, justifyContent: 'flex-end' },
  container:      { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '92%' },
  header:         { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  headerIcon:     { width: 42, height: 42, borderRadius: 12, backgroundColor: T.accent + '14', justifyContent: 'center', alignItems: 'center' },
  headerIconText: { fontSize: 20 },
  title:          { fontSize: 18, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.3 },
  subtitle:       { fontSize: 12, color: T.textSecondary, marginTop: 1 },
  scroll:         { flexGrow: 0, paddingHorizontal: 20, paddingTop: 16 },
  sectionLabel:   { fontSize: 11, color: T.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8, marginTop: 4 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  chip:           { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipText:       { fontSize: 12, fontWeight: '700', color: T.textSecondary },
  input:          { marginBottom: 10, backgroundColor: T.surface },
  footer:         { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, paddingHorizontal: 20, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border },
  footerBtn:      { borderRadius: 10 },
  saveBtnContent: { paddingHorizontal: 8 },
});