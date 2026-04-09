import React, { useState } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform,
  ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../../shared/context/AuthContext';

const ACCENT = '#2D73DE';

export default function SignupScreen() {
  const { signup }  = useAuth();
  const navigation  = useNavigation<any>();

  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');

  const handleSignup = async () => {
    if (!name.trim())     { setError('Your full name is required.'); return; }
    if (!email.trim())    { setError('Email is required.'); return; }
    if (!password.trim()) { setError('Password is required.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8)  { setError('Password must be at least 8 characters.'); return; }

    setError('');
    setLoading(true);
    const result = await signup(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) setError(result.error ?? 'Sign up failed.');
  };

  return (
    <KeyboardAvoidingView style={s.root} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        <View style={s.brand}>
          <View style={s.logoWrap}>
            <MaterialCommunityIcons name="briefcase-check-outline" size={38} color={ACCENT} />
          </View>
          <Text style={s.appName}>Field Manager</Text>
          <Text style={s.tagline}>Create your account</Text>
        </View>

        <View style={s.card}>
          {!!error && (
            <View style={s.errorBanner}>
              <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#DC2626" />
              <Text style={s.errorText}>{error}</Text>
            </View>
          )}

          <Text style={s.sectionLabel}>Your Details</Text>

          <View style={s.inputWrap}>
            <MaterialCommunityIcons name="account-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={name}
              onChangeText={v => { setName(v); setError(''); }}
              placeholder="Full Name" placeholderTextColor="#9CA3AF"
              autoCapitalize="words" returnKeyType="next"
            />
          </View>

          <View style={[s.inputWrap, { marginTop: 10 }]}>
            <MaterialCommunityIcons name="email-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={email}
              onChangeText={v => { setEmail(v); setError(''); }}
              placeholder="you@example.com" placeholderTextColor="#9CA3AF"
              keyboardType="email-address" autoCapitalize="none"
              autoComplete="email" returnKeyType="next"
            />
          </View>

          <View style={[s.inputWrap, { marginTop: 10 }]}>
            <MaterialCommunityIcons name="lock-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={password}
              onChangeText={v => { setPassword(v); setError(''); }}
              placeholder="Min. 8 characters" placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw} returnKeyType="next"
            />
            <TouchableOpacity onPress={() => setShowPw(v => !v)} style={s.eyeBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View style={[s.inputWrap, { marginTop: 10 }]}>
            <MaterialCommunityIcons name="lock-check-outline" size={18} color="#9CA3AF" style={s.inputIcon} />
            <TextInput
              style={s.input} value={confirm}
              onChangeText={v => { setConfirm(v); setError(''); }}
              placeholder="Confirm password" placeholderTextColor="#9CA3AF"
              secureTextEntry={!showPw} returnKeyType="done"
              onSubmitEditing={handleSignup}
            />
          </View>

          <TouchableOpacity
            style={[s.signupBtn, loading && { opacity: 0.75 }]}
            onPress={handleSignup} activeOpacity={0.85} disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" size="small" />
              : <>
                  <MaterialCommunityIcons name="account-plus-outline" size={18} color="#fff" />
                  <Text style={s.signupBtnText}>Create Account</Text>
                </>
            }
          </TouchableOpacity>

          <TouchableOpacity style={s.loginRow} onPress={() => navigation.goBack()} activeOpacity={0.8}>
            <Text style={s.loginText}>Already have an account? </Text>
            <Text style={s.loginLink}>Sign in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  root:          { flex: 1, backgroundColor: ACCENT },
  scroll:        { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 40 },
  brand:         { alignItems: 'center', marginBottom: 28 },
  logoWrap:      { width: 76, height: 76, borderRadius: 22, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 12, elevation: 6 },
  appName:       { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  tagline:       { fontSize: 14, color: 'rgba(255,255,255,0.7)', marginTop: 4 },
  card:          { backgroundColor: '#fff', borderRadius: 20, padding: 22, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 8 },
  errorBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FECACA', borderRadius: 10, padding: 10, marginBottom: 14 },
  errorText:     { fontSize: 13, color: '#DC2626', flex: 1 },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 },
  inputWrap:     { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F9FAFB', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, paddingHorizontal: 12, height: 50 },
  inputIcon:     { marginRight: 8 },
  input:         { flex: 1, fontSize: 15, color: '#111827' },
  eyeBtn:        { padding: 4 },
  signupBtn:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: ACCENT, borderRadius: 12, paddingVertical: 15, marginTop: 20 },
  signupBtnText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  loginRow:      { flexDirection: 'row', justifyContent: 'center', marginTop: 18 },
  loginText:     { fontSize: 14, color: '#6B7280' },
  loginLink:     { fontSize: 14, fontWeight: '700', color: ACCENT },
});