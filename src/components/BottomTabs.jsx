import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {tabs} from '../tabs';
import {myanmarFont} from '../theme';

export function BottomTabs({active, onChange}) {
  const insets = useSafeAreaInsets();
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={[styles.bar, {paddingBottom: Math.max(insets.bottom, 8)}]}>
      {tabs.map(tab => {
        const selected = tab.id === active;
        return (
          <Pressable
            key={tab.id}
            onPress={() => onChange(tab.id)}
            style={styles.item}
            accessibilityRole="button"
            accessibilityState={{selected}}
            accessibilityLabel={tab.label}>
            <Text style={[styles.icon, selected && styles.iconActive]}>
              {tab.icon}
            </Text>
            <Text
              style={[styles.label, selected && styles.labelActive]}
              numberOfLines={2}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(colors) {
  return {
    bar: {
      flexDirection: 'row',
      borderTopWidth: 1,
      borderTopColor: colors.line,
      backgroundColor: colors.bg,
      paddingTop: 10,
      paddingBottom: 8,
    },
    item: {
      flex: 1,
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 2,
    },
    icon: {
      fontSize: 28,
      lineHeight: 32,
      color: colors.muted,
    },
    iconActive: {
      color: colors.ink,
    },
    label: {
      fontFamily: myanmarFont,
      fontSize: 10,
      lineHeight: 14,
      textAlign: 'center',
      color: colors.muted,
    },
    labelActive: {
      color: colors.ink,
      fontWeight: '600',
    },
  };
}
