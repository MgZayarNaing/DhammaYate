import {ScrollView, Text, View} from 'react-native';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {APP_NAME, APP_VERSION} from '../data/appLinks';
import {mmText, mmTextBold} from '../theme';
import { MmText } from '../components/MmText';

export function AboutScreen() {
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <MmText style={styles.name}>{APP_NAME}</MmText>
        <MmText style={styles.version}>Version {APP_VERSION}</MmText>
        <MmText style={styles.body}>
          တရားစာကို အော့ဖ်လိုင်းဖတ်ရန်၊ အသံဖိုင်နာရန်နှင့် စိတ်ကြိုက်စာရင်း သိမ်းရန်
          ဖန်တီးထားသော အက်ပ်ဖြစ်သည်။
        </MmText>
        <MmText style={styles.body}>
          စာဖတ်စဉ် အသံဖတ်ခြင်းသည် Meta MMS Burmese (CC-BY-NC 4.0) မော်ဒယ်ကို sherpa-onnx
          ဖြင့် အော့ဖ်လိုင်း အသုံးပြုသည်။
        </MmText>
      </ScrollView>
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
      paddingTop: 24,
      paddingBottom: 32,
    },
    name: {
      ...mmTextBold,
      fontSize: 28,
      color: colors.ink,
    },
    version: {
      marginTop: 6,
      ...mmText,
      fontSize: 14,
      color: colors.muted,
    },
    body: {
      marginTop: 12,
      ...mmText,
      fontSize: 15,
      color: colors.muted,
    },
  };
}
