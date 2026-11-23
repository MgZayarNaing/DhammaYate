import {View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useThemedStyles} from '../hooks/useThemedStyles';
import {BackLink} from './BackLink';
import {MmText} from './MmText';

export function ScreenHeader({title, subtitle, right, onBack}) {
  const insets = useSafeAreaInsets();
  const {styles} = useThemedStyles(createStyles);

  return (
    <View style={[styles.wrap, {paddingTop: insets.top + 12}]}>
      {onBack ? <BackLink onPress={onBack} style={styles.backWrap} /> : null}
      <View style={styles.row}>
        <View style={styles.text}>
          <MmText style={styles.title}>{title}</MmText>
          {subtitle ? <MmText style={styles.subtitle}>{subtitle}</MmText> : null}
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
    backWrap: {
      marginBottom: 4,
      alignSelf: 'flex-start',
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
      fontSize: 28,
      color: colors.ink,
      lineHeight: 48,
    },
    subtitle: {
      marginTop: 2,
      fontSize: 14,
      color: colors.muted,
      lineHeight: 28,
    },
  };
}
