export const APP_NAME = 'DhammaYate';
export const APP_VERSION = '1.0.0';
export const ANDROID_PACKAGE = 'com.oitmyanmar.dhammayate';

export const PLAY_STORE_URL = `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE}`;
export const MORE_APPS_URL =
  'https://play.google.com/store/apps/dev?id=7008123049210363038';
export const TELEGRAM_URL = 'https://t.me/oitmyanmar';

export function storeUrl() {
  return PLAY_STORE_URL;
}

export function moreAppsUrl() {
  return MORE_APPS_URL;
}

export function shareMessage() {
  return `${APP_NAME} အက်ပ်ကို သုံးကြည့်ပါ။\n${storeUrl()}`;
}
