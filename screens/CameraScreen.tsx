import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface CameraScreenProps {
  onClose: () => void;
  onVideoRecorded: (videoUri: string) => void;
}

const CameraScreen: React.FC<CameraScreenProps> = ({ onClose, onVideoRecorded }) => {
  const [facing, setFacing] = useState<CameraType>('back');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const [mediaLibraryPermission, requestMediaLibraryPermission] = MediaLibrary.usePermissions();
  const cameraRef = useRef<CameraView>(null);
  const recordingIntervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRecording) {
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }

    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    };
  }, [isRecording]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === 'back' ? 'front' : 'back'));
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        if (!mediaLibraryPermission?.granted) {
          const { granted } = await requestMediaLibraryPermission();
          if (!granted) {
            Alert.alert('Permission needed', 'We need media library permission to save videos');
            return;
          }
        }

        setIsRecording(true);
        setRecordingTime(0);
        
        const video = await cameraRef.current.recordAsync({
          maxDuration: 60, // 60 seconds max
        });
        
        if (video) {
          // Save to media library
          await MediaLibrary.saveToLibraryAsync(video.uri);
          onVideoRecorded(video.uri);
        }
      } catch (error) {
        console.error('Recording failed:', error);
        Alert.alert('Recording failed', 'Something went wrong while recording');
      } finally {
        setIsRecording(false);
        setRecordingTime(0);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <CameraView 
        ref={cameraRef}
        style={styles.camera} 
        facing={facing}
        mode="video"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerButton} onPress={onClose}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
          
          {isRecording && (
            <View style={styles.recordingTimer}>
              <View style={styles.recordingDot} />
              <Text style={styles.timerText}>{formatTime(recordingTime)}</Text>
            </View>
          )}

          <TouchableOpacity style={styles.headerButton} onPress={toggleCameraFacing}>
            <Ionicons name="camera-reverse" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <View style={styles.controlsRow}>
            {/* Speed Control */}
            <View style={styles.speedControls}>
              <TouchableOpacity style={styles.speedButton}>
                <Text style={styles.speedText}>0.5x</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.speedButton, styles.speedButtonActive]}>
                <Text style={[styles.speedText, styles.speedTextActive]}>1x</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.speedButton}>
                <Text style={styles.speedText}>2x</Text>
              </TouchableOpacity>
            </View>

            {/* Record Button */}
            <View style={styles.recordButtonContainer}>
              <TouchableOpacity
                style={[styles.recordButton, isRecording && styles.recordButtonActive]}
                onPress={isRecording ? stopRecording : startRecording}
                activeOpacity={0.7}
              >
                <View style={[styles.recordButtonInner, isRecording && styles.recordButtonInnerActive]} />
              </TouchableOpacity>
            </View>

            {/* Effects Button */}
            <TouchableOpacity style={styles.effectsButton}>
              <Ionicons name="color-palette" size={24} color="white" />
              <Text style={styles.effectsText}>Effects</Text>
            </TouchableOpacity>
          </View>

          {/* Bottom Hint */}
          <Text style={styles.recordHint}>
            {isRecording ? 'Tap to stop recording' : 'Hold to record'}
          </Text>
        </View>
      </CameraView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  camera: {
    flex: 1,
  },
  permissionText: {
    color: 'white',
    fontSize: 18,
    textAlign: 'center',
    margin: 20,
  },
  permissionButton: {
    backgroundColor: '#ff3040',
    padding: 16,
    borderRadius: 8,
    margin: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingTimer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,48,64,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'white',
    marginRight: 8,
  },
  timerText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  speedControls: {
    alignItems: 'center',
  },
  speedButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  speedButtonActive: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 16,
  },
  speedText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '600',
  },
  speedTextActive: {
    color: 'white',
  },
  recordButtonContainer: {
    alignItems: 'center',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
  },
  recordButtonActive: {
    borderColor: '#ff3040',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#ff3040',
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  effectsButton: {
    alignItems: 'center',
  },
  effectsText: {
    color: 'white',
    fontSize: 12,
    marginTop: 4,
  },
  recordHint: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default CameraScreen;
