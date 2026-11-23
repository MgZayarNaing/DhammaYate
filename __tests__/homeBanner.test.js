import {HOME_BANNER_AD_UNIT_ID, IOS_HOME_BANNER_AD_UNIT_ID} from '../src/ads';

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
