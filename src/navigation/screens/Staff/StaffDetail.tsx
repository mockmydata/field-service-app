import React from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { T } from '../../../shared/Theme';
import { AppUser, UsersAPI } from '../../../shared/api/api';
import { useAuth } from '../../../shared/context/AuthContext';
import { useStaffContext } from '../../../shared/context/StaffContext';

type StaffDetailRouteProp = RouteProp<{ StaffDetail: { staff: AppUser } }, 'StaffDetail'>;

// Since we no longer have role configs, derive color from availability/role
const ROLE_COLOR = T.accent;
const ROLE_BG    = T.accent + '12';

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.card}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value, onPress }: {
  icon: string; label: string; value?: string | null; onPress?: () => void;
}) {
  if (!value) return null;
  const Wrap = onPress ? TouchableOpacity : View;
  return (
    <View>
      <Wrap onPress={onPress} activeOpacity={0.7} style={ir.row}>
        <View style={ir.iconWrap}>
          <MaterialCommunityIcons name={icon as any} size={18} color={T.textSecondary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={ir.label}>{label}</Text>
          <Text style={[ir.value, onPress && { color: T.accent }]}>{value}</Text>
        </View>
        {onPress && <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />}
      </Wrap>
      <View style={sec.divider} />
    </View>
  );
}

export default function StaffDetailScreen() {
  const navigation               = useNavigation<any>();
  const route                    = useRoute<StaffDetailRouteProp>();
  const { isManager }            = useAuth();
  const { staff: allStaff, deleteStaff } = useStaffContext();

  const staff    = allStaff.find(t => t.id === route.params.staff.id) ?? route.params.staff;
  const initials = staff.name.split(' ').slice(0, 2).map(w => w[0]).join('');
  const roleLabel = staff.role === 'manager' ? 'Manager' : 'Field Technician';

  const handleDelete = () => {
    Alert.alert(
      'Remove Staff Member',
      `Remove ${staff.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await UsersAPI.delete(staff.id);
              deleteStaff(staff.id);
              navigation.goBack();
            } catch (e: any) {
              Alert.alert('Error', e?.message ?? 'Failed to remove staff member.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={s.root} edges={['bottom']}>
      <Appbar.Header style={s.appbar}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Staff Member" titleStyle={s.appbarTitle} />
        {isManager && (
          <>
            <Appbar.Action icon="pencil-outline"    color="#fff" onPress={() => navigation.navigate('EditStaff', { staff })} />
            <Appbar.Action icon="trash-can-outline" color="#fff" onPress={handleDelete} />
          </>
        )}
      </Appbar.Header>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero ── */}
        <View style={[hero.card, { borderTopColor: ROLE_COLOR }]}>
          <View style={[hero.avatar, { backgroundColor: ROLE_BG }]}>
            <Text style={[hero.avatarText, { color: ROLE_COLOR }]}>{initials}</Text>
          </View>
          <Text style={hero.name}>{staff.name}</Text>
          <View style={[hero.roleBadge, { backgroundColor: ROLE_BG, borderColor: ROLE_COLOR + '40' }]}>
            <Text style={[hero.roleText, { color: ROLE_COLOR }]}>{roleLabel}</Text>
          </View>

          <View style={hero.actions}>
            {!!staff.phone && (
              <TouchableOpacity
                style={[hero.actionBtn, { backgroundColor: ROLE_COLOR + '12', borderColor: ROLE_COLOR + '30' }]}
                onPress={() => Linking.openURL(`tel:${staff.phone}`)}
              >
                <MaterialCommunityIcons name="phone-outline" size={18} color={ROLE_COLOR} />
                <Text style={[hero.actionText, { color: ROLE_COLOR }]}>Call</Text>
              </TouchableOpacity>
            )}
            {!!staff.email && (
              <TouchableOpacity
                style={[hero.actionBtn, { backgroundColor: ROLE_COLOR + '12', borderColor: ROLE_COLOR + '30' }]}
                onPress={() => Linking.openURL(`mailto:${staff.email}`)}
              >
                <MaterialCommunityIcons name="email-outline" size={18} color={ROLE_COLOR} />
                <Text style={[hero.actionText, { color: ROLE_COLOR }]}>Email</Text>
              </TouchableOpacity>
            )}
            {isManager && (
              <TouchableOpacity
                style={[hero.actionBtn, { backgroundColor: T.accent + '12', borderColor: T.accent + '30' }]}
                onPress={() => navigation.navigate('EditStaff', { staff })}
              >
                <MaterialCommunityIcons name="pencil-outline" size={18} color={T.accent} />
                <Text style={[hero.actionText, { color: T.accent }]}>Edit</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* ── Stats ── */}
        <SectionCard title="Overview">
          <View style={ov.row}>
            {staff.rating != null && (
              <>
                <View style={ov.stat}>
                  <Text style={[ov.num, { color: T.amber }]}>⭐ {staff.rating}</Text>
                  <Text style={ov.label}>Rating</Text>
                </View>
                <View style={ov.divider} />
              </>
            )}
            {staff.jobs_today != null && (
              <>
                <View style={ov.stat}>
                  <Text style={[ov.num, { color: T.accent }]}>{staff.jobs_today}</Text>
                  <Text style={ov.label}>Jobs Today</Text>
                </View>
                <View style={ov.divider} />
              </>
            )}
            {staff.years_experience != null && (
              <View style={ov.stat}>
                <Text style={[ov.num, { color: T.green }]}>{staff.years_experience}</Text>
                <Text style={ov.label}>Yrs Exp</Text>
              </View>
            )}
          </View>
        </SectionCard>

        {/* ── Contact ── */}
        <SectionCard title="Contact">
          <InfoRow icon="phone-outline" label="Phone" value={staff.phone} onPress={staff.phone ? () => Linking.openURL(`tel:${staff.phone}`) : undefined} />
          <InfoRow icon="email-outline" label="Email" value={staff.email} onPress={staff.email ? () => Linking.openURL(`mailto:${staff.email}`) : undefined} />
        </SectionCard>

        {/* ── Availability ── */}
        {staff.available != null && (
          <SectionCard title="Status">
            <View style={av.row}>
              <View style={[av.dot, { backgroundColor: staff.available ? T.green : T.red }]} />
              <Text style={[av.text, { color: staff.available ? T.green : T.red }]}>
                {staff.available ? 'Available' : 'Currently Busy'}
              </Text>
            </View>
          </SectionCard>
        )}

        {/* ── Specialties ── */}
        {(staff.specialties?.length ?? 0) > 0 && (
          <SectionCard title={`Specialties (${staff.specialties.length})`}>
            <View style={sp.grid}>
              {staff.specialties.map(skill => (
                <View key={skill} style={sp.chip}>
                  <MaterialCommunityIcons name="check-circle-outline" size={13} color={ROLE_COLOR} />
                  <Text style={[sp.chipText, { color: ROLE_COLOR }]}>{skill}</Text>
                </View>
              ))}
            </View>
          </SectionCard>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  appbar:      { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:      { paddingBottom: 24 },
});

const hero = StyleSheet.create({
  card:       { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: T.border },
  avatar:     { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText: { fontSize: 26, fontWeight: '800' },
  name:       { fontSize: 20, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.4, marginBottom: 8 },
  roleBadge:  { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginBottom: 18 },
  roleText:   { fontSize: 13, fontWeight: '700' },
  actions:    { flexDirection: 'row', gap: 8, width: '100%' },
  actionBtn:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  actionText: { fontSize: 11, fontWeight: '700' },
});

const sec = StyleSheet.create({
  card:    { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  title:   { fontSize: 12, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  divider: { height: 1, backgroundColor: T.border, marginHorizontal: 16 },
});

const ir = StyleSheet.create({
  row:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  iconWrap: { width: 24, alignItems: 'center' },
  label:    { fontSize: 11, color: T.textMuted, fontWeight: '600', marginBottom: 2 },
  value:    { fontSize: 14, color: T.textPrimary, fontWeight: '500' },
});

const ov = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stat:    { flex: 1, alignItems: 'center', paddingVertical: 8 },
  num:     { fontSize: 22, fontWeight: '800', letterSpacing: -0.5 },
  label:   { fontSize: 10, color: T.textMuted, fontWeight: '600', textTransform: 'uppercase', marginTop: 3 },
  divider: { width: 1, height: 40, backgroundColor: T.border },
});

const av = StyleSheet.create({
  row:  { flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 16, paddingVertical: 14 },
  dot:  { width: 10, height: 10, borderRadius: 5 },
  text: { fontSize: 15, fontWeight: '700' },
});

const sp = StyleSheet.create({
  grid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 8, padding: 16, paddingTop: 4 },
  chip:     { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border },
  chipText: { fontSize: 12, fontWeight: '700' },
});