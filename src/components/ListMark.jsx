import React from 'react';
import {View} from 'react-native';
import {useColors} from '../context/AppContext';

export function ListMark() {
  const colors = useColors();

  return (
    <View style={[styles.box, {backgroundColor: colors.ink}]}>
      <View style={[styles.ring, styles.top, {borderColor: colors.onAccent}]} />
      <View style={[styles.ring, styles.left, {borderColor: colors.onAccent}]} />
      <View style={[styles.ring, styles.right, {borderColor: colors.onAccent}]} />
    </View>
  );
}

const styles = {
  box: {
    width: 40,
    height: 40,
    borderRadius: 10,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 8,
    borderWidth: 1.7,
  },
  top: {
    top: 7,
  },
  left: {
    left: 6,
    bottom: 8,
  },
  right: {
    right: 6,
    bottom: 8,
  },
};
