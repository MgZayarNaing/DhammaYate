import React from 'react';
import {View} from 'react-native';

export function RepeatIcon({color, size = 22}) {
  const stroke = 2;
  const arrow = 6;
  const mid = stroke / 2;

  return (
    <View style={{width: size, height: Math.round(size * 0.68)}}>
      <View
        style={{
          position: 'absolute',
          left: 3,
          right: arrow,
          top: 1,
          height: stroke,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 0,
          top: 1 + mid - arrow / 2,
          width: 0,
          height: 0,
          borderTopWidth: arrow / 2,
          borderBottomWidth: arrow / 2,
          borderLeftWidth: arrow,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          right: 2,
          top: 1 + stroke,
          bottom: 1,
          width: stroke,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: arrow,
          right: 3,
          bottom: 1,
          height: stroke,
          backgroundColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 0,
          bottom: 1 + mid - arrow / 2,
          width: 0,
          height: 0,
          borderTopWidth: arrow / 2,
          borderBottomWidth: arrow / 2,
          borderRightWidth: arrow,
          borderTopColor: 'transparent',
          borderBottomColor: 'transparent',
          borderRightColor: color,
        }}
      />
      <View
        style={{
          position: 'absolute',
          left: 2,
          top: 1,
          bottom: 1 + stroke,
          width: stroke,
          backgroundColor: color,
        }}
      />
    </View>
  );
}
