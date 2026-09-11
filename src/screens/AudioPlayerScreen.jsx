import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Animated, Easing, Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SoundPlayer from 'react-native-sound-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AddToPlaylistModal} from '../components/PlaylistModals';
import {useApp} from '../context/AppContext';
import {getAdjacentAudio, getAudioById, getPlaylistQueue} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

function formatTime(seconds) {
  const safe = Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  const mins = Math.floor(safe / 60);
  const secs = Math.floor(safe % 60);
  return `${mins}:${String(secs).padStart(2, '0')}`;
}

function safeSeek(seconds) {
  try {
    SoundPlayer.seek(seconds);
  } catch {
    // Seek is unavailable on some devices.
  }
}

function safePlay() {
  try {
    SoundPlayer.play();
    return true;
  } catch {
    return false;
  }
}

export function AudioPlayerScreen({audioId}) {
  const insets = useSafeAreaInsets();
  const {goBack, openAudio, route, settings} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const audio = getAudioById(audioId);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [adding, setAdding] = useState(false);
  const timerRef = useRef(null);
  const trackWidthRef = useRef(0);
  const scrubbingRef = useRef(false);
  const loopRef = useRef(loop);
  const audioIdRef = useRef(audioId);
  const fromTabRef = useRef('audio');
  const playlistIdRef = useRef(route.playlistId);
  const queueRef = useRef([]);
  const spin = useRef(new Animated.Value(0)).current;
  const spinLoop = useRef(null);

  const playlist = (settings.playlists ?? []).find(item => item.id === route.playlistId);
  const queue = getPlaylistQueue(playlist);
  const index = queue.findIndex(item => item.id === audioId);
  const fromTab = route.from && route.from !== 'audioPlayer' ? route.from : 'audio';
  loopRef.current = loop;
  audioIdRef.current = audioId;
  fromTabRef.current = fromTab;
  playlistIdRef.current = route.playlistId;
  queueRef.current = queue;

  const spinStyle = useMemo(
    () => ({
      transform: [
        {
          rotate: spin.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          }),
        },
      ],
    }),
    [spin],
  );

  useEffect(() => {
    if (playing) {
      spinLoop.current = Animated.loop(
        Animated.timing(spin, {
          toValue: 1,
          duration: 8000,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
      );
      spinLoop.current.start();
      return () => {
        spinLoop.current?.stop();
        spin.setValue(0);
      };
    }
    spinLoop.current?.stop();
    return undefined;
  }, [playing, spin]);

  useEffect(() => {
    if (!audio?.file) {
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      return undefined;
    }

    const loaded = SoundPlayer.addEventListener('FinishedLoading', async () => {
      try {
        const info = await SoundPlayer.getInfo();
        setDuration(info.duration ?? 0);
        setCurrentTime(0);
      } catch {
        setDuration(0);
      }
      if (safePlay()) {
        setPlaying(true);
      }
    });
    const finished = SoundPlayer.addEventListener('FinishedPlaying', () => {
      setCurrentTime(0);
      if (loopRef.current) {
        safeSeek(0);
        if (safePlay()) {
          setPlaying(true);
        }
        return;
      }
      const currentId = audioIdRef.current;
      const currentQueue = queueRef.current;
      const currentIndex = currentQueue.findIndex(item => item.id === currentId);
      if (currentIndex !== -1 && currentIndex < currentQueue.length - 1) {
        const next = getAdjacentAudio(currentId, 1, currentQueue);
        if (next) {
          openAudio(next.id, fromTabRef.current, playlistIdRef.current);
          return;
        }
      }
      setPlaying(false);
    });

    try {
      SoundPlayer.stop();
    } catch {
      // Ignore if nothing is playing.
    }
    setPlaying(false);
    setCurrentTime(0);
    try {
      SoundPlayer.loadAsset(audio.file);
    } catch {
      setPlaying(false);
    }

    return () => {
      loaded.remove();
      finished.remove();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      try {
        SoundPlayer.stop();
      } catch {
        // Native player may already be released.
      }
    };
  }, [audio?.file, audioId, openAudio]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return undefined;
    }

    timerRef.current = setInterval(async () => {
      if (scrubbingRef.current) {
        return;
      }
      try {
        const info = await SoundPlayer.getInfo();
        setCurrentTime(info.currentTime ?? 0);
        if (info.duration) {
          setDuration(info.duration);
        }
      } catch {
        // Keep last known time.
      }
    }, 400);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [playing]);

  if (!audio) {
    return (
      <View style={[styles.screen, {paddingTop: insets.top + 12}]}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="နောက်သို့">
          <View style={styles.backRow}>
            <Icon name="chevron-left" size={22} color={colors.ink} />
            <Text style={styles.back}>နောက်</Text>
          </View>
        </Pressable>
        <Text style={styles.missingText}>အသံဖိုင် မတွေ့ပါ။</Text>
      </View>
    );
  }

  const hasFile = Boolean(audio.file);
  const progress = duration > 0 ? Math.min(1, currentTime / duration) : 0;

  const seekToRatio = ratio => {
    if (!hasFile || duration <= 0) {
      return;
    }
    const next = Math.min(duration, Math.max(0, duration * ratio));
    safeSeek(next);
    setCurrentTime(next);
  };

  const seekFromEvent = event => {
    const width = trackWidthRef.current;
    if (!width) {
      return;
    }
    seekToRatio(event.nativeEvent.locationX / width);
  };

  const togglePlay = () => {
    if (!hasFile) {
      return;
    }
    try {
      if (playing) {
        SoundPlayer.pause();
        setPlaying(false);
        return;
      }
      if (safePlay()) {
        setPlaying(true);
      }
    } catch {
      setPlaying(false);
    }
  };

  const skipBy = delta => {
    if (!hasFile || duration <= 0) {
      return;
    }
    const next = Math.min(duration, Math.max(0, currentTime + delta));
    safeSeek(next);
    setCurrentTime(next);
  };

  const goAdjacent = delta => {
    if (delta < 0 && currentTime > 3) {
      safeSeek(0);
      setCurrentTime(0);
      return;
    }
    const next = getAdjacentAudio(audioId, delta, queue);
    if (next) {
      openAudio(next.id, fromTab, route.playlistId);
    }
  };

  return (
    <View
      style={[
        styles.screen,
        {paddingTop: insets.top + 8, paddingBottom: Math.max(insets.bottom, 20)},
      ]}>
      <View style={styles.topBar}>
        <Pressable onPress={goBack} hitSlop={12} accessibilityLabel="နောက်သို့">
          <View style={styles.backRow}>
            <Icon name="chevron-left" size={22} color={colors.ink} />
            <Text style={styles.back}>နောက်</Text>
          </View>
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.count}>
          {index >= 0 ? `${index + 1} / ${queue.length}` : ''}
        </Text>
        <Text style={styles.title}>{audio.title}</Text>
        <Animated.View style={[styles.disc, spinStyle]}>
          <Text style={styles.discIcon}>☸</Text>
        </Animated.View>
      </View>

      <View style={styles.footer}>
        <View
          style={styles.trackHit}
          onLayout={event => {
            trackWidthRef.current = event.nativeEvent.layout.width;
          }}
          onStartShouldSetResponder={() => hasFile && duration > 0}
          onMoveShouldSetResponder={() => hasFile && duration > 0}
          onResponderGrant={event => {
            scrubbingRef.current = true;
            seekFromEvent(event);
          }}
          onResponderMove={seekFromEvent}
          onResponderRelease={() => {
            scrubbingRef.current = false;
          }}>
          <View style={styles.track}>
            <View style={[styles.fill, {width: `${Math.round(progress * 100)}%`}]} />
          </View>
          <View style={[styles.knob, {left: `${Math.round(progress * 100)}%`}]} />
        </View>
        <View style={styles.times}>
          <Text style={styles.time}>{formatTime(currentTime)}</Text>
          <Text style={styles.time}>{formatTime(duration)}</Text>
        </View>
        <View style={styles.controls}>
          <Pressable
            onPress={() => setLoop(on => !on)}
            style={[styles.toolButton, loop && styles.toolButtonOn]}
            accessibilityRole="button"
            accessibilityState={{selected: loop}}
            accessibilityLabel={loop ? 'Loop ပိတ်ရန်' : 'Loop ဖွင့်ရန်'}>
            <Icon name="repeat" size={18} color={loop ? colors.onAccent : colors.ink} />
          </Pressable>
          <Pressable onPress={() => goAdjacent(-1)} hitSlop={8} accessibilityLabel="ယခင်အသံ">
            <Icon name="skip-previous" size={22} color={colors.ink} />
          </Pressable>
          <Pressable onPress={() => skipBy(-10)} hitSlop={8} accessibilityLabel="နောက်သို့ ၁၀ စက္ကန့်">
            <Text style={styles.skipSmall}>-10</Text>
          </Pressable>
          <Pressable
            onPress={togglePlay}
            style={[styles.playButton, !hasFile && styles.playDisabled]}
            accessibilityRole="button"
            accessibilityLabel={playing ? 'ခဏရပ်ရန်' : 'ဖွင့်ရန်'}>
            <Icon
              name={playing ? 'pause' : 'play'}
              size={26}
              color={colors.onAccent}
              style={playing ? undefined : styles.playIcon}
            />
          </Pressable>
          <Pressable onPress={() => skipBy(10)} hitSlop={8} accessibilityLabel="ရှေ့သို့ ၁၀ စက္ကန့်">
            <Text style={styles.skipSmall}>+10</Text>
          </Pressable>
          <Pressable onPress={() => goAdjacent(1)} hitSlop={8} accessibilityLabel="ရှေ့အသံ">
            <Icon name="skip-next" size={22} color={colors.ink} />
          </Pressable>
          <Pressable
            onPress={() => setAdding(true)}
            style={styles.toolButton}
            accessibilityRole="button"
            accessibilityLabel="Playlist ထည့်ရန်">
            <Icon name="plus" size={20} color={colors.ink} />
          </Pressable>
        </View>
      </View>
      <AddToPlaylistModal
        visible={adding}
        audioId={audio.id}
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
      paddingHorizontal: 20,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      minHeight: 36,
    },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -6,
    },
    back: {
      fontFamily: myanmarFont,
      fontSize: 16,
      fontWeight: '600',
      color: colors.ink,
    },
    toolButton: {
      width: 34,
      height: 34,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.line,
      alignItems: 'center',
      justifyContent: 'center',
    },
    toolButtonOn: {
      backgroundColor: colors.ink,
      borderColor: colors.ink,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    count: {
      fontFamily: myanmarFont,
      fontSize: 13,
      color: colors.muted,
      marginBottom: 8,
    },
    title: {
      fontFamily: myanmarFont,
      fontSize: 26,
      fontWeight: '700',
      color: colors.ink,
      lineHeight: 38,
      textAlign: 'center',
      paddingHorizontal: 8,
    },
    disc: {
      marginTop: 36,
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: colors.blue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    discIcon: {
      fontSize: 64,
      color: colors.onAccent,
    },
    footer: {
      paddingBottom: 8,
    },
    trackHit: {
      width: '100%',
      height: 28,
      justifyContent: 'center',
    },
    track: {
      width: '100%',
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.line,
    },
    fill: {
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.blue,
    },
    knob: {
      position: 'absolute',
      width: 14,
      height: 14,
      borderRadius: 7,
      marginLeft: -7,
      backgroundColor: colors.ink,
    },
    times: {
      marginTop: 4,
      width: '100%',
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    time: {
      fontSize: 12,
      color: colors.muted,
    },
    controls: {
      marginTop: 22,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    skipSmall: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.ink,
      minWidth: 24,
      textAlign: 'center',
    },
    playButton: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.blue,
      alignItems: 'center',
      justifyContent: 'center',
    },
    playDisabled: {
      opacity: 0.4,
    },
    playIcon: {
      marginLeft: 3,
    },
    missingText: {
      marginTop: 24,
      fontFamily: myanmarFont,
      fontSize: 16,
      color: colors.ink,
    },
  };
}
