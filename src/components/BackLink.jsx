import {Pressable, View} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {MmText} from './MmText';

export function BackLink({onPress, style}) {
  const {colors, styles} = useThemedStyles(createStyles);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={12}
      accessibilityLabel="နောက်သို့"
      style={style}>
      <View style={styles.backRow}>
        <Icon
          name="chevron-left"
          size={22}
          color={colors.ink}
          style={styles.backIcon}
        />
        <MmText style={styles.back}>နောက်</MmText>
      </View>
    </Pressable>
  );
}

function createStyles(colors) {
  return {
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginLeft: -6,
    },
    back: {
      fontSize: 16,
      color: colors.ink,
      includeFontPadding: false,
      textAlignVertical: 'center',
      paddingTop: 0,
      paddingBottom: 0,
    },
  };
}
