import React, {useState} from 'react';
import {FlatList, Pressable, Text, View} from 'react-native';
import {AddTracksModal} from '../components/PlaylistModals';
import {useApp} from '../context/AppContext';
import {getAudioById} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function PlaylistScreen({playlistId}) {
  const {settings, openAudio, deletePlaylist, removeFromPlaylist, goBack} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const [adding, setAdding] = useState(false);
  const playlist = (settings.playlists ?? []).find(item => item.id === playlistId);
  const items = (playlist?.audioIds ?? []).map(id => getAudioById(id)).filter(Boolean);

  if (!playlist) {
    return (
      <View style={styles.screen}>
        <Text style={styles.empty}>Playlist မတွေ့ပါ။</Text>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        ListHeaderComponent={
          <View style={styles.headerActions}>
            <Pressable
              onPress={() => {
                if (items[0]) {
                  openAudio(items[0].id, 'audio', playlist.id);
                }
              }}
              style={[styles.addButton, styles.playAll, items.length === 0 && styles.playAllDisabled]}
              disabled={items.length === 0}
              accessibilityRole="button"
              accessibilityLabel="အားလုံး ဖွင့်ရန်">
              <Text style={styles.playAllIcon}>▶</Text>
              <Text style={styles.playAllText}>All</Text>
            </Pressable>
            <Pressable
              onPress={() => setAdding(true)}
              style={styles.addButton}
              accessibilityRole="button"
              accessibilityLabel="အသံဖိုင် ထည့်ရန်">
              <Text style={styles.addButtonText}>+ အသံဖိုင် ထည့်ရန်</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>ဤ playlist တွင် အသံမရှိသေးပါ။</Text>
        }
        ListFooterComponent={
          <Pressable
            onPress={() => {
              deletePlaylist(playlist.id);
              goBack();
            }}
            style={styles.delete}
            accessibilityRole="button"
            accessibilityLabel="Playlist ဖျက်ရန်">
            <Text style={styles.deleteText}>Playlist ဖျက်ရန်</Text>
          </Pressable>
        }
        renderItem={({item}) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => openAudio(item.id, 'audio', playlist.id)}
              style={({pressed}) => [styles.body, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.title}>
              <View style={styles.playBadge}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </Pressable>
            <Pressable
              onPress={() => removeFromPlaylist(playlist.id, item.id)}
              hitSlop={10}
              accessibilityLabel="ဖြုတ်ရန်">
              <Text style={styles.remove}>−</Text>
            </Pressable>
          </View>
        )}
      />
      <AddTracksModal
        visible={adding}
        playlistId={playlist.id}
        onClose={() => setAdding(false)}
      />
    </View>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    list: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    sep: {
      height: 10,
    },
    headerActions: {
      gap: 10,
      marginBottom: 16,
    },
    addButton: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: colors.line,
      backgroundColor: colors.card,
    },
    addButtonText: {
      fontFamily: myanmarFont,
      fontSize: 15,
      fontWeight: '700',
      color: colors.ink,
    },
    playAll: {
      flexDirection: 'row',
      backgroundColor: colors.blue,
      borderColor: colors.blue,
      gap: 8,
    },
    playAllDisabled: {
      opacity: 0.4,
    },
    playAllIcon: {
      color: colors.onAccent,
      fontSize: 14,
      marginLeft: 2,
    },
    playAllText: {
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '700',
      color: colors.onAccent,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderWidth: 1,
      borderColor: colors.line,
    },
    body: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
    },
    playBadge: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.blue,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    playIcon: {
      color: colors.onAccent,
      fontSize: 14,
      marginLeft: 2,
    },
    title: {
      flex: 1,
      fontFamily: myanmarFont,
      fontSize: 17,
      color: colors.ink,
      fontWeight: '700',
      lineHeight: 28,
    },
    remove: {
      fontSize: 28,
      color: colors.ink,
      paddingHorizontal: 8,
    },
    pressed: {
      opacity: 0.75,
    },
    empty: {
      fontFamily: myanmarFont,
      textAlign: 'center',
      color: colors.muted,
      marginTop: 8,
      marginBottom: 8,
      fontSize: 15,
    },
    delete: {
      marginTop: 24,
      alignItems: 'center',
      paddingVertical: 12,
    },
    deleteText: {
      fontFamily: myanmarFont,
      fontSize: 15,
      color: colors.muted,
    },
  };
}
