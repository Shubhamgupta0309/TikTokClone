import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import AnalyticsService, { UserAnalytics, VideoAnalytics } from '../services/AnalyticsService';

const { width: screenWidth } = Dimensions.get('window');

interface AnalyticsDashboardProps {
  onClose: () => void;
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ onClose }) => {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'videos' | 'audience'>('overview');
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('30d');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const analytics = await AnalyticsService.getUserAnalytics('current_user');
      setUserAnalytics(analytics);
    } catch (error) {
      console.log('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartConfig = {
    backgroundColor: '#000000',
    backgroundGradientFrom: '#1a1a1a',
    backgroundGradientTo: '#2a2a2a',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#ff3040',
    },
  };

  const renderOverviewTab = () => {
    if (!userAnalytics) return null;

    const followerData = {
      labels: userAnalytics.followerGrowth.slice(-7).map(item => 
        new Date(item.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })
      ),
      datasets: [{
        data: userAnalytics.followerGrowth.slice(-7).map(item => item.count),
        color: (opacity = 1) => `rgba(255, 48, 64, ${opacity})`,
        strokeWidth: 2,
      }],
    };

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Key Metrics */}
        <View style={styles.metricsGrid}>
          <View style={styles.metricCard}>
            <Ionicons name="eye" size={24} color="#ff3040" />
            <Text style={styles.metricValue}>{userAnalytics.totalViews.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Views</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="heart" size={24} color="#ff3040" />
            <Text style={styles.metricValue}>{userAnalytics.totalLikes.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Total Likes</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="chatbubble" size={24} color="#ff3040" />
            <Text style={styles.metricValue}>{userAnalytics.totalComments.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Comments</Text>
          </View>
          <View style={styles.metricCard}>
            <Ionicons name="share" size={24} color="#ff3040" />
            <Text style={styles.metricValue}>{userAnalytics.totalShares.toLocaleString()}</Text>
            <Text style={styles.metricLabel}>Shares</Text>
          </View>
        </View>

        {/* Follower Growth Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Follower Growth (Last 7 Days)</Text>
          <LineChart
            data={followerData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Engagement Rate */}
        <View style={styles.engagementContainer}>
          <Text style={styles.sectionTitle}>Engagement Rate</Text>
          <View style={styles.engagementCard}>
            <Text style={styles.engagementValue}>{userAnalytics.avgEngagement.toFixed(1)}%</Text>
            <Text style={styles.engagementLabel}>Average Engagement</Text>
            <View style={styles.engagementBar}>
              <View 
                style={[
                  styles.engagementFill, 
                  { width: `${Math.min(userAnalytics.avgEngagement * 10, 100)}%` }
                ]} 
              />
            </View>
          </View>
        </View>

        {/* Top Content */}
        <View style={styles.topContentContainer}>
          <Text style={styles.sectionTitle}>Top Content Categories</Text>
          {userAnalytics.topContent.map((category, index) => (
            <View key={index} style={styles.contentItem}>
              <Text style={styles.contentCategory}>{category}</Text>
              <View style={styles.contentBar}>
                <View 
                  style={[
                    styles.contentFill, 
                    { width: `${100 - (index * 15)}%` }
                  ]} 
                />
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderVideosTab = () => {
    if (!userAnalytics) return null;

    const performanceData = {
      labels: ['Views', 'Likes', 'Comments', 'Shares'],
      datasets: [{
        data: [
          userAnalytics.totalViews / 1000,
          userAnalytics.totalLikes / 100,
          userAnalytics.totalComments / 10,
          userAnalytics.totalShares / 10,
        ],
      }],
    };

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Video Performance Chart */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Video Performance Overview</Text>
          <BarChart
            data={performanceData}
            width={screenWidth - 32}
            height={220}
            yAxisLabel=""
            yAxisSuffix=""
            chartConfig={chartConfig}
            style={styles.chart}
            verticalLabelRotation={30}
          />
        </View>

        {/* Best Performing Times */}
        <View style={styles.timingContainer}>
          <Text style={styles.sectionTitle}>Best Posting Times</Text>
          <View style={styles.timingGrid}>
            {Object.entries(userAnalytics.audienceInsights.activeHours).map(([time, percentage]) => (
              <View key={time} style={styles.timingCard}>
                <Text style={styles.timingTime}>{time}</Text>
                <Text style={styles.timingPercentage}>{percentage}%</Text>
                <Text style={styles.timingLabel}>Active</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Video Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.sectionTitle}>💡 Performance Tips</Text>
          <View style={styles.tipCard}>
            <Ionicons name="trending-up" size={20} color="#ff3040" />
            <Text style={styles.tipText}>Post during 18-24h for maximum engagement</Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="time" size={20} color="#ff3040" />
            <Text style={styles.tipText}>Videos 15-30 seconds perform best</Text>
          </View>
          <View style={styles.tipCard}>
            <Ionicons name="musical-notes" size={20} color="#ff3040" />
            <Text style={styles.tipText}>Use trending music for better reach</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  const renderAudienceTab = () => {
    if (!userAnalytics) return null;

    const countryData = Object.entries(userAnalytics.audienceInsights.topCountries).map(([country, percentage]) => ({
      name: country,
      population: percentage,
      color: `rgba(255, 48, 64, ${0.3 + (percentage / 100) * 0.7})`,
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    }));

    const ageData = Object.entries(userAnalytics.audienceInsights.ageDistribution).map(([age, percentage]) => ({
      name: age,
      population: percentage,
      color: `rgba(255, 48, 64, ${0.3 + (percentage / 100) * 0.7})`,
      legendFontColor: '#FFFFFF',
      legendFontSize: 12,
    }));

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        {/* Geographic Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Top Countries</Text>
          <PieChart
            data={countryData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* Age Distribution */}
        <View style={styles.chartContainer}>
          <Text style={styles.chartTitle}>Age Distribution</Text>
          <PieChart
            data={ageData}
            width={screenWidth - 32}
            height={220}
            chartConfig={chartConfig}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
            style={styles.chart}
          />
        </View>

        {/* Audience Insights */}
        <View style={styles.insightsContainer}>
          <Text style={styles.sectionTitle}>👥 Audience Insights</Text>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Primary Audience</Text>
            <Text style={styles.insightText}>18-24 years old from United States</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Peak Activity</Text>
            <Text style={styles.insightText}>Evening hours (18:00 - 24:00)</Text>
          </View>
          <View style={styles.insightCard}>
            <Text style={styles.insightTitle}>Content Preference</Text>
            <Text style={styles.insightText}>Dance and entertainment content</Text>
          </View>
        </View>
      </ScrollView>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff3040" />
          <Text style={styles.loadingText}>Loading analytics...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Analytics</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {(['7d', '30d', '90d'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeframeButton,
              timeframe === period && styles.timeframeButtonActive,
            ]}
            onPress={() => setTimeframe(period)}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === period && styles.timeframeTextActive,
              ]}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : '90 Days'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { id: 'overview', label: 'Overview', icon: 'analytics' },
          { id: 'videos', label: 'Videos', icon: 'videocam' },
          { id: 'audience', label: 'Audience', icon: 'people' },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              activeTab === tab.id && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab(tab.id as any)}
          >
            <Ionicons
              name={tab.icon as any}
              size={20}
              color={activeTab === tab.id ? '#ff3040' : 'rgba(255,255,255,0.6)'}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.id && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab Content */}
      {activeTab === 'overview' && renderOverviewTab()}
      {activeTab === 'videos' && renderVideosTab()}
      {activeTab === 'audience' && renderAudienceTab()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
    marginTop: 16,
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
  timeframeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  timeframeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  timeframeButtonActive: {
    backgroundColor: '#ff3040',
  },
  timeframeText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  tabButtonActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#ff3040',
  },
  tabText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#ff3040',
  },
  tabContent: {
    flex: 1,
    padding: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    minWidth: (screenWidth - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  metricValue: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  chartContainer: {
    marginBottom: 24,
  },
  chartTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  engagementContainer: {
    marginBottom: 24,
  },
  engagementCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  engagementValue: {
    color: '#ff3040',
    fontSize: 32,
    fontWeight: 'bold',
  },
  engagementLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    marginBottom: 16,
  },
  engagementBar: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
  },
  engagementFill: {
    height: '100%',
    backgroundColor: '#ff3040',
    borderRadius: 4,
  },
  topContentContainer: {
    marginBottom: 24,
  },
  contentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  contentCategory: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    width: 80,
  },
  contentBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginLeft: 12,
  },
  contentFill: {
    height: '100%',
    backgroundColor: '#ff3040',
    borderRadius: 4,
  },
  timingContainer: {
    marginBottom: 24,
  },
  timingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  timingCard: {
    flex: 1,
    minWidth: (screenWidth - 56) / 2,
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  timingTime: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  timingPercentage: {
    color: '#ff3040',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 4,
  },
  timingLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    marginTop: 4,
  },
  tipsContainer: {
    marginBottom: 24,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  tipText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  insightsContainer: {
    marginBottom: 24,
  },
  insightCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  insightTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  insightText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});

export default AnalyticsDashboard;
