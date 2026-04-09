import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Job } from '../../types/types';
import { calcEndTime, formatTimeRange } from '../TimeHelpers';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  allJobs:    Job[];
  dayJobs:    Job[];
  dateKey:    string;
  onPressJob: (job: Job) => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DEFAULT_REGION = {
  latitude:       29.7604,
  longitude:      -95.3698,
  latitudeDelta:  0.08,
  longitudeDelta: 0.08,
};

function regionForJobs(jobs: Job[]) {
  const first = jobs.find(j => j.latitude != null && j.longitude != null);
  if (!first) return DEFAULT_REGION;
  return {
    latitude:       first.latitude!,
    longitude:      first.longitude!,
    latitudeDelta:  0.08,
    longitudeDelta: 0.08,
  };
}

// ─── Status Colors ────────────────────────────────────────────────────────────
function statusColors(status: string) {
  switch (status) {
    case 'Completed':   return { color: '#16A34A', bg: '#F0FDF4' };
    case 'In Progress': return { color: '#D97706', bg: '#FFFBEB' };
    case 'Cancelled':   return { color: '#DC2626', bg: '#FEF2F2' };
    case 'Enroute':     return { color: '#7C3AED', bg: '#F5F3FF' };
    case 'Arrived':     return { color: '#D97706', bg: '#FFFBEB' };
    default:            return { color: '#2D73DE', bg: '#EFF6FF' };
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function JobMapView({ allJobs = [], dayJobs = [], dateKey, onPressJob }: Props) {
  const initialRegion = regionForJobs(dayJobs.length > 0 ? dayJobs : allJobs);

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={{ flex: 1 }}
        provider={PROVIDER_GOOGLE}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {dayJobs
          .filter(j => j.latitude != null && j.longitude != null)
          .map(job => {
            const { color } = statusColors(job.status);
            return (
              <Marker
                key={job.id}
                coordinate={{ latitude: job.latitude!, longitude: job.longitude! }}
                tracksViewChanges={false}
                pinColor={color}
              />
            );
          })}
      </MapView>

      {/* ── Empty state ── */}
      {dayJobs.length === 0 && (
        <View style={styles.emptyOverlay} pointerEvents="none">
          <View style={styles.emptyCard}>
            <Text style={styles.emptyIcon}>🗺️</Text>
            <Text style={styles.emptyTitle}>No jobs today</Text>
            <Text style={styles.emptySub}>Tap + to schedule one</Text>
          </View>
        </View>
      )}

      {/* ── Bottom job strip ── */}
      {dayJobs.length > 0 && (
        <View style={strip.wrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={strip.scroll}
          >
            {dayJobs.map(job => {
              const { color, bg } = statusColors(job.status);
              const timeRange = formatTimeRange(job.time, job.duration);
              return (
                <TouchableOpacity
                  key={job.id}
                  style={strip.card}
                  onPress={() => onPressJob(job)}
                  activeOpacity={0.85}
                >
                  <View style={[strip.cardAccent, { backgroundColor: color }]} />
                  <View style={strip.cardBody}>
                    <Text style={strip.cardTitle} numberOfLines={1}>{job.title}</Text>
                    <Text style={strip.cardMeta} numberOfLines={1}>📍 {job.location}</Text>
                    {timeRange ? <Text style={strip.cardMeta}>🕐 {timeRange}</Text> : null}
                    <View style={[strip.badge, { backgroundColor: bg }]}>
                      <Text style={[strip.badgeText, { color }]}>{job.status}</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const strip = StyleSheet.create({
  wrapper:    { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(255,255,255,0.97)', borderTopWidth: 1, borderTopColor: '#E4E8F0', paddingTop: 10, paddingBottom: 12 },
  scroll:     { paddingHorizontal: 12, gap: 10 },
  card:       { width: 200, marginBottom: 2, backgroundColor: '#fff', borderRadius: 14, borderWidth: 1, borderColor: '#E4E8F0', flexDirection: 'row', overflow: 'hidden', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 6, elevation: 3 },
  cardAccent: { width: 4 },
  cardBody:   { flex: 1, padding: 10, gap: 3 },
  cardTitle:  { fontSize: 13, fontWeight: '700', color: '#111827' },
  cardMeta:   { fontSize: 11, color: '#6B7280' },
  badge:      { alignSelf: 'flex-start', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, marginTop: 2 },
  badgeText:  { fontSize: 10, fontWeight: '700' },
});

const styles = StyleSheet.create({
  emptyOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  emptyCard:    { backgroundColor: '#fff', borderRadius: 18, padding: 24, alignItems: 'center', gap: 6, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  emptyIcon:    { fontSize: 34 },
  emptyTitle:   { fontSize: 16, fontWeight: '700', color: '#111827' },
  emptySub:     { fontSize: 13, color: '#9CA3AF' },
  legend:       { position: 'absolute', top: 12, right: 12, backgroundColor: '#FFFFFFF0', borderRadius: 10, padding: 10, gap: 5, borderWidth: 1, borderColor: '#E4E8F0' },
  legendRow:    { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:    { width: 8, height: 8, borderRadius: 4 },
  legendLabel:  { fontSize: 10, color: '#6B7280', fontWeight: '600' },
});