// metro.config.js

const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

console.log('>>> METRO CONFIG LOADED');

// transformer 설정 추가
config.transformer = {
    ...config.transformer,
    babelTransformerPath: require.resolve("react-native-svg-transformer"),
  };
  
  // resolver 설정 추가
  config.resolver = {
    ...config.resolver,
    assetExts: config.resolver.assetExts.filter((ext) => ext !== "svg"),
    sourceExts: [...config.resolver.sourceExts, "svg"],
  };
  
module.exports = config;
