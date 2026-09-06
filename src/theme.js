import {Platform} from 'react-native';

const black = '#111111';
const white = '#ffffff';

export const palettes = {
  light: {
    scheme: 'light',
    bg: white,
    card: white,
    ink: black,
    muted: '#6f6f6f',
    cardMuted: '#6f6f6f',
    line: '#e6e6e6',
    parchment: '#f3f3f3',
    blue: black,
    white,
    onAccent: white,
    navy: black,
    cream: white,
    text: black,
    saffron: black,
    gold: black,
    burgundy: black,
  },
  dark: {
    scheme: 'dark',
    bg: black,
    card: '#1c1c1c',
    ink: white,
    muted: '#a3a3a3',
    cardMuted: '#a3a3a3',
    line: '#2e2e2e',
    parchment: '#1a1a1a',
    blue: white,
    white,
    onAccent: black,
    navy: white,
    cream: black,
    text: white,
    saffron: white,
    gold: white,
    burgundy: white,
  },
};

export const colors = palettes.light;

export function getColors(scheme) {
  return scheme === 'dark' ? palettes.dark : palettes.light;
}

export const FONT_SIZES = [16, 18, 20, 22, 24, 28];
export const DEFAULT_FONT_SIZE = 20;
export const DEFAULT_COLOR_SCHEME = 'light';

export const myanmarFont = Platform.select({
  ios: 'Myanmar MN',
  android: undefined,
  default: undefined,
});

export const categories = [
  {id: 'vandana', label: 'ရှိခိုး', emoji: '◉'},
  {id: 'paritta', label: 'ပရိတ်', emoji: '✦'},
  {id: 'guna', label: 'ဂုဏ်တော်', emoji: '☸'},
  {id: 'sutta', label: 'သုတ်', emoji: '✧'},
  {id: 'foundation', label: 'အခြေခံ', emoji: '◎'},
  {id: 'practice', label: 'ကျင့်စဉ်', emoji: '❀'},
  {id: 'parami', label: 'ပါရမီ', emoji: '✧'},
  {id: 'abhidhamma', label: 'အဘိဓမ္မာ', emoji: '◈'},
];
