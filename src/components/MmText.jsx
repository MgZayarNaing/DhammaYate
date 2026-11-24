import React from 'react';
import {Text} from 'react-native';
import {mmText} from '../theme';

/**
 * Myanmar-safe Text. Puts the Regular face last so it wins over other styles.
 * Do not pass fontWeight — it breaks stacked Myanmar glyphs on iOS.
 */
export function MmText({style, ...props}) {
  return <Text {...props} style={[style, mmText]} />;
}
