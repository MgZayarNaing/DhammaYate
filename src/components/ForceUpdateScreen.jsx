import React from 'react';
import {Pressable, StatusBar, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function ForceUpdateScreen({onUpdate}) {
  const insets = useSafeAreaInsets();
  const {colors, styles} = useThemedStyles(createStyles);

  return (
    <View style={[styles.screen, {paddingBottom: Math.max(insets.bottom, 24)}]}>
      <StatusBar
        barStyle={colors.scheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.bg}
      />
      <View style={styles.body}>
        <Icon name="update" size={42} color={colors.ink} />
        <Text style={styles.title}>ဗားရှင်းအသစ် တင်ပါ</Text>
        <Text style={styles.message}>
          ဆက်သုံးရန် Play Store မှာ ဗားရှင်းအသစ်ကို တင်ရန် လိုအပ်ပါသည်။
        </Text>
        <Pressable
          onPress={onUpdate}
          style={({pressed}) => [styles.button, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel="Update">
          <Text style={styles.buttonText}>Update</Text>
        </Pressable>
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    screen: {
      flex: 1,
      backgroundColor: colors.bg,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    title: {
      marginTop: 18,
      fontFamily: myanmarFont,
      fontSize: 28,
      fontWeight: '700',
      color: colors.ink,
      textAlign: 'center',
    },
    message: {
      marginTop: 12,
      fontFamily: myanmarFont,
      fontSize: 16,
      lineHeight: 28,
      color: colors.muted,
      textAlign: 'center',
    },
    button: {
      marginTop: 28,
      backgroundColor: colors.ink,
      borderRadius: 14,
      paddingVertical: 14,
      paddingHorizontal: 36,
    },
    pressed: {
      opacity: 0.7,
    },
    buttonText: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.bg,
    },
  };
}
