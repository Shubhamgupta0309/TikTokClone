import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CameraScreen from './CameraScreen';
import GalleryPicker from './GalleryPicker';
import VideoEditor from './VideoEditor';

const UploadScreen: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [showVideoEditor, setShowVideoEditor] = useState(false);
  const [selectedVideoUri, setSelectedVideoUri] = useState<string | null>(null);

  const uploadOptions = [
    { 
      id: 'record', 
      icon: 'videocam', 
      title: 'Record Video', 
      subtitle: 'Create a new video with camera',
      comingSoon: false
    },
    { 
      id: 'gallery', 
      icon: 'image', 
      title: 'Upload from Gallery', 
      subtitle: 'Select from your photos & videos',
      comingSoon: false
    },
    { 
      id: 'music', 
      icon: 'musical-notes', 
      title: 'Add Music', 
      subtitle: 'Browse music library',
      comingSoon: false
    },
    { 
      id: 'effects', 
      icon: 'color-palette', 
      title: 'Effects & Filters', 
      subtitle: 'Add filters and effects',
      comingSoon: false
    },
    { 
      id: 'live', 
      icon: 'radio-outline', 
      title: 'Go Live', 
      subtitle: 'Start a live stream',
      comingSoon: true
    },
    { 
      id: 'template', 
      icon: 'copy-outline', 
      title: 'Use Template', 
      subtitle: 'Create from trending templates',
      comingSoon: true
    },
  ];

  const handleOptionPress = (option: any) => {
    if (option.comingSoon) {
      Alert.alert(
        'Coming Soon!',
        `${option.title} will be available in a future update. Stay tuned!`,
        [{ text: 'OK' }]
      );
      return;
    }

    setSelectedOption(option.id);
    
    switch (option.id) {
      case 'record':
        setShowCamera(true);
        break;
      case 'gallery':
        setShowGallery(true);
        break;
      case 'music':
        Alert.alert(
          'Music Library',
          'Music selection is now available in the video editor after recording or selecting a video!',
          [{ text: 'OK' }]
        );
        break;
      case 'effects':
        Alert.alert(
          'Effects & Filters',
          'Effects and filters are now available in the video editor after recording or selecting a video!',
          [{ text: 'OK' }]
        );
        break;
      default:
        console.log(`Selected: ${option.title}`);
    }
  };

  const handleVideoRecorded = (videoUri: string) => {
    setShowCamera(false);
    setSelectedVideoUri(videoUri);
    setShowVideoEditor(true);
  };

  const handleVideoSelected = (videoUri: string) => {
    setShowGallery(false);
    setSelectedVideoUri(videoUri);
    setShowVideoEditor(true);
  };

  const handleVideoPublished = (videoData: any) => {
    setShowVideoEditor(false);
    setSelectedVideoUri(null);
    setSelectedOption(null);
    
    // In a real app, you would save this to Firebase/database
    console.log('Video published:', videoData);
  };

  const handleCloseCamera = () => {
    setShowCamera(false);
    setSelectedOption(null);
  };

  const handleCloseGallery = () => {
    setShowGallery(false);
    setSelectedOption(null);
  };

  const handleCloseVideoEditor = () => {
    setShowVideoEditor(false);
    setSelectedVideoUri(null);
    setSelectedOption(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Create</Text>
        <TouchableOpacity>
          <Ionicons name="help-circle-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.title}>What would you like to create?</Text>
        
        <ScrollView style={styles.optionsContainer} showsVerticalScrollIndicator={false}>
          {uploadOptions.map((option, index) => (
            <TouchableOpacity 
              key={option.id} 
              style={[
                styles.optionButton,
                selectedOption === option.id && styles.selectedOption
              ]}
              onPress={() => handleOptionPress(option)}
            >
              <View style={[
                styles.optionIcon,
                option.comingSoon && styles.comingSoonIcon
              ]}>
                <Ionicons 
                  name={option.icon as any} 
                  size={32} 
                  color={option.comingSoon ? "rgba(255,48,64,0.5)" : "#ff3040"} 
                />
              </View>
              <View style={styles.optionText}>
                <View style={styles.optionTitleContainer}>
                  <Text style={[
                    styles.optionTitle,
                    option.comingSoon && styles.comingSoonText
                  ]}>
                    {option.title}
                  </Text>
                  {option.comingSoon && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.optionSubtitle,
                  option.comingSoon && styles.comingSoonText
                ]}>
                  {option.subtitle}
                </Text>
              </View>
              <Ionicons 
                name="chevron-forward" 
                size={20} 
                color={option.comingSoon ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.6)"} 
              />
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={styles.bottomSection}>
          <TouchableOpacity 
            style={styles.recordButton}
            onPress={() => handleOptionPress(uploadOptions[0])}
          >
            <View style={styles.recordButtonInner}>
              <Ionicons name="videocam" size={24} color="white" />
            </View>
          </TouchableOpacity>
          <Text style={styles.recordText}>Tap to record</Text>
          <Text style={styles.recordSubtext}>Hold for video, tap for photo</Text>
        </View>
      </View>

      <View style={styles.phaseContainer}>
        <Text style={styles.phaseText}>Phase 7: Advanced Features 🚀</Text>
      </View>

      {/* Camera Modal */}
      <Modal visible={showCamera} animationType="slide" presentationStyle="fullScreen">
        <CameraScreen 
          onClose={handleCloseCamera}
          onVideoRecorded={handleVideoRecorded}
        />
      </Modal>

      {/* Gallery Modal */}
      <Modal visible={showGallery} animationType="slide" presentationStyle="fullScreen">
        <GalleryPicker 
          onClose={handleCloseGallery}
          onVideoSelected={handleVideoSelected}
        />
      </Modal>

      {/* Video Editor Modal */}
      {selectedVideoUri && (
        <Modal visible={showVideoEditor} animationType="slide" presentationStyle="fullScreen">
          <VideoEditor 
            videoUri={selectedVideoUri}
            onClose={handleCloseVideoEditor}
            onPublish={handleVideoPublished}
          />
        </Modal>
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 32,
  },
  optionsContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#ff3040',
    backgroundColor: 'rgba(255,48,64,0.1)',
  },
  optionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,48,64,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  comingSoonIcon: {
    backgroundColor: 'rgba(255,48,64,0.1)',
  },
  optionText: {
    flex: 1,
  },
  optionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  comingSoonText: {
    color: 'rgba(255,255,255,0.5)',
  },
  comingSoonBadge: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 8,
  },
  comingSoonBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  optionSubtitle: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  bottomSection: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff3040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  recordSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  phaseContainer: {
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  phaseText: {
    color: '#ff3040',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default UploadScreen;
