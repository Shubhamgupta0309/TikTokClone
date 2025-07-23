import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sampleVideos, VideoData } from '@/data/videos';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  followers: number;
  verified: boolean;
}

interface SearchResult {
  users: User[];
  hashtags: string[];
  videos: VideoData[];
}

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const { width } = Dimensions.get('window');
const videoWidth = (width - 6) / 3; // 3 columns with 2px gaps

export default function DiscoveryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult>({
    users: [],
    hashtags: [],
    videos: [],
  });
  const [trendingHashtags, setTrendingHashtags] = useState<string[]>([]);
  const [featuredUsers, setFeaturedUsers] = useState<User[]>([]);
  const [activeTab, setActiveTab] = useState<'top' | 'users' | 'videos' | 'hashtags'>('top');
  const [isSearching, setIsSearching] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [trendingVideos, setTrendingVideos] = useState<VideoData[]>([]);

  // Mock data - in real app this would come from Firebase
  const mockUsers: User[] = [
    {
      id: '1',
      name: 'Alex Johnson',
      username: '@alexj',
      avatar: 'https://i.pravatar.cc/150?img=1',
      followers: 125000,
      verified: true,
    },
    {
      id: '2',
      name: 'Sarah Chen',
      username: '@sarahc',
      avatar: 'https://i.pravatar.cc/150?img=2',
      followers: 89000,
      verified: false,
    },
    {
      id: '3',
      name: 'Mike Rodriguez',
      username: '@mikero',
      avatar: 'https://i.pravatar.cc/150?img=3',
      followers: 234000,
      verified: true,
    },
    {
      id: '4',
      name: 'Emma Wilson',
      username: '@emmaw',
      avatar: 'https://i.pravatar.cc/150?img=4',
      followers: 67000,
      verified: false,
    },
  ];

  const mockHashtags = [
    '#fyp',
    '#viral',
    '#dance',
    '#comedy',
    '#food',
    '#travel',
    '#fashion',
    '#music',
    '#art',
    '#sports',
  ];

  const categories: Category[] = [
    { id: 'trending', name: 'Trending', icon: 'trending-up', color: '#ff3040' },
    { id: 'dance', name: 'Dance', icon: 'musical-notes', color: '#8B5CF6' },
    { id: 'comedy', name: 'Comedy', icon: 'happy', color: '#F59E0B' },
    { id: 'food', name: 'Food', icon: 'restaurant', color: '#EF4444' },
    { id: 'travel', name: 'Travel', icon: 'airplane', color: '#3B82F6' },
    { id: 'fashion', name: 'Fashion', icon: 'shirt', color: '#EC4899' },
    { id: 'pets', name: 'Pets', icon: 'paw', color: '#10B981' },
    { id: 'sports', name: 'Sports', icon: 'basketball', color: '#F97316' },
  ];

  useEffect(() => {
    // Initialize trending content
    setTrendingHashtags(mockHashtags.slice(0, 6));
    setFeaturedUsers(mockUsers.slice(0, 3));
    
    // Set trending videos (most liked videos)
    const sortedVideos = [...sampleVideos]
      .sort((a, b) => b.likes - a.likes)
      .slice(0, 12);
    setTrendingVideos(sortedVideos);
  }, []);

  useEffect(() => {
    if (searchQuery.length > 0) {
      setIsSearching(true);
      performSearch(searchQuery);
    } else {
      setIsSearching(false);
      setSearchResults({ users: [], hashtags: [], videos: [] });
    }
  }, [searchQuery]);

  const performSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase();
    
    // Search users
    const filteredUsers = mockUsers.filter(
      user =>
        user.name.toLowerCase().includes(lowercaseQuery) ||
        user.username.toLowerCase().includes(lowercaseQuery)
    );

    // Search hashtags
    const filteredHashtags = mockHashtags.filter(hashtag =>
      hashtag.toLowerCase().includes(lowercaseQuery)
    );

    // Search videos (by title and username)
    const filteredVideos = sampleVideos.filter(
      (video: VideoData) =>
        video.title.toLowerCase().includes(lowercaseQuery) ||
        video.username.toLowerCase().includes(lowercaseQuery)
    );

    setSearchResults({
      users: filteredUsers,
      hashtags: filteredHashtags,
      videos: filteredVideos,
    });
  };

  const filterByCategory = (categoryId: string) => {
    if (selectedCategory === categoryId) {
      setSelectedCategory(null);
      setTrendingVideos([...sampleVideos].sort((a, b) => b.likes - a.likes).slice(0, 12));
    } else {
      setSelectedCategory(categoryId);
      
      // Filter videos by category (mock implementation)
      let filteredVideos: VideoData[] = [];
      
      switch (categoryId) {
        case 'trending':
          filteredVideos = [...sampleVideos].sort((a, b) => b.likes - a.likes);
          break;
        case 'dance':
          filteredVideos = sampleVideos.filter(v => 
            v.title.toLowerCase().includes('dance') || 
            v.username.toLowerCase().includes('dance')
          );
          break;
        case 'comedy':
          filteredVideos = sampleVideos.filter(v => 
            v.title.toLowerCase().includes('funny') || 
            v.title.toLowerCase().includes('comedy') ||
            v.username.toLowerCase().includes('comedy')
          );
          break;
        case 'food':
          filteredVideos = sampleVideos.filter(v => 
            v.title.toLowerCase().includes('food') ||
            v.title.toLowerCase().includes('recipe') ||
            v.title.toLowerCase().includes('cooking')
          );
          break;
        default:
          // For other categories, show random subset
          filteredVideos = sampleVideos.filter((_, index) => index % 3 === 0);
      }
      
      setTrendingVideos(filteredVideos.slice(0, 12));
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const renderCategoryItem = ({ item }: { item: Category }) => (
    <TouchableOpacity
      style={[
        styles.categoryItem,
        selectedCategory === item.id && { backgroundColor: item.color }
      ]}
      onPress={() => filterByCategory(item.id)}
    >
      <Ionicons 
        name={item.icon as any} 
        size={20} 
        color={selectedCategory === item.id ? 'white' : item.color} 
      />
      <Text style={[
        styles.categoryText,
        selectedCategory === item.id && { color: 'white' }
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity style={styles.userItem}>
      <Image source={{ uri: item.avatar }} style={styles.userAvatar} />
      <View style={styles.userInfo}>
        <View style={styles.userNameContainer}>
          <Text style={styles.userName}>{item.name}</Text>
          {item.verified && (
            <Ionicons name="checkmark-circle" size={16} color="#20D5EC" />
          )}
        </View>
        <Text style={styles.userUsername}>{item.username}</Text>
        <Text style={styles.userFollowers}>
          {formatNumber(item.followers)} followers
        </Text>
      </View>
      <TouchableOpacity style={styles.followButton}>
        <Text style={styles.followButtonText}>Follow</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

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

  const renderHashtagItem = ({ item }: { item: string }) => (
    <TouchableOpacity 
      style={styles.hashtagItem}
      onPress={() => {
        setSearchQuery(item);
        setIsSearching(true);
      }}
    >
      <View style={styles.hashtagIcon}>
        <Text style={styles.hashtagSymbol}>#</Text>
      </View>
      <View style={styles.hashtagInfo}>
        <Text style={styles.hashtagText}>{item}</Text>
        <Text style={styles.hashtagViews}>
          {Math.floor(Math.random() * 100)}M views
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderSearchTabs = () => (
    <View style={styles.tabsContainer}>
      {['top', 'users', 'videos', 'hashtags'].map((tab) => (
        <TouchableOpacity
          key={tab}
          style={[styles.tab, activeTab === tab && styles.activeTab]}
          onPress={() => setActiveTab(tab as any)}
        >
          <Text
            style={[styles.tabText, activeTab === tab && styles.activeTabText]}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderSearchResults = () => {
    switch (activeTab) {
      case 'users':
        return (
          <FlatList
            data={searchResults.users}
            renderItem={renderUserItem}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'videos':
        return (
          <FlatList
            data={searchResults.videos}
            renderItem={renderVideoItem}
            keyExtractor={(item) => item.id}
            numColumns={3}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.videosGrid}
          />
        );
      case 'hashtags':
        return (
          <FlatList
            data={searchResults.hashtags}
            renderItem={renderHashtagItem}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
          />
        );
      default: // 'top'
        return (
          <ScrollView showsVerticalScrollIndicator={false}>
            {searchResults.users.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Users</Text>
                {searchResults.users.slice(0, 3).map((user) => (
                  <View key={user.id}>
                    {renderUserItem({ item: user })}
                  </View>
                ))}
              </View>
            )}
            {searchResults.hashtags.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hashtags</Text>
                {searchResults.hashtags.slice(0, 3).map((hashtag) => (
                  <View key={hashtag}>
                    {renderHashtagItem({ item: hashtag })}
                  </View>
                ))}
              </View>
            )}
            {searchResults.videos.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Videos</Text>
                <FlatList
                  data={searchResults.videos.slice(0, 6)}
                  renderItem={renderVideoItem}
                  keyExtractor={(item) => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={styles.videosGrid}
                />
              </View>
            )}
          </ScrollView>
        );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search users, videos, hashtags..."
            placeholderTextColor="rgba(255,255,255,0.6)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {isSearching ? (
        <>
          {renderSearchTabs()}
          <View style={styles.content}>
            {renderSearchResults()}
          </View>
        </>
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <Text style={styles.categoriesTitle}>Categories</Text>
            <FlatList
              data={categories}
              renderItem={renderCategoryItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesList}
            />
          </View>

          {/* Trending Hashtags */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trending</Text>
            <View style={styles.hashtagsGrid}>
              {trendingHashtags.map((hashtag) => (
                <TouchableOpacity 
                  key={hashtag} 
                  style={styles.trendingHashtag}
                  onPress={() => {
                    setSearchQuery(hashtag);
                    setIsSearching(true);
                  }}
                >
                  <Text style={styles.trendingHashtagText}>{hashtag}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Featured Users */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Suggested for you</Text>
            {featuredUsers.map((user) => (
              <View key={user.id}>
                {renderUserItem({ item: user })}
              </View>
            ))}
          </View>

          {/* Trending/Filtered Videos */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {selectedCategory 
                ? `${categories.find(c => c.id === selectedCategory)?.name} Videos`
                : 'Trending Videos'
              }
            </Text>
            <FlatList
              data={trendingVideos}
              renderItem={renderVideoItem}
              keyExtractor={(item) => item.id}
              numColumns={3}
              scrollEnabled={false}
              contentContainerStyle={styles.videosGrid}
            />
          </View>
        </ScrollView>
      )}

      <View style={styles.phaseContainer}>
        <Text style={styles.phaseText}>Phase 7: Advanced Features 🚀</Text>
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
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 12,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 16,
    fontWeight: '500',
  },
  activeTabText: {
    color: 'white',
  },
  content: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 6,
  },
  userUsername: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  userFollowers: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    marginTop: 2,
  },
  followButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  videosGrid: {
    paddingHorizontal: 14,
  },
  videoItem: {
    width: videoWidth,
    aspectRatio: 0.75,
    margin: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
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
  hashtagItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  hashtagIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  hashtagSymbol: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hashtagInfo: {
    flex: 1,
  },
  hashtagText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  hashtagViews: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginTop: 2,
  },
  hashtagsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
  },
  trendingHashtag: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  trendingHashtagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  categoriesTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  categoriesList: {
    paddingVertical: 4,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 12,
    marginBottom: 8,
  },
  categoryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
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
