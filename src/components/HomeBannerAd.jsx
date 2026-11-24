import React, {useState} from 'react';
import {Platform, View} from 'react-native';
import {BannerAd, BannerAdSize, TestIds} from 'react-native-google-mobile-ads';
import {HOME_BANNER_AD_UNIT_ID, IOS_HOME_BANNER_AD_UNIT_ID} from '../ads';

const releaseUnitId =
  Platform.OS === 'ios' ? IOS_HOME_BANNER_AD_UNIT_ID : HOME_BANNER_AD_UNIT_ID;

export function HomeBannerAd() {
  const [loaded, setLoaded] = useState(false);

  if (Platform.OS !== 'ios' && Platform.OS !== 'android') {
    return null;
  }

  return (
    <View
      testID="home-banner-slot"
      style={loaded ? styles.slot : styles.hiddenSlot}>
      <BannerAd
        unitId={__DEV__ ? TestIds.BANNER : releaseUnitId}
        size={BannerAdSize.BANNER}
        onAdLoaded={() => setLoaded(true)}
        onAdFailedToLoad={error => {
          setLoaded(false);
          console.warn('[home banner] load failed', error);
        }}
      />
    </View>
  );
}

const styles = {
  slot: {
    alignItems: 'center',
  },
  hiddenSlot: {
    height: 0,
    overflow: 'hidden',
  },
};
