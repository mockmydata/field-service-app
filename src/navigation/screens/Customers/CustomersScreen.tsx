import React, { useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as TextInputNative,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { T } from '../Home';
import { useCustomerContext } from '../../../shared/context/CustomerContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuth } from '../../../shared/context/AuthContext';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Customer {
  id: number;
  name: string;
  contact: string;
  phone: string;
  email: string;
  address: string;
  type: 'Commercial' | 'Residential' | 'Healthcare' | string;
  active_jobs: number;
}

// ─── Config ───────────────────────────────────────────────────────────────────
export const TYPE_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  Commercial:  { color: T.blue,    bg: '#EFF6FF', icon: '🏢' },
  Residential: { color: T.green,   bg: '#F0FDF4', icon: '🏠' },
  Healthcare:  { color: '#9333EA', bg: '#FAF5FF', icon: '🏥' },
};
export const ALL_TYPES = ['Commercial', 'Residential', 'Healthcare'];
export const getTypeCfg = (type: string) =>
  TYPE_CFG[type] ?? { color: T.textSecondary, bg: T.surfaceAlt, icon: '📍' };

export type CustomerFormData = Omit<Customer, 'id' | 'active_jobs'>;

// ─── Customer Card ────────────────────────────────────────────────────────────
function CustomerCard({ customer, onPress }: { customer: Customer; onPress: () => void }) {
  const cfg      = getTypeCfg(customer.type);
  const initials = customer.name.split(' ').slice(0, 2).map((w) => w[0]).join('');

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={cc.container}>
      <View style={[cc.accentBar, { backgroundColor: cfg.color }]} />
      <View style={[cc.avatar, { backgroundColor: cfg.color + '1A' }]}>
        <Text style={[cc.avatarText, { color: cfg.color }]}>{initials}</Text>
      </View>
      <View style={cc.body}>
        <View style={cc.topRow}>
          <Text style={cc.name} numberOfLines={1}>{customer.name}</Text>
          <View style={[cc.typeBadge, { backgroundColor: cfg.bg }]}>
            <Text style={[cc.typeBadgeText, { color: cfg.color }]}>{cfg.icon}  {customer.type}</Text>
          </View>
        </View>
        <Text style={cc.contact}>👤 {customer.contact}</Text>
        <Text style={cc.address} numberOfLines={1}>📍 {customer.address}</Text>
        <View style={cc.footerRow}>
          <TouchableOpacity
            onPress={(e) => { e.stopPropagation(); Linking.openURL(`tel:${customer.phone}`); }}
            style={cc.actionChip}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={cc.actionChipText}>📞 {customer.phone}</Text>
          </TouchableOpacity>
          {customer.active_jobs > 0 && (
            <View style={cc.jobsBadge}>
              <Text style={cc.jobsBadgeText}>
                {customer.active_jobs} active job{customer.active_jobs > 1 ? 's' : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
      <View style={cc.chevron}>
        <Text style={cc.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── States ───────────────────────────────────────────────────────────────────
function LoadingState() {
  return (
    <View style={ls.wrapper}>
      <ActivityIndicator size="large" color={T.accent} />
      <Text style={ls.text}>Loading customers…</Text>
    </View>
  );
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <View style={ls.wrapper}>
      <Text style={ls.errorIcon}>⚠️</Text>
      <Text style={ls.errorTitle}>Failed to load customers</Text>
      <Text style={ls.errorSub}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={ls.retryBtn} activeOpacity={0.8}>
        <Text style={ls.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

function EmptyState({ query }: { query: string }) {
  return (
    <View style={es.wrapper}>
      <Text style={es.icon}>{query ? '🔍' : '🏗️'}</Text>
      <Text style={es.title}>{query ? 'No results found' : 'No customers yet'}</Text>
      <Text style={es.sub}>
        {query ? `Nothing matched "${query}"` : 'Tap ⋮ to add your first customer'}
      </Text>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type FilterType = 'All' | 'Commercial' | 'Residential' | 'Healthcare';
const FILTERS: FilterType[] = ['All', 'Commercial', 'Residential', 'Healthcare'];

export default function CustomersScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { logout } = useAuth();

  const { customers, loading, error, fetchCustomers } = useCustomerContext();

  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [menuOpen,     setMenuOpen]     = useState(false);

  const filtered = customers.filter((c) => {
    const matchesType   = activeFilter === 'All' || c.type === activeFilter;
    const q             = search.toLowerCase();
    const matchesSearch = !q ||
      c.name.toLowerCase().includes(q) ||
      c.contact.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q);
    return matchesType && matchesSearch;
  });

  return (
    <View style={sc.root}>
      <Appbar.Header style={sc.appbar} statusBarHeight={insets.top}>
        <Appbar.Content title="Customers" titleStyle={sc.appbarTitle} />
        <Appbar.Action icon="dots-vertical" color="#fff" onPress={() => setMenuOpen(v => !v)} />
      </Appbar.Header>

{menuOpen && (
  <TouchableOpacity style={mn.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
    <View style={mn.sheet}>
      {[
        { icon: 'account-plus-outline', color: T.accent, label: 'Add Customer', sub: 'Create a new customer record', onPress: () => { setMenuOpen(false); navigation.navigate('AddCustomer'); } },
        { icon: 'refresh',              color: T.accent, label: 'Refresh',      sub: 'Reload customer list',         onPress: () => { setMenuOpen(false); fetchCustomers(); } },
        { icon: 'account-outline',      color: T.accent, label: 'Profile',      sub: 'Account settings',             onPress: () => { setMenuOpen(false); navigation.navigate('Profile'); } },
        { icon: 'logout',               color: T.red,    label: 'Sign Out',     sub: 'Log out of your account',      onPress: () => { setMenuOpen(false); logout(); } },
      ].map((item, i) => (
        <React.Fragment key={item.label}>
          {i > 0 && <View style={mn.divider} />}
          <TouchableOpacity style={mn.item} activeOpacity={0.75} onPress={item.onPress}>
            <MaterialCommunityIcons name={item.icon as any} size={20} color={item.color} />
            <View>
              <Text style={[mn.label, { color: item.color }]}>{item.label}</Text>
              <Text style={mn.sub}>{item.sub}</Text>
            </View>
          </TouchableOpacity>
        </React.Fragment>
      ))}
    </View>
  </TouchableOpacity>
)}

      <View style={sc.stickyHeader}>
        <View style={sc.searchWrap}>
          <Text style={sc.searchIcon}>🔍</Text>
          <TextInputNative
            style={sc.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search customers…"
            placeholderTextColor={T.textMuted}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={sc.filterRow}>
          {FILTERS.map((f) => {
            const isActive = f === activeFilter;
            const cfg      = f === 'All' ? null : getTypeCfg(f);
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[sc.filterChip, isActive && { backgroundColor: cfg ? cfg.color : T.accent, borderColor: cfg ? cfg.color : T.accent }]}
              >
                {cfg && <Text style={sc.filterIcon}>{cfg.icon}</Text>}
                <Text style={[sc.filterText, isActive && sc.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchCustomers} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(c) => String(c.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={sc.listContent}
          ListHeaderComponent={
            <Text style={sc.sectionLabel}>
              {filtered.length} {filtered.length === 1 ? 'customer' : 'customers'}
              {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
            </Text>
          }
          renderItem={({ item }) => (
            <CustomerCard
              customer={item}
              onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
            />
          )}
          ListEmptyComponent={<EmptyState query={search} />}
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  root:             { flex: 1, backgroundColor: T.bg },
  appbar:           { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:      { color: '#fff', fontWeight: '700', fontSize: 18 },
  stickyHeader:     { backgroundColor: T.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.border, gap: 10 },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, borderRadius: 12, height: 44, paddingHorizontal: 12, gap: 8 },
  searchIcon:       { fontSize: 14, lineHeight: 18 },
  searchInput:      { flex: 1, fontSize: 14, color: T.textPrimary, height: 44, padding: 0 },
  filterRow:        { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  filterChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border },
  filterIcon:       { fontSize: 12 },
  filterText:       { fontSize: 12, fontWeight: '600', color: T.textSecondary },
  filterTextActive: { color: '#fff' },
  listContent:      { paddingTop: 4, paddingBottom: 12 },
  sectionLabel:     { fontSize: 12, color: T.textMuted, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
});

const mn = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  sheet:    { position: 'absolute', top: 56, right: 12, width: 220, backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 12, overflow: 'hidden', zIndex: 101 },
  item:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  icon:     { fontSize: 18 },
  label:    { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  sub:      { fontSize: 11, color: T.textMuted, marginTop: 1 },
  divider:  { height: 1, backgroundColor: T.border },
});

const cc = StyleSheet.create({
  container:      { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 14, marginHorizontal: 16, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: T.border, alignItems: 'center' },
  accentBar:      { width: 4, alignSelf: 'stretch' },
  avatar:         { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  avatarText:     { fontSize: 15, fontWeight: '800' },
  body:           { flex: 1, paddingVertical: 12, paddingLeft: 12, paddingRight: 4, gap: 4 },
  topRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  name:           { flex: 1, fontSize: 14, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.2 },
  typeBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  typeBadgeText:  { fontSize: 11, fontWeight: '700' },
  contact:        { fontSize: 12, color: T.textSecondary },
  address:        { fontSize: 11, color: T.textMuted },
  footerRow:      { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' },
  actionChip:     { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surfaceAlt, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: T.border },
  actionChipText: { fontSize: 11, color: T.textSecondary, fontWeight: '500' },
  jobsBadge:      { backgroundColor: T.amber + '18', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, borderWidth: 1, borderColor: T.amber + '40' },
  jobsBadgeText:  { fontSize: 11, color: T.amber, fontWeight: '700' },
  chevron:        { justifyContent: 'center', paddingRight: 12, paddingLeft: 4 },
  chevronText:    { fontSize: 22, color: T.textMuted, fontWeight: '300' },
});

const ls = StyleSheet.create({
  wrapper:    { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, paddingVertical: 60 },
  text:       { fontSize: 14, color: T.textSecondary },
  errorIcon:  { fontSize: 36, marginBottom: 4 },
  errorTitle: { fontSize: 16, fontWeight: '700', color: T.textPrimary },
  errorSub:   { fontSize: 13, color: T.textMuted, textAlign: 'center', paddingHorizontal: 32 },
  retryBtn:   { marginTop: 8, paddingHorizontal: 24, paddingVertical: 10, borderRadius: 20, backgroundColor: T.accent },
  retryText:  { fontSize: 14, fontWeight: '700', color: '#fff' },
});

const es = StyleSheet.create({
  wrapper: { alignItems: 'center', paddingVertical: 64 },
  icon:    { fontSize: 40, marginBottom: 12 },
  title:   { fontSize: 16, fontWeight: '600', color: T.textSecondary },
  sub:     { fontSize: 13, color: T.textMuted, marginTop: 4 },
});