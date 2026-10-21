import React from 'react';
import {Platform, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {HOME_BANNER_AD_UNIT_ID} from '../ads';

export function HomeBannerAd() {
  if (Platform.OS !== 'android') {
    return null;
  }

  return (
    <View style={styles.slot}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : HOME_BANNER_AD_UNIT_ID}
        size={BannerAdSize.BANNER}
      />
    </View>
  );
}

const styles = {
  slot: {
    alignItems: 'center',
  },
};
