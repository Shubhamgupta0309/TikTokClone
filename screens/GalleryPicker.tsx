import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  FlatList,
  Image,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth } = Dimensions.get('window');
const itemSize = (screenWidth - 6) / 3; // 3 columns with 2px gaps

interface GalleryPickerProps {
  onClose: () => void;
  onVideoSelected: (videoUri: string) => void;
}

interface MediaAsset {
  id: string;
  uri: string;
  mediaType: 'video' | 'photo';
  duration?: number;
}

const GalleryPicker: React.FC<GalleryPickerProps> = ({ onClose, onVideoSelected }) => {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [permission, requestPermission] = MediaLibrary.usePermissions();
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    loadMedia();
  }, []);

  const loadMedia = async () => {
    if (!permission?.granted) {
      const { granted } = await requestPermission();
      if (!granted) {
        Alert.alert('Permission needed', 'We need media library permission to access your videos');
        return;
      }
    }

    try {
      const media = await MediaLibrary.getAssetsAsync({
        mediaType: [MediaLibrary.MediaType.video, MediaLibrary.MediaType.photo],
        first: 100,
        sortBy: MediaLibrary.SortBy.creationTime,
      });

      const formattedAssets: MediaAsset[] = media.assets.map(asset => ({
        id: asset.id,
        uri: asset.uri,
        mediaType: asset.mediaType === MediaLibrary.MediaType.video ? 'video' : 'photo',
        duration: asset.duration,
      }));

      setMediaAssets(formattedAssets);
    } catch (error) {
      console.error('Error loading media:', error);
      Alert.alert('Error', 'Failed to load media from gallery');
    } finally {
      setLoading(false);
    }
  };

  const handleAssetPress = (asset: MediaAsset) => {
    if (asset.mediaType === 'video') {
      setSelectedAsset(asset);
    } else {
      Alert.alert(
        'Photo Selected',
        'This app currently supports video uploads only. Photo support will be added in a future update.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSelectVideo = () => {
    if (selectedAsset) {
      onVideoSelected(selectedAsset.uri);
    }
  };

  const pickFromCamera = async () => {
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets[0]) {
      onVideoSelected(result.assets[0].uri);
    }
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '';
    const minutes = Math.floor(duration / 60);
    const seconds = Math.floor(duration % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const renderMediaItem = ({ item }: { item: MediaAsset }) => (
    <TouchableOpacity
      style={[
        styles.mediaItem,
        selectedAsset?.id === item.id && styles.selectedMediaItem
      ]}
      onPress={() => handleAssetPress(item)}
    >
      <Image source={{ uri: item.uri }} style={styles.mediaThumbnail} />
      
      {item.mediaType === 'video' && (
        <View style={styles.videoOverlay}>
          <Ionicons name="play" size={16} color="white" />
          {item.duration && (
            <Text style={styles.durationText}>{formatDuration(item.duration)}</Text>
          )}
        </View>
      )}
      
      {selectedAsset?.id === item.id && (
        <View style={styles.selectionOverlay}>
          <View style={styles.selectionCheck}>
            <Ionicons name="checkmark" size={16} color="white" />
          </View>
        </View>
      )}
    </TouchableOpacity>
  );

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Gallery</Text>
          <View style={styles.placeholder} />
        </View>
        
        <View style={styles.permissionContainer}>
          <Ionicons name="images" size={64} color="rgba(255,255,255,0.3)" />
          <Text style={styles.permissionText}>Access your gallery</Text>
          <Text style={styles.permissionSubtext}>
            We need permission to access your photos and videos
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Video</Text>
        <TouchableOpacity onPress={pickFromCamera}>
          <Ionicons name="camera" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading media...</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={mediaAssets}
            renderItem={renderMediaItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            style={styles.mediaGrid}
            showsVerticalScrollIndicator={false}
          />

          {selectedAsset && (
            <View style={styles.bottomBar}>
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedText}>
                  {selectedAsset.mediaType === 'video' ? 'Video selected' : 'Photo selected'}
                </Text>
                {selectedAsset.duration && (
                  <Text style={styles.selectedDuration}>
                    Duration: {formatDuration(selectedAsset.duration)}
                  </Text>
                )}
              </View>
              <TouchableOpacity style={styles.selectButton} onPress={handleSelectVideo}>
                <Text style={styles.selectButtonText}>Use This Video</Text>
              </TouchableOpacity>
            </View>
          )}
        </>
      )}
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
  placeholder: {
    width: 24,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  permissionText: {
    color: 'white',
    fontSize: 20,
    fontWeight: '600',
    marginTop: 20,
    marginBottom: 8,
  },
  permissionSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
  },
  permissionButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
  },
  mediaGrid: {
    flex: 1,
    padding: 1,
  },
  mediaItem: {
    width: itemSize,
    height: itemSize * 1.3,
    margin: 1,
    position: 'relative',
  },
  selectedMediaItem: {
    borderWidth: 3,
    borderColor: '#ff3040',
  },
  mediaThumbnail: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  durationText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  selectionOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  selectionCheck: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedDuration: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  selectButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default GalleryPicker;
