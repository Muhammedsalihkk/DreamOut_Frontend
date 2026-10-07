module.exports = ({ config }) => {
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  return {
    ...config,
    android: {
      ...config.android,
      package: config.android?.package || 'com.dreamout.mobile',
      permissions: [
        ...(config.android?.permissions || []),
        'ACCESS_COARSE_LOCATION',
        'ACCESS_FINE_LOCATION',
        'android.permission.ACCESS_COARSE_LOCATION',
        'android.permission.ACCESS_FINE_LOCATION',
      ],
      config: {
        ...config.android?.config,
        googleMaps: {
          apiKey: googleMapsApiKey,
        },
      },
    },
    ios: {
      ...config.ios,
      bundleIdentifier: config.ios?.bundleIdentifier || 'com.dreamout.mobile',
      infoPlist: {
        ...config.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription:
          config.ios?.infoPlist?.NSLocationWhenInUseUsageDescription ||
          'DreamOut needs your location to help you find and select spots on the map.',
      },
      config: {
        ...config.ios?.config,
        googleMapsApiKey: googleMapsApiKey,
      },
    },
    extra: {
      ...config.extra,
      googleMapsApiKey: googleMapsApiKey,
    },
  };
};
