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
import { Appbar, Button, TextInput as PaperInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { T } from '../Home';
import { getTypeCfg, ALL_TYPES } from './CustomersScreen';
import { CustomersAPI } from '../../../shared/api/api';
import { useCustomerContext } from '../../../shared/context/CustomerContext';

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 10);
  if (digits.length === 0) return '';
  if (digits.length <= 3)  return `(${digits}`;
  if (digits.length <= 6)  return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

function isValidPhone(raw: string): boolean {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 0 || digits.length === 10;
}

export default function AddCustomerScreen() {
  const insets      = useSafeAreaInsets();
  const navigation  = useNavigation<any>();
  const { addCustomer } = useCustomerContext();

  const [name,    setName]    = useState('');
  const [contact, setContact] = useState('');
  const [phone,   setPhone]   = useState('');
  const [email,   setEmail]   = useState('');
  const [address, setAddress] = useState('');
  const [type,    setType]    = useState('Commercial');
  const [saving,  setSaving]  = useState(false);

  const [emailErr, setEmailErr] = useState('');
  const [phoneErr, setPhoneErr] = useState('');

  const handlePhoneChange = (raw: string) => {
    if (phoneErr) setPhoneErr('');
    setPhone(formatPhone(raw));
  };

  const validateAndSave = async () => {
    let valid = true;

    if (!name.trim() || !contact.trim()) {
      Alert.alert('Required', 'Name and primary contact are required.');
      return;
    }

    if (email.trim() && !EMAIL_RE.test(email.trim())) {
      setEmailErr('Please enter a valid email address');
      valid = false;
    } else {
      setEmailErr('');
    }

    if (!isValidPhone(phone)) {
      setPhoneErr('Please enter a valid 10-digit US phone number');
      valid = false;
    } else {
      setPhoneErr('');
    }

    if (!valid) return;

    setSaving(true);
    try {
      const created = await CustomersAPI.create({
        name:        name.trim(),
        contact:     contact.trim(),
        phone:       phone.trim(),
        email:       email.trim(),
        address:     address.trim(),
        type,
        active_jobs: 0,
      });
      addCustomer(created);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to add customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Customer" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Type */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Customer Type</Text>
            <View style={s.chipRow}>
              {ALL_TYPES.map(t => {
                const cfg      = getTypeCfg(t);
                const isActive = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[s.chip, isActive && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  >
                    <Text style={s.chipIcon}>{cfg.icon}</Text>
                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>

            <PaperInput
              label="Company / Property Name *"
              value={name} onChangeText={setName}
              mode="outlined" style={s.input} returnKeyType="next"
            />

            <PaperInput
              label="Primary Contact *"
              value={contact} onChangeText={setContact}
              mode="outlined" style={s.input} returnKeyType="next"
            />

            <PaperInput
              label="Phone"
              value={phone}
              onChangeText={handlePhoneChange}
              mode="outlined"
              style={s.input}
              keyboardType="phone-pad"
              returnKeyType="next"
              error={!!phoneErr}
              placeholder="(512) 800-1001"
              maxLength={14}
            />
            {phoneErr ? <Text style={s.errText}>{phoneErr}</Text> : null}

            <PaperInput
              label="Email"
              value={email}
              onChangeText={v => { setEmail(v); if (emailErr) setEmailErr(''); }}
              mode="outlined"
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              error={!!emailErr}
            />
            {emailErr ? <Text style={s.errText}>{emailErr}</Text> : null}

            <PaperInput
              label="Address"
              value={address} onChangeText={setAddress}
              mode="outlined" style={s.input} returnKeyType="done"
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 34) }]}>
        <Button
          onPress={() => navigation.goBack()}
          textColor={T.textSecondary}
          style={s.cancelBtn}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={validateAndSave}
          buttonColor={T.accent}
          style={s.saveBtn}
          contentStyle={s.saveBtnContent}
          loading={saving}
          disabled={saving}
        >
          Add Customer
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: T.bg },
  appbar:         { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:    { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:         { padding: 16 },
  section:        { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  sectionLabel:   { fontSize: 11, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipIcon:       { fontSize: 14 },
  chipText:       { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:          { marginBottom: 4, backgroundColor: T.surface },
  errText:        { fontSize: 12, color: '#DC2626', marginBottom: 8, marginTop: 2, paddingHorizontal: 4 },
  footer:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.surface },
  cancelBtn:      { flex: 1, borderRadius: 10 },
  saveBtn:        { flex: 2, borderRadius: 10 },
  saveBtnContent: { paddingVertical: 4 },
});