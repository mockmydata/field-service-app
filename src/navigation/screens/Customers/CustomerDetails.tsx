import React from 'react';
import {
  Alert,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { getTypeCfg } from './CustomersScreen';
import { Job } from '../../../types/types';
import { useCustomerContext } from '../../../shared/context/CustomerContext';
import { useJobContext } from '../../../shared/context/JobContext';
import { STATUS_CFG } from '../../../shared/JobConfig';
import { T } from '../../../shared/Theme';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const openMap = (address: string) => {
  const encoded = encodeURIComponent(address);
  const url = Platform.select({
    ios:     `maps:?q=${encoded}`,
    android: `geo:0,0?q=${encoded}`,
    default: `https://maps.google.com/?q=${encoded}`,
  })!;
  Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Maps.'));
};

// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, onPress }: {
  icon: string; label: string; value: string; onPress?: () => void;
}) {
  const inner = (
    <View style={ir.wrapper}>
      <View style={ir.iconWrap}>
        <Text style={ir.icon}>{icon}</Text>
      </View>
      <View style={ir.text}>
        <Text style={ir.label}>{label}</Text>
        <Text style={[ir.value, onPress && ir.link]}>{value}</Text>
      </View>
      {onPress && <Text style={ir.arrow}>›</Text>}
    </View>
  );
  return onPress
    ? <TouchableOpacity onPress={onPress} activeOpacity={0.7}>{inner}</TouchableOpacity>
    : inner;
}

// ─── Section Card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={sec.card}>
      <Text style={sec.title}>{title}</Text>
      {children}
    </View>
  );
}

// ─── Related Job Row ──────────────────────────────────────────────────────────
function JobRow({ job, onPress }: { job: Job; onPress: () => void }) {
  const cfg = STATUS_CFG[job.status];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={jr.row}>
      <View style={[jr.dot, { backgroundColor: cfg.color }]} />
      <View style={jr.body}>
        <Text style={jr.title}>{job.title}</Text>
        <Text style={jr.meta}>{job.date}  ·  {job.time ?? '—'}</Text>
      </View>
      <View style={[jr.badge, { backgroundColor: cfg.bg }]}>
        <MaterialCommunityIcons name={cfg.icon as any} size={11} color={cfg.color} />
        <Text style={[jr.badgeText, { color: cfg.color }]}>{job.status}</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Customer Detail Screen ───────────────────────────────────────────────────
export default function CustomerDetailScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route      = useRoute();
  const { customerId } = route.params as { customerId: number };
  const { customers, deleteCustomer }  = useCustomerContext();
  const { jobs, setSelectedJob }       = useJobContext();

  const customer     = customers.find(c => c.id === customerId)!;
  const customerJobs = jobs.filter(j => j.customerId === customerId);

  if (!customer) return null;

  const handleDelete = () => {
    Alert.alert(
      'Delete Customer',
      `Remove "${customer.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteCustomer(customer.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const cfg      = getTypeCfg(customer.type);
  const initials = customer.name.split(' ').slice(0, 2).map(w => w[0]).join('');

  return (
    <SafeAreaView style={sc.root} edges={['bottom']}>
      <Appbar.Header style={sc.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Customer" titleStyle={sc.appbarTitle} />
        <Appbar.Action icon="pencil-outline"    color="#fff" onPress={() => navigation.navigate('EditCustomer', { customerId: customer.id })} />
        <Appbar.Action icon="trash-can-outline" color="#fff" onPress={handleDelete} />
      </Appbar.Header>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[sc.scroll, { paddingBottom: Math.max(insets.bottom, 24) }]}
      >
        {/* ── Hero card ── */}
        <View style={[hero.card, { borderTopColor: cfg.color }]}>
          <View style={[hero.avatar, { backgroundColor: cfg.color + '18' }]}>
            <Text style={[hero.avatarText, { color: cfg.color }]}>{initials}</Text>
          </View>
          <Text style={hero.name}>{customer.name}</Text>
          <View style={[hero.typeBadge, { backgroundColor: cfg.bg, borderColor: cfg.color + '40' }]}>
            <Text style={[hero.typeBadgeText, { color: cfg.color }]}>{cfg.icon}  {customer.type}</Text>
          </View>

          <View style={hero.actions}>
            <TouchableOpacity
              style={[hero.actionBtn, { backgroundColor: cfg.color + '12', borderColor: cfg.color + '30' }]}
              onPress={() => Linking.openURL(`tel:${customer.phone}`)}
            >
              <MaterialCommunityIcons name="phone-outline" size={18} color={cfg.color} />
              <Text style={[hero.actionBtnText, { color: cfg.color }]}>Call</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[hero.actionBtn, { backgroundColor: cfg.color + '12', borderColor: cfg.color + '30' }]}
              onPress={() => Linking.openURL(`mailto:${customer.email}`)}
            >
              <MaterialCommunityIcons name="email-outline" size={18} color={cfg.color} />
              <Text style={[hero.actionBtnText, { color: cfg.color }]}>Email</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[hero.actionBtn, { backgroundColor: cfg.color + '12', borderColor: cfg.color + '30' }]}
              onPress={() => openMap(customer.address)}
            >
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={cfg.color} />
              <Text style={[hero.actionBtnText, { color: cfg.color }]}>Map</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Contact info ── */}
        <SectionCard title="Contact Information">
          <InfoRow icon="👤" label="Primary Contact" value={customer.contact} />
          <View style={sec.divider} />
          <InfoRow icon="📞" label="Phone"   value={customer.phone}   onPress={() => Linking.openURL(`tel:${customer.phone}`)} />
          <View style={sec.divider} />
          <InfoRow icon="✉️" label="Email"   value={customer.email}   onPress={() => Linking.openURL(`mailto:${customer.email}`)} />
          <View style={sec.divider} />
          <InfoRow icon="📍" label="Address" value={customer.address} onPress={() => openMap(customer.address)} />
        </SectionCard>

        {/* ── Stats ── */}
        <SectionCard title="Overview">
          <View style={ov.row}>
            <View style={ov.stat}>
              <Text style={[ov.num, { color: T.amber }]}>{customer.active_jobs}</Text>
              <Text style={ov.label}>Active{'\n'}Jobs</Text>
            </View>
            <View style={ov.divider} />
            <View style={ov.stat}>
              <Text style={[ov.num, { color: T.accent }]}>{customerJobs.length}</Text>
              <Text style={ov.label}>Total{'\n'}Jobs</Text>
            </View>
            <View style={ov.divider} />
            <View style={ov.stat}>
              <Text style={[ov.num, { color: T.green }]}>
                {customerJobs.filter(j => j.status === 'Completed').length}
              </Text>
              <Text style={ov.label}>Completed</Text>
            </View>
          </View>
        </SectionCard>

        {/* ── Related jobs ── */}
        <SectionCard title={`Jobs (${customerJobs.length})`}>
          {customerJobs.length > 0 ? (
            customerJobs.map((job, i) => (
              <React.Fragment key={job.id}>
                {i > 0 && <View style={sec.divider} />}
                <JobRow
                  job={job}
                  onPress={() => {
                    setSelectedJob(job);
                    navigation.navigate('JobDetail');
                  }}
                />
              </React.Fragment>
            ))
          ) : (
            <View style={ov.empty}>
              <Text style={ov.emptyText}>No jobs linked to this customer yet</Text>
            </View>
          )}
        </SectionCard>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  appbar:      { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle: { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:      { paddingBottom: 24 },
});

const hero = StyleSheet.create({
  card:          { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 16, borderRadius: 20, padding: 20, alignItems: 'center', borderTopWidth: 3, borderWidth: 1, borderColor: T.border },
  avatar:        { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarText:    { fontSize: 26, fontWeight: '800' },
  name:          { fontSize: 20, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.5, textAlign: 'center', marginBottom: 8 },
  typeBadge:     { paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, borderWidth: 1, marginBottom: 18 },
  typeBadgeText: { fontSize: 13, fontWeight: '700' },
  actions:       { flexDirection: 'row', gap: 8, width: '100%' },
  actionBtn:     { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12, borderWidth: 1, gap: 4 },
  actionBtnText: { fontSize: 11, fontWeight: '700' },
});

const sec = StyleSheet.create({
  card:    { backgroundColor: T.surface, marginHorizontal: 16, marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  title:   { fontSize: 12, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, paddingHorizontal: 16, paddingTop: 14, paddingBottom: 10 },
  divider: { height: 1, backgroundColor: T.border, marginHorizontal: 16 },
});

const ir = StyleSheet.create({
  wrapper:  { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  iconWrap: { width: 32, height: 32, borderRadius: 10, backgroundColor: T.surfaceAlt, justifyContent: 'center', alignItems: 'center' },
  icon:     { fontSize: 14 },
  text:     { flex: 1 },
  label:    { fontSize: 11, color: T.textMuted, fontWeight: '600', marginBottom: 2 },
  value:    { fontSize: 14, color: T.textPrimary, fontWeight: '500' },
  link:     { color: T.accent },
  arrow:    { fontSize: 20, color: T.textMuted, fontWeight: '300' },
});

const ov = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  stat:      { flex: 1, alignItems: 'center', paddingVertical: 8 },
  num:       { fontSize: 28, fontWeight: '800', letterSpacing: -1, lineHeight: 32 },
  label:     { fontSize: 11, color: T.textMuted, fontWeight: '600', textTransform: 'uppercase', textAlign: 'center', marginTop: 3, lineHeight: 15 },
  divider:   { width: 1, height: 44, backgroundColor: T.border },
  empty:     { paddingHorizontal: 16, paddingVertical: 20, alignItems: 'center' },
  emptyText: { fontSize: 13, color: T.textMuted },
});

const jr = StyleSheet.create({
  row:       { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  dot:       { width: 8, height: 8, borderRadius: 4 },
  body:      { flex: 1 },
  title:     { fontSize: 13, fontWeight: '700', color: T.textPrimary, marginBottom: 2 },
  meta:      { fontSize: 11, color: T.textMuted },
  badge:     { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  badgeText: { fontSize: 11, fontWeight: '700' },
});