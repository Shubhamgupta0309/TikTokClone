import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DiscoverScreen: React.FC = () => {
  const trendingHashtags = [
    '#dance', '#comedy', '#music', '#viral', '#trending',
    '#food', '#travel', '#pets', '#art', '#diy'
  ];

  const trendingCreators = [
    { name: 'Creator 1', followers: '2.1M' },
    { name: 'Creator 2', followers: '1.8M' },
    { name: 'Creator 3', followers: '3.2M' },
    { name: 'Creator 4', followers: '1.5M' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Discover</Text>
        <TouchableOpacity>
          <Ionicons name="search" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.content}>
        <Text style={styles.sectionTitle}>Trending Hashtags</Text>
        <View style={styles.hashtagContainer}>
          {trendingHashtags.map((hashtag, index) => (
            <TouchableOpacity key={index} style={styles.hashtagButton}>
              <Text style={styles.hashtagText}>{hashtag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionTitle}>Trending Creators</Text>
        {trendingCreators.map((creator, index) => (
          <TouchableOpacity key={index} style={styles.creatorItem}>
            <View style={styles.creatorInfo}>
              <View style={styles.creatorAvatar} />
              <View>
                <Text style={styles.creatorName}>{creator.name}</Text>
                <Text style={styles.creatorFollowers}>{creator.followers} followers</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.followButton}>
              <Text style={styles.followButtonText}>Follow</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        ))}
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
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 16,
  },
  hashtagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  hashtagButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    margin: 4,
  },
  hashtagText: {
    color: 'white',
    fontSize: 14,
  },
  creatorItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginRight: 12,
  },
  creatorName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  creatorFollowers: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  followButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 4,
  },
  followButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default DiscoverScreen;
