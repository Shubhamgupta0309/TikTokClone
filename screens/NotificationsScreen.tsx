import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const NotificationsScreen: React.FC = () => {
  const notifications = [
    {
      id: '1',
      type: 'like',
      user: 'johndoe',
      message: 'liked your video',
      time: '2m ago',
      isNew: true,
    },
    {
      id: '2',
      type: 'comment',
      user: 'sarah_smith',
      message: 'commented on your video: "Amazing content!"',
      time: '5m ago',
      isNew: true,
    },
    {
      id: '3',
      type: 'follow',
      user: 'mike_creator',
      message: 'started following you',
      time: '15m ago',
      isNew: true,
    },
    {
      id: '4',
      type: 'like',
      user: 'emma_dance',
      message: 'liked your video',
      time: '1h ago',
      isNew: false,
    },
    {
      id: '5',
      type: 'share',
      user: 'alex_traveler',
      message: 'shared your video',
      time: '2h ago',
      isNew: false,
    },
    {
      id: '6',
      type: 'comment',
      user: 'lucy_art',
      message: 'commented on your video: "Love this! 😍"',
      time: '3h ago',
      isNew: false,
    },
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return 'heart';
      case 'comment':
        return 'chatbubble';
      case 'follow':
        return 'person-add';
      case 'share':
        return 'share';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'like':
        return '#ff3040';
      case 'comment':
        return '#4285f4';
      case 'follow':
        return '#34a853';
      case 'share':
        return '#fbbc05';
      default:
        return 'white';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity>
          <Ionicons name="settings-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent</Text>
          {notifications.filter(n => n.isNew).map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  <Text style={styles.username}>{notification.user}</Text>{' '}
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
              {notification.isNew && <View style={styles.newIndicator} />}
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Earlier</Text>
          {notifications.filter(n => !n.isNew).map((notification) => (
            <TouchableOpacity key={notification.id} style={styles.notificationItem}>
              <View style={styles.notificationIcon}>
                <Ionicons
                  name={getNotificationIcon(notification.type) as any}
                  size={20}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.notificationContent}>
                <Text style={styles.notificationText}>
                  <Text style={styles.username}>{notification.user}</Text>{' '}
                  {notification.message}
                </Text>
                <Text style={styles.notificationTime}>{notification.time}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  username: {
    fontWeight: '600',
  },
  notificationTime: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  newIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ff3040',
    marginLeft: 8,
  },
});

export default NotificationsScreen;
