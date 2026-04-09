import React from 'react';
import { FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Theme';
import { useStaffContext } from '../context/StaffContext';

export function AssigneePickerModal({ visible, selected, onDismiss, onSelect }: {
  visible: boolean; selected: string;
  onDismiss: () => void; onSelect: (name: string) => void;
}) {
  const { staff } = useStaffContext();
  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={[s.sheet, { maxHeight: '60%' }]}>
          <View style={s.header}>
            <Text style={s.title}>Assign To</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={T.textSecondary} />
            </TouchableOpacity>
          </View>
          <View style={s.divider} />
          <FlatList
            data={staff} keyExtractor={t => String(t.id)} style={{ flex: 1 }}
            renderItem={({ item }) => {
              const isSel = selected === item.name;
              return (
                <TouchableOpacity
                  style={[s.row, isSel && { backgroundColor: T.accent + '08' }]}
                  onPress={() => { onSelect(item.name); onDismiss(); }}
                  activeOpacity={0.8}
                >
                  <View style={[s.avatar, isSel && { backgroundColor: T.accent, borderColor: T.accent }]}>
                    <Text style={[s.avatarText, isSel && { color: '#fff' }]}>
                      {item.name.split(' ').map((w: string) => w[0]).join('')}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.rowName}>{item.name}</Text>
                    <Text style={s.rowSub}>{item.role}  ·  {item.jobs_today} jobs today</Text>
                  </View>
                  <View style={[s.dot, { backgroundColor: item.available ? T.green : T.red }]} />
                  {isSel && <MaterialCommunityIcons name="check-circle" size={20} color={T.accent} style={{ marginLeft: 6 }} />}
                </TouchableOpacity>
              );
            }}
            ListEmptyComponent={<View style={s.empty}><Text style={s.emptyText}>No staff available</Text></View>}
          />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:    { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:      { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32, flex: 1 },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  title:      { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  divider:    { height: 1, backgroundColor: T.border, marginBottom: 4 },
  row:        { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingVertical: 13 },
  avatar:     { width: 38, height: 38, borderRadius: 19, backgroundColor: T.surfaceAlt, borderWidth: 1.5, borderColor: T.border, justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 13, fontWeight: '800', color: T.textSecondary },
  rowName:    { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  rowSub:     { fontSize: 12, color: T.textSecondary, marginTop: 1 },
  dot:        { width: 8, height: 8, borderRadius: 4 },
  empty:      { alignItems: 'center', paddingVertical: 32 },
  emptyText:  { fontSize: 14, color: T.textMuted },
});