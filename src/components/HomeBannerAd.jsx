import React from 'react';
import {Platform, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {HOME_BANNER_AD_UNIT_ID, IOS_HOME_BANNER_AD_UNIT_ID} from '../ads';

const releaseUnitId =
  Platform.OS === 'ios' ? IOS_HOME_BANNER_AD_UNIT_ID : HOME_BANNER_AD_UNIT_ID;

export function HomeBannerAd() {
  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  return (
    <View style={styles.slot}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : releaseUnitId}
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
