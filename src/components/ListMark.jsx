import React from 'react';
import { View, Image } from 'react-native';
import { useColors } from '../context/AppContext';

export function ListMark() {
  const colors = useColors();

  return (
    <View style={[styles.box, { backgroundColor: colors.ink }]}>
      <Image source={require('../assets/images/logo.png')} style={styles.image} />
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
  image: {
    width: 40,
    height: 40,
  },
};
