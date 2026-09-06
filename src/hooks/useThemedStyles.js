import {useMemo} from 'react';
import {StyleSheet} from 'react-native';
import {useColors} from '../context/AppContext';

export function useThemedStyles(factory) {
  const colors = useColors();
  const styles = useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  return {colors, styles};
}
