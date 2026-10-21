/**
 * @format
 */

import React from 'react';
import {BackHandler} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import ReactTestRenderer from 'react-test-renderer';
import {AppNavigator} from '../src/AppNavigator';
import {AppProvider, useApp} from '../src/context/AppContext';

jest.mock('react-native-sound-player', () => ({
  playAsset: jest.fn(),
  loadAsset: jest.fn(),
  loadUrl: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  seek: jest.fn(),
  getInfo: async () => ({currentTime: 0, duration: 0}),
  addEventListener: () => ({remove: jest.fn()}),
}));

jest.mock('@dr.pogodin/react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/docs',
  downloadFile: jest.fn(() => ({promise: Promise.resolve({statusCode: 200})})),
  exists: jest.fn(async () => false),
  mkdir: jest.fn(async () => {}),
  unlink: jest.fn(async () => {}),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    __esModule: true,
    default: {
      getItem: async key => store[key] ?? null,
      setItem: async (key, value) => {
        store[key] = value;
      },
      removeItem: async key => {
        delete store[key];
      },
    },
  };
});

let appApi;
function Probe() {
  appApi = useApp();
  return null;
}

const initialMetrics = {
  frame: {x: 0, y: 0, width: 390, height: 844},
  insets: {top: 0, left: 0, right: 0, bottom: 0},
};

function Harness() {
  return (
    <SafeAreaProvider initialMetrics={initialMetrics}>
      <AppProvider>
        <Probe />
        <AppNavigator />
      </AppProvider>
    </SafeAreaProvider>
  );
}

test('system back pops detail, returns other tabs to home, and exits only on home', async () => {
  const listeners = [];
  const addSpy = jest
    .spyOn(BackHandler, 'addEventListener')
    .mockImplementation((event, handler) => {
      if (event === 'hardwareBackPress') {
        listeners.push(handler);
      }
      return {remove: jest.fn()};
    });

  let root;
  await ReactTestRenderer.act(async () => {
    root = ReactTestRenderer.create(<Harness />);
  });

  await ReactTestRenderer.act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  expect(appApi).toBeTruthy();
  expect(appApi.ready).toBe(true);

  await ReactTestRenderer.act(async () => {
    appApi.openLibrary('home');
  });
  expect(appApi.route.name).toBe('library');
  expect(listeners.length).toBeGreaterThan(0);

  const onBack = listeners[listeners.length - 1];

  let handled;
  await ReactTestRenderer.act(async () => {
    handled = onBack();
  });
  expect(handled).toBe(true);
  expect(appApi.route.name).toBe('tabs');
  expect(appApi.route.tab).toBe('home');

  const onBackAtHome = listeners[listeners.length - 1];
  handled = onBackAtHome();
  expect(handled).toBe(false);

  await ReactTestRenderer.act(async () => {
    appApi.openTab('audio');
  });
  expect(appApi.route.tab).toBe('audio');

  const onBackFromAudio = listeners[listeners.length - 1];
  await ReactTestRenderer.act(async () => {
    handled = onBackFromAudio();
  });
  expect(handled).toBe(true);
  expect(appApi.route).toEqual({name: 'tabs', tab: 'home'});

  handled = listeners[listeners.length - 1]();
  expect(handled).toBe(false);

  await ReactTestRenderer.act(async () => {
    root.unmount();
  });
  addSpy.mockRestore();
});
