import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Alert } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';
import { ConnectionUser } from '@/data/mockData';

interface ConnectionUserCardProps {
  user: ConnectionUser;
  activeTab: 'followers' | 'following';
  isFollowingState: boolean;
  onToggleFollow: (userId: string) => void;
  onRemoveFollower?: (userId: string) => void;
  isOwnProfile?: boolean;
}

export const ConnectionUserCard: React.FC<ConnectionUserCardProps> = ({
  user,
  activeTab,
  isFollowingState,
  onToggleFollow,
  onRemoveFollower,
  isOwnProfile = true,
}) => {
  const router = useRouter();

  const handleCardPress = () => {
    // Navigate to user profile page
    router.push(`/user/${user.id}` as any);
  };

  const handleFollowPress = () => {
    if (isFollowingState) {
      Alert.alert(
        'Unfollow @' + user.username + '?',
        `Are you sure you want to stop following ${user.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfollow',
            style: 'destructive',
            onPress: () => onToggleFollow(user.id),
          },
        ]
      );
    } else {
      onToggleFollow(user.id);
    }
  };

  const handleMorePress = () => {
    Alert.alert(`@${user.username}`, 'Choose an action', [
      ...(isOwnProfile && activeTab === 'followers' && onRemoveFollower
        ? [
            {
              text: 'Remove from followers',
              style: 'destructive' as const,
              onPress: () => onRemoveFollower(user.id),
            },
          ]
        : []),
      {
        text: 'View Profile',
        onPress: handleCardPress,
      },
      {
        text: 'Share Profile',
        onPress: () => Alert.alert('Share', `Shared @${user.username}'s profile`),
      },
      { text: 'Cancel', style: 'cancel' as const },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.82}
      onPress={handleCardPress}
    >
      {/* Avatar Container with glowing border */}
      <View style={styles.avatarWrapper}>
        <Image source={{ uri: user.avatar }} style={styles.avatarImage} />
        {user.isVerified && (
          <View style={styles.verifiedDotBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#FF6B00" />
          </View>
        )}
      </View>

      {/* Middle Content */}
      <View style={styles.contentColumn}>
        <View style={styles.nameRow}>
          <Text style={styles.nameText} numberOfLines={1}>
            {user.name}
          </Text>
        </View>

        <Text style={styles.usernameText} numberOfLines={1}>
          @{user.username}
        </Text>

        {user.bio ? (
          <Text style={styles.bioText} numberOfLines={1}>
            {user.bio}
          </Text>
        ) : null}

        {/* Badges / Meta row */}
        <View style={styles.badgesRow}>
          {user.followsYou && activeTab === 'followers' && (
            <View style={styles.followsYouBadge}>
              <Text style={styles.followsYouText}>Follows you</Text>
            </View>
          )}

          {user.routeCount !== undefined && user.routeCount > 0 && (
            <View style={styles.metaBadge}>
              <Ionicons name="compass-outline" size={11} color="#FF6B00" style={{ marginRight: 2 }} />
              <Text style={styles.metaBadgeText}>{user.routeCount} routes</Text>
            </View>
          )}

          {user.location ? (
            <View style={styles.locationBadge}>
              <Ionicons name="location-outline" size={11} color="#8A8F9B" style={{ marginRight: 2 }} />
              <Text style={styles.locationBadgeText} numberOfLines={1}>
                {user.location.split(',')[0]}
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Action Buttons: Follow / Following and Options */}
      <View style={styles.actionsColumn}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            isFollowingState ? styles.followingButton : styles.followButton,
          ]}
          activeOpacity={0.8}
          onPress={handleFollowPress}
        >
          {isFollowingState ? (
            <Text style={styles.followingButtonText}>Following</Text>
          ) : (
            <Text style={styles.followButtonText}>
              {user.followsYou && activeTab === 'followers' ? 'Follow back' : 'Follow'}
            </Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.moreButton}
          activeOpacity={0.65}
          onPress={handleMorePress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="ellipsis-vertical" size={15} color="#8A8F9B" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.75)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    padding: 1.5,
    marginRight: 12,
    backgroundColor: '#12141A',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 23,
    backgroundColor: '#1E212A',
  },
  verifiedDotBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    backgroundColor: '#0A0B0E',
    borderRadius: 8,
  },
  contentColumn: {
    flex: 1,
    marginRight: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  usernameText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '500',
    marginTop: 1,
  },
  bioText: {
    color: '#D1D5DB',
    fontSize: 11,
    marginTop: 3,
    lineHeight: 14,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    marginTop: 5,
  },
  followsYouBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  followsYouText: {
    color: '#D1D5DB',
    fontSize: 9.5,
    fontWeight: '600',
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 107, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  metaBadgeText: {
    color: '#FF6B00',
    fontSize: 9.5,
    fontWeight: '600',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationBadgeText: {
    color: '#8A8F9B',
    fontSize: 10,
    fontWeight: '500',
  },
  actionsColumn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionButton: {
    minWidth: 84,
    height: 34,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  followButton: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 2,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#E5E7EB',
    fontSize: 12,
    fontWeight: '600',
  },
  moreButton: {
    width: 24,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
