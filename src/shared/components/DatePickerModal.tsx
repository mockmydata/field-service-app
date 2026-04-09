import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { T } from '../Theme';

export function DatePickerModal({ visible, dateKey, onDismiss, onSelect }: {
  visible: boolean; dateKey: string;
  onDismiss: () => void; onSelect: (key: string) => void;
}) {
  const [selected, setSelected] = useState(dateKey);
  useEffect(() => { if (visible) setSelected(dateKey); }, [visible]);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <View style={s.overlay}>
        <View style={s.sheet}>
          <View style={s.header}>
            <Text style={s.title}>Select Date</Text>
            <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <MaterialCommunityIcons name="close" size={22} color={T.textSecondary} />
            </TouchableOpacity>
          </View>
          <Calendar
            current={selected}
            onDayPress={(day: { dateString: string }) => {
              setSelected(day.dateString);
              onSelect(day.dateString);
              onDismiss();
            }}
            markedDates={{ [selected]: { selected: true, selectedColor: T.accent } }}
            theme={{
              backgroundColor: T.surface, calendarBackground: T.surface,
              selectedDayBackgroundColor: T.accent, selectedDayTextColor: '#fff',
              todayTextColor: T.accent, dayTextColor: T.textPrimary,
              textDisabledColor: T.textMuted, monthTextColor: T.textPrimary,
              arrowColor: T.accent, textMonthFontWeight: '700' as any,
              textDayFontSize: 14, textMonthFontSize: 15,
            }}
          />
          <View style={{ height: 12 }} />
        </View>
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:   { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32 },
  header:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  title:   { fontSize: 17, fontWeight: '700', color: T.textPrimary },
});