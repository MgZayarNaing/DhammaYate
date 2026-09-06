import React, {useEffect, useState} from 'react';
import {Modal, Pressable, ScrollView, Text, TextInput, View} from 'react-native';
import {useApp} from '../context/AppContext';
import {dhammaAudios} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function CreatePlaylistModal({visible, onClose, onCreated, preselectedIds}) {
  const {createPlaylist} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState([]);

  const presetKey = (preselectedIds ?? []).join(',');

  useEffect(() => {
    if (!visible) {
      return;
    }
    setName('');
    setSelected(presetKey ? presetKey.split(',') : []);
  }, [visible, presetKey]);

  const toggle = id => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const submit = () => {
    const playlist = createPlaylist(name, selected);
    if (!playlist) {
      return;
    }
    onCreated?.(playlist);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.center}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>Playlist အသစ်</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="အမည်"
            placeholderTextColor={colors.cardMuted}
            style={styles.input}
            autoFocus
            returnKeyType="done"
          />
          <Text style={styles.subheading}>အသံဖိုင် ရွေးရန်</Text>
          <ScrollView style={styles.pickList}>
            {dhammaAudios.map(item => {
              const checked = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={({pressed}) => [styles.pickRow, pressed && styles.pressed]}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked}}>
                  <View style={[styles.check, checked && styles.checkOn]}>
                    {checked ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.action}>
              <Text style={styles.actionText}>ပယ်ဖျက်</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.action}>
              <Text style={styles.actionStrong}>ဖန်တီးရန်</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AddTracksModal({visible, playlistId, onClose}) {
  const {settings, setPlaylistTracks} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const playlist = (settings.playlists ?? []).find(item => item.id === playlistId);
  const [selected, setSelected] = useState([]);
  const existingKey = (playlist?.audioIds ?? []).join(',');

  useEffect(() => {
    if (!visible) {
      return;
    }
    setSelected(existingKey ? existingKey.split(',') : []);
  }, [visible, existingKey]);

  const toggle = id => {
    setSelected(current =>
      current.includes(id) ? current.filter(item => item !== id) : [...current, id],
    );
  };

  const submit = () => {
    if (!playlist) {
      return;
    }
    setPlaylistTracks(playlist.id, selected);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose} />
      <View style={styles.center}>
        <View style={styles.sheet}>
          <Text style={styles.heading}>အသံဖိုင် ထည့်ရန်</Text>
          <ScrollView style={styles.pickList}>
            {dhammaAudios.map(item => {
              const checked = selected.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  onPress={() => toggle(item.id)}
                  style={({pressed}) => [styles.pickRow, pressed && styles.pressed]}
                  accessibilityRole="checkbox"
                  accessibilityState={{checked}}>
                  <View style={[styles.check, checked && styles.checkOn]}>
                    {checked ? <Text style={styles.checkMark}>✓</Text> : null}
                  </View>
                  <Text style={styles.rowTitle}>{item.title}</Text>
                </Pressable>
              );
            })}
          </ScrollView>
          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.action}>
              <Text style={styles.actionText}>ပယ်ဖျက်</Text>
            </Pressable>
            <Pressable onPress={submit} style={styles.action}>
              <Text style={styles.actionStrong}>သိမ်းရန်</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function AddToPlaylistModal({visible, audioId, onClose}) {
  const {settings, addToPlaylist} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const [creating, setCreating] = useState(false);
  const playlists = settings.playlists ?? [];

  useEffect(() => {
    if (!visible) {
      setCreating(false);
    }
  }, [visible]);

  return (
    <>
      <Modal
        visible={visible && !creating}
        transparent
        animationType="fade"
        onRequestClose={onClose}>
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.center}>
          <View style={styles.sheet}>
            <Text style={styles.heading}>Playlist ထဲ ထည့်ရန်</Text>
            <Pressable
              onPress={() => setCreating(true)}
              style={({pressed}) => [styles.row, pressed && styles.pressed]}>
              <Text style={styles.rowTitle}>+ Playlist အသစ်</Text>
            </Pressable>
            <ScrollView style={styles.list}>
              {playlists.length === 0 ? (
                <Text style={styles.empty}>Playlist မရှိသေးပါ။</Text>
              ) : (
                playlists.map(playlist => {
                  const added = playlist.audioIds.includes(audioId);
                  return (
                    <Pressable
                      key={playlist.id}
                      onPress={() => {
                        if (!added) {
                          addToPlaylist(playlist.id, audioId);
                        }
                        onClose();
                      }}
                      style={({pressed}) => [styles.row, pressed && styles.pressed]}>
                      <Text style={styles.rowTitle}>{playlist.name}</Text>
                      <Text style={styles.rowMeta}>
                        {added ? 'ထည့်ပြီး' : `${playlist.audioIds.length} ပုဒ်`}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
      <CreatePlaylistModal
        visible={creating}
        preselectedIds={audioId ? [audioId] : []}
        onClose={() => setCreating(false)}
        onCreated={onClose}
      />
    </>
  );
}

function createStyles(colors) {
  return {
    backdrop: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(0,0,0,0.45)',
    },
    center: {
      flex: 1,
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    sheet: {
      backgroundColor: colors.bg,
      borderRadius: 20,
      padding: 18,
      maxHeight: '80%',
    },
    heading: {
      fontFamily: myanmarFont,
      fontSize: 17,
      fontWeight: '700',
      color: colors.ink,
      marginBottom: 12,
    },
    subheading: {
      fontFamily: myanmarFont,
      fontSize: 14,
      fontWeight: '700',
      color: colors.ink,
      marginTop: 16,
      marginBottom: 4,
    },
    input: {
      fontFamily: myanmarFont,
      borderWidth: 1,
      borderColor: colors.line,
      borderRadius: 14,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 16,
      color: colors.ink,
      backgroundColor: colors.parchment,
    },
    actions: {
      marginTop: 14,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: 16,
    },
    action: {
      paddingVertical: 6,
    },
    actionText: {
      fontFamily: myanmarFont,
      fontSize: 15,
      color: colors.muted,
    },
    actionStrong: {
      fontFamily: myanmarFont,
      fontSize: 15,
      fontWeight: '700',
      color: colors.ink,
    },
    list: {
      maxHeight: 260,
    },
    pickList: {
      maxHeight: 280,
    },
    row: {
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      flexDirection: 'row',
      alignItems: 'center',
    },
    pickRow: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    check: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkOn: {
      backgroundColor: colors.ink,
      borderColor: colors.ink,
    },
    checkMark: {
      color: colors.onAccent,
      fontSize: 13,
      fontWeight: '700',
      lineHeight: 16,
    },
    rowTitle: {
      flex: 1,
      fontFamily: myanmarFont,
      fontSize: 16,
      color: colors.ink,
    },
    rowMeta: {
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.muted,
    },
    empty: {
      fontFamily: myanmarFont,
      fontSize: 14,
      color: colors.muted,
      paddingVertical: 12,
    },
    pressed: {
      opacity: 0.7,
    },
  };
}
