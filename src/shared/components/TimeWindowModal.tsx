import React, { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { T } from '../Theme';
import { TimeInputPair } from './TimeInputPair';
import { computeDuration, validHour, validMin } from '../TimeHelpers';

export function TimeWindowModal({
  visible,
  startHour, startMin, startPeriod,
  endHour, endMin, endPeriod,
  onDismiss, onSave,
}: {
  visible: boolean;
  startHour: string; startMin: string; startPeriod: 'AM'|'PM';
  endHour: string;   endMin: string;   endPeriod: 'AM'|'PM';
  onDismiss: () => void;
  onSave: (sh: string, sm: string, sp: 'AM'|'PM', eh: string, em: string, ep: 'AM'|'PM') => void;
}) {
  const [sh, setSh] = useState(startHour);
  const [sm, setSm] = useState(startMin);
  const [sp, setSp] = useState<'AM'|'PM'>(startPeriod);
  const [eh, setEh] = useState(endHour);
  const [em, setEm] = useState(endMin);
  const [ep, setEp] = useState<'AM'|'PM'>(endPeriod);
  const [shErr, setShErr] = useState(false);
  const [smErr, setSmErr] = useState(false);
  const [ehErr, setEhErr] = useState(false);
  const [emErr, setEmErr] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setSh(startHour); setSm(startMin); setSp(startPeriod);
    setEh(endHour);   setEm(endMin);   setEp(endPeriod);
    setShErr(false); setSmErr(false); setEhErr(false); setEmErr(false);
  }, [visible]);

  const startStr = sh && sm ? `${sh}:${sm.padStart(2, '0')}` : '';
  const endStr   = eh && em ? `${eh}:${em.padStart(2, '0')}` : '';
  const duration = computeDuration(startStr, sp, endStr, ep);

  const handleSave = () => {
    const she = sh || sm ? !validHour(sh) : false;
    const sme = sh || sm ? !validMin(sm)  : false;
    const ehe = eh || em ? !validHour(eh) : false;
    const eme = eh || em ? !validMin(em)  : false;
    setShErr(she); setSmErr(sme); setEhErr(ehe); setEmErr(eme);
    if (she || sme || ehe || eme) return;
    onSave(sh, sm, sp, eh, em, ep);
    onDismiss();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onDismiss}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={s.overlay}>
          <View style={s.sheet}>
            <View style={s.header}>
              <Text style={s.title}>Time Window</Text>
              <TouchableOpacity onPress={onDismiss} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialCommunityIcons name="close" size={22} color={T.textSecondary} />
              </TouchableOpacity>
            </View>
            <View style={s.body}>
              <TimeInputPair
                label="Start Time" hour={sh} min={sm} period={sp}
                onHourChange={v => { setSh(v); setShErr(false); }}
                onMinChange={v  => { setSm(v); setSmErr(false); }}
                onPeriodChange={setSp}
                hourErr={shErr} minErr={smErr}
              />
              {duration ? (
                <View style={s.durationBadge}>
                  <MaterialCommunityIcons name="timer-outline" size={13} color={T.green} />
                  <Text style={s.durationText}>{duration}</Text>
                </View>
              ) : <View style={{ height: 14 }} />}
              <TimeInputPair
                label="End Time" hour={eh} min={em} period={ep}
                onHourChange={v => { setEh(v); setEhErr(false); }}
                onMinChange={v  => { setEm(v); setEmErr(false); }}
                onPeriodChange={setEp}
                hourErr={ehErr} minErr={emErr}
              />
            </View>
            <View style={s.footer}>
              <Button mode="outlined" textColor={T.textSecondary} style={[s.btn, { borderColor: T.border }]} onPress={onDismiss}>Cancel</Button>
              <Button mode="contained" buttonColor={T.accent} style={s.btn} onPress={handleSave}>Save</Button>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const s = StyleSheet.create({
  overlay:       { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet:         { backgroundColor: T.surface, borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 32 },
  header:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 20, paddingBottom: 14 },
  title:         { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  body:          { paddingHorizontal: 20, paddingTop: 4 },
  durationBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, alignSelf: 'flex-start', backgroundColor: T.green + '12', borderWidth: 1, borderColor: T.green + '30', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, marginTop: 6, marginBottom: 10 },
  durationText:  { fontSize: 12, fontWeight: '700', color: T.green },
  footer:        { flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 16, borderTopWidth: 1, borderTopColor: T.border, marginTop: 8 },
  btn:           { flex: 1, borderRadius: 10 },
});