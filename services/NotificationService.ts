import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'like' | 'comment' | 'follow' | 'video_upload' | 'mention';
  userId: string;
  videoId?: string;
  message: string;
  timestamp: number;
  [key: string]: unknown;
}

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize() {
    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      
      try {
        const token = await Notifications.getExpoPushTokenAsync({
          projectId: Constants.expoConfig?.extra?.eas?.projectId,
        });
        this.expoPushToken = token.data;
        
        // Store token locally for later use
        await AsyncStorage.setItem('expoPushToken', token.data);
        
        console.log('Push token:', token.data);
      } catch (error) {
        console.log('Error getting push token:', error);
      }
    } else {
      console.log('Must use physical device for Push Notifications');
    }
  }

  async getStoredToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('expoPushToken');
    } catch (error) {
      console.log('Error getting stored token:', error);
      return null;
    }
  }

  async sendLocalNotification(data: NotificationData) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: this.getNotificationTitle(data.type),
        body: data.message,
        data: data,
        sound: 'default',
        badge: 1,
      },
      trigger: null, // Send immediately
    });
  }

  async sendPushNotification(
    expoPushToken: string,
    title: string,
    body: string,
    data?: any
  ) {
    const message = {
      to: expoPushToken,
      sound: 'default',
      title: title,
      body: body,
      data: data,
      badge: 1,
    };

    try {
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      const result = await response.json();
      console.log('Push notification sent:', result);
    } catch (error) {
      console.log('Error sending push notification:', error);
    }
  }

  private getNotificationTitle(type: NotificationData['type']): string {
    switch (type) {
      case 'like':
        return '❤️ New Like';
      case 'comment':
        return '💬 New Comment';
      case 'follow':
        return '👤 New Follower';
      case 'video_upload':
        return '🎬 New Video';
      case 'mention':
        return '📢 You were mentioned';
      default:
        return '🔔 TikTok Clone';
    }
  }

  // Store notification in local storage for notification screen
  async storeNotification(notification: NotificationData) {
    try {
      const existing = await AsyncStorage.getItem('notifications');
      const notifications = existing ? JSON.parse(existing) : [];
      
      notifications.unshift(notification); // Add to beginning
      
      // Keep only last 50 notifications
      if (notifications.length > 50) {
        notifications.splice(50);
      }
      
      await AsyncStorage.setItem('notifications', JSON.stringify(notifications));
    } catch (error) {
      console.log('Error storing notification:', error);
    }
  }

  async getStoredNotifications(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem('notifications');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.log('Error getting stored notifications:', error);
      return [];
    }
  }

  async clearNotifications() {
    try {
      await AsyncStorage.removeItem('notifications');
      await Notifications.setBadgeCountAsync(0);
    } catch (error) {
      console.log('Error clearing notifications:', error);
    }
  }

  // Simulate receiving notifications for demo purposes
  async simulateNotifications() {
    const demoNotifications: NotificationData[] = [
      {
        type: 'like',
        userId: 'user1',
        videoId: 'video1',
        message: 'Sarah liked your video "Amazing Dance Moves"',
        timestamp: Date.now() - 300000, // 5 minutes ago
      },
      {
        type: 'comment',
        userId: 'user2',
        videoId: 'video2',
        message: 'Mike commented: "This is incredible! 🔥"',
        timestamp: Date.now() - 900000, // 15 minutes ago
      },
      {
        type: 'follow',
        userId: 'user3',
        message: 'Emma started following you',
        timestamp: Date.now() - 1800000, // 30 minutes ago
      },
      {
        type: 'video_upload',
        userId: 'user4',
        videoId: 'video3',
        message: 'Alex uploaded a new video: "Travel Vibes"',
        timestamp: Date.now() - 3600000, // 1 hour ago
      },
    ];

    for (const notification of demoNotifications) {
      await this.storeNotification(notification);
    }
  }
}

export default new NotificationService();
