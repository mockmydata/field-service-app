// ─── QuotaBanner.tsx ──────────────────────────────────────────────────────────
import React from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Modal, Portal } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuota } from '../context/QuotaContext';

const BASE_URL = 'https://dev.mockmydata.io';

const CONTENT = {
  ANONYMOUS: {
    icon:       'account-plus-outline' as const,
    iconColor:  '#7C3AED',
    title:      'Session Limit Reached',
    body:       (used: number, limit: number) =>
      `You've used all ${limit} demo requests. To save your endpoints, sign up in the browser where you started this tutorial.`,
    upgradeLabel: 'Sign Up Free',
    upgradeUrl:   `${BASE_URL}/auth?mode=signup`,
  },
  FREE: {
    icon:       'alert-circle-outline' as const,
    iconColor:  '#D97706',
    title:      'Daily Limit Reached',
    body:       (used: number, limit: number) =>
      `You've used all ${limit} requests for today. Resets at midnight UTC. Upgrade to Pro for unlimited.`,
    upgradeLabel: 'Upgrade to Pro',
    upgradeUrl:   `${BASE_URL}/settings?section=billing`,
  },
};

export function QuotaBanner() {
  const { quotaExceeded, quotaState, setQuotaExceeded } = useQuota();

  if (!quotaExceeded) return null;

  const plan    = quotaState.plan ?? 'FREE';
  const content = CONTENT[plan] ?? CONTENT.FREE;
  const { icon, iconColor, title, upgradeLabel, upgradeUrl } = content;
  const body = content.body(quotaState.requestsUsed, quotaState.limit);

  return (
    <Portal>
      <Modal
        visible={quotaExceeded}
        onDismiss={() => setQuotaExceeded(false)}
        contentContainerStyle={qs.modal}
      >
        <View style={[qs.iconWrap, { backgroundColor: iconColor + '18' }]}>
          <MaterialCommunityIcons name={icon} size={40} color={iconColor} />
        </View>

        <Text style={qs.title}>{title}</Text>
        <Text style={qs.body}>{body}</Text>

        {/* Usage pill */}
        {quotaState.limit > 0 && (
          <View style={qs.usagePill}>
            <Text style={qs.usageText}>
              {quotaState.requestsUsed} / {quotaState.limit} requests used
            </Text>
          </View>
        )}
        <TouchableOpacity
          style={[qs.upgradeBtn, { backgroundColor: iconColor, opacity: plan === 'ANONYMOUS' ? 0.5 : 1 }]}
          onPress={() => plan !== 'ANONYMOUS' && Linking.openURL(upgradeUrl)}
          activeOpacity={plan === 'ANONYMOUS' ? 1 : 0.85}
          disabled={plan === 'ANONYMOUS'}
        >
          <MaterialCommunityIcons name="arrow-up-circle-outline" size={16} color="#fff" />
          <Text style={qs.upgradeBtnText}>{upgradeLabel}</Text>
        </TouchableOpacity>

        {plan === 'ANONYMOUS' && (
          <Text style={{ color: '#94a3b8', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
            Visit mockmydata.io in your browser
          </Text>
        )}
      </Modal>
    </Portal>
  );
}

const qs = StyleSheet.create({
  modal:          { backgroundColor: '#fff', marginHorizontal: 24, borderRadius: 20, padding: 28, alignItems: 'center' },
  iconWrap:       { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  title:          { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  body:           { fontSize: 14, color: '#6B7280', lineHeight: 22, textAlign: 'center', marginBottom: 12 },
  usagePill:      { backgroundColor: '#F3F4F6', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, marginBottom: 20 },
  usageText:      { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  upgradeBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10, marginBottom: 10, width: '100%', justifyContent: 'center' },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  dismissBtn:     { paddingVertical: 8 },
  dismissText:    { fontSize: 14, color: '#9CA3AF' },
});