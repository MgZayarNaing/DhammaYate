/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';

jest.mock('react-native-sound-player', () => ({
  playAsset: jest.fn(),
  loadAsset: jest.fn(),
  play: jest.fn(),
  pause: jest.fn(),
  stop: jest.fn(),
  seek: jest.fn(),
  getInfo: async () => ({currentTime: 0, duration: 0}),
  addEventListener: () => ({remove: jest.fn()}),
}));

jest.mock('@react-native-async-storage/async-storage', () => {
  let store = {};
  return {
    default: {
      getItem: async key => store[key] ?? null,
      setItem: async (key, value) => {
        store[key] = value;
      },
      removeItem: async key => {
        delete store[key];
      },
      clear: async () => {
        store = {};
      },
    },
  };
});

test('renders correctly', async () => {
  await ReactTestRenderer.act(async () => {
    ReactTestRenderer.create(<App />);
  });
});
