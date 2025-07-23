import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { ProfileSkeleton } from '../components/SkeletonLoaders';

const ProfileScreen: React.FC = () => {
  const { user, userProfile, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout },
      ]
    );
  };

  const stats = [
    { label: 'Following', value: '298' },
    { label: 'Followers', value: '1.2M' },
    { label: 'Likes', value: '5.3M' },
  ];

  useEffect(() => {
    // Simulate loading delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  const mockVideos = Array.from({ length: 20 }, (_, index) => ({
    id: index.toString(),
    thumbnail: `https://picsum.photos/200/300?random=${index}`,
    views: Math.floor(Math.random() * 1000000),
  }));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="person-add" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {userProfile?.name || user?.displayName || 'Profile'}
          </Text>
          <TouchableOpacity onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <Image
            source={{
              uri: userProfile?.photoURL || user?.photoURL || 'https://i.pravatar.cc/150?img=1',
            }}
            style={styles.profileImage}
          />
          <Text style={styles.username}>
            @{userProfile?.name?.replace(/\s+/g, '').toLowerCase() || 'username'}
          </Text>
          <Text style={styles.displayName}>
            {userProfile?.name || user?.displayName || 'Display Name'}
          </Text>
          <Text style={styles.email}>
            {userProfile?.email || user?.email || 'email@example.com'}
          </Text>

          {/* Stats */}
          <View style={styles.statsContainer}>
            {stats.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.editButton}>
              <Text style={styles.editButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Ionicons name="share-outline" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Ionicons name="grid-outline" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="heart-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Ionicons name="bookmark-outline" size={20} color="rgba(255,255,255,0.6)" />
          </TouchableOpacity>
        </View>

        {/* Videos Grid */}
        <View style={styles.videosGrid}>
          {mockVideos.map((video, index) => (
            <TouchableOpacity key={video.id} style={styles.videoItem}>
              <Image source={{ uri: video.thumbnail }} style={styles.videoThumbnail} />
              <View style={styles.videoOverlay}>
                <View style={styles.videoViews}>
                  <Ionicons name="play" size={12} color="white" />
                  <Text style={styles.viewsText}>
                    {video.views > 1000000
                      ? `${(video.views / 1000000).toFixed(1)}M`
                      : `${Math.floor(video.views / 1000)}K`}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  },
  headerTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 12,
  },
  username: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  displayName: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
    marginBottom: 4,
  },
  email: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  editButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  shareButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 8,
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  videosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 2,
  },
  videoItem: {
    width: '33.33%',
    aspectRatio: 9 / 16,
    padding: 2,
  },
  videoThumbnail: {
    flex: 1,
    borderRadius: 4,
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
  },
  videoViews: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  viewsText: {
    color: 'white',
    fontSize: 10,
    marginLeft: 4,
  },
});

export default ProfileScreen;
