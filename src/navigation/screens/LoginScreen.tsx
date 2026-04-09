import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../shared/context/AuthContext';
import { IS_MOCK } from '../../shared/api/api';

const ACCENT = '#2D73DE';

const DEMO_ACCOUNTS = [
  { label: 'Manager',    email: 'alex@fieldco.io',   password: 'manager123', icon: 'shield-account-outline' as const, bg: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.35)' },
  { label: 'Technician', email: 'm.webb@fieldco.io', password: 'tech123',    icon: 'hard-hat' as const,               bg: 'rgba(255,255,255,0.18)', border: 'rgba(255,255,255,0.35)' },
];

export default function LoginScreen() {
  const { login }    = useAuth();
  const navigation   = useNavigation<any>();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) { setError('Please enter your email and password.'); return; }
    setError('');
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Login failed.');
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.brand}>
          <View style={s.logoWrap}>
            <MaterialCommunityIcons name="briefcase-check-outline" size={38} color={ACCENT} />
          </View>
          <Text style={s.appName}>Field Manager</Text>
          <Text style={s.tagline}>Sign in to continue</Text>
        </View>

        <View style={s.card}>
          {!!error && (
            <View style={s.errorBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#DC2626" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.fieldLabel}>Email</Text>
          <View style={s.inputWrap}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              placeholder="you@example.com" placeholderTextColor="#9CA3AF"
              keyboardType="email-address" autoCapitalize="none"
              autoComplete="email" returnKeyType="next"
            />
          </View>

          <Text style={[s.fieldLabel, { marginTop: 14 }]}>Password</Text>
          <View style={s.inputWrap}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              placeholder="••••••••" placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw} returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[s.loginBtn, loading && { opacity: 0.75 }]}
            onPress={handleLogin} activeOpacity={0.85} disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <><MaterialCommunityIcons name="login" size={18} color="#fff" /><Text style={s.loginBtnText}>Sign In</Text></>
            }
          </TouchableOpacity>

          {/* Only show sign up link on real backend */}
          {!IS_MOCK && (
            <TouchableOpacity style={s.signupRow} onPress={() => navigation.navigate('Signup')} activeOpacity={0.8}>
              <Text style={s.signupText}>Don't have an account? </Text>
              <Text style={s.signupLink}>Sign up</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Only show demo chips on mock */}
        {IS_MOCK && (
          <View style={s.demoSection}>
            <View style={s.demoLabelRow}>
              <View style={s.demoLine} />
              <Text style={s.demoLabel}>Try a demo account</Text>
              <View style={s.demoLine} />
            </View>
            <View style={s.demoRow}>
              {DEMO_ACCOUNTS.map(acc => (
                <TouchableOpacity
                  key={acc.label}
                  onPress={() => { setEmail(acc.email); setPassword(acc.password); setError(''); }}
                  style={[s.demoChip, { backgroundColor: acc.bg, borderColor: acc.border }]}
                  activeOpacity={0.75}
                >
                  <View style={s.demoChipIcon}>
                    <MaterialCommunityIcons name={acc.icon} size={20} color="#fff" />
                  </View>
                  <View>
                    <Text style={s.demoChipRole}>{acc.label}</Text>
                    <Text style={s.demoChipHint}>Tap to fill</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:         { flex: 1, backgroundColor: ACCENT },
  scroll:       { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  brand:        { alignItems: 'center', marginBottom: 28 },
  logoWrap:     { width: 76, height: 76, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  appName:      { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline:      { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card:         { backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  errorBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText:    { fontSize: 13, color: '#DC2626', flex: 1 },
  fieldLabel:   { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  inputWrap:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon:    { marginRight: 8 },
  input:        { flex: 1, fontSize: 15, color: '#111827' },
  eyeBtn:       { padding: 4 },
  loginBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 15, marginTop: 20 },
  loginBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  signupRow:    { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  signupText:   { fontSize: 14, color: '#6B7280' },
  signupLink:   { fontSize: 14, fontWeight: '700', color: ACCENT },
  demoSection:  { marginTop: 28 },
  demoLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  demoLine:     { flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.3)' },
  demoLabel:    { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 },
  demoRow:      { flexDirection: 'row', gap: 10 },
  demoChip:     { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14 },
  demoChipIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  demoChipRole: { fontSize: 13, fontWeight: '700', color: '#fff' },
  demoChipHint: { fontSize: 11, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
});