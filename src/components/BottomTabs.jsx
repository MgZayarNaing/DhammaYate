import React from 'react';
import {Pressable, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {tabs} from '../tabs';
import {myanmarFont} from '../theme';

export function BottomTabs({active, onChange}) {
  const insets = useSafeAreaInsets();
  const {colors, styles} = useThemedStyles(createStyles);

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
            <Icon
              name={tab.icon}
              size={22}
              color={selected ? colors.ink : colors.muted}
            />
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
