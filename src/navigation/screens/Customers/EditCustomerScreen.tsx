import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Appbar, Button, TextInput as PaperInput } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { T } from '../Home';
import { getTypeCfg, ALL_TYPES, Customer } from './CustomersScreen';
import { CustomersAPI } from '../../../shared/api/api';
import { useCustomerContext } from '../../../shared/context/CustomerContext';

export default function EditCustomerScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route      = useRoute();
  const { customerId } = route.params as { customerId: number };
  const { customers, updateCustomer } = useCustomerContext();
  const customer = customers.find(c => c.id === customerId)!;

  const [name,    setName]    = useState(customer.name);
  const [contact, setContact] = useState(customer.contact);
  const [phone,   setPhone]   = useState(customer.phone);
  const [email,   setEmail]   = useState(customer.email);
  const [address, setAddress] = useState(customer.address);
  const [type,    setType]    = useState(customer.type);
  const [saving,  setSaving]  = useState(false);

  const handleSave = async () => {
    if (!name.trim() || !contact.trim()) {
      Alert.alert('Required', 'Name and primary contact are required.');
      return;
    }

    const updated: Customer = {
      ...customer,
      name:    name.trim(),
      contact: contact.trim(),
      phone:   phone.trim(),
      email:   email.trim(),
      address: address.trim(),
      type,
    };

    setSaving(true);
    try {
      const saved = await CustomersAPI.update(customer.id, updated);
      updateCustomer(saved);
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Error', e?.message ?? 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content title="Edit Customer" titleStyle={s.appbarTitle} />
      </Appbar.Header>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView
          contentContainerStyle={s.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={s.section}>
            <Text style={s.sectionLabel}>Customer Type</Text>
            <View style={s.chipRow}>
              {ALL_TYPES.map(t => {
                const cfg      = getTypeCfg(t);
                const isActive = type === t;
                return (
                  <TouchableOpacity
                    key={t}
                    onPress={() => setType(t)}
                    style={[s.chip, isActive && { backgroundColor: cfg.color, borderColor: cfg.color }]}
                  >
                    <Text style={s.chipIcon}>{cfg.icon}</Text>
                    <Text style={[s.chipText, isActive && { color: '#fff' }]}>{t}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={s.section}>
            <Text style={s.sectionLabel}>Details</Text>
            <PaperInput
              label="Company / Property Name *"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={s.input}
              returnKeyType="next"
            />
            <PaperInput
              label="Primary Contact *"
              value={contact}
              onChangeText={setContact}
              mode="outlined"
              style={s.input}
              returnKeyType="next"
            />
            <PaperInput
              label="Phone"
              value={phone}
              onChangeText={setPhone}
              mode="outlined"
              style={s.input}
              keyboardType="phone-pad"
              returnKeyType="next"
            />
            <PaperInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              mode="outlined"
              style={s.input}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
            />
            <PaperInput
              label="Address"
              value={address}
              onChangeText={setAddress}
              mode="outlined"
              style={s.input}
              returnKeyType="done"
            />
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      <View style={[s.footer, { paddingBottom: Math.max(insets.bottom, 12) }]}>
        <Button
          onPress={() => navigation.goBack()}
          textColor={T.textSecondary}
          style={s.cancelBtn}
          disabled={saving}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSave}
          buttonColor={T.accent}
          style={s.saveBtn}
          contentStyle={s.saveBtnContent}
          loading={saving}
          disabled={saving}
        >
          Save Changes
        </Button>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root:           { flex: 1, backgroundColor: T.bg },
  appbar:         { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle:    { color: '#fff', fontWeight: '700', fontSize: 18 },
  scroll:         { padding: 16 },
  section:        { backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, padding: 16, marginBottom: 12 },
  sectionLabel:   { fontSize: 11, fontWeight: '700', color: T.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  chipRow:        { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip:           { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border },
  chipIcon:       { fontSize: 14 },
  chipText:       { fontSize: 13, fontWeight: '600', color: T.textSecondary },
  input:          { marginBottom: 10, backgroundColor: T.surface },
  footer:         { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: T.border, backgroundColor: T.surface },
  cancelBtn:      { flex: 1, borderRadius: 10 },
  saveBtn:        { flex: 2, borderRadius: 10 },
  saveBtnContent: { paddingVertical: 4 },
});