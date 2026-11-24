import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {useApp} from '../src/context/AppContext';
import {dhammaAudios} from '../src/data/audios';
import {AudioScreen} from '../src/screens/AudioScreen';

jest.mock('../src/context/AppContext', () => ({
  useApp: jest.fn(),
  useColors: () => require('../src/theme').palettes.light,
}));

test('shows playlists and audio in separate tabs', async () => {
  useApp.mockReturnValue({
    openAudio: jest.fn(),
    openPlaylist: jest.fn(),
    settings: {
      playlists: [{id: 'pl-morning', name: 'Morning', audioIds: [dhammaAudios[0].id]}],
      downloadedAudioIds: [],
    },
    createPlaylist: jest.fn(),
  });

  let screen;
  await ReactTestRenderer.act(async () => {
    screen = ReactTestRenderer.create(<AudioScreen />);
  });

  expect(screen.root.findByProps({accessibilityLabel: dhammaAudios[0].title})).toBeTruthy();

  await ReactTestRenderer.act(async () => {
    screen.root.findAllByProps({accessibilityRole: 'tab'})[0].props.onPress();
  });

  expect(screen.root.findByProps({accessibilityLabel: 'Morning'})).toBeTruthy();
  expect(screen.root.findAllByProps({accessibilityLabel: dhammaAudios[0].title})).toHaveLength(0);
});
