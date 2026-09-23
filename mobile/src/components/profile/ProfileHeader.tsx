import React from 'react';
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

import { useAuthStore } from '@/store/useAuthStore';

interface ProfileHeaderProps {
  profile: UserProfile;
  isOwnProfile?: boolean;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isOwnProfile = true,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const displayName = user?.name || profile.name;

  const handleEditProfile = () => {
    Alert.alert('Edit Profile', 'Open edit profile screen.');
  };

  const handleNotificationsPress = () => {
    Alert.alert('Notifications', 'No new notifications.');
  };

  const handleMorePress = () => {
    Alert.alert('Options', 'Profile settings and preferences.', [
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => {
          logout();
          router.replace('/login');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };


  const handleAvatarPress = () => {
    Alert.alert('Change Avatar', 'Select a new profile photo.');
  };

  // Safe top padding for iPhone notch / Dynamic Island and Android Status bar
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
          {/* Top Bar: Brand Logo + Actions */}
          <View style={styles.topBar}>
            <View>
              <Text style={styles.logoText}>
                Dream<Text style={styles.logoAccent}>Out</Text>
              </Text>
           
            </View>

            <View style={styles.topActions}>
              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={handleNotificationsPress}
              >
                <Ionicons name="notifications-outline" size={19} color="#FFFFFF" />
                <View style={styles.badgeDot} />
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.iconButton}
                activeOpacity={0.7}
                onPress={handleMorePress}
              >
                <Ionicons name="ellipsis-horizontal" size={19} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Profile User Info Row */}
          <View style={styles.userMainRow}>
            {/* Left: Avatar with Camera Badge Overlay */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              activeOpacity={0.85}
              onPress={handleAvatarPress}
            >
              <Image
                source={{ uri: profile.avatar }}
                style={styles.avatarImage}
              />
              <View style={styles.cameraBadge}>
                <Ionicons name="camera-outline" size={13} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            {/* Right: Info + Edit Button */}
            <View style={styles.userMetaColumn}>
              <View style={styles.userHeaderRow}>
                <View style={styles.nameBlock}>
                  <Text style={styles.nameText}>{displayName}</Text>

                  <Text style={styles.usernameText}>@{profile.username}</Text>
                </View>

                {/* Edit Profile Button */}
                {isOwnProfile && (
                  <TouchableOpacity
                    style={styles.editButton}
                    activeOpacity={0.75}
                    onPress={handleEditProfile}
                  >
                    <Ionicons name="pencil-outline" size={13} color="#FFFFFF" style={{ marginRight: 5 }} />
                    <Text style={styles.editButtonText}>Edit Profile</Text>
                  </TouchableOpacity>
                )}
              </View>

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
    paddingBottom: 8,
  },

  /* Top Bar */
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  logoAccent: {
    color: '#FF6B00',
  },
  taglineText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#9CA3AF',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
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
  badgeDot: {
    position: 'absolute',
    top: 9,
    right: 9,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
  },

  /* User Info Row */
  userMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
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
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#12141A',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
  },
  userMetaColumn: {
    flex: 1,
    justifyContent: 'center',
  },
  userHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  nameBlock: {
    flex: 1,
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
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '600',
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
});
