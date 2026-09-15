import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  ImageBackground,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { UserProfile } from '@/data/mockData';
import { useRouter } from 'expo-router';

interface OtherProfileHeaderProps {
  profile: UserProfile;
}

export const OtherProfileHeader: React.FC<OtherProfileHeaderProps> = ({
  profile,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isFollowing, setIsFollowing] = useState(false);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/' as any);
    }
  };

  const handleFollowToggle = () => {
    if (isFollowing) {
      Alert.alert(
        'Unfollow @' + profile.username + '?',
        `Are you sure you want to stop following ${profile.name}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Unfollow',
            style: 'destructive',
            onPress: () => setIsFollowing(false),
          },
        ]
      );
    } else {
      setIsFollowing(true);
    }
  };

  const handleMessagePress = () => {
    Alert.alert('Message', `Start a conversation with ${profile.name}`);
  };

  const handleMoreMenuPress = () => {
    Alert.alert(`@${profile.username}`, 'Choose an action', [
      { text: 'Share Profile', onPress: () => Alert.alert('Share', `Shared @${profile.username}'s profile.`) },
      { text: 'Report User', onPress: () => Alert.alert('Reported', `Report submitted for @${profile.username}.`) },
      { text: 'Block User', style: 'destructive', onPress: () => Alert.alert('Blocked', `Blocked @${profile.username}.`) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Safe top padding for notch / status bar
  const topPadding = Math.max(insets.top, Platform.OS === 'android' ? 24 : 44) + 6;

  return (
    <View style={styles.headerWrapper}>
      {/* Background Image with Dark Cinematic Overlays */}
      <ImageBackground
        source={require('@/assets/images/login-background.jpg')}
        style={[styles.backgroundImage, { paddingTop: topPadding }]}
        resizeMode="cover"
      >
        <LinearGradient
          colors={[
            'rgba(10, 11, 15, 0.75)',
            'rgba(10, 11, 15, 0.60)',
            'rgba(10, 11, 15, 0.92)',
            '#0A0B0E',
          ]}
          locations={[0, 0.35, 0.75, 1]}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerContent}>
          {/* Top Bar: Back Button + More Options */}
          <View style={styles.topBar}>
            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={handleBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconButton}
              activeOpacity={0.7}
              onPress={handleMoreMenuPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="ellipsis-horizontal" size={19} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Profile User Identity Section */}
          <View style={styles.userMainRow}>
            {/* Avatar with Orange Border Ring */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: profile.avatar }} style={styles.avatarImage} />
            </View>

            {/* User Details */}
            <View style={styles.userMetaColumn}>
              <View style={styles.nameRow}>
                <Text style={styles.nameText}>{profile.name}</Text>
                {profile.isVerified && (
                  <Ionicons name="checkmark-circle" size={17} color="#FF6B00" style={{ marginLeft: 4 }} />
                )}
              </View>

              <Text style={styles.usernameText}>@{profile.username}</Text>

              {/* Bio */}
              {profile.bio ? (
                <Text style={styles.bioText} numberOfLines={2}>
                  {profile.bio}
                </Text>
              ) : null}

              {/* Location */}
              {profile.location ? (
                <View style={styles.locationRow}>
                  <Ionicons name="location-outline" size={13} color="#FF6B00" style={{ marginRight: 4 }} />
                  <Text style={styles.locationText}>{profile.location}</Text>
                </View>
              ) : null}
            </View>
          </View>

          {/* Action Buttons: [ Follow / Following ] + [ Message ] */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.followButton,
                isFollowing ? styles.followingButton : styles.notFollowingButton,
              ]}
              activeOpacity={0.82}
              onPress={handleFollowToggle}
            >
              {isFollowing ? (
                <>
                  <Ionicons name="checkmark-outline" size={15} color="#FFFFFF" style={{ marginRight: 4 }} />
                  <Text style={styles.followingButtonText}>Following</Text>
                </>
              ) : (
                <Text style={styles.followButtonText}>Follow</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.messageButton}
              activeOpacity={0.75}
              onPress={handleMessagePress}
            >
              <Ionicons name="chatbubble-outline" size={15} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.messageButtonText}>Message</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    width: '100%',
  },
  backgroundImage: {
    width: '100%',
  },
  headerContent: {
    paddingHorizontal: 18,
    paddingBottom: 10,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  iconButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },

  /* User Info Row */
  userMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 14,
  },
  avatarWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 2,
    borderColor: '#FF6B00',
    padding: 2,
    backgroundColor: 'rgba(10, 11, 15, 0.8)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    backgroundColor: '#1E212A',
  },
  userMetaColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nameText: {
    color: '#FFFFFF',
    fontSize: 21,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  usernameText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '500',
    marginTop: 1,
  },
  bioText: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 16.5,
    marginTop: 5,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  locationText: {
    color: '#9CA3AF',
    fontSize: 11.5,
    fontWeight: '500',
  },

  /* Action Buttons Row */
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
    marginBottom: 6,
  },
  followButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFollowingButton: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  followingButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  followButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  followingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  messageButton: {
    flex: 1,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
