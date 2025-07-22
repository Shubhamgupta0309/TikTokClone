import React, { useState, useRef, useCallback } from 'react';
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
import { sampleVideos, VideoData } from '../data/videos';
import { doc, updateDoc, arrayUnion, arrayRemove, getDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useAuth } from '../contexts/AuthContext';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>(sampleVideos);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const { user } = useAuth();

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

  const renderItem = ({ item, index }: { item: VideoData; index: number }) => (
    <VideoFeedItem
      video={item}
      isVisible={index === currentIndex}
      isMuted={isMuted}
      onMuteToggle={handleMuteToggle}
      onLike={handleLike}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
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
        getItemLayout={(data, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
      />
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
