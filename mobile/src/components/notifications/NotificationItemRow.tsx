import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NotificationItem } from '@/data/mockData';

interface NotificationItemRowProps {
  item: NotificationItem;
  onPress: (item: NotificationItem) => void;
}

export const NotificationItemRow: React.FC<NotificationItemRowProps> = ({ item, onPress }) => {
  // Determine left icon badge based on type
  const renderBadgeIcon = () => {
    switch (item.type) {
      case 'like':
        return (
          <View style={[styles.miniBadge, { backgroundColor: '#EF4444' }]}>
            <Ionicons name="heart" size={10} color="#FFFFFF" />
          </View>
        );
      case 'follow':
        return (
          <View style={[styles.miniBadge, { backgroundColor: '#FF6B00' }]}>
            <Ionicons name="person-add" size={10} color="#FFFFFF" />
          </View>
        );
      case 'comment':
        return (
          <View style={[styles.miniBadge, { backgroundColor: '#3B82F6' }]}>
            <Ionicons name="chatbubble" size={10} color="#FFFFFF" />
          </View>
        );
      case 'route_share':
        return (
          <View style={[styles.miniBadge, { backgroundColor: '#10B981' }]}>
            <Ionicons name="share-social" size={10} color="#FFFFFF" />
          </View>
        );
      case 'route_invitation':
        return (
          <View style={[styles.miniBadge, { backgroundColor: '#8B5CF6' }]}>
            <Ionicons name="map" size={10} color="#FFFFFF" />
          </View>
        );
      default:
        return null;
    }
  };

  const renderLeftAvatar = () => {
    if (item.type === 'system') {
      return (
        <View style={styles.systemAvatarCircle}>
          <Ionicons name="sparkles" size={18} color="#FF6B00" />
        </View>
      );
    }

    if (item.user?.avatar) {
      return (
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: item.user.avatar }} style={styles.avatarImage} />
          {renderBadgeIcon()}
        </View>
      );
    }

    if (item.thumbnailUri) {
      return (
        <View style={styles.avatarWrapper}>
          <Image source={{ uri: item.thumbnailUri }} style={styles.avatarImage} />
        </View>
      );
    }

    return (
      <View style={styles.systemAvatarCircle}>
        <Ionicons name="notifications" size={18} color="#FF6B00" />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        item.isUnread && styles.unreadContainer,
      ]}
      activeOpacity={0.7}
      onPress={() => onPress(item)}
    >
      {/* Left Avatar / Type Icon */}
      {renderLeftAvatar()}

      {/* Center Text Info */}
      <View style={styles.contentCol}>
        <View style={styles.titleRow}>
          {item.isUnread && <View style={styles.unreadDot} />}
          <Text
            style={[
              styles.titleText,
              item.isUnread ? styles.unreadTitleText : styles.readTitleText,
            ]}
            numberOfLines={2}
          >
            {item.title}
          </Text>
        </View>

        {item.targetTitle && (
          <Text style={styles.targetTitleText} numberOfLines={1}>
            {item.targetTitle}
          </Text>
        )}

        {item.body && (
          <Text style={styles.bodyText} numberOfLines={2}>
            {item.body}
          </Text>
        )}

        <Text style={styles.timeText}>{item.timeAgo}</Text>
      </View>

      {/* Right Thumbnail if present */}
      {item.thumbnailUri && item.type !== 'journey' && item.type !== 'spot_discovery' && (
        <Image source={{ uri: item.thumbnailUri }} style={styles.rightThumbnail} />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    backgroundColor: '#0A0B0E',
    minHeight: 64,
  },
  unreadContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
  },
  avatarWrapper: {
    position: 'relative',
    width: 44,
    height: 44,
    marginRight: 12,
  },
  avatarImage: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1E212A',
  },
  miniBadge: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 18,
    height: 18,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#0A0B0E',
  },
  systemAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#1C1F28',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contentCol: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
    marginRight: 6,
  },
  titleText: {
    fontSize: 14,
    lineHeight: 19,
  },
  unreadTitleText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  readTitleText: {
    color: '#D1D5DB',
    fontWeight: '500',
  },
  targetTitleText: {
    color: '#FF6B00',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
  },
  bodyText: {
    color: '#9CA3AF',
    fontSize: 13,
    fontStyle: 'italic',
    marginTop: 2,
    lineHeight: 18,
  },
  timeText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '400',
    marginTop: 4,
  },
  rightThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 8,
    backgroundColor: '#1E212A',
    marginLeft: 10,
  },
});
