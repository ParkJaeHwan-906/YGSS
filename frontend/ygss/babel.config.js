module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            alias: {
              '@': './',   // @ -> 프로젝트 루트
            },
            extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
          },
        ],
        'expo-router/babel',
      ],
    };
  };
  