import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import SkeletonPlaceholder from 'react-native-skeleton-placeholder';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Video Feed Skeleton
export const VideoFeedSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder borderRadius={4}>
        <View style={styles.videoContainer}>
          {/* Video placeholder */}
          <View style={styles.video} />
          
          {/* User info */}
          <View style={styles.userInfo}>
            <View style={styles.avatar} />
            <View style={styles.userDetails}>
              <View style={styles.username} />
              <View style={styles.description} />
            </View>
          </View>
          
          {/* Action buttons */}
          <View style={styles.actions}>
            <View style={styles.actionButton} />
            <View style={styles.actionButton} />
            <View style={styles.actionButton} />
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

// Profile Skeleton
export const ProfileSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder borderRadius={4}>
        <View style={styles.profileContainer}>
          {/* Header */}
          <View style={styles.profileHeader}>
            <View style={styles.profileAvatar} />
            <View style={styles.profileInfo}>
              <View style={styles.profileName} />
              <View style={styles.profileStats} />
            </View>
          </View>
          
          {/* Tabs */}
          <View style={styles.tabs}>
            <View style={styles.tab} />
            <View style={styles.tab} />
            <View style={styles.tab} />
          </View>
          
          {/* Video grid */}
          <View style={styles.videoGrid}>
            {[...Array(6)].map((_, index) => (
              <View key={index} style={styles.gridVideo} />
            ))}
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

// Comments Skeleton
export const CommentsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder borderRadius={4}>
        <View style={styles.commentsContainer}>
          {[...Array(5)].map((_, index) => (
            <View key={index} style={styles.comment}>
              <View style={styles.commentAvatar} />
              <View style={styles.commentContent}>
                <View style={styles.commentUsername} />
                <View style={styles.commentText} />
                <View style={styles.commentText} />
              </View>
            </View>
          ))}
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

// Discover Skeleton
export const DiscoverSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder borderRadius={4}>
        <View style={styles.discoverContainer}>
          {/* Search bar */}
          <View style={styles.searchBar} />
          
          {/* Categories */}
          <View style={styles.categories}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.category} />
            ))}
          </View>
          
          {/* Trending videos */}
          <View style={styles.trendingSection}>
            <View style={styles.sectionTitle} />
            <View style={styles.videoList}>
              {[...Array(3)].map((_, index) => (
                <View key={index} style={styles.trendingVideo}>
                  <View style={styles.trendingThumbnail} />
                  <View style={styles.trendingInfo}>
                    <View style={styles.trendingTitle} />
                    <View style={styles.trendingStats} />
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

// Analytics Skeleton
export const AnalyticsSkeleton: React.FC = () => {
  return (
    <View style={styles.container}>
      <SkeletonPlaceholder borderRadius={4}>
        <View style={styles.analyticsContainer}>
          {/* Metrics cards */}
          <View style={styles.metricsRow}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.metricCard} />
            ))}
          </View>
          
          {/* Chart */}
          <View style={styles.chart} />
          
          {/* Stats list */}
          <View style={styles.statsList}>
            {[...Array(4)].map((_, index) => (
              <View key={index} style={styles.statItem}>
                <View style={styles.statLabel} />
                <View style={styles.statValue} />
              </View>
            ))}
          </View>
        </View>
      </SkeletonPlaceholder>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  
  // Video Feed Styles
  videoContainer: {
    width: screenWidth,
    height: screenHeight,
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
    backgroundColor: '#333',
  },
  userInfo: {
    position: 'absolute',
    bottom: 100,
    left: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    width: 120,
    height: 16,
    marginBottom: 8,
  },
  description: {
    width: 200,
    height: 14,
  },
  actions: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginBottom: 16,
  },
  
  // Profile Styles
  profileContainer: {
    padding: 16,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    width: 150,
    height: 20,
    marginBottom: 8,
  },
  profileStats: {
    width: 200,
    height: 16,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  tab: {
    width: 80,
    height: 32,
    marginRight: 16,
  },
  videoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridVideo: {
    width: (screenWidth - 48) / 3,
    height: 120,
    marginBottom: 4,
  },
  
  // Comments Styles
  commentsContainer: {
    padding: 16,
  },
  comment: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  commentAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 12,
  },
  commentContent: {
    flex: 1,
  },
  commentUsername: {
    width: 100,
    height: 14,
    marginBottom: 6,
  },
  commentText: {
    width: '100%',
    height: 12,
    marginBottom: 4,
  },
  
  // Discover Styles
  discoverContainer: {
    padding: 16,
  },
  searchBar: {
    width: '100%',
    height: 40,
    marginBottom: 16,
  },
  categories: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  category: {
    width: 80,
    height: 32,
    marginRight: 12,
  },
  trendingSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    width: 120,
    height: 18,
    marginBottom: 16,
  },
  videoList: {
    gap: 12,
  },
  trendingVideo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  trendingThumbnail: {
    width: 80,
    height: 60,
    marginRight: 12,
  },
  trendingInfo: {
    flex: 1,
  },
  trendingTitle: {
    width: '80%',
    height: 14,
    marginBottom: 6,
  },
  trendingStats: {
    width: '60%',
    height: 12,
  },
  
  // Analytics Styles
  analyticsContainer: {
    padding: 16,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  metricCard: {
    width: (screenWidth - 64) / 4,
    height: 80,
  },
  chart: {
    width: '100%',
    height: 200,
    marginBottom: 24,
  },
  statsList: {
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    width: 120,
    height: 14,
  },
  statValue: {
    width: 60,
    height: 14,
  },
});
