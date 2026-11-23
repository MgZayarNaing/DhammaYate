/* eslint-env jest */
jest.mock('sp-react-native-in-app-updates', () => {
  class SpInAppUpdates {
    checkNeedsUpdate() {
      return Promise.resolve({shouldUpdate: false});
    }
    startUpdate() {
      return Promise.resolve();
    }
  }

  return {
    __esModule: true,
    default: SpInAppUpdates,
    IAUUpdateKind: {IMMEDIATE: 1, FLEXIBLE: 0},
    IAUAvailabilityStatus: {
      UNKNOWN: 0,
      UNAVAILABLE: 1,
      AVAILABLE: 2,
      DEVELOPER_TRIGGERED: 3,
    },
  };
});

jest.mock('@react-native-firebase/analytics', () => ({
  getAnalytics: () => ({}),
  setAnalyticsCollectionEnabled: () => Promise.resolve(),
}));

jest.mock('react-native-google-mobile-ads', () => {
  const React = require('react');
  const {View} = require('react-native');

  return {
    __esModule: true,
    default: () => ({
      initialize: () => Promise.resolve([]),
    }),
    BannerAd: props => React.createElement(View, props),
    BannerAdSize: {
      BANNER: 'BANNER',
    },
    TestIds: {
      BANNER: 'ca-app-pub-3940256099942544/6300978111',
    },
  };
});
