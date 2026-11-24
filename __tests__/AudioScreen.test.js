import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {FlatList} from 'react-native';
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

  const audioList = screen.root.findByType(FlatList);
  expect(audioList.props.data).toContain(dhammaAudios[0]);

  await ReactTestRenderer.act(async () => {
    screen.root.findAllByProps({accessibilityRole: 'tab'})[0].props.onPress();
  });

  const playlistList = screen.root.findByType(FlatList);
  expect(playlistList.props.data).toEqual([
    {id: 'pl-morning', name: 'Morning', audioIds: [dhammaAudios[0].id]},
  ]);
  expect(playlistList.props.renderItem({item: playlistList.props.data[0]}).props.children[1].props.accessibilityLabel).toBe(
    'Morning',
  );
});
