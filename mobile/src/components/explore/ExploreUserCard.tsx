import React, { useState } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { ExploreUser } from '@/data/mockData';
import { useRouter } from 'expo-router';

interface ExploreUserCardProps {
  user: ExploreUser;
}

export const ExploreUserCard: React.FC<ExploreUserCardProps> = ({ user }) => {
  const router = useRouter();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleUserPress = () => {
    router.push(`/user/${user.id}` as any);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.88}
      onPress={handleUserPress}
    >
      {/* Avatar Circle */}
      <Image source={{ uri: user.avatar }} style={styles.avatar} />

      {/* User Details */}
      <View style={styles.infoContainer}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user.name}
          </Text>
          {user.isVerified && (
            <Ionicons name="checkmark-circle" size={14} color="#FF6B00" style={{ marginLeft: 3 }} />
          )}
        </View>

        <Text style={styles.usernameText}>@{user.username}</Text>

        {user.bio ? (
          <Text style={styles.bioText} numberOfLines={1}>
            {user.bio}
          </Text>
        ) : null}

        {/* Route Count Badge */}
        <View style={styles.badgeRow}>
          <Ionicons name="compass-outline" size={12} color="#FF6B00" style={{ marginRight: 3 }} />
          <Text style={styles.routeCountText}>{user.routeCount} Routes</Text>
        </View>
      </View>

      {/* Follow / Following Button */}
      <TouchableOpacity
        style={[styles.followButton, isFollowing && styles.followingButton]}
        activeOpacity={0.8}
        onPress={() => setIsFollowing(!isFollowing)}
      >
        <Text style={[styles.followText, isFollowing && styles.followingText]}>
          {isFollowing ? 'Following' : 'Follow'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.84)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 12,
    marginBottom: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    marginRight: 12,
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  usernameText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '500',
    marginTop: 1,
  },
  bioText: {
    color: '#D1D5DB',
    fontSize: 11.5,
    marginTop: 3,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  routeCountText: {
    color: '#FF6B00',
    fontSize: 11,
    fontWeight: '600',
  },
  followButton: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  followText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  followingText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
