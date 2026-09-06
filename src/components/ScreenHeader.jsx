import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {myanmarFont} from '../theme';

export function ScreenHeader({title, subtitle, right, onBack}) {
  const insets = useSafeAreaInsets();
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={[styles.wrap, {paddingTop: insets.top + 12}]}>
      {onBack ? (
        <Pressable onPress={onBack} hitSlop={12} accessibilityLabel="နောက်သို့">
          <Text style={styles.back}>‹ နောက်</Text>
        </Pressable>
      ) : null}
      <View style={styles.row}>
        <View style={styles.text}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        {right}
      </View>
    </View>
  );
}

function createStyles(colors) {
  return {
    wrap: {
      paddingHorizontal: 20,
      paddingBottom: 12,
      backgroundColor: colors.bg,
    },
    back: {
      fontFamily: myanmarFont,
      fontSize: 16,
      color: colors.ink,
      fontWeight: '600',
      marginBottom: 4,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
      gap: 12,
    },
    text: {
      flex: 1,
    },
    title: {
      fontFamily: myanmarFont,
      fontSize: 28,
      fontWeight: '700',
      color: colors.ink,
      lineHeight: 40,
    },
    subtitle: {
      marginTop: 2,
      fontFamily: myanmarFont,
      fontSize: 14,
      color: colors.muted,
      lineHeight: 22,
    },
  };
}
