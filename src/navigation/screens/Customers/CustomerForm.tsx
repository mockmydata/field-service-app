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
import { getCustomerTypeStyle, ALL_TYPES } from './CustomersScreen';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface CustomerFormValues {
  name:    string;
  contact: string;
  phone:   string;
  email:   string;
  address: string;
  type:    string;
}

interface CustomerFormProps {
  screenTitle:   string;
  submitLabel:   string;
  initialValues: CustomerFormValues;
  onSubmit:      (values: CustomerFormValues) => Promise<void>;
}

// ─── Validation ───────────────────────────────────────────────────────────────
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

// ─── Component ────────────────────────────────────────────────────────────────
export default function CustomerForm({ screenTitle, submitLabel, initialValues, onSubmit }: CustomerFormProps) {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();

  const [formValues, setFormValues] = useState<CustomerFormValues>(initialValues);
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [saving,     setSaving]     = useState(false);

  const setField = <K extends keyof CustomerFormValues>(field: K, value: CustomerFormValues[K]) =>
    setFormValues(prev => ({ ...prev, [field]: value }));

  const handlePhoneChange = (raw: string) => {
    if (phoneError) setPhoneError('');
    setField('phone', formatPhone(raw));
  };

  const handleEmailChange = (value: string) => {
    if (emailError) setEmailError('');
    setField('email', value);
  };

  const validateAndSubmit = async () => {
    let valid = true;

    if (!formValues.name.trim() || !formValues.contact.trim()) {
      Alert.alert('Required', 'Name and primary contact are required.');
      return;
    }

    if (formValues.email.trim() && !EMAIL_PATTERN.test(formValues.email.trim())) {
      setEmailError('Please enter a valid email address');
      valid = false;
    } else {
      setEmailError('');
    }

    if (!isValidPhone(formValues.phone)) {
      setPhoneError('Please enter a valid 10-digit US phone number');
      valid = false;
    } else {
      setPhoneError('');
    }

    if (!valid) return;

    setSaving(true);
    try {
      await onSubmit({
        ...formValues,
        name:    formValues.name.trim(),
        contact: formValues.contact.trim(),
        phone:   formValues.phone.trim(),
        email:   formValues.email.trim(),
        address: formValues.address.trim(),
      });
      navigation.goBack();
    } catch (submitError: any) {
      Alert.alert('Error', submitError?.message ?? 'Failed to save customer. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title={screenTitle} titleStyle={s.appbarTitle} />
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
              {ALL_TYPES.map(customerType => {
                const typeStyle = getCustomerTypeStyle(customerType);
                const isActive  = formValues.type === customerType;
                return (
                  <TouchableOpacity
                    key={customerType}
                    onPress={() => setField('type', customerType)}
                    style={[s.chip, isActive && { backgroundColor: typeStyle.color, borderColor: typeStyle.color }]}
                  >
                    <Text style={s.chipIcon}>{typeStyle.icon}</Text>
                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>{customerType}</Text>
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
              value={formValues.name} onChangeText={value => setField('name', value)}
              mode="outlined" style={s.input} returnKeyType="next"
            />

            <PaperInput
              label="Primary Contact *"
              value={formValues.contact} onChangeText={value => setField('contact', value)}
              mode="outlined" style={s.input} returnKeyType="next"
            />

            <PaperInput
              label="Phone"
              value={formValues.phone}
              onChangeText={handlePhoneChange}
              mode="outlined"
              style={s.input}
              keyboardType="phone-pad"
              returnKeyType="next"
              error={!!phoneError}
              placeholder="(512) 800-1001"
              maxLength={14}
            />
            {phoneError ? <Text style={s.errorText}>{phoneError}</Text> : null}

            <PaperInput
              label="Email"
              value={formValues.email}
              onChangeText={handleEmailChange}
              mode="outlined"
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              error={!!emailError}
            />
            {emailError ? <Text style={s.errorText}>{emailError}</Text> : null}

            <PaperInput
              label="Address"
              value={formValues.address} onChangeText={value => setField('address', value)}
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
          style={s.cancelButton}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={validateAndSubmit}
          buttonColor={T.accent}
          style={s.submitButton}
          contentStyle={s.submitButtonContent}
          loading={saving}
          disabled={saving}
        >
          {submitLabel}
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:                { flex: 1, backgroundColor: T.bg },
  appbar:              { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:         { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:              { padding: 16 },
  section:             { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  sectionLabel:        { fontSize: 11, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  chipRow:             { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:                { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipIcon:            { fontSize: 14 },
  chipText:            { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:               { marginBottom: 4, backgroundColor: T.surface },
  errorText:           { fontSize: 12, color: '#DC2626', marginBottom: 8, marginTop: 2, paddingHorizontal: 4 },
  footer:              { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.surface },
  cancelButton:        { flex: 1, borderRadius: 10 },
  submitButton:        { flex: 2, borderRadius: 10 },
  submitButtonContent: { paddingVertical: 4 },
});
