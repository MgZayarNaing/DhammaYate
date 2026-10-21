/* eslint-env jest */
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
