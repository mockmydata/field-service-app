import React, { useCallback, useState } from 'react';
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Calendar } from 'react-native-calendars';
import {
  Appbar,
  Button,
  Dialog,
  Portal,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { Job, Status } from '../../../types/types';
import { useJobContext } from '../../../shared/context/JobContext';
import { useStaffContext } from '../../../shared/context/StaffContext';
import { STATUS_CFG } from '../../../shared/JobConfig';
import { T } from '../../../shared/Theme';
import { formatTimeRange } from '../../../shared/TimeHelpers';
import { Avatar, Card, CardLabel, Chip, InfoLine, StatusBadge } from '../../../shared/components/JobAtoms';
import { TravelActionBar } from '../../../shared/components/TravelActionBar';
import { TextEditDialog } from '../../../shared/components/TextEditDialog';
import { ChangeStatusDialog, ReassignDialog, RescheduleDialog } from '../../../shared/components/JobDialogs';


const W = Dimensions.get('window').width;

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function JobDetailScreen() {
  const insets     = useSafeAreaInsets();
  const navigation = useNavigation();
  const { selectedJob, updateJob, deleteJob } = useJobContext();
  const { staff } = useStaffContext();

  const [edited, setEdited] = useState<Job>({
    ...selectedJob!,
    photos: [...(selectedJob?.photos ?? [])],
  });

  const [menuVisible,         setMenuVisible]         = useState(false);
  const [statusDialogVisible, setStatusDialogVisible] = useState(false);
  const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
  const [rescheduleVisible,   setRescheduleVisible]   = useState(false);
  const [reassignVisible,     setReassignVisible]     = useState(false);
  const [notesVisible,        setNotesVisible]        = useState(false);
  const [instructionsVisible, setInstructionsVisible] = useState(false);
  const [imageModalVisible,   setImageModalVisible]   = useState(false);
  const [selectedImage,       setSelectedImage]       = useState<string | null>(null);

  const persist = useCallback(async (patch: Partial<Job>) => {
    const next = { ...edited, ...patch };
    setEdited(next);
    try { await updateJob(next); }
    catch { Alert.alert('Error', 'Failed to save changes.'); }
  }, [edited]);

  const handleTravelAction = async (nextStatus: string) => {
    await persist({ status: nextStatus as Status });
  };

  const handleDelete = async () => {
    setDeleteDialogVisible(false);
    try { await deleteJob(edited.id); navigation.goBack(); }
    catch { Alert.alert('Error', 'Failed to delete job.'); }
  };

  const openDirections = () => {
    const addr = edited.location.split(' ').join('+');
    const url  = Platform.select({ ios: `maps:0,0?q=${addr}`, android: `geo:0,0?q=${addr}` }) ?? `https://maps.google.com/?q=${addr}`;
    Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Maps.'));
  };

  const addCamera = async () => {
    const p = await ImagePicker.requestCameraPermissionsAsync();
    if (!p.granted) { Alert.alert('Permission needed', 'Allow camera access in Settings.'); return; }
    const r = await ImagePicker.launchCameraAsync({ quality: 0.85 });
    if (!r.canceled) await persist({ photos: [...(edited.photos ?? []), r.assets[0].uri] });
  };

  const addLibrary = async () => {
    const p = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!p.granted) { Alert.alert('Permission needed', 'Allow photo access in Settings.'); return; }
    const r = await ImagePicker.launchImageLibraryAsync({ quality: 0.85, allowsMultipleSelection: true });
    if (!r.canceled) await persist({ photos: [...(edited.photos ?? []), ...r.assets.map(a => a.uri)] });
  };

  const removePhoto = (uri: string) => {
    persist({ photos: (edited.photos ?? []).filter(p => p !== uri) });
    setImageModalVisible(false);
  };

  if (!selectedJob) { navigation.goBack(); return null; }

  const cfg       = STATUS_CFG[edited.status] ?? STATUS_CFG['Scheduled'];
  const hasMap    = !!(edited.latitude && edited.longitude);
  const phone     = edited.customerPhone || edited.phone;
  const timeRange = formatTimeRange(edited.time, edited.duration);

  return (
    <View style={s.root}>
      <Appbar.Header style={s.appbar} statusBarHeight={insets.top}>
        <Appbar.BackAction color="#fff" onPress={() => navigation.goBack()} />
        <Appbar.Content
          title={edited.title} titleStyle={s.appbarTitle}
          subtitle={edited.date + (timeRange ? '  ·  ' + timeRange : '')}
          subtitleStyle={s.appbarSub}
        />
        <TouchableOpacity onPress={() => setMenuVisible(v => !v)} style={mn.trigger} activeOpacity={0.8}>
          <MaterialCommunityIcons name="dots-vertical" size={22} color="#fff" />
        </TouchableOpacity>
      </Appbar.Header>

      {menuVisible && (
        <TouchableOpacity style={mn.backdrop} activeOpacity={1} onPress={() => setMenuVisible(false)}>
          <View style={mn.sheet}>
            {[
              { icon: 'swap-horizontal',       color: T.accent, title: 'Change Status', sub: `Currently: ${edited.status}`,                        showChevron: true,  onPress: () => { setMenuVisible(false); setStatusDialogVisible(true); } },
              { icon: 'calendar-edit',          color: T.amber,  title: 'Reschedule',   sub: edited.date + (timeRange ? '  ·  ' + timeRange : ''), showChevron: true,  onPress: () => { setMenuVisible(false); setRescheduleVisible(true); } },
              { icon: 'account-switch-outline', color: T.green,  title: 'Reassign',     sub: edited.assignee ?? 'Unassigned',                      showChevron: true,  onPress: () => { setMenuVisible(false); setReassignVisible(true); } },
              { icon: 'delete-outline',         color: T.red,    title: 'Delete Job',   sub: 'This cannot be undone',                              showChevron: false, onPress: () => { setMenuVisible(false); setDeleteDialogVisible(true); } },
            ].map((item, i) => (
              <React.Fragment key={item.title}>
                {i > 0 && <View style={card.divider} />}
                <TouchableOpacity style={mn.item} onPress={item.onPress} activeOpacity={0.75}>
                  <View style={[mn.itemIcon, { backgroundColor: item.color + '15' }]}>
                    <MaterialCommunityIcons name={item.icon as any} size={18} color={item.color} />
                  </View>
                  <View style={mn.itemBody}>
                    <Text style={[mn.itemTitle, item.icon === 'delete-outline' && { color: T.red }]}>{item.title}</Text>
                    <Text style={mn.itemSub}>{item.sub}</Text>
                  </View>
                  {item.showChevron && <MaterialCommunityIcons name="chevron-right" size={18} color={T.textMuted} />}
                </TouchableOpacity>
              </React.Fragment>
            ))}
          </View>
        </TouchableOpacity>
      )}

      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        <TravelActionBar status={edited.status} onAction={handleTravelAction} />

        <Card>
          <View style={[hd.topBar, { backgroundColor: cfg.color }]} />
          <View style={hd.body}>
            <View style={hd.titleRow}>
              <Text style={hd.title} numberOfLines={2}>{edited.title}</Text>
              <StatusBadge status={edited.status} />
            </View>
            <View style={hd.chips}>
              <Chip icon="calendar-outline" label={edited.date} />
              {timeRange && <Chip icon="clock-outline" label={timeRange} />}
              {edited.jobType  && <Chip icon="wrench-outline" label={edited.jobType}  color={T.accent} bg={T.accent + '12'} />}
              {edited.priority && <Chip icon="flag-outline"   label={edited.priority} color={T.amber}  bg={T.amber  + '12'} />}
            </View>
          </View>
          <View style={card.divider} />
          <View style={hd.assigneeRow}>
            {edited.assignee
              ? <Avatar name={edited.assignee} size={40} />
              : <View style={[av.circle, { width: 40, height: 40, borderRadius: 20, backgroundColor: T.surfaceAlt }]}>
                  <MaterialCommunityIcons name="account-outline" size={22} color={T.textMuted} />
                </View>
            }
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={hd.assigneeName}>{edited.assignee || 'Unassigned'}</Text>
              <Text style={hd.assigneeRole}>Field Technician</Text>
            </View>
          </View>
          <View style={card.divider} />
          <View style={hd.actionRow}>
            <TouchableOpacity style={hd.actionBtn} onPress={() => setStatusDialogVisible(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="swap-horizontal" size={16} color={T.accent} />
              <Text style={hd.actionBtnText}>Status</Text>
            </TouchableOpacity>
            <View style={hd.actionDivider} />
            <TouchableOpacity style={hd.actionBtn} onPress={() => setRescheduleVisible(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="calendar-edit" size={16} color={T.accent} />
              <Text style={hd.actionBtnText}>Reschedule</Text>
            </TouchableOpacity>
            <View style={hd.actionDivider} />
            <TouchableOpacity style={hd.actionBtn} onPress={() => setReassignVisible(true)} activeOpacity={0.85}>
              <MaterialCommunityIcons name="account-switch-outline" size={16} color={T.accent} />
              <Text style={hd.actionBtnText}>Reassign</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <View style={card.header}>
            <View style={card.headerLeft}>
              <MaterialCommunityIcons name="map-marker-outline" size={18} color={T.accent} />
              <CardLabel text="LOCATION" />
            </View>
          </View>
          <View style={card.divider} />
          {hasMap ? (
            <MapView
              style={lc.map} provider={PROVIDER_DEFAULT} userInterfaceStyle="light"
              initialRegion={{ latitude: edited.latitude!, longitude: edited.longitude!, latitudeDelta: 0.006, longitudeDelta: 0.006 }}
              scrollEnabled={false} zoomEnabled={false} pitchEnabled={false} rotateEnabled={false}
            >
              <Marker coordinate={{ latitude: edited.latitude!, longitude: edited.longitude! }} pinColor={cfg.color} tracksViewChanges={false} />
            </MapView>
          ) : (
            <View style={lc.placeholder}>
              <MaterialCommunityIcons name="map-outline" size={36} color={T.textMuted} />
              <Text style={lc.placeholderText}>No coordinates available</Text>
            </View>
          )}
          <View style={lc.addrRow}><Text style={lc.addrText}>{edited.location}</Text></View>
          <View style={card.divider} />
          <View style={lc.btnRow}>
            <TouchableOpacity style={lc.dirBtn} onPress={openDirections} activeOpacity={0.85}>
              <MaterialCommunityIcons name="directions" size={18} color="#fff" />
              <Text style={lc.dirText}>Open Directions</Text>
            </TouchableOpacity>
          </View>
        </Card>

        <Card>
          <View style={card.header}>
            <View style={card.headerLeft}>
              <MaterialCommunityIcons name="account-outline" size={18} color={T.accent} />
              <CardLabel text="CUSTOMER" />
            </View>
          </View>
          <View style={card.divider} />
          <InfoLine first icon="account-outline"    label="Name"    value={edited.customerName || 'Not specified'} />
          <InfoLine       icon="phone-outline"      label="Phone"   value={phone}                onPress={phone ? () => Linking.openURL(`tel:${phone}`) : undefined} />
          <InfoLine       icon="email-outline"      label="Email"   value={edited.customerEmail} onPress={edited.customerEmail ? () => Linking.openURL(`mailto:${edited.customerEmail!}`) : undefined} />
          <InfoLine       icon="map-marker-outline" label="Address" value={edited.location} />
        </Card>

        <Card>
          <View style={card.header}>
            <View style={card.headerLeft}>
              <MaterialCommunityIcons name="note-text-outline" size={18} color={T.accent} />
              <CardLabel text="INSTRUCTIONS" />
            </View>
            <TouchableOpacity style={cc.editBtn} onPress={() => setInstructionsVisible(true)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="pencil-outline" size={14} color={T.accent} />
              <Text style={cc.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={card.divider} />
          <View style={tx.body}>
            {edited.instructions
              ? <Text style={tx.text}>{edited.instructions}</Text>
              : <TouchableOpacity onPress={() => setInstructionsVisible(true)} activeOpacity={0.7} style={tx.emptyBtn}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.accent} />
                  <Text style={tx.emptyBtnText}>Add instructions</Text>
                </TouchableOpacity>
            }
          </View>
        </Card>

        <Card>
          <View style={card.header}>
            <View style={card.headerLeft}>
              <MaterialCommunityIcons name="pencil-outline" size={18} color={T.accent} />
              <CardLabel text="NOTES" />
            </View>
            <TouchableOpacity style={cc.editBtn} onPress={() => setNotesVisible(true)} activeOpacity={0.8}>
              <MaterialCommunityIcons name="pencil-outline" size={14} color={T.accent} />
              <Text style={cc.editText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <View style={card.divider} />
          <View style={tx.body}>
            {edited.notes
              ? <Text style={tx.text}>{edited.notes}</Text>
              : <TouchableOpacity onPress={() => setNotesVisible(true)} activeOpacity={0.7} style={tx.emptyBtn}>
                  <MaterialCommunityIcons name="plus-circle-outline" size={16} color={T.accent} />
                  <Text style={tx.emptyBtnText}>Add notes</Text>
                </TouchableOpacity>
            }
          </View>
        </Card>

        <Card>
          <View style={card.header}>
            <View style={card.headerLeft}>
              <MaterialCommunityIcons name="image-multiple-outline" size={18} color={T.accent} />
              <CardLabel text={`IMAGES${edited.photos?.length ? `  (${edited.photos.length})` : ''}`} />
            </View>
            {(edited.photos?.length ?? 0) > 0 && (
              <View style={{ flexDirection: 'row', gap: 6 }}>
                <TouchableOpacity onPress={addCamera} style={cc.editBtn}>
                  <MaterialCommunityIcons name="camera-outline" size={14} color={T.accent} />
                  <Text style={cc.editText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={addLibrary} style={cc.editBtn}>
                  <MaterialCommunityIcons name="image-outline" size={14} color={T.accent} />
                  <Text style={cc.editText}>Library</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
          <View style={card.divider} />
          {edited.photos && edited.photos.length > 0 ? (
            <FlatList
              data={edited.photos} numColumns={3} scrollEnabled={false}
              keyExtractor={(item, i) => `${i}-${item}`}
              contentContainerStyle={ic.grid}
              renderItem={({ item }) => (
                <TouchableOpacity activeOpacity={0.85} onPress={() => { setSelectedImage(item); setImageModalVisible(true); }}>
                  <Image source={{ uri: item }} style={ic.thumb} resizeMode="cover" />
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={ic.empty}>
              <MaterialCommunityIcons name="image-multiple-outline" size={34} color={T.textMuted} />
              <Text style={ic.emptyText}>No images yet</Text>
              <View style={ic.emptyBtns}>
                <TouchableOpacity style={ic.emptyBtn} onPress={addCamera} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="camera-outline" size={16} color={T.accent} />
                  <Text style={ic.emptyBtnText}>Camera</Text>
                </TouchableOpacity>
                <TouchableOpacity style={ic.emptyBtn} onPress={addLibrary} activeOpacity={0.8}>
                  <MaterialCommunityIcons name="image-outline" size={16} color={T.accent} />
                  <Text style={ic.emptyBtnText}>Library</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Card>

        <View style={{ height: 32 }} />
      </ScrollView>

      <Portal>
        <ChangeStatusDialog
          visible={statusDialogVisible}
          currentStatus={edited.status as Status}
          onDismiss={() => setStatusDialogVisible(false)}
          onSave={s => persist({ status: s })}
        />

        <RescheduleDialog
          visible={rescheduleVisible}
          currentDate={edited.date}
          currentStartTime={edited.time}
          onDismiss={() => setRescheduleVisible(false)}
          onSave={(date, st, et) => persist({ date, time: st ? `${st}${et ? ' – ' + et : ''}` : undefined })}
        />

        <ReassignDialog
          visible={reassignVisible}
          currentAssignee={edited.assignee}
          staff={staff}
          onDismiss={() => setReassignVisible(false)}
          onSave={name => persist({ assignee: name })}
        />

     
        <Dialog style={{ backgroundColor: "white" }} visible={deleteDialogVisible} onDismiss={() => setDeleteDialogVisible(false)}>
          <Dialog.Title style={dlg.title}>Confirm Delete</Dialog.Title>
          <Dialog.Content>
            <Text style={{ fontSize: 15, color: T.textSecondary, lineHeight: 22 }}>
              Are you sure you want to delete this job? This cannot be undone.
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <View style={dlg.actions}>
              <Button mode="outlined" textColor={T.textSecondary} style={[dlg.btn, { borderColor: T.border }]}
                onPress={() => setDeleteDialogVisible(false)}>Cancel</Button>
              <Button mode="contained" buttonColor={T.red} style={dlg.btn} onPress={handleDelete}>Delete</Button>
            </View>
          </Dialog.Actions>
        </Dialog>

          <Modal
          visible={imageModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setImageModalVisible(false)}
          statusBarTranslucent
        >
          <View style={im.overlay}>
            {selectedImage && (
              <>
                <Image source={{ uri: selectedImage }} style={im.img} resizeMode="contain" />
                <View style={im.actions}>
                  <Button mode="outlined" textColor="#fff" style={im.btn}
                    onPress={() => setImageModalVisible(false)}>Back</Button>
                  <Button mode="outlined" textColor={T.red} style={[im.btn, { borderColor: T.red + '80' }]}
                    onPress={() => Alert.alert('Delete Photo', 'Remove this photo?', [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Delete', style: 'destructive', onPress: () => removePhoto(selectedImage) },
                    ])}>Delete</Button>
                </View>
              </>
            )}
          </View>
        </Modal>
      </Portal>
         <TextEditDialog
          visible={notesVisible} title="Edit Notes"
          value={edited.notes ?? ''} placeholder="Add job notes here…"
          onDismiss={() => setNotesVisible(false)}
          onSave={v => persist({ notes: v })}
        />

        <TextEditDialog
          visible={instructionsVisible} title="Edit Instructions"
          value={(edited as any).instructions ?? ''} placeholder="Add instructions here…"
          onDismiss={() => setInstructionsVisible(false)}
          onSave={v => persist({ instructions: v } as any)}
        />

    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root:        { flex: 1, backgroundColor: T.bg },
  appbar:      { backgroundColor: T.appbar, elevation: 4 },
  appbarTitle: { color: '#fff', fontWeight: '700', fontSize: 17 },
  appbarSub:   { color: 'rgba(255,255,255,0.72)', fontSize: 12 },
  scroll:      { flex: 1 },
  content:     { padding: 12, gap: 10, paddingBottom: 24 },
 
});
const card = StyleSheet.create({
  shell:      { backgroundColor: T.surface, borderRadius: 14, borderWidth: 1, borderColor: T.border, overflow: 'hidden' },
  divider:    { height: 1, backgroundColor: T.border },
  header:     { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 14, paddingVertical: 12 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label:      { fontSize: 11, fontWeight: '700', color: T.textMuted, letterSpacing: 0.8 },
  row:        { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, gap: 12 },
});


const mn = StyleSheet.create({
  trigger:   { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginRight: 4 },
  backdrop:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 100 },
  sheet:     { position: 'absolute', top: 56, right: 12, width: 264, backgroundColor: T.surface, borderRadius: 16, borderWidth: 1, borderColor: T.border, shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 20, elevation: 16, overflow: 'hidden', zIndex: 101 },
  item:      { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 13, gap: 12 },
  itemIcon:  { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  itemBody:  { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: T.textPrimary },
  itemSub:   { fontSize: 11, color: T.textMuted, marginTop: 1 },
});


const av = StyleSheet.create({
  circle: { backgroundColor: T.accent + '18', borderWidth: 1.5, borderColor: T.accent + '30', alignItems: 'center', justifyContent: 'center' },
  text:   { fontWeight: '800', color: T.accent },
});

const hd = StyleSheet.create({
  topBar:       { height: 4 },
  body:         { padding: 14, gap: 12 },
  titleRow:     { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  title:        { flex: 1, fontSize: 19, fontWeight: '800', color: T.textPrimary, letterSpacing: -0.4, lineHeight: 25 },
  chips:        { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  assigneeRow:  { flexDirection: 'row', alignItems: 'center', padding: 14 },
  assigneeName: { fontSize: 15, fontWeight: '700', color: T.textPrimary },
  assigneeRole: { fontSize: 12, color: T.textSecondary, marginTop: 1 },
  actionRow:    { flexDirection: 'row' },
  actionBtn:    { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 13 },
  actionBtnText:{ fontSize: 13, fontWeight: '600', color: T.accent },
  actionDivider:{ width: 1, backgroundColor: T.border },
});

const lc = StyleSheet.create({
  map:             { width: '100%', height: 175 },
  placeholder:     { height: 120, backgroundColor: T.surfaceAlt, alignItems: 'center', justifyContent: 'center', gap: 8 },
  placeholderText: { fontSize: 13, color: T.textMuted },
  addrRow:         { padding: 14 },
  addrText:        { fontSize: 14, color: T.textSecondary, lineHeight: 20 },
  btnRow:          { flexDirection: 'row' },
  dirBtn:          { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingVertical: 14, backgroundColor: T.accent },
  dirText:         { fontSize: 14, fontWeight: '700', color: '#fff' },
});

const cc = StyleSheet.create({
  editBtn:  { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, backgroundColor: T.accent + '10', borderWidth: 1, borderColor: T.accent + '30' },
  editText: { fontSize: 12, fontWeight: '700', color: T.accent },
});

const tx = StyleSheet.create({
  body:         { padding: 14, minHeight: 60 },
  text:         { fontSize: 14, color: T.textPrimary, lineHeight: 22 },
  emptyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6 },
  emptyBtnText: { fontSize: 14, color: T.accent, fontWeight: '600' },
});

const THUMB = (W - 24 - 8) / 3;

const ic = StyleSheet.create({
  grid:         { padding: 4 },
  thumb:        { width: THUMB, height: THUMB, margin: 2, borderRadius: 6 },
  empty:        { alignItems: 'center', paddingVertical: 28, gap: 8 },
  emptyText:    { fontSize: 14, color: T.textMuted },
  emptyBtns:    { flexDirection: 'row', gap: 10, marginTop: 4 },
  emptyBtn:     { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 16, paddingVertical: 10, borderRadius: 10, backgroundColor: T.surfaceAlt, borderWidth: 1, borderColor: T.border },
  emptyBtnText: { fontSize: 13, fontWeight: '600', color: T.accent },
});

const im = StyleSheet.create({
  overlay: { 
  flex: 1, 
  backgroundColor: '#000', 
  justifyContent: 'center', 
  alignItems: 'center',       // add this
  paddingTop: 60, 
  paddingBottom: 40 
},
  img:     { width: W, height: '80%' },
  actions: { flexDirection: 'row', gap: 12, paddingHorizontal: 20, marginTop: 20 },
  btn:     { flex: 1, borderColor: 'rgba(255,255,255,0.35)' },
});

const dlg = StyleSheet.create({
  title:   { fontSize: 17, fontWeight: '700', color: T.textPrimary },
  actions: { flexDirection: 'row', gap: 10, width: '100%', paddingHorizontal: 4, paddingBottom: 8 },
  btn:     { flex: 1, borderRadius: 10 },
});
