import React, { useRef, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  Appbar,
  Modal,
  Portal,
} from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Job, Status } from '../../types/types';
import { useJobContext } from '../../shared/context/JobContext';
import JobMapView from '../../shared/components/JobMapView';
import { Calendar } from 'react-native-calendars';
import { StatusBar } from 'expo-status-bar';
import { calcEndTime } from '../../shared/TimeHelpers';
import { useAuth } from '../../shared/context/AuthContext';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// ─── Theme ────────────────────────────────────────────────────────────────────
export const T = {
  bg: '#F4F6FA',
  surface: '#FFFFFF',
  surfaceAlt: '#F0F2F8',
  border: '#E4E8F0',
  accent: '#2D73DE',
  green: '#16A34A',
  amber: '#D97706',
  blue: '#2D73DE',
  red: '#DC2626',
  textPrimary: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  appbar: '#2D73DE',
};

export const STATUS_CFG: Record<string, { color: string; bg: string; icon: string; label: string }> = {
  'Scheduled':   { color: T.blue,    bg: '#EFF6FF', icon: '◷', label: 'Scheduled'   },
  'In Progress': { color: T.amber,   bg: '#FFFBEB', icon: '⚡', label: 'In Progress' },
  'Completed':   { color: T.green,   bg: '#F0FDF4', icon: '✓', label: 'Completed'   },
  'Cancelled':   { color: T.red,     bg: '#FEF2F2', icon: '✕', label: 'Cancelled'   },
  'Enroute':     { color: '#7C3AED', bg: '#F5F3FF', icon: '🚗', label: 'Enroute'    },
  'Arrived':     { color: T.amber,   bg: '#FFFBEB', icon: '📍', label: 'Arrived'    },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const ALL_STATUSES: Status[] = ['Scheduled', 'In Progress', 'Completed', 'Cancelled'];

export function toKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function buildMonthDates(year: number, month: number): Date[] {
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => new Date(year, month, i + 1));
}

// ─── View Toggle ──────────────────────────────────────────────────────────────
type ViewMode = 'list' | 'map';

function ViewToggle({ mode, onChange }: { mode: ViewMode; onChange: (m: ViewMode) => void }) {
  return (
    <View style={toggle.wrapper}>
      {(['list', 'map'] as ViewMode[]).map(m => (
        <TouchableOpacity
          key={m}
          onPress={() => onChange(m)}
          activeOpacity={0.8}
          style={[toggle.btn, mode === m && toggle.btnActive]}
        >
          <Text style={toggle.icon}>{m === 'list' ? '☰' : '⊕'}</Text>
          <Text style={[toggle.label, mode === m && toggle.labelActive]}>
            {m === 'list' ? 'List' : 'Map'}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// ─── Strip Calendar ───────────────────────────────────────────────────────────
function StripCalendar({ jobs, selectedDate, onSelectDate }: {
  jobs: Job[];
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
}) {
  const listRef = useRef<FlatList>(null);
  const today   = new Date();
  const dates   = buildMonthDates(selectedDate.getFullYear(), selectedDate.getMonth());
  const activeIndex = Math.min(Math.max(selectedDate.getDate() - 1, 0), dates.length - 1);

  const jobsByDate = jobs.reduce<Record<string, number>>((acc, j) => {
    acc[j.date] = (acc[j.date] ?? 0) + 1;
    return acc;
  }, {});

  useEffect(() => {
    setTimeout(() => {
      const index = Math.min(Math.max(activeIndex, 0), dates.length - 1);
      if (index >= 0 && index < dates.length) {
        listRef.current?.scrollToIndex({ animated: true, index, viewPosition: 0.5 });
      }
    }, 150);
  }, [activeIndex, selectedDate.getMonth()]);

  return (
    <View style={strip.wrapper}>
      <FlatList
        ref={listRef}
        data={dates}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => String(i)}
        getItemLayout={(_, index) => ({ length: 62, offset: 62 * index, index })}
        onScrollToIndexFailed={() => {}}
        contentContainerStyle={{ paddingHorizontal: 8 }}
        renderItem={({ item, index }) => {
          const isActive = index === activeIndex;
          const isToday  = toKey(item) === toKey(today);
          const count    = jobsByDate[toKey(item)] ?? 0;
          return (
            <TouchableOpacity
              onPress={() => onSelectDate(item)}
              style={[strip.cell, isActive && strip.cellActive, isToday && !isActive && strip.cellToday]}
              activeOpacity={0.75}
            >
              <Text style={[strip.weekday, isActive && strip.textActive, isToday && !isActive && strip.todayText]}>
                {WEEKDAYS[item.getDay()]}
              </Text>
              <Text style={[strip.day, isActive && strip.textActive, isToday && !isActive && strip.todayText]}>
                {item.getDate()}
              </Text>
              {count > 0
                ? <View style={[strip.dot, isActive && strip.dotActive]} />
                : <View style={strip.dotPlaceholder} />
              }
            </TouchableOpacity>
          );
        }}
      />
      <View style={strip.divider} />
    </View>
  );
}

// ─── Job Card ─────────────────────────────────────────────────────────────────
function JobCard({ job, onPress }: { job: Job; onPress: () => void }) {
  const cfg     = STATUS_CFG[job.status] ?? STATUS_CFG['Scheduled'];
  const endTime = calcEndTime(job.time, job.duration);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82} style={jc.container}>
      <View style={[jc.accent, { backgroundColor: cfg.color }]} />
      <View style={jc.body}>
        <View style={jc.topRow}>
          <Text style={jc.title}>{job.title}</Text>
          <View style={[jc.badge, { backgroundColor: cfg.bg }]}>
            <Text style={[jc.badgeText, { color: cfg.color }]}>{cfg.icon}  {job.status}</Text>
          </View>
        </View>
        <Text style={jc.meta}>📍 {job.location}</Text>
        {job.time && (
          <Text style={jc.meta}>
            🕐 {job.time}{endTime ? ` – ${endTime}` : ''}
          </Text>
        )}
        {job.assignee && (
          <View style={jc.assigneeRow}>
            <View style={jc.avatar}>
              <Text style={jc.avatarText}>{job.assignee.split(' ').map(w => w[0]).join('')}</Text>
            </View>
            <Text style={jc.assigneeText}>{job.assignee}</Text>
            {job.notes && <Text style={jc.noteChip}>📝 Note</Text>}
            {(job.photos?.length ?? 0) > 0 && (
              <Text style={jc.noteChip}>📷 {job.photos!.length}</Text>
            )}
          </View>
        )}
      </View>
      <View style={jc.chevron}>
        <Text style={jc.chevronText}>›</Text>
      </View>
    </TouchableOpacity>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────
export default function HomeScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const {
    jobs, loading, selectedDate, setSelectedDate, setSelectedJob, fetchJobs,
  } = useJobContext();

  const [viewMode,     setViewMode]     = useState<ViewMode>('list');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [menuOpen,     setMenuOpen]     = useState(false);
  const { logout } = useAuth();

  const dateKey = toKey(selectedDate);
  const dayJobs = jobs.filter(j => j.date === dateKey);

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    navigation.navigate('JobDetail');
  };

  return (
    <View style={sc.root}>
      <StatusBar style="light" />
      <Appbar.Header style={sc.appbar} statusBarHeight={insets.top}>
        <Appbar.Content title="Field Manager" titleStyle={sc.appbarTitle} />
        <Appbar.Action icon="dots-vertical" color="#fff" onPress={() => setMenuOpen(v => !v)} />
      </Appbar.Header>

{/* ── Dropdown menu ── */}
{menuOpen && (
  <TouchableOpacity style={mn.backdrop} activeOpacity={1} onPress={() => setMenuOpen(false)}>
    <View style={mn.sheet}>
      {[
        { icon: 'plus-circle-outline', color: T.accent, label: 'Add Job',     sub: 'Schedule for selected day',  onPress: () => { setMenuOpen(false); navigation.navigate('AddJob'); } },
        { icon: 'calendar-month',      color: T.accent, label: 'Change Date', sub: 'Jump to any day or month',   onPress: () => { setMenuOpen(false); setCalendarOpen(true); } },
        { icon: 'refresh',             color: T.accent, label: 'Refresh',     sub: 'Reload all jobs',            onPress: () => { setMenuOpen(false); fetchJobs(); } },
        { icon: 'account-outline',     color: T.accent, label: 'Profile',     sub: 'Account settings',           onPress: () => { setMenuOpen(false); navigation.navigate('Profile'); } },
        { icon: 'logout',              color: T.red,    label: 'Sign Out',    sub: 'Log out of your account',    onPress: () => { setMenuOpen(false); logout(); } },
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
    {loading ? (
  <View style={sc.loader}>
    <ActivityIndicator size="large" color={T.accent} />
    <Text style={sc.loaderText}>Loading jobs…</Text>
  </View>
) : (
  <View style={{ flex: 1 }}>

    <StripCalendar
      jobs={jobs}
      selectedDate={selectedDate}
      onSelectDate={setSelectedDate}
    />

    {viewMode === 'list' ? (
      <ScrollView style={sc.scroll} showsVerticalScrollIndicator={false}>

        <View style={sc.dayHeader}>
          <View>
            <Text style={sc.dayTitle}>{formattedDate}</Text>
            <View style={[sc.countBadge, dayJobs.length === 0 && sc.countBadgeEmpty]}>
              <Text style={[sc.countText, dayJobs.length === 0 && sc.countTextEmpty]}>
                {dayJobs.length === 0 ? 'No jobs' : `${dayJobs.length} job${dayJobs.length > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </View>
        <View style={sc.jobList}>
          {dayJobs.length > 0 ? (
            dayJobs.map(job => (
              <JobCard key={job.id} job={job} onPress={() => handleSelectJob(job)} />
            ))
          ) : (
            <View style={sc.empty}>
              <Text style={sc.emptyIcon}>🌿</Text>
              <Text style={sc.emptyText}>Nothing scheduled</Text>
              <Text style={sc.emptySubtext}>Tap ⋮ to add a job for this day</Text>
            </View>
          )}
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>
    ) : (
      <View style={{ flex: 1 }}>
        <View style={sc.dayHeader}>
          <View>
            <Text style={sc.dayTitle}>{formattedDate}</Text>
            <View style={[sc.countBadge, dayJobs.length === 0 && sc.countBadgeEmpty]}>
              <Text style={[sc.countText, dayJobs.length === 0 && sc.countTextEmpty]}>
                {dayJobs.length === 0 ? 'No jobs' : `${dayJobs.length} job${dayJobs.length > 1 ? 's' : ''}`}
              </Text>
            </View>
          </View>
          <ViewToggle mode={viewMode} onChange={setViewMode} />
        </View>
        <JobMapView
          allJobs={jobs}
          dayJobs={dayJobs}
          dateKey={dateKey}
          onPressJob={handleSelectJob}
        />
      </View>
    )}

  </View>
)}

      {/* ── Calendar picker modal ── */}
      <Portal>
        <Modal visible={calendarOpen} onDismiss={() => setCalendarOpen(false)} contentContainerStyle={sc.calModal}>
          <Calendar
            current={dateKey}
            onDayPress={(day: { dateString: string }) => {
              const [y, m, d] = day.dateString.split('-').map(Number);
              setSelectedDate(new Date(y, m - 1, d));
              setCalendarOpen(false);
            }}
            markedDates={{ [dateKey]: { selected: true, selectedColor: T.accent } }}
            theme={{
              backgroundColor: T.surface,
              calendarBackground: T.surface,
              selectedDayBackgroundColor: T.accent,
              selectedDayTextColor: '#fff',
              todayTextColor: T.accent,
              dayTextColor: T.textPrimary,
              textDisabledColor: T.textMuted,
              monthTextColor: T.textPrimary,
              arrowColor: T.accent,
              textMonthFontWeight: '700' as any,
              textDayFontSize: 14,
              textMonthFontSize: 15,
            }}
          />
        </Modal>
      </Portal>

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const sc = StyleSheet.create({
  root:            { flex: 1, backgroundColor: T.bg },
  appbar:          { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:     { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:          { flex: 1 },
  loader:          { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loaderText:      { fontSize: 14, color: T.textSecondary },
  dayHeader:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingTop: 18, paddingBottom: 10, backgroundColor: T.bg },
  dayTitle:        { fontSize: 15, fontWeight: '600', color: T.textPrimary },
  countBadge:      { backgroundColor: T.accent + '18', paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4, alignSelf: 'flex-start' },
  countBadgeEmpty: { backgroundColor: T.surfaceAlt },
  countText:       { fontSize: 12, color: T.accent, fontWeight: '700' },
  countTextEmpty:  { color: T.textMuted },
  jobList:         { paddingHorizontal: 16 },
  empty:           { alignItems: 'center', paddingVertical: 52 },
  emptyIcon:       { fontSize: 38, marginBottom: 10 },
  emptyText:       { fontSize: 16, color: T.textSecondary, fontWeight: '600' },
  emptySubtext:    { fontSize: 13, color: T.textMuted, marginTop: 4 },
  calModal:        { backgroundColor: T.surface, marginHorizontal: 20, marginVertical: 60, borderRadius: 24, padding: 20, overflow: 'hidden' },
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

const hdr = StyleSheet.create({
  wrapper:          { backgroundColor: T.surface, paddingHorizontal: 16, paddingTop: 20, paddingBottom: 20, borderBottomWidth: 1, borderBottomColor: T.border },
  topRow:           { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 },
  greeting:         { fontSize: 21, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.4 },
  subtitle:         { fontSize: 13, color: T.textSecondary, marginTop: 2 },
  totalBadge:       { flexDirection: 'row', alignItems: 'center', backgroundColor: T.accent + '12', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 8, gap: 8, borderWidth: 1, borderColor: T.accent + '30' },
  totalNum:         { fontSize: 28, fontWeight: '800', color: T.accent, lineHeight: 32 },
  totalLabel:       { fontSize: 11, color: T.textSecondary, lineHeight: 14 },
  progressSection:  { marginBottom: 18 },
  progressLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 7 },
  progressLabel:    { fontSize: 12, color: T.textSecondary },
  progressPct:      { fontSize: 12, fontWeight: '700' },
  progressTrack:    { height: 7, backgroundColor: T.surfaceAlt, borderRadius: 4, overflow: 'hidden', borderWidth: 1, borderColor: T.border },
  progressFill:     { height: '100%', backgroundColor: T.green, borderRadius: 4 },
  cardRow:          { flexDirection: 'row', gap: 10 },
});

const stat = StyleSheet.create({
  card:     { flex: 1, backgroundColor: T.surfaceAlt, borderRadius: 14, padding: 12, borderWidth: 1, borderColor: T.border, alignItems: 'flex-start', gap: 3 },
  iconWrap: { width: 30, height: 30, borderRadius: 9, justifyContent: 'center', alignItems: 'center', marginBottom: 4 },
  icon:     { fontSize: 14, fontWeight: '700' },
  value:    { fontSize: 26, fontWeight: '800', letterSpacing: -1, lineHeight: 30 },
  label:    { fontSize: 10, color: T.textMuted, fontWeight: '600', letterSpacing: 0.3, textTransform: 'uppercase' },
});

const strip = StyleSheet.create({
  wrapper:        { paddingTop: 10, backgroundColor: T.bg },
  cell:           { width: 54, height: 68, marginHorizontal: 3, borderRadius: 14, backgroundColor: T.surface, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: T.border },
  cellActive:     { backgroundColor: T.accent, borderColor: T.accent, shadowColor: T.accent, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 6, elevation: 5 },
  cellToday:      { borderColor: T.accent, borderWidth: 1.5 },
  weekday:        { fontSize: 10, color: T.textMuted, marginBottom: 2, fontWeight: '600' },
  day:            { fontSize: 18, fontWeight: '700', color: T.textPrimary },
  textActive:     { color: '#ffffff' },
  todayText:      { color: T.accent },
  dot:            { width: 5, height: 5, borderRadius: 3, backgroundColor: T.accent, marginTop: 3 },
  dotActive:      { backgroundColor: 'rgba(255,255,255,0.85)' },
  dotPlaceholder: { width: 5, height: 5, marginTop: 3 },
  divider:        { height: 1, backgroundColor: T.border, marginTop: 14 },
});

const toggle = StyleSheet.create({
  wrapper:     { flexDirection: 'row', backgroundColor: T.surfaceAlt, borderRadius: 10, padding: 3, borderWidth: 1, borderColor: T.border },
  btn:         { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 8, gap: 5 },
  btnActive:   { backgroundColor: T.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 2 },
  icon:        { fontSize: 13, color: T.textSecondary },
  label:       { fontSize: 12, fontWeight: '600', color: T.textMuted },
  labelActive: { color: T.accent },
});

const jc = StyleSheet.create({
  container:    { flexDirection: 'row', backgroundColor: T.surface, borderRadius: 14, marginBottom: 10, overflow: 'hidden', borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3, elevation: 2 },
  accent:       { width: 4 },
  body:         { flex: 1, padding: 14, gap: 5 },
  topRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  title:        { flex: 1, fontSize: 14, fontWeight: '700', color: T.textPrimary, letterSpacing: -0.2 },
  badge:        { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeText:    { fontSize: 11, fontWeight: '700' },
  meta:         { fontSize: 12, color: T.textSecondary },
  assigneeRow:  { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 },
  avatar:       { width: 20, height: 20, borderRadius: 10, backgroundColor: T.accent + '20', justifyContent: 'center', alignItems: 'center' },
  avatarText:   { fontSize: 9, fontWeight: '800', color: T.accent },
  assigneeText: { fontSize: 11, color: T.textSecondary, flex: 1 },
  noteChip:     { fontSize: 10, color: T.textMuted, backgroundColor: T.surfaceAlt, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  chevron:      { justifyContent: 'center', paddingRight: 12 },
  chevronText:  { fontSize: 22, color: T.textMuted, fontWeight: '300' },
});