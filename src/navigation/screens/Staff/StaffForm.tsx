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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { T } from '../../../shared/Theme';
import { ALL_SPECIALTIES } from './Staff.constants';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StaffFormValues {
  name:            string;
  phone:           string;
  email:           string;
  yearsExperience: string;
  role:            'manager' | 'technician';
  available:       boolean;
  specialties:     string[];
  password:        string;
}

interface StaffFormProps {
  /** 'create' shows the role picker and login credentials; 'edit' hides them. */
  mode:          'create' | 'edit';
  screenTitle:   string;
  submitLabel:   string;
  initialValues: StaffFormValues;
  onSubmit:      (values: StaffFormValues) => Promise<void>;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StaffForm({ mode, screenTitle, submitLabel, initialValues, onSubmit }: StaffFormProps) {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const isCreate   = mode === 'create';

  const [formValues,   setFormValues]   = useState<StaffFormValues>(initialValues);
  const [showPassword, setShowPassword] = useState(false);
  const [saving,       setSaving]       = useState(false);

  const setField = <K extends keyof StaffFormValues>(field: K, value: StaffFormValues[K]) =>
    setFormValues(prev => ({ ...prev, [field]: value }));

  const toggleSpecialty = (specialty: string) =>
    setFormValues(prev => ({
      ...prev,
      specialties: prev.specialties.includes(specialty)
        ? prev.specialties.filter(existing => existing !== specialty)
        : [...prev.specialties, specialty],
    }));

  // In create mode, technician-only sections follow the selected role.
  // In edit mode, all sections stay visible (matches previous Edit screen behavior).
  const showTechnicianSections = !isCreate || formValues.role === 'technician';

  const validateAndSubmit = async () => {
    if (!formValues.name.trim()) { Alert.alert('Required', 'Name is required.'); return; }

    if (isCreate) {
      if (!formValues.email.trim())    { Alert.alert('Required', 'Email is required.');    return; }
      if (!formValues.password.trim()) { Alert.alert('Required', 'Password is required.'); return; }
      if (formValues.password.length < 8) {
        Alert.alert('Required', 'Password must be at least 8 characters.');
        return;
      }
    }

    setSaving(true);
    try {
      await onSubmit({
        ...formValues,
        name:     formValues.name.trim(),
        phone:    formValues.phone.trim(),
        email:    formValues.email.trim(),
        password: formValues.password.trim(),
      });
      navigation.goBack();
    } catch (submitError: any) {
      Alert.alert('Error', submitError?.message ?? 'Failed to save staff member.');
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
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Role — create only */}
          {isCreate && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Role</Text>
              <View style={s.chipRow}>
                {(['technician', 'manager'] as const).map(roleOption => {
                  const isActive  = formValues.role === roleOption;
                  const roleColor = roleOption === 'manager' ? T.accent : T.green;
                  return (
                    <TouchableOpacity
                      key={roleOption}
                      onPress={() => setField('role', roleOption)}
                      style={[s.chip, isActive && { backgroundColor: roleColor, borderColor: roleColor }]}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons
                        name={roleOption === 'manager' ? 'shield-account-outline' : 'hard-hat'}
                        size={13}
                        color={isActive ? '#fff' : roleColor}
                      />
                      <Text style={[s.chipText, isActive && { color: '#fff' }]}>
                        {roleOption === 'manager' ? 'Manager' : 'Technician'}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Details */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>
            <PaperInput label="Full Name *" value={formValues.name} onChangeText={value => setField('name', value)} mode="outlined" style={s.input} returnKeyType="next" />
            <PaperInput label="Phone" value={formValues.phone} onChangeText={value => setField('phone', value)} mode="outlined" style={s.input} keyboardType="phone-pad" returnKeyType="next" />
            {!isCreate && (
              <PaperInput label="Email" value={formValues.email} onChangeText={value => setField('email', value)} mode="outlined" style={s.input} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            )}
            {showTechnicianSections && (
              <PaperInput label="Years Experience" value={formValues.yearsExperience} onChangeText={value => setField('yearsExperience', value)} mode="outlined" style={s.input} keyboardType="numeric" returnKeyType="next" />
            )}
          </View>

          {/* Login credentials — create only */}
          {isCreate && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Login Credentials</Text>
              <PaperInput
                label="Email *" value={formValues.email} onChangeText={value => setField('email', value)}
                mode="outlined" style={s.input}
                keyboardType="email-address" autoCapitalize="none" returnKeyType="next"
              />
              <View style={s.passwordRow}>
                <PaperInput
                  label="Password *" value={formValues.password} onChangeText={value => setField('password', value)}
                  mode="outlined" style={[s.input, { flex: 1 }]}
                  secureTextEntry={!showPassword} returnKeyType="done"
                />
                <TouchableOpacity onPress={() => setShowPassword(visible => !visible)} style={s.passwordToggle} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <MaterialCommunityIcons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={T.textMuted} />
                </TouchableOpacity>
              </View>
              <Text style={s.hint}>They'll use this email and password to log in.</Text>
            </View>
          )}

          {/* Availability */}
          {showTechnicianSections && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Availability</Text>
              <View style={s.chipRow}>
                {([true, false] as const).map(availabilityOption => (
                  <TouchableOpacity
                    key={String(availabilityOption)}
                    onPress={() => setField('available', availabilityOption)}
                    style={[s.chip, formValues.available === availabilityOption && {
                      backgroundColor: availabilityOption ? T.green : T.red,
                      borderColor:     availabilityOption ? T.green : T.red,
                    }]}
                  >
                    <Text style={[s.chipText, formValues.available === availabilityOption && { color: '#fff' }]}>
                      {availabilityOption ? 'Available' : 'Unavailable'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Specialties */}
          {showTechnicianSections && (
            <View style={s.section}>
              <Text style={s.sectionLabel}>Specialties</Text>
              <View style={s.chipRow}>
                {ALL_SPECIALTIES.map(specialty => {
                  const isActive = formValues.specialties.includes(specialty);
                  return (
                    <TouchableOpacity
                      key={specialty}
                      onPress={() => toggleSpecialty(specialty)}
                      style={[s.chip, isActive && { backgroundColor: T.accent, borderColor: T.accent }]}
                    >
                      {isActive && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                      <Text style={[s.chipText, isActive && { color: '#fff' }]}>{specialty}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button onPress={() => navigation.goBack()} textColor={T.textSecondary} style={s.cancelButton} disabled={saving}>
          Cancel
        </Button>
        <Button
          mode="contained" onPress={validateAndSubmit} buttonColor={T.accent}
          style={s.submitButton} contentStyle={s.submitButtonContent}
          loading={saving} disabled={saving}
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
  chip:                { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipText:            { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:               { marginBottom: 10, backgroundColor: T.surface },
  passwordRow:         { flexDirection: 'row', alignItems: 'center', gap: 8 },
  passwordToggle:      { padding: 8, marginBottom: 10 },
  hint:                { fontSize: 12, color: T.textMuted, marginTop: -6, marginBottom: 4 },
  footer:              { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: T.surface, borderTopWidth: 1, borderTopColor: T.border },
  cancelButton:        { flex: 1, borderRadius: 10 },
  submitButton:        { flex: 2, borderRadius: 10 },
  submitButtonContent: { paddingVertical: 4 },
});
