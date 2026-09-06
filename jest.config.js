module.exports = {
  preset: '@react-native/jest-preset',
  moduleFileExtensions: ['js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(js|jsx)$': 'babel-jest',
    '^.+\\.(bmp|gif|jpg|jpeg|mp4|png|psd|svg|webp|wav|mp3|m4a)$':
      '@react-native/jest-preset/jest/assetFileTransformer.js',
  },
};
