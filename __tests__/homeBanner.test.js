import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {BannerAd} from 'react-native-google-mobile-ads';
import {HOME_BANNER_AD_UNIT_ID, IOS_HOME_BANNER_AD_UNIT_ID} from '../src/ads';
import {HomeBannerAd} from '../src/components/HomeBannerAd';

test('hides the banner slot until an ad loads and collapses it after failure', async () => {
  let screen;
  const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  await ReactTestRenderer.act(async () => {
    screen = ReactTestRenderer.create(<HomeBannerAd />);
  });

  const slot = screen.root.findByProps({testID: 'home-banner-slot'});
  const banner = screen.root.findByType(BannerAd);
  expect(slot.props.style).toEqual({height: 0, overflow: 'hidden'});

  await ReactTestRenderer.act(async () => {
    banner.props.onAdLoaded();
  });
  expect(slot.props.style).toEqual({alignItems: 'center'});

  await ReactTestRenderer.act(async () => {
    banner.props.onAdFailedToLoad(new Error('no fill'));
  });
  expect(slot.props.style).toEqual({height: 0, overflow: 'hidden'});
  expect(warn).toHaveBeenCalled();
  warn.mockRestore();
});

test('Home banner uses the Home_Banner ad unit', () => {
  expect(HOME_BANNER_AD_UNIT_ID).toBe(
    'ca-app-pub-7212739063301359/5562325500',
  );
});

test('iOS home banner uses the iOS banner ad unit', () => {
  expect(IOS_HOME_BANNER_AD_UNIT_ID).toBe(
    'ca-app-pub-7212739063301359/5481279501',
  );
});
