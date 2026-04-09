import React, { useEffect, useState } from 'react';
import { FlatList, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Theme';
import { CustomersAPI, Customer } from '../api/api';

export function CustomerPickerModal({ visible, onDismiss, onSelect, onAddNew }: {
  visible: boolean;
  onDismiss: () => void;
  onSelect: (c: Customer) => void;
  onAddNew: () => void;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [search,    setSearch]    = useState('');

  useEffect(() => {
    if (!visible) return;
    setLoading(true);
    CustomersAPI.getAll()
      .then(setCustomers)
      .catch(() => setCustomers([]))
      .finally(() => setLoading(false));
  }, [visible]);

  const filtered = customers.filter(c =>
    !search ||
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Select Customer</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={T.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={s.searchWrap}>
            <MaterialCommunityIcons name="magnify" size={18} color={T.textMuted} />
            <TextInput
              style={s.searchInput} value={search} onChangeText={setSearch}
              placeholder="Search customers…" placeholderTextColor={T.textMuted}
              clearButtonMode="while-editing"
            />
          </View>
          <TouchableOpacity style={s.addNewRow} onPress={onAddNew} activeOpacity={0.8}>
            <View style={s.addNewIcon}>
              <MaterialCommunityIcons name="plus" size={18} color={T.accent} />
            </View>
            <Text style={s.addNewText}>Add New Customer</Text>
            <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
          </TouchableOpacity>
          <View style={s.divider} />
          {loading ? (
            <View style={s.empty}><Text style={s.emptyText}>Loading…</Text></View>
          ) : (
            <FlatList
              data={filtered} keyExtractor={c => String(c.id)} keyboardShouldPersistTaps="handled"
              ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>No customers found</Text></View>}
              renderItem={({ item }) => (
                <TouchableOpacity style={s.row} onPress={() => onSelect(item)} activeOpacity={0.8}>
                  <View style={s.avatar}>
                    <Text style={s.avatarText}>{item.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2)}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowName}>{item.name}</Text>
                    <Text style={s.rowSub} numberOfLines={1}>📍 {item.address}</Text>
                  </View>
                  <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />
                </TouchableOpacity>
              )}
            />
          )}
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, maxHeight: '80%', paddingBottom: 32, flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  title:      { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 16, marginBottom: 10, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border, borderRadius: 12, paddingHorizontal: 12, height: 42 },
  searchInput:{ flex: 1, fontSize: 14, color: T.textPrimary, padding: 0 },
  addNewRow:  { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 14 },
  addNewIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: T.accent + '14', justifyContent: 'center', alignItems: 'center' },
  addNewText: { flex: 1, fontSize: 14, fontWeight: '700', color: T.accent },
  divider:    { height: 1, backgroundColor: T.border, marginBottom: 4 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  avatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: T.textSecondary },
  rowName:    { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  rowSub:     { fontSize: 12, color: T.textSecondary, marginTop: 1 },
  empty:      { alignItems: 'center', paddingVertical: 32 },
  emptyText:  { fontSize: 14, color: T.textMuted },
});