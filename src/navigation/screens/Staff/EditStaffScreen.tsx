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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { UsersAPI, AppUser } from '../../../shared/api/api';
import { useStaffContext } from '../../../shared/context/StaffContext';
import { T } from '../../../shared/Theme';

const ALL_SPECIALTIES = ['HVAC', 'Electrical', 'Plumbing', 'Roofing', 'General', 'Elevators', 'Security'];

type EditStaffRouteProp = RouteProp<{ EditStaff: { staff: AppUser } }, 'EditStaff'>;

export default function EditStaffScreen() {
  const insets          = useSafeAreaInsets();
  const navigation      = useNavigation<any>();
  const route           = useRoute<EditStaffRouteProp>();
  const { staff }       = route.params;
  const { updateStaff } = useStaffContext();

  const [name,        setName]        = useState(staff.name);
  const [phone,       setPhone]       = useState(staff.phone ?? '');
  const [email,       setEmail]       = useState(staff.email ?? '');
  const [years,       setYears]       = useState(String(staff.years_experience ?? ''));
  const [available,   setAvailable]   = useState(staff.available ?? true);
  const [specialties, setSpecialties] = useState<string[]>(staff.specialties ?? []);
  const [saving,      setSaving]      = useState(false);

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Required', 'Name is required.'); return; }

    const payload: Partial<AppUser> = {
      name:             name.trim(),
      phone:            phone.trim(),
      email:            email.trim(),
      years_experience: parseInt(years, 10) || 0,
      available,
      specialties,
    };

    setSaving(true);
    try {
      const updated = await UsersAPI.update(staff.id, payload);
      updateStaff(updated);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Staff Member" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>
            <PaperInput label="Full Name *"      value={name}  onChangeText={setName}  mode="outlined" style={s.input} returnKeyType="next" />
            <PaperInput label="Phone"            value={phone} onChangeText={setPhone} mode="outlined" style={s.input} keyboardType="phone-pad" returnKeyType="next" />
            <PaperInput label="Email"            value={email} onChangeText={setEmail} mode="outlined" style={s.input} keyboardType="email-address" autoCapitalize="none" returnKeyType="next" />
            <PaperInput label="Years Experience" value={years} onChangeText={setYears} mode="outlined" style={s.input} keyboardType="numeric" returnKeyType="done" />
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Availability</Text>
            <View style={s.chipRow}>
              {([true, false] as const).map(v => (
                <TouchableOpacity
                  key={String(v)}
                  onPress={() => setAvailable(v)}
                  style={[s.chip, available === v && { backgroundColor: v ? T.green : T.red, borderColor: v ? T.green : T.red }]}
                >
                  <Text style={[s.chipText, available === v && { color: '#fff' }]}>
                    {v ? 'Available' : 'Unavailable'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Specialties</Text>
            <View style={s.chipRow}>
              {ALL_SPECIALTIES.map(skill => {
                const isActive = specialties.includes(skill);
                return (
                  <TouchableOpacity
                    key={skill}
                    onPress={() => toggleSpecialty(skill)}
                    style={[s.chip, isActive && { backgroundColor: T.accent, borderColor: T.accent }]}
                  >
                    {isActive && <MaterialCommunityIcons name="check" size={13} color="#fff" />}
                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>{skill}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button onPress={() => navigation.goBack()} textColor={T.textSecondary} style={s.cancelBtn} disabled={saving}>
          Cancel
        </Button>
        <Button
          mode="contained" onPress={handleSave} buttonColor={T.accent}
          style={s.saveBtn} contentStyle={s.saveBtnContent}
          loading={saving} disabled={saving}
        >
          Save Changes
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
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipText:       { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:          { marginBottom: 10, backgroundColor: T.surface },
  footer:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 12, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.surface },
  cancelBtn:      { flex: 1, borderRadius: 10 },
  saveBtn:        { flex: 2, borderRadius: 10 },
  saveBtnContent: { paddingVertical: 4 },
});