import {useCallback, useEffect, useRef, useState} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {AppDialog} from '../components/AppDialog';
import {MmText} from '../components/MmText';
import {useApp} from '../context/AppContext';
import {getTextById} from '../data/texts';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {isTtsSpeaking, speakText, stopTts, subscribeTts} from '../tts';
import {
  cancelMmsModelDownload,
  downloadMmsModel,
  isMmsModelReady,
  TtsModelDownloadCancelledError,
} from '../ttsModel';

export function ReaderScreen({textId}) {
  const insets = useSafeAreaInsets();
  const {settings, goBack, toggleBookmark, bumpFontSize, markLastRead} = useApp();
  const {colors, styles} = useThemedStyles(createStyles);
  const text = getTextById(textId);
  const bookmarked = settings.bookmarks.includes(textId);
  const [progress, setProgress] = useState(0);
  const [speaking, setSpeaking] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [downloadRatio, setDownloadRatio] = useState(0);
  const [ttsDialog, setTtsDialog] = useState(null);
  const pendingSpeakRef = useRef(false);
  const downloadAcceptedRef = useRef(false);

  useEffect(() => {
    markLastRead(textId);
  }, [markLastRead, textId]);

  useEffect(() => {
    const unsubscribe = subscribeTts(event => {
      if (event === 'start') {
        setSpeaking(true);
        return;
      }
      if (event === 'finish' || event === 'cancel' || event === 'error') {
        setSpeaking(false);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    stopTts();
    setSpeaking(false);
    pendingSpeakRef.current = false;
    return () => {
      stopTts();
      cancelMmsModelDownload();
    };
  }, [textId]);

  const onScroll = event => {
    const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
    const max = contentSize.height - layoutMeasurement.height;
    if (max <= 0) {
      setProgress(1);
      return;
    }
    setProgress(Math.min(1, Math.max(0, contentOffset.y / max)));
  };

  const startSpeak = useCallback(async () => {
    if (!text) {
      return;
    }
    try {
      await speakText([text.title, ...(text.paragraphs ?? [])]);
    } catch (error) {
      setSpeaking(false);
      if (error?.code === 'MODEL_NOT_READY') {
        pendingSpeakRef.current = true;
        setTtsDialog({type: 'confirmDownload'});
        return;
      }
      setTtsDialog({
        type: 'error',
        title: 'အသံဖတ်၍ မရပါ',
        message: 'နောက်မှ ထပ်မံကြိုးစားပါ။',
      });
    }
  }, [text]);

  const runDownloadThenSpeak = useCallback(async () => {
    setDownloading(true);
    setDownloadRatio(0);
    setTtsDialog({type: 'downloading', progress: 0});
    try {
      await downloadMmsModel(ratio => {
        setDownloadRatio(ratio);
        setTtsDialog({type: 'downloading', progress: ratio});
      });
      setTtsDialog(null);
      setDownloading(false);
      if (pendingSpeakRef.current) {
        pendingSpeakRef.current = false;
        await startSpeak();
      }
    } catch (error) {
      setDownloading(false);
      pendingSpeakRef.current = false;
      if (error instanceof TtsModelDownloadCancelledError) {
        setTtsDialog(null);
        return;
      }
      setTtsDialog({
        type: 'error',
        title: 'ဒေါင်းလုဒ် မအောင်မြင်ပါ',
        message: 'အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပြီး ထပ်မံကြိုးစားပါ။',
      });
    }
  }, [startSpeak]);

  const toggleSpeak = useCallback(async () => {
    if (!text) {
      return;
    }
    if (downloading) {
      return;
    }
    if (speaking || isTtsSpeaking()) {
      await stopTts();
      setSpeaking(false);
      return;
    }
    const ready = await isMmsModelReady();
    if (!ready) {
      pendingSpeakRef.current = true;
      setTtsDialog({type: 'confirmDownload'});
      return;
    }
    await startSpeak();
  }, [downloading, speaking, startSpeak, text]);

  const closeDialog = useCallback(() => {
    // AppDialog calls onClose after onConfirm; keep the downloading dialog.
    if (downloadAcceptedRef.current) {
      downloadAcceptedRef.current = false;
      return;
    }
    if (ttsDialog?.type === 'downloading') {
      cancelMmsModelDownload();
      setDownloading(false);
      pendingSpeakRef.current = false;
    } else if (ttsDialog?.type === 'confirmDownload') {
      pendingSpeakRef.current = false;
    }
    setTtsDialog(null);
  }, [ttsDialog?.type]);

  if (!text) {
    return (
      <View style={styles.missing}>
        <MmText style={styles.missingText}>စာမတွေ့ပါ။</MmText>
        <Pressable onPress={goBack}>
          <MmText style={styles.backLink}>ပြန်သွားရန်</MmText>
        </Pressable>
      </View>
    );
  }

  const bodySize = settings.fontSize;
  const bodyLineHeight = Math.round(bodySize * 2.2);
  const percent = Math.round((ttsDialog?.progress ?? downloadRatio) * 100);

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.tools}>
          <Pressable onPress={() => bumpFontSize(-1)} hitSlop={8} accessibilityLabel="စာလုံးသေး">
            <MmText style={styles.tool}>က-</MmText>
          </Pressable>
          <Pressable onPress={() => bumpFontSize(1)} hitSlop={8} accessibilityLabel="စာလုံးကြီး">
            <MmText style={styles.tool}>က+</MmText>
          </Pressable>
          <Pressable
            onPress={toggleSpeak}
            hitSlop={8}
            disabled={downloading}
            accessibilityLabel={speaking ? 'အသံရပ်ရန်' : 'အသံဖတ်ရန်'}>
            <Icon
              name={speaking ? 'stop' : downloading ? 'download' : 'volume-high'}
              size={22}
              color={downloading ? colors.muted : colors.ink}
            />
          </Pressable>
          <Pressable
            onPress={() => toggleBookmark(text.id)}
            hitSlop={8}
            accessibilityLabel="မှတ်သားရန်">
            <Icon
              name={bookmarked ? 'bookmark-check' : 'bookmark-outline'}
              size={22}
              color={colors.ink}
            />
          </Pressable>
        </View>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, {width: `${Math.round(progress * 100)}%`}]} />
      </View>
      <ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={[styles.body, {paddingBottom: insets.bottom + 40}]}>
        <MmText style={styles.title}>{text.title}</MmText>
        <MmText style={styles.subtitle}>{text.subtitle}</MmText>
        {text.paragraphs.map((paragraph, index) => (
          <MmText
            key={`${text.id}-${index}`}
            style={[styles.paragraph, {fontSize: bodySize, lineHeight: bodyLineHeight}]}>
            {paragraph}
          </MmText>
        ))}
      </ScrollView>
      <AppDialog
        visible={Boolean(ttsDialog)}
        variant={ttsDialog?.type === 'confirmDownload' ? 'confirmCancel' : 'downloadFailed'}
        title={
          ttsDialog?.type === 'confirmDownload'
            ? 'မြန်မာအသံ'
            : ttsDialog?.type === 'downloading'
              ? 'ဒေါင်းလုဒ်လုပ်နေသည်'
              : ttsDialog?.title ?? ''
        }
        message={
          ttsDialog?.type === 'confirmDownload'
            ? 'ပထမအကြိမ် အသံဖတ်ရန် မြန်မာအသံ  (~114MB) ကို ဒေါင်းလုဒ်လုပ်ရန် လိုပါသည်။ ဒေါင်းလုဒ်ပြီးနောက် အော့ဖ်လိုင်း အသုံးပြုနိုင်ပါသည်။'
            : ttsDialog?.type === 'downloading'
              ? `မြန်မာအသံ ဒေါင်းလုဒ်လုပ်နေသည်… ${percent}%`
              : ttsDialog?.message
        }
        confirmLabel={
          ttsDialog?.type === 'confirmDownload'
            ? 'ဒေါင်းလုဒ်'
            : ttsDialog?.type === 'downloading'
              ? 'ပယ်ဖျက်ရန်'
              : 'OK'
        }
        cancelLabel="မလုပ်တော့"
        onConfirm={
          ttsDialog?.type === 'confirmDownload'
            ? () => {
                downloadAcceptedRef.current = true;
                pendingSpeakRef.current = true;
                runDownloadThenSpeak();
              }
            : undefined
        }
        onClose={closeDialog}
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
    topBar: {
      paddingHorizontal: 16,
      paddingTop: 10,
      paddingBottom: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderBottomWidth: 1,
      borderBottomColor: colors.line,
      backgroundColor: colors.bg,
    },
    tools: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 16,
    },
    tool: {
      fontSize: 16,
      color: colors.ink,
    },
    progressTrack: {
      height: 3,
      backgroundColor: colors.parchment,
    },
    progressFill: {
      height: 3,
      backgroundColor: colors.ink,
    },
    body: {
      paddingHorizontal: 22,
      paddingTop: 24,
    },
    title: {
      marginTop: 0,
      fontSize: 28,
      lineHeight: 52,
      color: colors.ink,
    },
    subtitle: {
      marginTop: 8,
      marginBottom: 8,
      fontSize: 15,
      lineHeight: 32,
      color: colors.muted,
    },
    paragraph: {
      marginTop: 16,
      color: colors.ink,
    },
    missing: {
      flex: 1,
      backgroundColor: colors.bg,
      alignItems: 'center',
      paddingTop: 20,
    },
    missingText: {
      fontSize: 16,
      color: colors.ink,
      lineHeight: 30,
    },
    backLink: {
      marginTop: 12,
      color: colors.ink,
      fontSize: 15,
      lineHeight: 28,
    },
  };
}
