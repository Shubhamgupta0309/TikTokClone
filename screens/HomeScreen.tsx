import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VideoFeedItem from '../components/VideoFeedItem';
import { VideoFeedSkeleton } from '../components/SkeletonLoaders';
import { sampleVideos, VideoData } from '../data/videos';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';
import PerformanceService from '../services/PerformanceService';
import OfflineManager from '../services/OfflineManager';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>(sampleVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  // Initialize performance monitoring and data loading
  useEffect(() => {
    PerformanceService.startTimer('videoLoad');
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      // Check if offline
      if (OfflineManager.isOffline()) {
        const cachedVideos = OfflineManager.getCachedVideos();
        if (cachedVideos.length > 0) {
          setVideos(cachedVideos);
        }
      } else {
        // Preload videos for better performance
        await Promise.all(
          sampleVideos.slice(0, 3).map(video => 
            PerformanceService.preloadVideo(video.uri)
          )
        );
        
        // Cache videos for offline use
        await Promise.all(
          sampleVideos.map(video => 
            OfflineManager.cacheVideo(video)
          )
        );
      }
    } catch (error) {
      PerformanceService.handleError(error as Error, 'HomeScreen initialization');
    } finally {
      PerformanceService.endTimer('videoLoad');
      setLoading(false);
    }
  };

  // Handle screen focus to play/pause videos
  useFocusEffect(
    useCallback(() => {
      StatusBar.setBarStyle('light-content');
      return () => {
        StatusBar.setBarStyle('default');
      };
    }, [])
  );

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index || 0);
    }
  }).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
  };

  const handleLike = async (videoId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to like videos');
      return;
    }

    try {
      // Update local state immediately for better UX
      setVideos(prevVideos =>
        prevVideos.map(video => {
          if (video.id === videoId) {
            const newIsLiked = !video.isLiked;
            return {
              ...video,
              isLiked: newIsLiked,
              likes: newIsLiked ? video.likes + 1 : video.likes - 1,
            };
          }
          return video;
        })
      );

      // Handle offline actions
      if (OfflineManager.isOffline()) {
        const videoIndex = videos.findIndex(v => v.id === videoId);
        const video = videos[videoIndex];
        await OfflineManager.addOfflineAction({
          type: 'like',
          data: { videoId, userId: user.uid, action: !video.isLiked ? 'like' : 'unlike' }
        });
      } else {
        // Update Firestore (optional - since this is demo data)
        // In a real app, you would have a proper likes collection
        const userDoc = doc(db, 'users', user.uid);
        const userSnapshot = await getDoc(userDoc);
        const userData = userSnapshot.data();
        const likedVideos = userData?.likedVideos || [];

        if (likedVideos.includes(videoId)) {
          // Unlike the video
          await updateDoc(userDoc, {
            likedVideos: arrayRemove(videoId),
          });
        } else {
          // Like the video
          await updateDoc(userDoc, {
            likedVideos: arrayUnion(videoId),
          });
        }
      }
    } catch (error) {
      PerformanceService.handleError(error as Error, 'Like video action');
      console.error('Error updating like:', error);
      // Revert local state if Firestore update fails
      setVideos(prevVideos =>
        prevVideos.map(video => {
          if (video.id === videoId) {
            const newIsLiked = !video.isLiked;
            return {
              ...video,
              isLiked: !newIsLiked,
              likes: !newIsLiked ? video.likes + 1 : video.likes - 1,
            };
          }
          return video;
        })
      );
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) {
      Alert.alert('Login Required', 'Please login to follow users');
      return;
    }

    try {
      // Handle offline actions
      if (OfflineManager.isOffline()) {
        await OfflineManager.addOfflineAction({
          type: 'follow',
          data: { targetUserId: userId, followerId: user.uid }
        });
        Alert.alert('Saved', 'Follow action will be synced when online');
      } else {
        // Update Firestore following relationship
        const userDoc = doc(db, 'users', user.uid);
        await updateDoc(userDoc, {
          following: arrayUnion(userId),
        });
        Alert.alert('Success', 'Now following this user!');
      }
    } catch (error) {
      PerformanceService.handleError(error as Error, 'Follow user action');
      console.error('Error following user:', error);
      Alert.alert('Error', 'Failed to follow user. Please try again.');
    }
  };

  // Fix the video reference issue
  const getVideoIsLiked = (videoId: string) => {
    const video = videos.find(v => v.id === videoId);
    return video?.isLiked || false;
  };

  const renderItem = ({ item, index }: { item: VideoData; index: number }) => (
    <VideoFeedItem
      video={item}
      isVisible={index === currentIndex}
      isMuted={isMuted}
      onMuteToggle={handleMuteToggle}
      onLike={handleLike}
      onFollow={handleFollow}
    />
  );

  // Show loading skeleton while data is loading
  if (loading) {
    return <VideoFeedSkeleton />;
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        decelerationRate="fast"
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
      <StatusBar barStyle="light-content" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default HomeScreen;
