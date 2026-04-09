import React from 'react';
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../../shared/context/AuthContext'; // adjust path
import { T } from '../Home'; // adjust path

const ROLE_CFG = {
  manager:    { label: 'Manager',    color: T.accent,  bg: '#EFF6FF', icon: 'shield-account-outline' as const },
  technician: { label: 'Technician', color: T.green,   bg: '#F0FDF4', icon: 'hard-hat' as const },
};

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.card}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={ir.row}>
      <View style={ir.iconWrap}>
        <MaterialCommunityIcons name={icon as any} size={18} color={T.textSecondary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={ir.label}>{label}</Text>
        <Text style={ir.value}>{value}</Text>
      </View>
    </View>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: T.border, marginHorizontal: 16 }} />;
}

export default function ProfileScreen() {
  const insets      = useSafeAreaInsets();
  const { user, logout, isManager } = useAuth();

  if (!user) return null;

  const roleCfg = ROLE_CFG[user.role];

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  const PERMISSIONS = isManager
    ? ['View all jobs', 'Create & edit jobs', 'Delete jobs', 'Manage staff', 'View all customers', 'Access reports']
    : ['View assigned jobs', 'Update job status', 'Add photos & notes', 'Contact customers'];

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.Content title="Profile" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero ── */}
        <View style={hero.card}>
          <View style={[hero.avatar, { backgroundColor: roleCfg.color + '20' }]}>
            <Text style={[hero.avatarText, { color: roleCfg.color }]}>{user.avatar_initials}</Text>
          </View>
          <Text style={hero.name}>{user.name}</Text>
          <View style={[hero.roleBadge, { backgroundColor: roleCfg.bg, borderColor: roleCfg.color + '40' }]}>
            <MaterialCommunityIcons name={roleCfg.icon} size={14} color={roleCfg.color} />
            <Text style={[hero.roleText, { color: roleCfg.color }]}>{roleCfg.label}</Text>
          </View>
        </View>

        {/* ── Account info ── */}
        <SectionCard title="Account">
          <InfoRow icon="account-outline" label="Full Name" value={user.name} />
          <Divider />
          <InfoRow icon="email-outline"   label="Email"     value={user.email} />
          <Divider />
          <InfoRow icon="identifier"      label="Role"      value={roleCfg.label} />
        </SectionCard>

        {/* ── Permissions ── */}
        <SectionCard title="Permissions">
          {PERMISSIONS.map((p, i) => (
            <View key={p}>
              {i > 0 && <Divider />}
              <View style={pm.row}>
                <View style={pm.check}>
                  <MaterialCommunityIcons name="check" size={13} color={roleCfg.color} />
                </View>
                <Text style={pm.text}>{p}</Text>
              </View>
            </View>
          ))}
          {!isManager && (
            <>
              <Divider />
              <View style={pm.row}>
                <View style={[pm.check, pm.checkDisabled]}>
                  <MaterialCommunityIcons name="close" size={13} color={T.textMuted} />
                </View>
                <Text style={[pm.text, { color: T.textMuted }]}>Delete jobs (Manager only)</Text>
              </View>
              <Divider />
              <View style={pm.row}>
                <View style={[pm.check, pm.checkDisabled]}>
                  <MaterialCommunityIcons name="close" size={13} color={T.textMuted} />
                </View>
                <Text style={[pm.text, { color: T.textMuted }]}>Manage staff (Manager only)</Text>
              </View>
            </>
          )}
        </SectionCard>

        {/* ── Sign out ── */}
        <TouchableOpacity style={s.signOutBtn} onPress={handleLogout} activeOpacity={0.8}>
          <MaterialCommunityIcons name="logout" size={18} color={T.red} />
          <Text style={s.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  appbar:      { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:      { paddingBottom: 24 },
  signOutBtn:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginHorizontal: 16, marginTop: 16, paddingVertical: 14, borderRadius: 14, backgroundColor: T.red + '10', borderWidth: 1, borderColor: T.red + '30' },
  signOutText: { fontSize: 15, fontWeight: '700', color: T.red },
});

const hero = StyleSheet.create({
  card:       { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1, borderColor: T.border },
  avatar:     { width: 80, height: 80, borderRadius: 40, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 28, fontWeight: '800' },
  name:       { fontSize: 22, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.5, marginBottom: 10 },
  roleBadge:  { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, borderWidth: 1 },
  roleText:   { fontSize: 13, fontWeight: '700' },
});

const sec = StyleSheet.create({
  card:  { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  title: { fontSize: 12, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
});

const ir = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  iconWrap:{ width: 24, alignItems: 'center' },
  label:   { fontSize: 11, color: T.textMuted, fontWeight: '600', marginBottom: 2 },
  value:   { fontSize: 14, color: T.textPrimary, fontWeight: '500' },
});

const pm = StyleSheet.create({
  row:           { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 11, gap: 12 },
  check:         { width: 22, height: 22, borderRadius: 11, backgroundColor: T.green + '18', justifyContent: 'center', alignItems: 'center' },
  checkDisabled: { backgroundColor: T.surfaceAlt },
  text:          { fontSize: 14, color: T.textPrimary },
});