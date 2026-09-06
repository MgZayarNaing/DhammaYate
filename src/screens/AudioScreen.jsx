import React, {useState} from 'react';
import {Pressable, ScrollView, Text, View} from 'react-native';
import {CreatePlaylistModal} from '../components/PlaylistModals';
import {useApp} from '../context/AppContext';
import {dhammaAudios, getAudioById} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function AudioScreen() {
  const {openAudio, openPlaylist, settings} = useApp();
  const {styles} = useThemedStyles(createStyles);
  const [creating, setCreating] = useState(false);
  const playlists = settings.playlists ?? [];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          <Text style={styles.section}>Playlist</Text>
          <Pressable onPress={() => setCreating(true)} hitSlop={8} accessibilityLabel="Playlist အသစ်">
            <Text style={styles.addLink}>+ အသစ်</Text>
          </Pressable>
        </View>
        {playlists.length === 0 ? (
          <Text style={styles.hint}>Playlist အသစ်တွင် အသံဖိုင်များ ရွေးချယ်နိုင်သည်။</Text>
        ) : (
          <View style={styles.stack}>
            {playlists.map(playlist => (
              <View key={playlist.id} style={styles.card}>
                <Pressable
                  onPress={() => {
                    const first = playlist.audioIds
                      .map(id => getAudioById(id))
                      .find(Boolean);
                    if (first) {
                      openAudio(first.id, 'audio', playlist.id);
                    }
                  }}
                  style={({pressed}) => [styles.playBadge, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={`${playlist.name} All`}>
                  <Text style={styles.playIcon}>▶</Text>
                </Pressable>
                <Pressable
                  onPress={() => openPlaylist(playlist.id)}
                  style={({pressed}) => [styles.playlistBody, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={playlist.name}>
                  <Text style={styles.title}>{playlist.name}</Text>
                  <Text style={styles.meta}>{playlist.audioIds.length} ပုဒ်</Text>
                  <Text style={styles.chevron}>›</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.section}>အသံဖိုင်များ</Text>
        <View style={styles.stack}>
          {dhammaAudios.map(item => (
            <Pressable
              key={item.id}
              onPress={() => openAudio(item.id, 'audio')}
              style={({pressed}) => [styles.card, pressed && styles.pressed]}
              accessibilityRole="button"
              accessibilityLabel={item.title}>
              <View style={styles.playBadge}>
                <Text style={styles.playIcon}>▶</Text>
              </View>
              <Text style={styles.title}>{item.title}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
      <CreatePlaylistModal visible={creating} onClose={() => setCreating(false)} />
    </View>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    content: {
      paddingHorizontal: 20,
      paddingTop: 16,
      paddingBottom: 28,
    },
    sectionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    section: {
      marginTop: 8,
      marginBottom: 12,
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '700',
      color: colors.ink,
    },
    addLink: {
      fontFamily: myanmarFont,
      fontSize: 15,
      fontWeight: '700',
      color: colors.ink,
    },
    hint: {
      fontFamily: myanmarFont,
      fontSize: 14,
      color: colors.muted,
      lineHeight: 24,
      marginBottom: 8,
    },
    stack: {
      gap: 10,
      marginBottom: 20,
    },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: 16,
      paddingVertical: 14,
      paddingHorizontal: 14,
      borderWidth: 1,
      borderColor: colors.line,
    },
    pressed: {
      opacity: 0.85,
    },
    playlistBody: {
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
    meta: {
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.muted,
      marginRight: 8,
    },
    chevron: {
      fontSize: 26,
      color: colors.ink,
      lineHeight: 28,
    },
  };
}
