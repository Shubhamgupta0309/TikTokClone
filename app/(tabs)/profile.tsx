import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Alert,
  FlatList,
  Dimensions,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { sampleVideos, VideoData } from '../../data/videos';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';

const { width } = Dimensions.get('window');
const ITEM_SIZE = (width - 4) / 3; // 3 columns with small gaps

interface UserStats {
  videos: number;
  followers: number;
  following: number;
  likes: number;
}

export default function ProfileScreen() {
  const { user, userProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'videos' | 'liked'>('videos');
  const [userVideos, setUserVideos] = useState<VideoData[]>([]);
  const [likedVideos, setLikedVideos] = useState<VideoData[]>([]);
  const [stats, setStats] = useState<UserStats>({
    videos: 0,
    followers: 0,
    following: 0,
    likes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Get user's videos (for demo, filter by first few sample videos)
      const userVideosList = sampleVideos.slice(0, 6); // Demo: show first 6 videos as user's
      setUserVideos(userVideosList);

      // Get liked videos from user's document
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const userData = userDoc.data();
      const likedVideoIds = userData?.likedVideos || [];
      const likedVideosList = sampleVideos.filter(video => likedVideoIds.includes(video.id));
      setLikedVideos(likedVideosList);

      // Calculate stats
      const following = userData?.following || [];
      const totalLikes = userVideosList.reduce((sum, video) => sum + video.likes, 0);
      
      setStats({
        videos: userVideosList.length,
        followers: Math.floor(Math.random() * 1000), // Demo data
        following: following.length,
        likes: totalLikes,
      });
      
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderVideoItem = ({ item }: { item: VideoData }) => (
    <TouchableOpacity style={styles.videoItem}>
      <Image source={{ uri: item.avatar }} style={styles.videoThumbnail} />
      <View style={styles.videoOverlay}>
        <View style={styles.videoStats}>
          <Ionicons name="play" size={16} color="white" />
          <Text style={styles.videoStatText}>{formatNumber(item.likes)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderTabContent = () => {
    const videos = activeTab === 'videos' ? userVideos : likedVideos;
    
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      );
    }

    if (videos.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons 
            name={activeTab === 'videos' ? 'videocam-outline' : 'heart-outline'} 
            size={50} 
            color="rgba(255,255,255,0.3)" 
          />
          <Text style={styles.emptyText}>
            {activeTab === 'videos' ? 'No videos yet' : 'No liked videos yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            {activeTab === 'videos' 
              ? 'Start creating to see your videos here' 
              : 'Videos you like will appear here'}
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={videos}
        renderItem={renderVideoItem}
        keyExtractor={(item) => item.id}
        numColumns={3}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.videosGrid}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Image
          source={{
            uri: userProfile?.photoURL || user?.photoURL || 'https://i.pravatar.cc/150?img=1',
          }}
          style={styles.profileImage}
        />
        
        <Text style={styles.name}>
          {userProfile?.name || user?.displayName || 'Display Name'}
        </Text>
        
        <Text style={styles.email}>
          {userProfile?.email || user?.email || 'email@example.com'}
        </Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.following)}</Text>
            <Text style={styles.statLabel}>Following</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.followers)}</Text>
            <Text style={styles.statLabel}>Followers</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{formatNumber(stats.likes)}</Text>
            <Text style={styles.statLabel}>Likes</Text>
          </View>
        </View>

        {/* Profile Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'videos' && styles.activeTab]}
            onPress={() => setActiveTab('videos')}
          >
            <Ionicons 
              name="grid-outline" 
              size={20} 
              color={activeTab === 'videos' ? 'white' : 'rgba(255,255,255,0.6)'} 
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'liked' && styles.activeTab]}
            onPress={() => setActiveTab('liked')}
          >
            <Ionicons 
              name="heart-outline" 
              size={20} 
              color={activeTab === 'liked' ? 'white' : 'rgba(255,255,255,0.6)'} 
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab Content */}
      <View style={styles.tabContent}>
        {renderTabContent()}
      </View>

      <View style={styles.phaseContainer}>
        <Text style={styles.phaseText}>Phase 6: Enhanced User Profiles 🎭</Text>
      </View>
    </SafeAreaView>
  );
}

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
  content: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 16,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
  },
  name: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  email: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    marginBottom: 30,
  },
  statsContainer: {
    flexDirection: 'row',
    marginBottom: 40,
  },
  statItem: {
    alignItems: 'center',
    marginHorizontal: 20,
  },
  statNumber: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  statLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginTop: 20,
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
  tabContent: {
    flex: 1,
  },
  videosGrid: {
    padding: 2,
  },
  videoItem: {
    flex: 1,
    aspectRatio: 0.75,
    margin: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  videoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  videoStats: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  videoStatText: {
    color: 'white',
    fontSize: 12,
    marginLeft: 4,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  phaseContainer: {
    alignItems: 'center',
    padding: 16,
  },
  phaseText: {
    color: '#ff3040',
    fontSize: 18,
    fontWeight: '600',
  },
});
