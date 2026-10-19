import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  getUserConnections,
  ConnectionUser,
  MOCK_USER_PROFILE,
  MOCK_OTHER_USER_PROFILE,
} from '@/data/mockData';
import { ConnectionUserCard } from '@/components/profile/ConnectionUserCard';
import { ProfileEmptyState } from '@/components/profile/ProfileEmptyState';

export type ConnectionsTabType = 'followers' | 'following';

export default function UserConnectionsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    userId?: string;
    initialTab?: string;
    userName?: string;
    userHandle?: string;
  }>();

  const userId = params.userId || 'u1';
  const isOwnProfile = userId === 'u1' || userId === 'current-user';

  // Determine user profile metadata
  const userProfile = useMemo(() => {
    if (isOwnProfile) return MOCK_USER_PROFILE;
    if (userId === 'user-2') return MOCK_OTHER_USER_PROFILE;
    return {
      ...MOCK_USER_PROFILE,
      id: userId,
      name: params.userName || 'User',
      username: params.userHandle || 'user',
    };
  }, [userId, isOwnProfile, params.userName, params.userHandle]);

  // Initial tab selection
  const [activeTab, setActiveTab] = useState<ConnectionsTabType>(
    params.initialTab === 'following' ? 'following' : 'followers'
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Initial data from mockData
  const initialConnections = useMemo(() => getUserConnections(userId), [userId]);

  const [followersList, setFollowersList] = useState<ConnectionUser[]>(
    initialConnections.followers
  );
  const [followingList, setFollowingList] = useState<ConnectionUser[]>(
    initialConnections.following
  );

  // Track follow state per user for interactive toggle
  const [followingMap, setFollowingMap] = useState<Record<string, boolean>>(() => {
    const map: Record<string, boolean> = {};
    initialConnections.followers.forEach((u) => {
      map[u.id] = !!u.isFollowing;
    });
    initialConnections.following.forEach((u) => {
      map[u.id] = true;
    });
    return map;
  });

  const handleToggleFollow = (targetUserId: string) => {
    setFollowingMap((prev) => {
      const currentState = !!prev[targetUserId];
      const newState = !currentState;
      return { ...prev, [targetUserId]: newState };
    });
  };

  const handleRemoveFollower = (targetUserId: string) => {
    Alert.alert(
      'Remove Follower',
      'DreamOut won’t tell them they were removed from your followers.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setFollowersList((prev) => prev.filter((u) => u.id !== targetUserId));
          },
        },
      ]
    );
  };

  // Filter current tab by search query
  const displayedList = useMemo(() => {
    const sourceList = activeTab === 'followers' ? followersList : followingList;
    if (!searchQuery.trim()) return sourceList;

    const q = searchQuery.toLowerCase().trim();
    return sourceList.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.location && u.location.toLowerCase().includes(q)) ||
        (u.bio && u.bio.toLowerCase().includes(q))
    );
  }, [activeTab, followersList, followingList, searchQuery]);

  const handleBackPress = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/profile');
    }
  };

  const followersCount = followersList.length;
  const followingCount = followingList.length;

  return (
    <SafeAreaView style={styles.safeContainer}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* 1. Header Bar */}
      <View style={[styles.headerBar, { paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 12) : 6 }]}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.7}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTitleBlock}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {userProfile.name}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            @{userProfile.username}
          </Text>
        </View>

        <View style={styles.headerRightSpace} />
      </View>

      {/* 2. Segmented Pill Tabs (Followers vs Following) */}
      <View style={styles.tabBarContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'followers' && styles.activeTabButton]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('followers')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'followers' && styles.activeTabText]}
          >
            Followers
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'followers' ? styles.activeTabBadge : styles.inactiveTabBadge,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'followers' && styles.activeTabBadgeText,
              ]}
            >
              {followersCount}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'following' && styles.activeTabButton]}
          activeOpacity={0.8}
          onPress={() => setActiveTab('following')}
        >
          <Text
            style={[styles.tabButtonText, activeTab === 'following' && styles.activeTabText]}
          >
            Following
          </Text>
          <View
            style={[
              styles.tabBadge,
              activeTab === 'following' ? styles.activeTabBadge : styles.inactiveTabBadge,
            ]}
          >
            <Text
              style={[
                styles.tabBadgeText,
                activeTab === 'following' && styles.activeTabBadgeText,
              ]}
            >
              {followingCount}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInner}>
          <Ionicons name="search" size={17} color="#8A8F9B" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder={
              activeTab === 'followers' ? 'Search followers...' : 'Search following...'
            }
            placeholderTextColor="#8A8F9B"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={18} color="#8A8F9B" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* 4. Sub-header info / Count Indicator */}
      <View style={styles.metaRow}>
        <Text style={styles.metaText}>
          {searchQuery.trim()
            ? `Found ${displayedList.length} ${
                displayedList.length === 1 ? 'person' : 'people'
              }`
            : activeTab === 'followers'
            ? `All ${followersCount} Followers`
            : `All ${followingCount} Following`}
        </Text>
        {searchQuery.trim().length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Text style={styles.clearSearchLink}>Clear filter</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 5. List of People */}
      <FlatList
        data={displayedList}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ConnectionUserCard
            user={item}
            activeTab={activeTab}
            isFollowingState={!!followingMap[item.id]}
            onToggleFollow={handleToggleFollow}
            onRemoveFollower={handleRemoveFollower}
            isOwnProfile={isOwnProfile}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery.trim().length > 0 ? (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="search-outline" size={28} color="#8A8F9B" />
              </View>
              <Text style={styles.emptyTitle}>No matching travelers</Text>
              <Text style={styles.emptyDescription}>
                We couldn't find anyone matching "{searchQuery}". Try a different name or handle.
              </Text>
              <TouchableOpacity
                style={styles.clearButton}
                activeOpacity={0.8}
                onPress={() => setSearchQuery('')}
              >
                <Text style={styles.clearButtonText}>Clear Search</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconCircle}>
                <Ionicons
                  name={activeTab === 'followers' ? 'people-outline' : 'person-add-outline'}
                  size={30}
                  color="#FF6B00"
                />
              </View>
              <Text style={styles.emptyTitle}>
                {activeTab === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
              </Text>
              <Text style={styles.emptyDescription}>
                {activeTab === 'followers'
                  ? 'When people follow this profile, they will show up here.'
                  : 'Start following fellow explorers to see their journeys and routes in your feed.'}
              </Text>
              <TouchableOpacity
                style={styles.exploreButton}
                activeOpacity={0.85}
                onPress={() => router.push('/explore')}
              >
                <Ionicons name="compass-outline" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.exploreButtonText}>Explore Community</Text>
              </TouchableOpacity>
            </View>
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeContainer: {
    flex: 1,
    backgroundColor: '#0A0B0E',
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  headerTitleBlock: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 16.5,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 1,
  },
  headerRightSpace: {
    width: 38,
  },

  /* Segmented Pill Tabs */
  tabBarContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 14,
    marginHorizontal: 16,
    marginTop: 12,
    padding: 3,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    borderRadius: 11,
    gap: 6,
  },
  activeTabButton: {
    backgroundColor: '#FF6B00',
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 3,
  },
  tabButtonText: {
    color: '#9CA3AF',
    fontSize: 13.5,
    fontWeight: '600',
  },
  activeTabText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  tabBadge: {
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 10,
  },
  activeTabBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
  },
  inactiveTabBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  tabBadgeText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
  },
  activeTabBadgeText: {
    color: '#FFFFFF',
  },

  /* Search Bar */
  searchContainer: {
    paddingHorizontal: 16,
    marginTop: 12,
  },
  searchInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(18, 20, 26, 0.85)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: 12,
    height: 42,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 13.5,
    paddingVertical: 0,
  },

  /* Meta Row */
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    marginTop: 12,
    marginBottom: 6,
  },
  metaText: {
    color: '#8A8F9B',
    fontSize: 12,
    fontWeight: '600',
  },
  clearSearchLink: {
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
  },

  /* List */
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 4,
    paddingBottom: 28,
  },

  /* Empty State */
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptyDescription: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 18,
  },
  clearButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 12,
  },
  clearButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B00',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 3,
  },
  exploreButtonText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '700',
  },
});
