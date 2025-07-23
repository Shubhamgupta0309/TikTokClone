import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { EventEmitter } from 'events';

export interface OfflineAction {
  id: string;
  type: 'like' | 'comment' | 'follow' | 'view' | 'share';
  data: any;
  timestamp: number;
  retryCount: number;
}

export interface OfflineData {
  videos: any[];
  userProfiles: any[];
  comments: any[];
  lastSync: number;
}

class OfflineManager extends EventEmitter {
  private isConnected: boolean = true;
  private offlineActions: OfflineAction[] = [];
  private offlineData: OfflineData = {
    videos: [],
    userProfiles: [],
    comments: [],
    lastSync: 0,
  };

  constructor() {
    super();
    this.initialize();
  }

  private async initialize() {
    // Load offline data and actions from storage
    await this.loadOfflineData();
    await this.loadOfflineActions();
    
    // Set up network monitoring
    this.setupNetworkMonitoring();
  }

  private setupNetworkMonitoring() {
    NetInfo.addEventListener(state => {
      const wasConnected = this.isConnected;
      this.isConnected = state.isConnected ?? false;
      
      if (!wasConnected && this.isConnected) {
        // Just came back online
        this.emit('connected');
        this.syncOfflineActions();
      } else if (wasConnected && !this.isConnected) {
        // Just went offline
        this.emit('disconnected');
      }
      
      this.emit('connectionChange', this.isConnected);
    });
  }

  // Network Status
  isOnline(): boolean {
    return this.isConnected;
  }

  isOffline(): boolean {
    return !this.isConnected;
  }

  // Offline Actions Management
  async addOfflineAction(action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) {
    const offlineAction: OfflineAction = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      retryCount: 0,
      ...action,
    };

    this.offlineActions.push(offlineAction);
    await this.saveOfflineActions();
    
    // If online, try to sync immediately
    if (this.isConnected) {
      await this.syncOfflineActions();
    }
  }

  async syncOfflineActions(): Promise<void> {
    if (!this.isConnected || this.offlineActions.length === 0) {
      return;
    }

    const actionsToSync = [...this.offlineActions];
    const successfulActions: string[] = [];

    for (const action of actionsToSync) {
      try {
        const success = await this.executeOfflineAction(action);
        if (success) {
          successfulActions.push(action.id);
        } else {
          // Increment retry count
          action.retryCount++;
          if (action.retryCount >= 3) {
            // Remove after 3 failed attempts
            successfulActions.push(action.id);
          }
        }
      } catch (error) {
        console.log('Error syncing offline action:', error);
        action.retryCount++;
        if (action.retryCount >= 3) {
          successfulActions.push(action.id);
        }
      }
    }

    // Remove successful/failed actions
    this.offlineActions = this.offlineActions.filter(
      action => !successfulActions.includes(action.id)
    );
    
    await this.saveOfflineActions();
    this.emit('syncComplete', successfulActions.length);
  }

  private async executeOfflineAction(action: OfflineAction): Promise<boolean> {
    switch (action.type) {
      case 'like':
        return await this.syncLike(action.data);
      case 'comment':
        return await this.syncComment(action.data);
      case 'follow':
        return await this.syncFollow(action.data);
      case 'view':
        return await this.syncView(action.data);
      case 'share':
        return await this.syncShare(action.data);
      default:
        return false;
    }
  }

  // Sync Methods
  private async syncLike(data: any): Promise<boolean> {
    try {
      // Simulate API call for like
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Synced like:', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async syncComment(data: any): Promise<boolean> {
    try {
      // Simulate API call for comment
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Synced comment:', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async syncFollow(data: any): Promise<boolean> {
    try {
      // Simulate API call for follow
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('Synced follow:', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async syncView(data: any): Promise<boolean> {
    try {
      // Simulate API call for view
      await new Promise(resolve => setTimeout(resolve, 200));
      console.log('Synced view:', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  private async syncShare(data: any): Promise<boolean> {
    try {
      // Simulate API call for share
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log('Synced share:', data);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Offline Data Caching
  async cacheVideo(video: any): Promise<void> {
    const existingIndex = this.offlineData.videos.findIndex(v => v.id === video.id);
    
    if (existingIndex >= 0) {
      this.offlineData.videos[existingIndex] = video;
    } else {
      this.offlineData.videos.push(video);
    }
    
    // Keep only last 50 videos
    if (this.offlineData.videos.length > 50) {
      this.offlineData.videos = this.offlineData.videos.slice(-50);
    }
    
    await this.saveOfflineData();
  }

  async cacheUserProfile(profile: any): Promise<void> {
    const existingIndex = this.offlineData.userProfiles.findIndex(p => p.id === profile.id);
    
    if (existingIndex >= 0) {
      this.offlineData.userProfiles[existingIndex] = profile;
    } else {
      this.offlineData.userProfiles.push(profile);
    }
    
    // Keep only last 20 profiles
    if (this.offlineData.userProfiles.length > 20) {
      this.offlineData.userProfiles = this.offlineData.userProfiles.slice(-20);
    }
    
    await this.saveOfflineData();
  }

  async cacheComments(videoId: string, comments: any[]): Promise<void> {
    const existingIndex = this.offlineData.comments.findIndex(c => c.videoId === videoId);
    
    if (existingIndex >= 0) {
      this.offlineData.comments[existingIndex] = { videoId, comments };
    } else {
      this.offlineData.comments.push({ videoId, comments });
    }
    
    // Keep only last 30 comment sets
    if (this.offlineData.comments.length > 30) {
      this.offlineData.comments = this.offlineData.comments.slice(-30);
    }
    
    await this.saveOfflineData();
  }

  // Data Retrieval
  getCachedVideos(): any[] {
    return this.offlineData.videos;
  }

  getCachedUserProfile(userId: string): any | null {
    return this.offlineData.userProfiles.find(p => p.id === userId) || null;
  }

  getCachedComments(videoId: string): any[] {
    const cached = this.offlineData.comments.find(c => c.videoId === videoId);
    return cached ? cached.comments : [];
  }

  // Storage Management
  private async saveOfflineActions(): Promise<void> {
    try {
      await AsyncStorage.setItem('offline_actions', JSON.stringify(this.offlineActions));
    } catch (error) {
      console.log('Error saving offline actions:', error);
    }
  }

  private async loadOfflineActions(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_actions');
      if (stored) {
        this.offlineActions = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error loading offline actions:', error);
    }
  }

  private async saveOfflineData(): Promise<void> {
    try {
      this.offlineData.lastSync = Date.now();
      await AsyncStorage.setItem('offline_data', JSON.stringify(this.offlineData));
    } catch (error) {
      console.log('Error saving offline data:', error);
    }
  }

  private async loadOfflineData(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('offline_data');
      if (stored) {
        this.offlineData = JSON.parse(stored);
      }
    } catch (error) {
      console.log('Error loading offline data:', error);
    }
  }

  // Utility Methods
  getPendingActionsCount(): number {
    return this.offlineActions.length;
  }

  getLastSyncTime(): number {
    return this.offlineData.lastSync;
  }

  async clearOfflineData(): Promise<void> {
    this.offlineData = {
      videos: [],
      userProfiles: [],
      comments: [],
      lastSync: 0,
    };
    this.offlineActions = [];
    
    await AsyncStorage.removeItem('offline_data');
    await AsyncStorage.removeItem('offline_actions');
  }

  // Error Handling
  async retryFailedActions(): Promise<void> {
    if (this.isConnected) {
      await this.syncOfflineActions();
    }
  }
}

export default new OfflineManager();
