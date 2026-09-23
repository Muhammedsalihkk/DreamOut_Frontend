import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useRouter } from 'expo-router';

import {
  MOCK_NOTIFICATIONS,
  NotificationItem,
  NotificationFilterType,
  NotificationMomentData,
} from '@/data/mockData';
import { NotificationItemRow } from '@/components/notifications/NotificationItemRow';
import { MomentDetailModal } from '@/components/notifications/MomentDetailModal';

const FILTERS: NotificationFilterType[] = ['All', 'Mentions', 'Follows', 'Journey', 'System'];

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  const [activeFilter, setActiveFilter] = useState<NotificationFilterType>('All');
  const [selectedMoment, setSelectedMoment] = useState<NotificationMomentData | undefined>(undefined);
  const [momentModalVisible, setMomentModalVisible] = useState(false);

  // Filter notifications based on active pill
  const filteredNotifications = notifications.filter((item) => {
    if (activeFilter === 'All') return true;
    if (activeFilter === 'Mentions') return item.category === 'Mentions' || item.type === 'like' || item.type === 'comment';
    if (activeFilter === 'Follows') return item.category === 'Follows' || item.type === 'follow';
    if (activeFilter === 'Journey') return item.category === 'Journey' || item.type === 'journey' || item.type === 'route_share' || item.type === 'route_invitation' || item.type === 'story_view' || item.type === 'spot_discovery';
    if (activeFilter === 'System') return item.category === 'System' || item.type === 'system';
    return true;
  });

  // Group filtered notifications by dateGroup
  const groupedNotifications: { [key: string]: NotificationItem[] } = {};
  filteredNotifications.forEach((item) => {
    const group = item.dateGroup || 'Older';
    if (!groupedNotifications[group]) {
      groupedNotifications[group] = [];
    }
    groupedNotifications[group].push(item);
  });

  const dateGroupKeys = Object.keys(groupedNotifications);

  const handleNotificationPress = (item: NotificationItem) => {
    // Mark as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, isUnread: false } : n))
    );

    // Contextual actions
    if (item.type === 'like' || item.type === 'comment') {
      if (item.momentData) {
        setSelectedMoment(item.momentData);
        setMomentModalVisible(true);
      } else {
        Alert.alert('Moment', item.title);
      }
      return;
    }

    if (item.type === 'follow' && item.user) {
      router.push(`/user/${item.user.id}` as any);
      return;
    }

    if (item.type === 'journey' || item.type === 'route_share' || item.type === 'route_invitation') {
      const routeId = item.targetId || 'r1';
      router.push(`/route/${routeId}` as any);
      return;
    }

    if (item.type === 'spot_discovery') {
      const spotId = item.targetId || 's1';
      router.push(`/spot/${spotId}` as any);
      return;
    }

    if (item.type === 'story_view') {
      router.push('/story/s0' as any);
      return;
    }

    if (item.type === 'system') {
      Alert.alert(item.title, item.body || 'System update information.');
    }
  };

  const handleOpenSettings = () => {
    Alert.alert(
      'Notification Preferences',
      'Choose which notifications you would like to receive on DreamOut.',
      [
        { text: 'Push Notifications: ON', onPress: () => {} },
        { text: 'Email Digests: ON', onPress: () => {} },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/(tabs)');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0B0E" />

      {/* Screen Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBack}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          <Text style={styles.headerSubtitle}>Stay updated on your journeys</Text>
        </View>

        <TouchableOpacity
          style={styles.settingsButton}
          onPress={handleOpenSettings}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Notification Filters Horizontal Row */}
      <View style={styles.filterBarContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollContent}
        >
          {FILTERS.map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                style={[styles.filterPill, isActive && styles.activeFilterPill]}
                onPress={() => setActiveFilter(filter)}
                activeOpacity={0.8}
              >
                <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Notification List by Date Group */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredNotifications.length === 0 ? (
          /* Empty State */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-off-outline" size={38} color="#FF6B00" />
            </View>
            <Text style={styles.emptyTitle}>You're all caught up</Text>
            <Text style={styles.emptySubtitle}>
              When people interact with your journeys, routes, spots, and moments, you'll see them here.
            </Text>
          </View>
        ) : (
          dateGroupKeys.map((groupKey) => (
            <View key={groupKey} style={styles.groupSection}>
              {/* Date Section Header */}
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionHeaderText}>{groupKey}</Text>
              </View>

              {/* Items in this date group */}
              {groupedNotifications[groupKey].map((item) => (
                <NotificationItemRow
                  key={item.id}
                  item={item}
                  onPress={handleNotificationPress}
                />
              ))}
            </View>
          ))
        )}
      </ScrollView>

      {/* Moment Detail Modal */}
      <MomentDetailModal
        visible={momentModalVisible}
        moment={selectedMoment}
        onClose={() => setMomentModalVisible(false)}
        onViewJourney={() => {
          router.push('/journey/j1' as any);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0B0E',
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  backText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  headerCenter: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 1,
  },
  settingsButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  filterBarContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  activeFilterPill: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  filterText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontWeight: '600',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  groupSection: {
    marginTop: 14,
  },
  sectionHeaderRow: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: '#0A0B0E',
  },
  sectionHeaderText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: 64,
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255, 107, 0, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#9CA3AF',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
});
