import {useMemo} from 'react';
import {Pressable, ScrollView, View} from 'react-native';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {categories} from '../theme';
import {MmText} from './MmText';

export function CategoryChips({
  selected,
  onSelect,
  categoryIds,
  counts,
  count = 'off',
  contentContainerStyle,
}) {
  const {styles} = useThemedStyles(createStyles);
  const showCount = count === 'on';

  const visibleCategories = useMemo(() => {
    if (!categoryIds?.length) {
      return categories;
    }
    const byId = new Map(categories.map(category => [category.id, category]));
    return categoryIds.map(id => byId.get(id)).filter(Boolean);
  }, [categoryIds]);

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={[styles.row, contentContainerStyle]}>
      <Chip
        label="အားလုံး"
        count={showCount ? counts?.all : undefined}
        active={selected === 'all'}
        onPress={() => onSelect('all')}
        styles={styles}
      />
      {visibleCategories.map(category => (
        <Chip
          key={category.id}
          icon={category.emoji}
          label={category.label}
          count={showCount ? counts?.[category.id] : undefined}
          active={selected === category.id}
          onPress={() => onSelect(category.id)}
          styles={styles}
        />
      ))}
    </ScrollView>
  );
}

function Chip({icon, label, count, active, onPress, styles}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active && styles.chipActive]}
      accessibilityRole="button"
      accessibilityState={{selected: active}}>
      <View style={styles.labelRow}>
        {icon ? (
          <MmText style={[styles.icon, active && styles.iconActive]}>{icon}</MmText>
        ) : null}
        <MmText style={[styles.label, active && styles.labelActive]}>{label}</MmText>
        {typeof count === 'number' ? (
          <MmText style={[styles.count, active && styles.countActive]}>{count}</MmText>
        ) : null}
      </View>
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    row: {
      gap: 4,
      paddingHorizontal: 20,
      alignItems: 'flex-end',
    },
    chip: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 10,
      backgroundColor: 'transparent',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    chipActive: {
      borderBottomColor: colors.blue,
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    icon: {
      fontSize: 15,
      color: colors.muted,
    },
    iconActive: {
      color: colors.blue,
      opacity: 1,
    },
    label: {
      fontSize: 14,
      color: colors.muted,
    },
    labelActive: {
      color: colors.ink,
    },
    count: {
      fontSize: 12,
      color: colors.muted,
      opacity: 0.75,
    },
    countActive: {
      color: colors.blue,
      opacity: 1,
    },
  };
}
