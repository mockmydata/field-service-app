import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { T } from '../Home';

// ─── Loading ──────────────────────────────────────────────────────────────────
export function LoadingState({ text = 'Loading…' }: { text?: string }) {
  return (
    <View style={ls.wrapper}>
      <ActivityIndicator size="large" color={T.accent} />
      <Text style={ls.text}>{text}</Text>
    </View>
  );
}

// ─── Error ────────────────────────────────────────────────────────────────────
export function ErrorState({
  message, onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <View style={ls.wrapper}>
      <Text style={ls.errorIcon}>⚠️</Text>
      <Text style={ls.errorTitle}>Something went wrong</Text>
      <Text style={ls.errorSub}>{message}</Text>
      <TouchableOpacity onPress={onRetry} style={ls.retryBtn} activeOpacity={0.8}>
        <Text style={ls.retryText}>Try Again</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Empty ────────────────────────────────────────────────────────────────────
export function EmptyState({
  query, icon = '📭', title, subtitle,
}: {
  query?: string;
  icon?: string;
  title?: string;
  subtitle?: string;
}) {
  const defaultTitle    = query ? 'No results found'               : (title    ?? 'Nothing here yet');
  const defaultSubtitle = query ? `Nothing matched "${query}"`     : (subtitle ?? '');
  return (
    <View style={es.wrapper}>
      <Text style={es.icon}>{query ? '🔍' : icon}</Text>
      <Text style={es.title}>{defaultTitle}</Text>
      {defaultSubtitle ? <Text style={es.sub}>{defaultSubtitle}</Text> : null}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
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