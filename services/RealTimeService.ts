import { onSnapshot, collection, doc, updateDoc, arrayUnion, arrayRemove, query, where, orderBy, limit, addDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface RealTimeUpdate {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'view';
  videoId?: string;
  userId: string;
  data: any;
  timestamp: number;
}

class RealTimeService {
  private listeners: { [key: string]: () => void } = {};
  private eventCallbacks: { [key: string]: ((data: any) => void)[] } = {};

  // Subscribe to real-time video updates (likes, comments, views)
  subscribeToVideoUpdates(videoId: string, callback: (updates: any) => void) {
    const unsubscribe = onSnapshot(
      doc(db, 'videos', videoId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: videoId,
            likes: data.likes || 0,
            comments: data.comments || 0,
            views: data.views || 0,
            likedBy: data.likedBy || [],
          });
        }
      },
      (error) => {
        console.log('Error listening to video updates:', error);
      }
    );

    this.listeners[`video_${videoId}`] = unsubscribe;
    return unsubscribe;
  }

  // Subscribe to user's followers updates
  subscribeToUserUpdates(userId: string, callback: (updates: any) => void) {
    const unsubscribe = onSnapshot(
      doc(db, 'users', userId),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          callback({
            id: userId,
            followers: data.followers || 0,
            following: data.following || 0,
            videos: data.videos || 0,
          });
        }
      },
      (error) => {
        console.log('Error listening to user updates:', error);
      }
    );

    this.listeners[`user_${userId}`] = unsubscribe;
    return unsubscribe;
  }

  // Subscribe to live comments for a video
  subscribeToComments(videoId: string, callback: (comments: any[]) => void) {
    const commentsQuery = query(
      collection(db, 'comments'),
      where('videoId', '==', videoId),
      orderBy('timestamp', 'desc'),
      limit(50)
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(comments);
      },
      (error) => {
        console.log('Error listening to comments:', error);
      }
    );

    this.listeners[`comments_${videoId}`] = unsubscribe;
    return unsubscribe;
  }

  // Subscribe to trending videos
  subscribeToTrending(callback: (videos: any[]) => void) {
    const trendingQuery = query(
      collection(db, 'videos'),
      orderBy('likes', 'desc'),
      orderBy('views', 'desc'),
      limit(20)
    );

    const unsubscribe = onSnapshot(
      trendingQuery,
      (snapshot) => {
        const videos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        callback(videos);
      },
      (error) => {
        console.log('Error listening to trending videos:', error);
      }
    );

    this.listeners['trending'] = unsubscribe;
    return unsubscribe;
  }

  // Update video likes in real-time
  async updateVideoLike(videoId: string, userId: string, isLiked: boolean) {
    try {
      const videoRef = doc(db, 'videos', videoId);
      
      if (isLiked) {
        await updateDoc(videoRef, {
          likes: arrayUnion(userId),
          likeCount: await this.getLikeCount(videoId) + 1,
        });
      } else {
        await updateDoc(videoRef, {
          likes: arrayRemove(userId),
          likeCount: Math.max(0, await this.getLikeCount(videoId) - 1),
        });
      }

      // Emit real-time update
      this.emit('videoLike', {
        videoId,
        userId,
        isLiked,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.log('Error updating video like:', error);
    }
  }

  // Update video views in real-time
  async updateVideoView(videoId: string, userId: string) {
    try {
      const videoRef = doc(db, 'videos', videoId);
      
      await updateDoc(videoRef, {
        views: arrayUnion(userId),
        viewCount: await this.getViewCount(videoId) + 1,
      });

      // Emit real-time update
      this.emit('videoView', {
        videoId,
        userId,
        timestamp: Date.now(),
      });

    } catch (error) {
      console.log('Error updating video view:', error);
    }
  }

  // Add real-time comment
  async addComment(videoId: string, userId: string, text: string, username: string) {
    try {
      const comment = {
        videoId,
        userId,
        username,
        text,
        timestamp: Date.now(),
      };

      // Add to comments collection
      await addDoc(collection(db, 'comments'), comment);

      // Update video comment count
      const videoRef = doc(db, 'videos', videoId);
      await updateDoc(videoRef, {
        commentCount: await this.getCommentCount(videoId) + 1,
      });

      // Emit real-time update
      this.emit('newComment', comment);

      return comment;
    } catch (error) {
      console.log('Error adding comment:', error);
      return null;
    }
  }

  // Event system for real-time updates
  on(event: string, callback: (data: any) => void) {
    if (!this.eventCallbacks[event]) {
      this.eventCallbacks[event] = [];
    }
    this.eventCallbacks[event].push(callback);
  }

  off(event: string, callback: (data: any) => void) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event] = this.eventCallbacks[event].filter(cb => cb !== callback);
    }
  }

  emit(event: string, data: any) {
    if (this.eventCallbacks[event]) {
      this.eventCallbacks[event].forEach(callback => callback(data));
    }
  }

  // Cache management for offline support
  async cacheData(key: string, data: any) {
    try {
      await AsyncStorage.setItem(`cache_${key}`, JSON.stringify({
        data,
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.log('Error caching data:', error);
    }
  }

  async getCachedData(key: string, maxAge: number = 300000): Promise<any | null> { // 5 minutes default
    try {
      const cached = await AsyncStorage.getItem(`cache_${key}`);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < maxAge) {
          return data;
        }
      }
      return null;
    } catch (error) {
      console.log('Error getting cached data:', error);
      return null;
    }
  }

  // Helper methods
  private async getLikeCount(videoId: string): Promise<number> {
    // In a real app, you would fetch this from Firebase
    return 0;
  }

  private async getViewCount(videoId: string): Promise<number> {
    // In a real app, you would fetch this from Firebase
    return 0;
  }

  private async getCommentCount(videoId: string): Promise<number> {
    // In a real app, you would fetch this from Firebase
    return 0;
  }

  // Cleanup all listeners
  cleanup() {
    Object.values(this.listeners).forEach(unsubscribe => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    });
    this.listeners = {};
    this.eventCallbacks = {};
  }

  // Simulate real-time updates for demo
  simulateRealTimeUpdates() {
    setInterval(() => {
      // Simulate random like
      this.emit('videoLike', {
        videoId: 'demo_video_1',
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        isLiked: true,
        timestamp: Date.now(),
      });
    }, 5000);

    setInterval(() => {
      // Simulate random comment
      const comments = [
        "Amazing! 🔥",
        "Love this! ❤️",
        "So cool! 😍",
        "Can't stop watching! 👀",
        "Incredible! 🤩",
      ];
      
      this.emit('newComment', {
        videoId: 'demo_video_1',
        userId: `user_${Math.floor(Math.random() * 1000)}`,
        username: `User${Math.floor(Math.random() * 1000)}`,
        text: comments[Math.floor(Math.random() * comments.length)],
        timestamp: Date.now(),
      });
    }, 8000);
  }
}

export default new RealTimeService();
