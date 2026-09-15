import React from 'react';
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

export type SocialProvider = 'google' | 'apple' | 'facebook';

interface SocialLoginButtonProps {
  provider: SocialProvider;
  onPress: () => void;
}

export const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({
  provider,
  onPress,
}) => {
  const getProviderConfig = () => {
    switch (provider) {
      case 'google':
        return {
          iconName: 'logo-google' as const,
          label: 'Google',
          color: '#EA4335',
        };
      case 'apple':
        return {
          iconName: 'logo-apple' as const,
          label: 'Apple',
          color: '#FFFFFF',
        };
      case 'facebook':
        return {
          iconName: 'logo-facebook' as const,
          label: 'Facebook',
          color: '#1877F2',
        };
    }
  };

  const config = getProviderConfig();

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={config.iconName} size={20} color={config.color} />
      <Text style={styles.label}>{config.label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.07)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    height: 46,
    marginHorizontal: 4,
    gap: 8,
  },
  label: {
    color: '#E0E4EB',
    fontSize: 13,
    fontWeight: '600',
  },
});
