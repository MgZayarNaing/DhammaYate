import React, {useState} from 'react';
import {FlatList, Pressable, Text, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AddTracksModal} from '../components/PlaylistModals';
import {useApp} from '../context/AppContext';
import {DOWNLOADS_PLAYLIST_ID, getAudioById, resolvePlaylist} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function PlaylistScreen({playlistId}) {
  const {settings, openAudio, deletePlaylist, removeFromPlaylist, goBack} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [adding, setAdding] = useState(false);
  const playlist = resolvePlaylist(playlistId, settings);
  const items = (playlist?.audioIds ?? []).map(id => getAudioById(id)).filter(Boolean);
  const isDownloads = playlist?.id === DOWNLOADS_PLAYLIST_ID;

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
              <Icon name="play" size={16} color={colors.onAccent} style={styles.playAllIcon} />
              <Text style={styles.playAllText}>All</Text>
            </Pressable>
            {isDownloads ? null : (
              <Pressable
                onPress={() => setAdding(true)}
                style={styles.addButton}
                accessibilityRole="button"
                accessibilityLabel="အသံဖိုင် ထည့်ရန်">
                <View style={styles.addButtonRow}>
                  <Icon name="plus" size={16} color={colors.ink} />
                  <Text style={styles.addButtonText}>အသံဖိုင် ထည့်ရန်</Text>
                </View>
              </Pressable>
            )}
          </View>
        }
        ListEmptyComponent={
          <Text style={styles.empty}>ဤ playlist တွင် အသံမရှိသေးပါ။</Text>
        }
        ListFooterComponent={
          isDownloads ? null : (
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
          )
        }
        renderItem={({item}) => (
          <View style={styles.row}>
            <Pressable
              onPress={() => openAudio(item.id, 'audio', playlist.id)}
              style={({pressed}) => [styles.body, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.title}>
              <View style={styles.playBadge}>
                <Icon name="play" size={16} color={colors.onAccent} style={styles.playIcon} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </Pressable>
            {isDownloads ? null : (
              <Pressable
                onPress={() => removeFromPlaylist(playlist.id, item.id)}
                hitSlop={10}
                accessibilityLabel="ဖြုတ်ရန်">
                <Icon name="minus" size={22} color={colors.ink} />
              </Pressable>
            )}
          </View>
        )}
      />
      {isDownloads ? null : (
        <AddTracksModal
          visible={adding}
          playlistId={playlist.id}
          onClose={() => setAdding(false)}
        />
      )}
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
    addButtonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
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
