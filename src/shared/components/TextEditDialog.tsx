import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TextInput, View } from 'react-native';
import { Button } from 'react-native-paper';
import { T } from '../Theme';

export function TextEditDialog({ visible, title, value, placeholder, onDismiss, onSave }: {
  visible: boolean; title: string; value: string; placeholder: string;
  onDismiss: () => void; onSave: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => { if (visible) setText(value); }, [visible]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss} statusBarTranslucent>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={s.kav}
      >
        <View style={s.card}>
          <Text style={s.title}>{title}</Text>
          <View style={s.inputWrap}>
            <TextInput
              style={s.input} value={text} onChangeText={setText}
              multiline numberOfLines={6} placeholder={placeholder}
              placeholderTextColor={T.textMuted} textAlignVertical="top" autoFocus
            />
          </View>
          <View style={s.actions}>
            <Button mode="outlined" textColor={T.textSecondary} style={[s.btn, { borderColor: T.border }]} onPress={onDismiss}>Cancel</Button>
            <Button mode="contained" buttonColor={T.accent} style={s.btn} onPress={() => { onSave(text); onDismiss(); }}>Save</Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  kav:      { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', paddingHorizontal: 24 },
  card:     { backgroundColor: T.surface, borderRadius: 20, overflow: 'hidden' },
  title:    { fontSize: 17, fontWeight: '700', color: T.textPrimary, padding: 20, paddingBottom: 12 },
  inputWrap:{ borderWidth: 1, borderColor: T.border, borderRadius: 12, backgroundColor: T.surfaceAlt, overflow: 'hidden', marginHorizontal: 16, marginBottom: 16 },
  input:    { fontSize: 14, color: T.textPrimary, lineHeight: 22, padding: 12, minHeight: 120 },
  actions:  { flexDirection: 'row', gap: 10, paddingHorizontal: 16, paddingBottom: 16 },
  btn:      { flex: 1, borderRadius: 10 },
});