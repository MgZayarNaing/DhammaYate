import React, {useMemo, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {CategoryChips} from '../components/CategoryChips';
import {CreatePlaylistModal} from '../components/PlaylistModals';
import {MmText} from '../components/MmText';
import {useApp} from '../context/AppContext';
import {dhammaAudios, getAudioById, getDownloadsPlaylist} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {categories} from '../theme';

const categoryLabelById = Object.fromEntries(categories.map(c => [c.id, c.label]));
const sortedAudios = [...dhammaAudios].sort((a, b) => a.sort - b.sort);

export function AudioScreen() {
  const {openAudio, openPlaylist, settings} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const [creating, setCreating] = useState(false);
  const [category, setCategory] = useState('all');
  const playlists = settings.playlists ?? [];
  const downloaded = settings.downloadedAudioIds ?? [];
  const downloadsPlaylist = getDownloadsPlaylist(downloaded);
  const totalPlaylists = [downloadsPlaylist, ...playlists].filter(Boolean);

  const audioCategoryIds = useMemo(() => {
    const counts = {};
    for (const item of dhammaAudios) {
      if (item.category) {
        counts[item.category] = (counts[item.category] || 0) + 1;
      }
    }
    return categories
      .map(c => c.id)
      .filter(id => (counts[id] || 0) > 0)
      .sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  }, []);

  const categoryCounts = useMemo(() => {
    const counts = {all: dhammaAudios.length};
    for (const id of audioCategoryIds) {
      counts[id] = 0;
    }
    for (const item of dhammaAudios) {
      if (counts[item.category] != null) {
        counts[item.category] += 1;
      }
    }
    return counts;
  }, [audioCategoryIds]);

  const filteredAudios = useMemo(() => {
    if (category === 'all') {
      return sortedAudios;
    }
    return sortedAudios.filter(item => item.category === category);
  }, [category]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionRow}>
          <MmText style={styles.section}>Playlist</MmText>
          <Pressable onPress={() => setCreating(true)} hitSlop={8} accessibilityLabel="Playlist အသစ်">
            <View style={styles.addLinkRow}>
              <Icon name="plus" size={16} color={colors.ink} />
              <MmText style={styles.addLink}>အသစ်</MmText>
            </View>
          </Pressable>
        </View>
        {playlists.length === 0 ? (
          <MmText style={styles.hint}>Playlist အသစ်တွင် အသံဖိုင်များ ရွေးချယ်နိုင်သည်။</MmText>
        ) : null}
        {totalPlaylists.length > 0 ? (
          <View style={styles.stack}>
            {totalPlaylists.map(playlist => (
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
                  <Icon name="play" size={16} color={colors.onAccent} style={styles.playIcon} />
                </Pressable>
                <Pressable
                  onPress={() => openPlaylist(playlist.id)}
                  style={({pressed}) => [styles.playlistBody, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={playlist.name}>
                  <MmText style={styles.playlistTitle}>{playlist.name}</MmText>
                  <MmText style={styles.meta}>{playlist.audioIds.length} ပုဒ်</MmText>
                  <Icon name="chevron-right" size={22} color={colors.ink} />
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

        <View style={styles.sectionRow}>
          <MmText style={[styles.section, styles.sectionFlush]}>အသံဖိုင်များ</MmText>
          <MmText style={styles.sectionCount}>{filteredAudios.length} ပုဒ်</MmText>
        </View>
        <View style={styles.chipsWrap}>
          <CategoryChips
            selected={category}
            onSelect={setCategory}
            categoryIds={audioCategoryIds}
            counts={categoryCounts}
            contentContainerStyle={styles.chipsRow}
          />
        </View>
        <View style={styles.stack}>
          {filteredAudios.length === 0 ? (
            <MmText style={styles.empty}>ဤအမျိုးအစားတွင် အသံဖိုင်မရှိပါ။</MmText>
          ) : (
            filteredAudios.map(item => (
              <Pressable
                key={item.id}
                onPress={() => openAudio(item.id, 'audio')}
                style={({pressed}) => [styles.card, pressed && styles.pressed]}
                accessibilityRole="button"
                accessibilityLabel={item.title}>
                <View style={styles.playBadge}>
                  <Icon name="play" size={16} color={colors.onAccent} style={styles.playIcon} />
                </View>
                <View style={styles.audioBody}>
                  <MmText style={styles.audioTitle} numberOfLines={2}>
                    {item.title}
                  </MmText>
                  <MmText style={styles.subtitle} numberOfLines={1}>
                    {(category === 'all'
                      ? [categoryLabelById[item.category], item.speaker]
                      : [item.speaker]
                    )
                      .filter(Boolean)
                      .join(' · ')}
                  </MmText>
                </View>
                {downloaded.includes(item.id) ? (
                  <Icon name="check-circle-outline" size={18} color={colors.muted} />
                ) : null}
              </Pressable>
            ))
          )}
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
      fontSize: 16,
      color: colors.ink,
    },
    sectionFlush: {
      marginBottom: 10,
    },
    sectionCount: {
      fontSize: 13,
      color: colors.muted,
      marginBottom: 10,
    },
    chipsWrap: {
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      marginBottom: 14,
    },
    chipsRow: {
      paddingHorizontal: 0,
    },
    addLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    addLink: {
      fontSize: 15,
      color: colors.ink,
    },
    hint: {
      fontSize: 14,
      color: colors.muted,
      marginBottom: 8,
    },
    empty: {
      fontSize: 14,
      color: colors.muted,
      textAlign: 'center',
      paddingVertical: 24,
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
    audioBody: {
      flex: 1,
      marginRight: 8,
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
    playlistTitle: {
      flex: 1,
      fontSize: 17,
      color: colors.ink,
    },
    audioTitle: {
      fontSize: 17,
      color: colors.ink,
    },
    subtitle: {
      fontSize: 13,
      color: colors.muted,
      marginTop: 2,
    },
    meta: {
      fontSize: 13,
      color: colors.muted,
      marginRight: 8,
    },
  };
}
