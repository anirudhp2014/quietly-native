const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Resolve @/* path alias to src/*
config.resolver.extraNodeModules = new Proxy(
  {},
  {
    get: (_target, name) => {
      if (name === '@') {
        return path.resolve(__dirname, 'src');
      }
      return path.resolve(__dirname, 'node_modules', String(name));
    },
  }
);

module.exports = withNativeWind(config, { input: './src/global.css' });
