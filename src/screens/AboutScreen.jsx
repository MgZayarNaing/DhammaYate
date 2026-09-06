import React from 'react';
import {ScrollView, Text, View} from 'react-native';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {APP_NAME} from '../data/appLinks';
import {myanmarFont} from '../theme';

export function AboutScreen() {
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.name}>{APP_NAME}</Text>
        <Text style={styles.body}>
          တရားစာကို အော့ဖ်လိုင်းဖတ်ရန်၊ အသံဖိုင်နာရန်နှင့် စိတ်ကြိုက်စာရင်း သိမ်းရန်
          ဖန်တီးထားသော အက်ပ်ဖြစ်သည်။
        </Text>
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
      fontFamily: myanmarFont,
      fontSize: 28,
      fontWeight: '700',
      color: colors.ink,
      lineHeight: 40,
    },
    body: {
      marginTop: 12,
      fontFamily: myanmarFont,
      fontSize: 15,
      color: colors.muted,
      lineHeight: 26,
    },
  };
}
