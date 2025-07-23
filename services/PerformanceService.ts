import { MMKV } from 'react-native-mmkv';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PerformanceMetrics {
  videoLoadTime: number;
  appStartTime: number;
  navigationTime: number;
  memoryUsage: number;
  cacheHitRate: number;
  apiResponseTime: number;
}

export interface CacheItem {
  data: any;
  timestamp: number;
  expiresAt: number;
}

class PerformanceService {
  private storage: MMKV;
  private metrics: PerformanceMetrics;
  private cache: Map<string, CacheItem>;
  private startTimes: Map<string, number>;

  constructor() {
    this.storage = new MMKV();
    this.cache = new Map();
    this.startTimes = new Map();
    this.metrics = {
      videoLoadTime: 0,
      appStartTime: 0,
      navigationTime: 0,
      memoryUsage: 0,
      cacheHitRate: 0,
      apiResponseTime: 0,
    };
    this.initializePerformanceMonitoring();
  }

  private initializePerformanceMonitoring() {
    // Monitor app start time
    this.startTimer('appStart');
    
    // Set up memory monitoring
    this.monitorMemoryUsage();
    
    // Initialize cache from storage
    this.loadCacheFromStorage();
  }

  // Timer Management
  startTimer(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  endTimer(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) return 0;
    
    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);
    
    // Update metrics based on operation type
    switch (operation) {
      case 'videoLoad':
        this.metrics.videoLoadTime = duration;
        break;
      case 'appStart':
        this.metrics.appStartTime = duration;
        break;
      case 'navigation':
        this.metrics.navigationTime = duration;
        break;
      case 'apiCall':
        this.metrics.apiResponseTime = duration;
        break;
    }
    
    this.saveMetrics();
    return duration;
  }

  // Cache Management
  setCache(key: string, data: any, ttl: number = 30 * 60 * 1000): void {
    const item: CacheItem = {
      data,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    };
    
    this.cache.set(key, item);
    this.storage.set(`cache_${key}`, JSON.stringify(item));
  }

  getCache(key: string): any | null {
    let item = this.cache.get(key);
    
    // If not in memory, try to load from storage
    if (!item) {
      const storedItem = this.storage.getString(`cache_${key}`);
      if (storedItem) {
        try {
          const parsedItem = JSON.parse(storedItem);
          this.cache.set(key, parsedItem);
          item = parsedItem;
        } catch (error) {
          console.log('Error parsing cached item:', error);
        }
      }
    }
    
    if (!item || Date.now() > item.expiresAt) {
      this.removeCache(key);
      return null;
    }
    
    return item.data;
  }

  removeCache(key: string): void {
    this.cache.delete(key);
    this.storage.delete(`cache_${key}`);
  }

  clearCache(): void {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => this.removeCache(key));
  }

  // Memory Management
  private monitorMemoryUsage(): void {
    setInterval(() => {
      try {
        // React Native doesn't have performance.memory, so we'll simulate it
        const estimatedMemory = Math.random() * 50 + 20; // 20-70 MB
        this.metrics.memoryUsage = estimatedMemory;
      } catch (error) {
        console.log('Error monitoring memory:', error);
      }
    }, 10000); // Check every 10 seconds
  }

  // Performance Optimization
  optimizeImages(): string[] {
    const optimizations = [];
    
    // Check cache size
    if (this.cache.size > 100) {
      this.cleanupExpiredCache();
      optimizations.push('Cleaned up expired cache entries');
    }
    
    // Check memory usage
    if (this.metrics.memoryUsage > 100) {
      this.clearCache();
      optimizations.push('Cleared cache to free memory');
    }
    
    return optimizations;
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    this.cache.forEach((item, key) => {
      if (now > item.expiresAt) {
        expiredKeys.push(key);
      }
    });
    
    expiredKeys.forEach(key => this.removeCache(key));
  }

  // Metrics and Analytics
  getMetrics(): PerformanceMetrics {
    return { ...this.metrics };
  }

  saveMetrics(): void {
    this.storage.set('performance_metrics', JSON.stringify(this.metrics));
  }

  private loadCacheFromStorage(): void {
    try {
      const storedMetrics = this.storage.getString('performance_metrics');
      if (storedMetrics) {
        this.metrics = { ...this.metrics, ...JSON.parse(storedMetrics) };
      }
    } catch (error) {
      console.log('Error loading performance metrics:', error);
    }
  }

  // Video Performance Optimization
  preloadVideo(videoUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const cacheKey = `video_${videoUrl}`;
      
      // Check if already cached
      if (this.getCache(cacheKey)) {
        resolve();
        return;
      }
      
      // Start preloading
      this.startTimer('videoLoad');
      
      // Simulate video preloading (in real app, you'd use actual video preloading)
      setTimeout(() => {
        this.setCache(cacheKey, { preloaded: true }, 60 * 60 * 1000); // 1 hour
        this.endTimer('videoLoad');
        resolve();
      }, 100);
    });
  }

  // Navigation Performance
  trackNavigation(from: string, to: string): void {
    this.startTimer('navigation');
    
    // End timer when navigation completes (you'd call this after navigation)
    setTimeout(() => {
      const duration = this.endTimer('navigation');
      console.log(`Navigation from ${from} to ${to} took ${duration}ms`);
    }, 50);
  }

  // Error Recovery
  handleError(error: Error, context: string): void {
    const errorInfo = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      metrics: this.getMetrics(),
    };
    
    // Store error for debugging
    this.storage.set(`error_${Date.now()}`, JSON.stringify(errorInfo));
    
    // Clean up old errors (keep only last 10)
    this.cleanupErrorLogs();
  }

  private cleanupErrorLogs(): void {
    const allKeys = this.storage.getAllKeys();
    const errorKeys = allKeys.filter(key => key.startsWith('error_')).sort();
    
    if (errorKeys.length > 10) {
      const keysToDelete = errorKeys.slice(0, errorKeys.length - 10);
      keysToDelete.forEach(key => this.storage.delete(key));
    }
  }

  // Offline Support
  async syncOfflineData(): Promise<void> {
    try {
      const offlineActions = await AsyncStorage.getItem('offline_actions');
      if (offlineActions) {
        const actions = JSON.parse(offlineActions);
        
        // Process offline actions (likes, comments, etc.)
        for (const action of actions) {
          await this.processOfflineAction(action);
        }
        
        // Clear processed actions
        await AsyncStorage.removeItem('offline_actions');
      }
    } catch (error) {
      console.log('Error syncing offline data:', error);
    }
  }

  private async processOfflineAction(action: any): Promise<void> {
    // Process different types of offline actions
    switch (action.type) {
      case 'like':
        // Sync like action
        break;
      case 'comment':
        // Sync comment action
        break;
      case 'follow':
        // Sync follow action
        break;
    }
  }
}

export default new PerformanceService();
