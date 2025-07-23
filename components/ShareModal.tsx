import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Share,
  Clipboard,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ShareModalProps {
  visible: boolean;
  onClose: () => void;
  videoId: string;
  videoAuthor: string;
  videoDescription: string;
}

const ShareModal: React.FC<ShareModalProps> = ({
  visible,
  onClose,
  videoId,
  videoAuthor,
  videoDescription,
}) => {
  const shareUrl = `https://tiktokclone.app/video/${videoId}`;

  const handleNativeShare = async () => {
    try {
      const result = await Share.share({
        message: `Check out this video by ${videoAuthor}: ${videoDescription}\n\n${shareUrl}`,
        url: shareUrl,
        title: `Video by ${videoAuthor}`,
      });

      if (result.action === Share.sharedAction) {
        onClose();
      }
    } catch (error) {
      console.error('Error sharing:', error);
      Alert.alert('Error', 'Failed to share video');
    }
  };

  const handleCopyLink = async () => {
    try {
      await Clipboard.setString(shareUrl);
      Alert.alert('Copied!', 'Link copied to clipboard');
      onClose();
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  const shareOptions = [
    {
      id: 'native',
      title: 'Share via...',
      icon: 'share-outline',
      onPress: handleNativeShare,
    },
    {
      id: 'copy',
      title: 'Copy Link',
      icon: 'copy-outline',
      onPress: handleCopyLink,
    },
    {
      id: 'message',
      title: 'Send to Friends',
      icon: 'chatbubble-outline',
      onPress: () => {
        // TODO: Implement internal sharing to app friends
        Alert.alert('Coming Soon', 'Share to friends feature coming soon!');
      },
    },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Share Video</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
          </View>

          <View style={styles.content}>
            {shareOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.shareOption}
                onPress={option.onPress}
              >
                <View style={styles.iconContainer}>
                  <Ionicons name={option.icon as any} size={24} color="#007AFF" />
                </View>
                <Text style={styles.optionText}>{option.title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#ccc" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  shareOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
});

export default ShareModal;
