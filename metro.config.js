const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Support SCSS/SASS files
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('react-native-sass-transformer'),
};

config.resolver = {
  ...config.resolver,
  assetExts: config.resolver.assetExts.filter((ext) => ext !== 'scss' && ext !== 'sass'),
  sourceExts: [...config.resolver.sourceExts, 'scss', 'sass'],
};

module.exports = config;
