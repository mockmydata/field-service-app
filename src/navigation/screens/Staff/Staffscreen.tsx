import React, { useState } from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TextInput as TextInputNative,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { T } from '../Home';
import { useAuth } from '../../../shared/context/AuthContext';
import { useStaffContext } from '../../../shared/context/StaffContext';
import { Technician } from './Staff.constants';
import { LoadingState, ErrorState, EmptyState } from './States';
import { StaffCard } from './StaffCard';

// ─── Summary Bar ──────────────────────────────────────────────────────────────
function SummaryBar({ staff }: { staff: Technician[] }) {
  const available = staff.filter(t => t.available).length;
  const busy      = staff.length - available;

  return (
    <View style={sum.wrapper}>
      <View style={sum.stat}>
        <Text style={[sum.num, { color: T.accent }]}>{staff.length}</Text>
        <Text style={sum.label}>Total</Text>
      </View>
      <View style={sum.divider} />
      <View style={sum.stat}>
        <Text style={[sum.num, { color: T.green }]}>{available}</Text>
        <Text style={sum.label}>Available</Text>
      </View>
      <View style={sum.divider} />
      <View style={sum.stat}>
        <Text style={[sum.num, { color: T.red }]}>{busy}</Text>
        <Text style={sum.label}>Busy</Text>
      </View>
      <View style={sum.divider} />
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
type FilterType = 'All' | 'Available' | 'Busy';
const FILTERS: FilterType[] = ['All', 'Available', 'Busy'];

export default function StaffScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { isManager, logout }              = useAuth();
  const { staff, loading, error, fetchStaff } = useStaffContext();

  const [search,       setSearch]       = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');
  const [menuOpen,     setMenuOpen]     = useState(false);

  const filtered = staff.filter(t => {
    const matchesFilter =
      activeFilter === 'All' ||
      (activeFilter === 'Available' && t.available) ||
      (activeFilter === 'Busy' && !t.available);
    const q = search.toLowerCase();
    const matchesSearch =
      !q ||
      t.name.toLowerCase().includes(q) ||
      t.role.toLowerCase().includes(q) ||
      t.specialties.some(s => s.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  return (
    <View style={root.bg}>
      <Appbar.Header style={root.appbar} statusBarHeight={insets.top}>
        <Appbar.Content title="Staff" titleStyle={root.appbarTitle} />
        <Appbar.Action icon="dots-vertical" color="#fff" onPress={() => setMenuOpen(v => !v)} />
      </Appbar.Header>

      {menuOpen && (
        <TouchableOpacity style={mn.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
          <View style={mn.sheet}>
            {[
              {
                icon: 'account-plus-outline',
                color: isManager ? T.accent : T.textMuted,
                label: 'Add Staff',
                sub: isManager ? 'Create a new staff member' : 'Manager access required',
                onPress: () => { if (!isManager) return; setMenuOpen(false); navigation.navigate('AddStaff'); },
              },
              {
                icon: 'refresh',
                color: T.accent,
                label: 'Refresh',
                sub: 'Reload staff list',
                onPress: () => { setMenuOpen(false); fetchStaff(); },
              },
              {
                icon: 'account-outline',
                color: T.accent,
                label: 'Profile',
                sub: 'Account settings',
                onPress: () => { setMenuOpen(false); navigation.navigate('Profile'); },
              },
              {
                icon: 'logout',
                color: T.red,
                label: 'Sign Out',
                sub: 'Log out of your account',
                onPress: () => { setMenuOpen(false); logout(); },
              },
            ].map((item, i) => (
              <React.Fragment key={item.label}>
                {i > 0 && <View style={mn.divider} />}
                <TouchableOpacity
                  style={mn.item}
                  activeOpacity={item.label === 'Add Staff' && !isManager ? 1 : 0.75}
                  onPress={item.onPress}
                >
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

      <View style={root.stickyHeader}>
        <View style={root.searchWrap}>
          <Text style={root.searchIcon}>🔍</Text>
          <TextInputNative
            style={root.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search staff…"
            placeholderTextColor={T.textMuted}
            returnKeyType="search"
            clearButtonMode="while-editing"
          />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={root.filterRow}>
          {FILTERS.map(f => {
            const isActive = f === activeFilter;
            const color    = f === 'Available' ? T.green : f === 'Busy' ? T.red : T.accent;
            return (
              <TouchableOpacity
                key={f}
                onPress={() => setActiveFilter(f)}
                style={[root.filterChip, isActive && { backgroundColor: color, borderColor: color }]}
              >
                <Text style={[root.filterText, isActive && root.filterTextActive]}>{f}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <LoadingState text="Loading staff…" />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchStaff} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={t => String(t.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={root.listContent}
          ListHeaderComponent={
            <>
              <SummaryBar staff={staff} />
              <Text style={root.sectionLabel}>
                {filtered.length} {filtered.length === 1 ? 'member' : 'members'}
                {activeFilter !== 'All' ? ` · ${activeFilter}` : ''}
              </Text>
            </>
          }
          renderItem={({ item }) => (
            <StaffCard
              tech={item}
              onPress={() => navigation.navigate('StaffDetail', { staff: item })}
            />
          )}
          ListEmptyComponent={
            <EmptyState
              query={search}
              icon="👷"
              subtitle="Tap ⋮ to add your first staff member"
            />
          }
          ListFooterComponent={<View style={{ height: 100 }} />}
        />
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const root = StyleSheet.create({
  bg:               { flex: 1, backgroundColor: T.bg },
  appbar:           { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:      { color: '#fff', fontWeight: '700', fontSize: 18 },
  stickyHeader:     { backgroundColor: T.surface, paddingHorizontal: 16, paddingTop: 12, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: T.border, gap: 10 },
  searchWrap:       { flexDirection: 'row', alignItems: 'center', backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, borderRadius: 12, height: 44, paddingHorizontal: 12, gap: 8 },
  searchIcon:       { fontSize: 14, lineHeight: 18 },
  searchInput:      { flex: 1, fontSize: 14, color: T.textPrimary, height: 44, padding: 0 },
  filterRow:        { flexDirection: 'row', gap: 8, paddingVertical: 2 },
  filterChip:       { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, backgroundColor: T.bg, borderWidth: 1, borderColor: T.border },
  filterText:       { fontSize: 12, fontWeight: '600', color: T.textSecondary },
  filterTextActive: { color: '#fff' },
  listContent:      { paddingTop: 4, paddingBottom: 12 },
  sectionLabel:     { fontSize: 12, color: T.textMuted, fontWeight: '600', paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8, textTransform: 'uppercase', letterSpacing: 0.4 },
});

const mn = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  sheet:    { position: 'absolute', top: 56, right: 12, width: 220, backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.1, shadowRadius: 16, elevation: 12, overflow: 'hidden', zIndex: 101 },
  item:     { flexDirection: 'row', alignItems: 'center', padding: 14, gap: 12 },
  label:    { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  sub:      { fontSize: 11, color: T.textMuted, marginTop: 1 },
  divider:  { height: 1, backgroundColor: T.border },
});

const sum = StyleSheet.create({
  wrapper: { flexDirection: 'row', backgroundColor: T.surface, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: T.border },
  stat:    { flex: 1, alignItems: 'center' },
  num:     { fontSize: 24, fontWeight: '800', letterSpacing: -0.5, lineHeight: 28 },
  label:   { fontSize: 10, color: T.textMuted, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 2 },
  divider: { width: 1, backgroundColor: T.border, marginVertical: 4 },
});