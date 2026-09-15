const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure ttf and otf font assets are properly resolved by Metro
config.resolver.assetExts.push('ttf', 'otf');

module.exports = config;
