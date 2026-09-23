import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

interface ExploreHeaderProps {
  locationName?: string;
  onLocationPress?: () => void;
}

export const ExploreHeader: React.FC<ExploreHeaderProps> = ({
  locationName = 'Kerala, India',
  onLocationPress,
}) => {
  const handleLocationTap = () => {
    if (onLocationPress) {
      onLocationPress();
    } else {
      Alert.alert(
        'Select Location',
        'Choose discovery location',
        [
          { text: 'Kerala, India (Current)', onPress: () => {} },
          { text: 'Himachal Pradesh, India', onPress: () => {} },
          { text: 'Bali, Indonesia', onPress: () => {} },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      {/* Brand Logo & Tagline */}
      <View style={styles.logoGroup}>
        <Text style={styles.logoText}>
          Dream<Text style={styles.logoAccent}>Out</Text>
        </Text>
    
      </View>

      {/* Location Selector Button */}
      <TouchableOpacity
        style={styles.locationButton}
        activeOpacity={0.75}
        onPress={handleLocationTap}
      >
        <Ionicons name="location" size={13} color="#FF6B00" style={{ marginRight: 4 }} />
        <Text style={styles.locationText} numberOfLines={1}>
          {locationName}
        </Text>
        <Ionicons name="chevron-down" size={12} color="#8A8F9B" style={{ marginLeft: 3 }} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  logoGroup: {},
  logoText: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FF6B00',
  },
  taglineText: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.4,
    marginTop: -2,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    maxWidth: 160,
  },
  locationText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
  },
});
