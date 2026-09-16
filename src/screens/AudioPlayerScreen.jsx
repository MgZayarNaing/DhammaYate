import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  Image,
  Pressable,
  Text,
  View,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import SoundPlayer from 'react-native-sound-player';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  audioFileExists,
  deleteAudioDownload,
  downloadAudio,
  filePlayUrl,
  localAudioPath,
} from '../audioFiles';
import {AddToPlaylistModal} from '../components/PlaylistModals';
import {useApp} from '../context/AppContext';
import {
  getAdjacentAudio,
  getAudioById,
  getPlaylistQueue,
  resolvePlaylist,
} from '../data/audios';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

const HERO_SIZE = 240;
const LOGO_SIZE = 240;
const RAY_SIZE = 120;

const HEAD_CENTER_X = HERO_SIZE / 2;
const HEAD_CENTER_Y = (HERO_SIZE - LOGO_SIZE) / 2 + LOGO_SIZE * 0.25;
const RAY_TOP = HEAD_CENTER_Y - RAY_SIZE / 2;
const RAY_LEFT = HEAD_CENTER_X - RAY_SIZE / 2;

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
  const {
    goBack,
    openAudio,
    route,
    settings,
    markAudioDownloaded,
    unmarkAudioDownloaded,
  } = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const audio = getAudioById(audioId);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [loop, setLoop] = useState(false);
  const [adding, setAdding] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [localRevision, setLocalRevision] = useState(0);
  const timerRef = useRef(null);
  const trackWidthRef = useRef(0);
  const scrubbingRef = useRef(false);
  const loopRef = useRef(loop);
  const audioIdRef = useRef(audioId);
  const fromTabRef = useRef('audio');
  const playlistIdRef = useRef(route.playlistId);
  const queueRef = useRef([]);
  const rayA = useRef(new Animated.Value(0)).current;
  const rayB = useRef(new Animated.Value(0)).current;
  const rayC = useRef(new Animated.Value(0)).current;
  const rayLoop = useRef(null);

  const playlist = resolvePlaylist(route.playlistId, settings);
  const queue = getPlaylistQueue(playlist);
  const index = queue.findIndex(item => item.id === audioId);
  const fromTab = route.from && route.from !== 'audioPlayer' ? route.from : 'audio';
  loopRef.current = loop;
  audioIdRef.current = audioId;
  fromTabRef.current = fromTab;
  playlistIdRef.current = route.playlistId;
  queueRef.current = queue;

  const rayStyles = useMemo(() => {
    const makeRing = value => ({
      transform: [
        {
          scale: value.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.45],
          }),
        },
      ],
      opacity: value.interpolate({
        inputRange: [0, 0.2, 1],
        outputRange: [0.45, 0.3, 0],
      }),
    });
    return [makeRing(rayA), makeRing(rayB), makeRing(rayC)];
  }, [rayA, rayB, rayC]);

  useEffect(() => {
    const rays = [rayA, rayB, rayC];
    if (playing) {
      rays.forEach(value => value.setValue(0));
      const animations = rays.map((value, index) =>
        Animated.sequence([
          Animated.delay(index * 600),
          Animated.loop(
            Animated.sequence([
              Animated.timing(value, {
                toValue: 1,
                duration: 1800,
                easing: Easing.out(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.timing(value, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ]),
          ),
        ]),
      );
      rayLoop.current = Animated.parallel(animations);
      rayLoop.current.start();
      return () => {
        rayLoop.current?.stop();
      };
    }
    rayLoop.current?.stop();
    Animated.parallel(
      rays.map(value =>
        Animated.timing(value, {
          toValue: 0,
          duration: 280,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
      ),
    ).start();
    return undefined;
  }, [playing, rayA, rayB, rayC]);

  useEffect(() => {
    if (!audio?.file) {
      setPlaying(false);
      setCurrentTime(0);
      setDuration(0);
      setOfflineReady(false);
      return undefined;
    }

    let cancelled = false;
    const onLoaded = async () => {
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
    };
    const loaded = SoundPlayer.addEventListener('FinishedLoading', onLoaded);
    const loadedUrl = SoundPlayer.addEventListener('FinishedLoadingURL', onLoaded);
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

    (async () => {
      try {
        if (typeof audio.file === 'string') {
          const hasLocal = await audioFileExists(audio.id);
          if (cancelled) {
            return;
          }
          setOfflineReady(hasLocal);
          if (hasLocal) {
            markAudioDownloaded(audio.id);
            SoundPlayer.loadUrl(filePlayUrl(localAudioPath(audio.id)));
          } else {
            unmarkAudioDownloaded(audio.id);
            SoundPlayer.loadUrl(audio.file);
          }
        } else {
          setOfflineReady(false);
          SoundPlayer.loadAsset(audio.file);
        }
      } catch (error) {
        console.warn('[audio play]', audio.id, audio.file, error);
        if (!cancelled) {
          setPlaying(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      loaded.remove();
      loadedUrl.remove();
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
  }, [audio?.file, audio?.id, audioId, localRevision, markAudioDownloaded, openAudio, unmarkAudioDownloaded]);

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

  const canDownload = typeof audio.file === 'string';

  const removeDownload = async () => {
    try {
      await deleteAudioDownload(audio.id);
      unmarkAudioDownloaded(audio.id);
      setOfflineReady(false);
      setLocalRevision(value => value + 1);
    } catch (error) {
      console.warn('[audio delete]', audio.id, error);
      Alert.alert('ဖျက်မရပါ', 'ဒေါင်းလုဒ်ဖိုင်ကို ဖျက်၍မရပါ။');
    }
  };

  const onDownloadPress = () => {
    if (!canDownload || downloading) {
      return;
    }
    if (offlineReady) {
      Alert.alert('ဒေါင်းလုဒ် ဖျက်မည်လား', 'သိမ်းထားသော အသံဖိုင်ကို ဖျက်မည်။', [
        {text: 'မလုပ်တော့', style: 'cancel'},
        {text: 'ဖျက်မည်', style: 'destructive', onPress: () => removeDownload()},
      ]);
      return;
    }
    setDownloading(true);
    downloadAudio(audio.id, audio.file)
      .then(() => {
        markAudioDownloaded(audio.id);
        setOfflineReady(true);
        setLocalRevision(value => value + 1);
      })
      .catch(error => {
        console.warn('[audio download]', audio.id, audio.file, error);
        Alert.alert(
          'ဒေါင်းလုဒ် မအောင်မြင်ပါ',
        );
      })
      .finally(() => {
        setDownloading(false);
      });
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
        {canDownload ? (
          <Pressable
            onPress={onDownloadPress}
            style={[styles.toolButton, offlineReady && styles.toolButtonOn]}
            accessibilityRole="button"
            accessibilityLabel={
              offlineReady ? 'ဒေါင်းလုဒ် ဖျက်ရန်' : 'အော့ဖ်လိုင်း သိမ်းရန်'
            }>
            {downloading ? (
              <ActivityIndicator size="small" color={colors.ink} />
            ) : (
              <Icon
                name={offlineReady ? 'cloud' : 'download'}
                size={18}
                color={offlineReady ? colors.onAccent : colors.ink}
              />
            )}
          </Pressable>
        ) : (
          <View style={styles.toolButtonSpacer} />
        )}
      </View>

      <View style={styles.body}>
        <Text style={styles.count}>
          {index >= 0 ? `${index + 1} / ${queue.length}` : ''}
        </Text>
        <Text style={styles.title}>{audio.title}</Text>
        <View style={styles.hero}>
          {rayStyles.map((ringStyle, ringIndex) => (
            <Animated.View
              key={`ray-${ringIndex}`}
              pointerEvents="none"
              style={[styles.rayRing, ringStyle, {borderColor: colors.ink}]}
            />
          ))}
          <View style={styles.logoDisc}>
            <Image
              source={require('../assets/images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="ဘုရား"
            />
          </View>
        </View>
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
      justifyContent: 'space-between',
      minHeight: 36,
    },
    toolButtonSpacer: {
      width: 34,
      height: 34,
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
      backgroundColor: colors.gold,
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
    hero: {
      marginTop: 36,
      width: HERO_SIZE,
      height: HERO_SIZE,
      alignItems: 'center',
      justifyContent: 'center',
    },
    rayRing: {
      position: 'absolute',
      top: RAY_TOP,
      left: RAY_LEFT,
      width: RAY_SIZE,
      height: RAY_SIZE,
      borderRadius: RAY_SIZE / 2,
      borderWidth: 1,
      borderColor: colors.ink,
      backgroundColor: 'yellow',
      opacity: 0,
    },
    logoDisc: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
      borderRadius: LOGO_SIZE / 2,
      overflow: 'hidden',
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
    logo: {
      width: LOGO_SIZE,
      height: LOGO_SIZE,
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
