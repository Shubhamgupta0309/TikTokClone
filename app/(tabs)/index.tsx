import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Dimensions,
  StatusBar,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import VideoFeedItem from '../../components/VideoFeedItem';
import LoadingScreen from '../../components/LoadingScreen';
import LikeNotification from '../../components/LikeNotification';
import { sampleVideos, VideoData } from '../../data/videos';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function HomeScreen() {
  const [videos, setVideos] = useState<VideoData[]>(sampleVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showLikeNotification, setShowLikeNotification] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

  // Simulate loading for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

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

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Simulate refresh
    setTimeout(() => {
      setRefreshing(false);
      // In a real app, you'd fetch new videos here
    }, 2000);
  }, []);

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

      // Show like notification
      setShowLikeNotification(true);

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
    } catch (error) {
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
      const userDoc = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userDoc);
      const userData = userSnapshot.data();
      const following = userData?.following || [];

      if (following.includes(userId)) {
        // Unfollow
        await updateDoc(userDoc, {
          following: arrayRemove(userId),
        });
        Alert.alert('Unfollowed', 'You are no longer following this user');
      } else {
        // Follow
        await updateDoc(userDoc, {
          following: arrayUnion(userId),
        });
        Alert.alert('Following', 'You are now following this user!');
      }
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    }
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

  if (isLoading) {
    return <LoadingScreen message="Loading your feed..." />;
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LikeNotification 
        visible={showLikeNotification}
        onComplete={() => setShowLikeNotification(false)}
      />
      <FlatList
        ref={flatListRef}
        data={videos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={SCREEN_HEIGHT}
        snapToAlignment="start"
        decelerationRate="fast"
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#ff3040"
            colors={['#ff3040']}
          />
        }
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});
