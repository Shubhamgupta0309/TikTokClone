import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import { useAuth } from '../contexts/AuthContext';
import { sampleVideos } from '../data/videos';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface VideoEditorProps {
  videoUri: string;
  onClose: () => void;
  onPublish: (videoData: any) => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ videoUri, onClose, onPublish }) => {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null);
  const videoRef = useRef<Video>(null);

  const filters = [
    { id: 'none', name: 'Original', icon: 'refresh' },
    { id: 'vintage', name: 'Vintage', icon: 'camera' },
    { id: 'bright', name: 'Bright', icon: 'sunny' },
    { id: 'dark', name: 'Dark', icon: 'moon' },
    { id: 'vibrant', name: 'Vibrant', icon: 'color-palette' },
  ];

  const musicTracks = [
    { id: 'none', name: 'No Music', artist: '' },
    { id: 'track1', name: 'Summer Vibes', artist: 'TikTok Audio' },
    { id: 'track2', name: 'Upbeat Pop', artist: 'TikTok Audio' },
    { id: 'track3', name: 'Chill Beats', artist: 'TikTok Audio' },
    { id: 'track4', name: 'Dance Energy', artist: 'TikTok Audio' },
  ];

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMuteToggle = async () => {
    if (videoRef.current) {
      await videoRef.current.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  const handleFilterSelect = (filterId: string) => {
    setSelectedFilter(filterId);
    // In a real app, you would apply the filter to the video
    Alert.alert('Filter Applied', `${filters.find(f => f.id === filterId)?.name} filter applied!`);
  };

  const handleMusicSelect = (trackId: string) => {
    setSelectedMusic(trackId);
    const track = musicTracks.find(t => t.id === trackId);
    if (track) {
      Alert.alert('Music Selected', `${track.name} has been added to your video!`);
    }
  };

  const handlePublish = () => {
    if (!title.trim()) {
      Alert.alert('Title Required', 'Please add a title for your video');
      return;
    }

    // Create video data
    const videoData = {
      id: Date.now().toString(),
      uri: videoUri,
      title: title.trim(),
      username: user?.displayName || 'You',
      userId: user?.uid || 'current_user',
      avatar: user?.photoURL || 'https://i.pravatar.cc/150?img=1',
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      filter: selectedFilter,
      music: selectedMusic,
      createdAt: new Date().toISOString(),
    };

    Alert.alert(
      'Publish Video',
      'Your video will be published to your profile and the main feed!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Publish', 
          onPress: () => {
            onPublish(videoData);
            Alert.alert('Success!', 'Your video has been published!');
          }
        }
      ]
    );
  };

  const renderFilterItem = (filter: any) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterItem,
        selectedFilter === filter.id && styles.selectedFilterItem
      ]}
      onPress={() => handleFilterSelect(filter.id)}
    >
      <View style={[
        styles.filterIcon,
        selectedFilter === filter.id && styles.selectedFilterIcon
      ]}>
        <Ionicons 
          name={filter.icon as any} 
          size={20} 
          color={selectedFilter === filter.id ? 'white' : '#ff3040'} 
        />
      </View>
      <Text style={[
        styles.filterName,
        selectedFilter === filter.id && styles.selectedFilterName
      ]}>
        {filter.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMusicItem = (track: any) => (
    <TouchableOpacity
      key={track.id}
      style={[
        styles.musicItem,
        selectedMusic === track.id && styles.selectedMusicItem
      ]}
      onPress={() => handleMusicSelect(track.id)}
    >
      <View style={styles.musicInfo}>
        <Text style={[
          styles.musicName,
          selectedMusic === track.id && styles.selectedMusicText
        ]}>
          {track.name}
        </Text>
        {track.artist && (
          <Text style={[
            styles.musicArtist,
            selectedMusic === track.id && styles.selectedMusicText
          ]}>
            {track.artist}
          </Text>
        )}
      </View>
      {selectedMusic === track.id && (
        <Ionicons name="checkmark-circle" size={20} color="#ff3040" />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Video</Text>
        <TouchableOpacity style={styles.publishButton} onPress={handlePublish}>
          <Text style={styles.publishButtonText}>Publish</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Video Preview */}
        <View style={styles.videoContainer}>
          <Video
            ref={videoRef}
            style={styles.video}
            source={{ uri: videoUri }}
            useNativeControls={false}
            resizeMode={ResizeMode.COVER}
            isLooping
            shouldPlay={isPlaying}
            isMuted={isMuted}
          />
          
          {/* Video Controls */}
          <View style={styles.videoControls}>
            <TouchableOpacity style={styles.controlButton} onPress={handlePlayPause}>
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.controlButton} onPress={handleMuteToggle}>
              <Ionicons 
                name={isMuted ? 'volume-mute' : 'volume-high'} 
                size={24} 
                color="white" 
              />
            </TouchableOpacity>
          </View>
        </View>

        {/* Title Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add a title</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Describe your video..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            multiline
          />
          <Text style={styles.characterCount}>{title.length}/100</Text>
        </View>

        {/* Filters */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filters</Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.filtersContainer}
          >
            {filters.map(renderFilterItem)}
          </ScrollView>
        </View>

        {/* Music */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add Music</Text>
          <View style={styles.musicContainer}>
            {musicTracks.map(renderMusicItem)}
          </View>
        </View>

        {/* Additional Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          <TouchableOpacity style={styles.optionItem}>
            <View style={styles.optionLeft}>
              <Ionicons name="globe" size={20} color="white" />
              <Text style={styles.optionText}>Everyone can see this video</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  publishButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  publishButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  videoContainer: {
    height: screenHeight * 0.4,
    backgroundColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  videoControls: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'column',
  },
  controlButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  titleInput: {
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 8,
    padding: 12,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
  },
  filterItem: {
    alignItems: 'center',
    marginRight: 16,
    paddingVertical: 8,
  },
  selectedFilterItem: {
    opacity: 1,
  },
  filterIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,48,64,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  selectedFilterIcon: {
    backgroundColor: '#ff3040',
  },
  filterName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
  selectedFilterName: {
    color: 'white',
    fontWeight: '600',
  },
  musicContainer: {
    marginTop: 8,
  },
  musicItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 8,
    marginBottom: 8,
  },
  selectedMusicItem: {
    backgroundColor: 'rgba(255,48,64,0.1)',
    borderWidth: 1,
    borderColor: '#ff3040',
  },
  musicInfo: {
    flex: 1,
  },
  musicName: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  musicArtist: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 2,
  },
  selectedMusicText: {
    color: '#ff3040',
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 12,
  },
});

export default VideoEditor;
