import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Alert } from 'react-native';
import { UserProfile } from '@/data/mockData';

interface ProfileStatsProps {
  profile: UserProfile;
}

export const ProfileStats: React.FC<ProfileStatsProps> = ({ profile }) => {
  const formatNum = (num: number): string => {
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleFollowersPress = () => {
    Alert.alert('Followers', `Viewing followers of @${profile.username}`);
  };

  const handleFollowingPress = () => {
    Alert.alert('Following', `Viewing accounts followed by @${profile.username}`);
  };

  return (
    <View style={styles.container}>
      {/* 1. Followers */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowersPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statValue}>{formatNum(profile.followersCount)}</Text>
        <Text style={styles.statLabel}>Followers</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 2. Following */}
      <TouchableOpacity
        style={styles.statItem}
        onPress={handleFollowingPress}
        activeOpacity={0.7}
      >
        <Text style={styles.statValue}>{formatNum(profile.followingCount)}</Text>
        <Text style={styles.statLabel}>Following</Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* 3. Created Routes */}
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{profile.routeCount}</Text>
        <Text style={styles.statLabel}>Routes</Text>
      </View>

      <View style={styles.divider} />

      {/* 4. Created Spots */}
      <View style={styles.statItem}>
        <Text style={styles.statValue}>{profile.spotCount}</Text>
        <Text style={styles.statLabel}>Spots</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: '#0A0B0E',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 2,
  },
  divider: {
    width: 1,
    height: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});
