import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from './VideoPlayer';
import CommentModal from './CommentModal';
import ShareModal from './ShareModal';
import { VideoData } from '../data/videos';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface VideoFeedItemProps {
  video: VideoData;
  isVisible: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike: (videoId: string) => void;
  onFollow: (userId: string) => void;
}

const VideoFeedItem: React.FC<VideoFeedItemProps> = ({
  video,
  isVisible,
  isMuted,
  onMuteToggle,
  onLike,
  onFollow,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const handleLike = () => {
    onLike(video.id);
  };

  const handleComment = () => {
    setShowComments(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handleFollow = () => {
    onFollow(video.userId);
  };

  return (
    <View style={styles.container}>
      <VideoPlayer
        uri={video.uri}
        isVisible={isVisible}
        isMuted={isMuted}
        onMuteToggle={onMuteToggle}
        onLike={handleLike}
        isLiked={video.isLiked}
        onComment={handleComment}
        onShare={handleShare}
      />
      
      {/* Video Info Overlay */}
      <View style={styles.overlay}>
        {/* Left side - User info and title */}
        <View style={styles.leftContent}>
          <View style={styles.userInfo}>
            <Image source={{ uri: video.avatar }} style={styles.avatar} />
            <Text style={styles.username}>@{video.username}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-circle" size={16} color="#4285f4" />
            </View>
          </View>
          <Text style={styles.title}>{video.title}</Text>
          <View style={styles.videoMeta}>
            <Text style={styles.metaText}>
              🎵 Original sound - {video.username}
            </Text>
          </View>
        </View>

        {/* Right side - Action buttons */}
        <View style={styles.rightContent}>
          {/* Profile image with follow button */}
          <View style={styles.profileContainer}>
            <Image source={{ uri: video.avatar }} style={styles.profileImage} />
            <TouchableOpacity style={styles.followButton} onPress={handleFollow}>
              <Ionicons name="add" size={16} color="white" />
            </TouchableOpacity>
          </View>

          {/* Like button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleLike}>
            <Ionicons
              name={video.isLiked ? 'heart' : 'heart-outline'}
              size={32}
              color={video.isLiked ? '#ff3040' : 'white'}
            />
            <Text style={styles.actionText}>
              {formatNumber(video.likes)}
            </Text>
          </TouchableOpacity>

          {/* Comment button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleComment}>
            <Ionicons name="chatbubble-outline" size={30} color="white" />
            <Text style={styles.actionText}>
              {formatNumber(video.comments)}
            </Text>
          </TouchableOpacity>

          {/* Share button */}
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="arrow-redo-outline" size={30} color="white" />
            <Text style={styles.actionText}>
              {formatNumber(video.shares)}
            </Text>
          </TouchableOpacity>

          {/* More options */}
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Comment Modal */}
      <CommentModal
        visible={showComments}
        onClose={() => setShowComments(false)}
        videoId={video.id}
        videoAuthor={video.username}
      />

      {/* Share Modal */}
      <ShareModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        videoId={video.id}
        videoAuthor={video.username}
        videoDescription={video.title}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: 'black',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 40,
    paddingTop: 20,
  },
  leftContent: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingRight: 16,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginRight: 8,
  },
  username: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  rightContent: {
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  profileImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: 'white',
  },
  followButton: {
    position: 'absolute',
    bottom: -8,
    backgroundColor: '#ff3040',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    alignItems: 'center',
    marginBottom: 16,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '600',
  },
  verifiedBadge: {
    marginLeft: 6,
  },
  videoMeta: {
    marginTop: 8,
  },
  metaText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontStyle: 'italic',
  },
});

export default VideoFeedItem;
