import AsyncStorage from '@react-native-async-storage/async-storage';

export interface VideoAnalytics {
  videoId: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  watchTime: number; // in seconds
  completion: number; // percentage
  engagement: number; // calculated metric
  demographics: {
    ageGroups: { [key: string]: number };
    countries: { [key: string]: number };
    devices: { [key: string]: number };
  };
  performance: {
    reachRate: number;
    viralityScore: number;
    retentionRate: number;
  };
}

export interface UserAnalytics {
  userId: string;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  followerGrowth: { date: string; count: number }[];
  videoPerformance: VideoAnalytics[];
  avgEngagement: number;
  topContent: string[];
  audienceInsights: {
    topCountries: { [key: string]: number };
    ageDistribution: { [key: string]: number };
    activeHours: { [key: string]: number };
  };
}

export interface AppAnalytics {
  dailyActiveUsers: number;
  totalUsers: number;
  videoUploads: number;
  totalWatchTime: number;
  retentionRate: number;
  popularHashtags: { tag: string; count: number }[];
  trendingVideos: string[];
}

class AnalyticsService {
  private analyticsData: { [key: string]: any } = {};

  // Track video view
  async trackVideoView(videoId: string, userId: string, watchTime: number, completion: number) {
    const event = {
      type: 'video_view',
      videoId,
      userId,
      watchTime,
      completion,
      timestamp: Date.now(),
      device: await this.getDeviceInfo(),
      location: await this.getLocationInfo(),
    };

    await this.storeEvent(event);
    await this.updateVideoAnalytics(videoId, { views: 1, watchTime, completion });
  }

  // Track video like
  async trackVideoLike(videoId: string, userId: string, isLiked: boolean) {
    const event = {
      type: 'video_like',
      videoId,
      userId,
      isLiked,
      timestamp: Date.now(),
    };

    await this.storeEvent(event);
    await this.updateVideoAnalytics(videoId, { likes: isLiked ? 1 : -1 });
  }

  // Track video comment
  async trackVideoComment(videoId: string, userId: string, commentLength: number) {
    const event = {
      type: 'video_comment',
      videoId,
      userId,
      commentLength,
      timestamp: Date.now(),
    };

    await this.storeEvent(event);
    await this.updateVideoAnalytics(videoId, { comments: 1 });
  }

  // Track video share
  async trackVideoShare(videoId: string, userId: string, platform: string) {
    const event = {
      type: 'video_share',
      videoId,
      userId,
      platform,
      timestamp: Date.now(),
    };

    await this.storeEvent(event);
    await this.updateVideoAnalytics(videoId, { shares: 1 });
  }

  // Track user session
  async trackUserSession(userId: string, sessionDuration: number, videosWatched: number) {
    const event = {
      type: 'user_session',
      userId,
      sessionDuration,
      videosWatched,
      timestamp: Date.now(),
    };

    await this.storeEvent(event);
  }

  // Get video analytics
  async getVideoAnalytics(videoId: string): Promise<VideoAnalytics> {
    try {
      const cached = await AsyncStorage.getItem(`analytics_video_${videoId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Return demo data if no cached data
      return this.generateDemoVideoAnalytics(videoId);
    } catch (error) {
      console.log('Error getting video analytics:', error);
      return this.generateDemoVideoAnalytics(videoId);
    }
  }

  // Get user analytics
  async getUserAnalytics(userId: string): Promise<UserAnalytics> {
    try {
      const cached = await AsyncStorage.getItem(`analytics_user_${userId}`);
      if (cached) {
        return JSON.parse(cached);
      }

      // Return demo data if no cached data
      return this.generateDemoUserAnalytics(userId);
    } catch (error) {
      console.log('Error getting user analytics:', error);
      return this.generateDemoUserAnalytics(userId);
    }
  }

  // Get app analytics
  async getAppAnalytics(): Promise<AppAnalytics> {
    try {
      const cached = await AsyncStorage.getItem('analytics_app');
      if (cached) {
        return JSON.parse(cached);
      }

      // Return demo data if no cached data
      return this.generateDemoAppAnalytics();
    } catch (error) {
      console.log('Error getting app analytics:', error);
      return this.generateDemoAppAnalytics();
    }
  }

  // Calculate engagement rate
  calculateEngagementRate(likes: number, comments: number, shares: number, views: number): number {
    if (views === 0) return 0;
    return ((likes + comments + shares) / views) * 100;
  }

  // Calculate virality score
  calculateViralityScore(shares: number, views: number, timePosted: number): number {
    const hoursOld = (Date.now() - timePosted) / (1000 * 60 * 60);
    const shareRate = shares / Math.max(views, 1);
    const timeDecay = Math.max(0, 1 - (hoursOld / 168)); // Decay over 1 week
    
    return shareRate * timeDecay * 1000; // Scale for readability
  }

  // Store analytics event
  private async storeEvent(event: any) {
    try {
      const existing = await AsyncStorage.getItem('analytics_events');
      const events = existing ? JSON.parse(existing) : [];
      
      events.push(event);
      
      // Keep only last 1000 events
      if (events.length > 1000) {
        events.splice(0, events.length - 1000);
      }
      
      await AsyncStorage.setItem('analytics_events', JSON.stringify(events));
    } catch (error) {
      console.log('Error storing analytics event:', error);
    }
  }

  // Update video analytics
  private async updateVideoAnalytics(videoId: string, updates: Partial<VideoAnalytics>) {
    try {
      const existing = await this.getVideoAnalytics(videoId);
      const updated = {
        ...existing,
        views: existing.views + (updates.views || 0),
        likes: existing.likes + (updates.likes || 0),
        comments: existing.comments + (updates.comments || 0),
        shares: existing.shares + (updates.shares || 0),
        watchTime: existing.watchTime + (updates.watchTime || 0),
      };

      // Recalculate derived metrics
      updated.engagement = this.calculateEngagementRate(
        updated.likes,
        updated.comments,
        updated.shares,
        updated.views
      );

      await AsyncStorage.setItem(`analytics_video_${videoId}`, JSON.stringify(updated));
    } catch (error) {
      console.log('Error updating video analytics:', error);
    }
  }

  // Get device info
  private async getDeviceInfo(): Promise<string> {
    // In a real app, you would get actual device info
    return 'iOS'; // or 'Android'
  }

  // Get location info
  private async getLocationInfo(): Promise<string> {
    // In a real app, you would get actual location
    return 'US';
  }

  // Generate demo analytics data
  private generateDemoVideoAnalytics(videoId: string): VideoAnalytics {
    return {
      videoId,
      views: Math.floor(Math.random() * 10000) + 1000,
      likes: Math.floor(Math.random() * 1000) + 100,
      comments: Math.floor(Math.random() * 200) + 20,
      shares: Math.floor(Math.random() * 100) + 10,
      watchTime: Math.floor(Math.random() * 30000) + 5000,
      completion: Math.floor(Math.random() * 40) + 60,
      engagement: 0, // Will be calculated
      demographics: {
        ageGroups: {
          '13-17': 25,
          '18-24': 35,
          '25-34': 25,
          '35-44': 10,
          '45+': 5,
        },
        countries: {
          'US': 40,
          'India': 20,
          'Brazil': 15,
          'UK': 10,
          'Others': 15,
        },
        devices: {
          'iOS': 60,
          'Android': 40,
        },
      },
      performance: {
        reachRate: Math.random() * 20 + 80,
        viralityScore: Math.random() * 10,
        retentionRate: Math.random() * 30 + 70,
      },
    };
  }

  private generateDemoUserAnalytics(userId: string): UserAnalytics {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        count: Math.floor(Math.random() * 100) + 50,
      };
    });

    return {
      userId,
      totalViews: Math.floor(Math.random() * 100000) + 10000,
      totalLikes: Math.floor(Math.random() * 10000) + 1000,
      totalComments: Math.floor(Math.random() * 2000) + 200,
      totalShares: Math.floor(Math.random() * 1000) + 100,
      followerGrowth: last30Days,
      videoPerformance: [],
      avgEngagement: Math.random() * 10 + 5,
      topContent: ['#dance', '#comedy', '#music', '#lifestyle'],
      audienceInsights: {
        topCountries: {
          'United States': 35,
          'India': 20,
          'Brazil': 15,
          'United Kingdom': 10,
          'Canada': 8,
          'Others': 12,
        },
        ageDistribution: {
          '13-17': 20,
          '18-24': 40,
          '25-34': 25,
          '35-44': 10,
          '45+': 5,
        },
        activeHours: {
          '0-6': 5,
          '6-12': 15,
          '12-18': 35,
          '18-24': 45,
        },
      },
    };
  }

  private generateDemoAppAnalytics(): AppAnalytics {
    return {
      dailyActiveUsers: Math.floor(Math.random() * 10000) + 50000,
      totalUsers: Math.floor(Math.random() * 100000) + 500000,
      videoUploads: Math.floor(Math.random() * 1000) + 5000,
      totalWatchTime: Math.floor(Math.random() * 1000000) + 5000000,
      retentionRate: Math.random() * 20 + 70,
      popularHashtags: [
        { tag: '#fyp', count: 12450 },
        { tag: '#viral', count: 9870 },
        { tag: '#dance', count: 8234 },
        { tag: '#comedy', count: 7456 },
        { tag: '#music', count: 6789 },
        { tag: '#trending', count: 5432 },
      ],
      trendingVideos: ['video1', 'video2', 'video3', 'video4', 'video5'],
    };
  }

  // Export analytics data
  async exportAnalytics(type: 'video' | 'user' | 'app', id?: string): Promise<string> {
    try {
      let data;
      switch (type) {
        case 'video':
          data = id ? await this.getVideoAnalytics(id) : null;
          break;
        case 'user':
          data = id ? await this.getUserAnalytics(id) : null;
          break;
        case 'app':
          data = await this.getAppAnalytics();
          break;
      }

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.log('Error exporting analytics:', error);
      return '';
    }
  }
}

export default new AnalyticsService();
