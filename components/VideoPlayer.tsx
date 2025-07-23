import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Text,
  Pressable,
} from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
  runOnJS,
  interpolate,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoPlayerProps {
  uri: string;
  isVisible: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: () => void;
  isLiked: boolean;
  onComment: () => void;
  onShare: () => void;
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  uri,
  isVisible,
  isMuted,
  onMuteToggle,
  onLike,
  isLiked,
  onComment,
  onShare,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showMuteIndicator, setShowMuteIndicator] = useState(false);
  const videoRef = useRef<Video>(null);
  const scale = useSharedValue(1);
  const doubleTapHeart = useSharedValue(0);
  const lastTap = useRef<number>(0);
  const muteIndicatorOpacity = useSharedValue(0);

  useEffect(() => {
    if (videoRef.current) {
      if (isVisible) {
        videoRef.current.playAsync();
        setIsPlaying(true);
      } else {
        videoRef.current.pauseAsync();
        setIsPlaying(false);
      }
    }
  }, [isVisible]);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        setIsPlaying(false);
      } else {
        await videoRef.current.playAsync();
        setIsPlaying(true);
      }
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected - trigger like
      doubleTapHeart.value = withSequence(
        withTiming(1, { duration: 0 }),
        withSpring(1.2, { damping: 10 }),
        withTiming(0, { duration: 1000 })
      );
      runOnJS(onLike)();
    } else {
      // Single tap - toggle play/pause after delay to check for double tap
      setTimeout(() => {
        if (Date.now() - lastTap.current >= DOUBLE_TAP_DELAY) {
          runOnJS(handlePlayPause)();
        }
      }, DOUBLE_TAP_DELAY);
    }
    lastTap.current = now;
  };

  const handleLike = () => {
    scale.value = withSequence(
      withSpring(1.2),
      withSpring(1),
    );
    runOnJS(onLike)();
  };

  const handleMuteToggle = () => {
    setShowMuteIndicator(true);
    onMuteToggle();
  };

  const animatedHeartStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const doubleTapHeartStyle = useAnimatedStyle(() => {
    const opacity = interpolate(doubleTapHeart.value, [0, 1], [0, 1]);
    const scale = interpolate(doubleTapHeart.value, [0, 1, 1.2], [0.5, 1, 1.2]);
    
    return {
      opacity,
      transform: [{ scale }],
    };
  });

  const muteIndicatorStyle = useAnimatedStyle(() => ({
    opacity: muteIndicatorOpacity.value,
  }));

  useEffect(() => {
    if (showMuteIndicator) {
      muteIndicatorOpacity.value = withSequence(
        withTiming(1, { duration: 150 }),
        withTiming(1, { duration: 800 }),
        withTiming(0, { duration: 150 })
      );
      
      const timer = setTimeout(() => {
        setShowMuteIndicator(false);
      }, 1100);
      
      return () => clearTimeout(timer);
    }
  }, [showMuteIndicator, muteIndicatorOpacity]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setProgress(status.positionMillis || 0);
      setDuration(status.durationMillis || 0);
    }
  };

  const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <View style={styles.container}>
      <Pressable style={styles.videoContainer} onPress={handleDoubleTap}>
        <Video
          ref={videoRef}
          source={{ uri }}
          style={styles.video}
          resizeMode={ResizeMode.COVER}
          isLooping
          isMuted={isMuted}
          shouldPlay={isVisible}
          onLoad={() => setIsLoading(false)}
          onError={(error) => console.error('Video error:', error)}
          onPlaybackStatusUpdate={onPlaybackStatusUpdate}
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        )}

        {/* Play/Pause button */}
        {!isPlaying && !isLoading && (
          <View style={styles.playButton}>
            <Ionicons name="play" size={60} color="white" />
          </View>
        )}

        {/* Double tap heart animation */}
        <Animated.View style={[styles.doubleTapHeart, doubleTapHeartStyle]}>
          <Ionicons name="heart" size={80} color="#ff3040" />
        </Animated.View>

        {/* Mute indicator */}
        {showMuteIndicator && (
          <Animated.View style={[styles.muteIndicator, muteIndicatorStyle]}>
            <View style={styles.muteIndicatorContainer}>
              <Ionicons 
                name={isMuted ? 'volume-mute' : 'volume-high'} 
                size={30} 
                color="white" 
              />
            </View>
          </Animated.View>
        )}
      </Pressable>

      {/* Controls */}
      <View style={styles.controls}>
        {/* Mute button */}
        <TouchableOpacity style={styles.controlButton} onPress={handleMuteToggle}>
          <Ionicons
            name={isMuted ? 'volume-mute' : 'volume-high'}
            size={24}
            color="white"
          />
        </TouchableOpacity>

        {/* Like button */}
        <TouchableOpacity style={styles.controlButton} onPress={handleLike}>
          <Animated.View style={animatedHeartStyle}>
            <Ionicons
              name={isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={isLiked ? '#ff3040' : 'white'}
            />
          </Animated.View>
        </TouchableOpacity>

        {/* Comment button */}
        <TouchableOpacity style={styles.controlButton} onPress={onComment}>
          <Ionicons name="chatbubble-outline" size={28} color="white" />
        </TouchableOpacity>

        {/* Share button */}
        <TouchableOpacity style={styles.controlButton} onPress={onShare}>
          <Ionicons name="arrow-redo-outline" size={28} color="white" />
        </TouchableOpacity>
      </View>

      {/* Progress bar */}
      {isVisible && !isLoading && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${progressPercentage}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  videoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  playButton: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 50,
    width: 100,
    height: 100,
  },
  doubleTapHeart: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  muteIndicator: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    pointerEvents: 'none',
  },
  muteIndicatorContainer: {
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 30,
    padding: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    position: 'absolute',
    right: 16,
    bottom: 100,
    alignItems: 'center',
  },
  controlButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 8,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  progressBar: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 1,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff3040',
    borderRadius: 1,
  },
});

export default VideoPlayer;
