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
import { UsersAPI, AppUser } from '../../../shared/api/api';
import { useStaffContext } from '../../../shared/context/StaffContext';
import { useAuth } from '../../../shared/context/AuthContext';

const ALL_SPECIALTIES = ['HVAC', 'Electrical', 'Plumbing', 'Roofing', 'General', 'Elevators', 'Security'];

export default function AddStaffScreen() {
  const insets       = useSafeAreaInsets();
  const navigation   = useNavigation<any>();
  const { addStaff } = useStaffContext();
  const { user }     = useAuth();

  const [name,        setName]        = useState('');
  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [showPw,      setShowPw]      = useState(false);
  const [phone,       setPhone]       = useState('');
  const [years,       setYears]       = useState('');
  const [role,        setRole]        = useState<'manager' | 'technician'>('technician');
  const [available,   setAvailable]   = useState(true);
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [saving,      setSaving]      = useState(false);

  const toggleSpecialty = (s: string) =>
    setSpecialties(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const handleSave = async () => {
    if (!name.trim())     { Alert.alert('Required', 'Name is required.');     return; }
    if (!email.trim())    { Alert.alert('Required', 'Email is required.');    return; }
    if (!password.trim()) { Alert.alert('Required', 'Password is required.'); return; }
    if (password.length < 8) { Alert.alert('Required', 'Password must be at least 8 characters.'); return; }


    const payload: Omit<AppUser, 'id'> & { password: string } = {
      name:             name.trim(),
      email:            email.trim(),
      password:         password.trim(),
      role,
      phone:            phone.trim(),
      technician_id:    null,
      specialties:      role === 'technician' ? specialties : [],
      available:        role === 'technician' ? available : null,
      jobs_today:       null,
      rating:           null,
      years_experience: role === 'technician' ? parseInt(years, 10) || 0 : null,
    };

    setSaving(true);
    try {
      const created = await UsersAPI.create(payload);
      addStaff(created);
      navigation.goBack();
    } catch (e: any) {

      console.log('ADD STAFF ERROR:', JSON.stringify(e?.response?.data));
      Alert.alert('Error', e?.message ?? 'Failed to add staff member.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Add Staff Member" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

          {/* Role */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Role</Text>
            <View style={s.chipRow}>
              {(['technician', 'manager'] as const).map(r => {
                const isActive = role === r;
                const color    = r === 'manager' ? T.accent : T.green;
                return (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRole(r)}
                    style={[s.chip, isActive && { backgroundColor: color, borderColor: color }]}
                    activeOpacity={0.8}
                  >
                    <MaterialCommunityIcons
                      name={r === 'manager' ? 'shield-account-outline' : 'hard-hat'}
                      size={13}
                      color={isActive ? '#fff' : color}
                    />
                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>
                      {r === 'manager' ? 'Manager' : 'Technician'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Details */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>
            <PaperInput label="Full Name *"      value={name}  onChangeText={setName}  mode="outlined" style={s.input} returnKeyType="next" />
            <PaperInput label="Phone"            value={phone} onChangeText={setPhone} mode="outlined" style={s.input} keyboardType="phone-pad" returnKeyType="next" />
            {role === 'technician' && (
              <PaperInput label="Years Experience" value={years} onChangeText={setYears} mode="outlined" style={s.input} keyboardType="numeric" returnKeyType="next" />
            )}
          </View>

          {/* Login credentials */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>Login Credentials</Text>
            <PaperInput
              label="Email *" value={email} onChangeText={setEmail}
              mode="outlined" style={s.input}
              keyboardType="email-address" autoCapitalize="none" returnKeyType="next"
            />
            <View style={s.passwordWrap}>
              <PaperInput
                label="Password *" value={password} onChangeText={setPassword}
                mode="outlined" style={[s.input, { flex: 1 }]}
                secureTextEntry={!showPw} returnKeyType="done"
              />
              <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={T.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={s.hint}>They'll use this email and password to log in.</Text>
          </View>

          {/* Availability — technicians only */}
          {role === 'technician' && (
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
          )}

          {/* Specialties — technicians only */}
          {role === 'technician' && (
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
          )}

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
          Add Staff Member
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
  passwordWrap:   { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyeBtn:         { padding: 8, marginBottom: 10 },
  hint:           { fontSize: 12, color: T.textMuted, marginTop: -6, marginBottom: 4 },
  footer:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, backgroundColor: T.surface, borderTopWidth: 1, borderTopColor: T.border },
  cancelBtn:      { flex: 1, borderRadius: 10 },
  saveBtn:        { flex: 2, borderRadius: 10 },
  saveBtnContent: { paddingVertical: 4 },
});