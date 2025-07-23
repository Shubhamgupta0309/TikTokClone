import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Modal,
  Alert,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video, ResizeMode } from 'expo-av';
import Slider from '@react-native-community/slider';
import VideoEffectsService, { VideoEffect, VideoFilter } from '../services/VideoEffectsService';

const { width: screenWidth } = Dimensions.get('window');

interface EffectsScreenProps {
  videoUri: string;
  onClose: () => void;
  onApplyEffects: (processedVideoUri: string, effects: VideoEffect[]) => void;
}

const EffectsScreen: React.FC<EffectsScreenProps> = ({ 
  videoUri, 
  onClose, 
  onApplyEffects 
}) => {
  const [activeTab, setActiveTab] = useState<'filters' | 'effects' | 'adjust'>('filters');
  const [selectedFilter, setSelectedFilter] = useState<VideoFilter | null>(null);
  const [selectedEffects, setSelectedEffects] = useState<VideoEffect[]>([]);
  const [processing, setProcessing] = useState(false);
  const [previewMode, setPreviewMode] = useState(true);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  
  // Adjustment values
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [saturation, setSaturation] = useState(0);
  const [blur, setBlur] = useState(0);

  useEffect(() => {
    // Set default filter
    const naturalFilter = VideoEffectsService.getFilterById('natural');
    if (naturalFilter) {
      setSelectedFilter(naturalFilter);
    }
  }, []);

  const handleFilterSelect = (filter: VideoFilter) => {
    setSelectedFilter(filter);
  };

  const handleEffectToggle = (effect: VideoEffect) => {
    if (effect.premium && !isPremiumUser()) {
      setShowPremiumModal(true);
      return;
    }

    const isSelected = selectedEffects.some(e => e.id === effect.id);
    if (isSelected) {
      setSelectedEffects(prev => prev.filter(e => e.id !== effect.id));
    } else {
      setSelectedEffects(prev => [...prev, effect]);
    }
  };

  const isPremiumUser = () => {
    // In a real app, this would check user's premium status
    return false;
  };

  const applyEffects = async () => {
    if (!selectedFilter && selectedEffects.length === 0) {
      Alert.alert('No Effects Selected', 'Please select at least one filter or effect to apply.');
      return;
    }

    setProcessing(true);
    try {
      let processedUri = videoUri;

      // Apply filter first
      if (selectedFilter) {
        processedUri = await VideoEffectsService.applyFilter(processedUri, selectedFilter);
      }

      // Apply effects
      if (selectedEffects.length > 0) {
        const effectsWithIntensity = selectedEffects.map(effect => ({
          effect,
          intensity: effect.intensity || 50,
        }));
        processedUri = await VideoEffectsService.applyMultipleEffects(processedUri, effectsWithIntensity);
      }

      onApplyEffects(processedUri, selectedEffects);
    } catch (error) {
      Alert.alert('Error', 'Failed to apply effects. Please try again.');
      console.log('Error applying effects:', error);
    } finally {
      setProcessing(false);
    }
  };

  const renderFiltersTab = () => {
    const filters = VideoEffectsService.getFilters();

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.filterGrid}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.id}
              style={[
                styles.filterItem,
                selectedFilter?.id === filter.id && styles.filterItemSelected,
              ]}
              onPress={() => handleFilterSelect(filter)}
            >
              <View style={styles.filterPreview}>
                <Video
                  source={{ uri: videoUri }}
                  style={styles.filterVideo}
                  shouldPlay={false}
                  isLooping
                  isMuted
                  resizeMode={ResizeMode.COVER}
                />
                <View 
                  style={[
                    styles.filterOverlay,
                    {
                      filter: VideoEffectsService.generateFilterCSS(filter),
                    },
                  ]} 
                />
              </View>
              <Text style={styles.filterName}>{filter.name}</Text>
              {selectedFilter?.id === filter.id && (
                <View style={styles.selectedIndicator}>
                  <Ionicons name="checkmark" size={16} color="white" />
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderEffectsTab = () => {
    const effects = VideoEffectsService.getEffects('effect');

    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.effectsGrid}>
          {effects.map((effect) => {
            const isSelected = selectedEffects.some(e => e.id === effect.id);
            const isAvailable = VideoEffectsService.isEffectAvailable(effect.id, isPremiumUser());

            return (
              <TouchableOpacity
                key={effect.id}
                style={[
                  styles.effectItem,
                  isSelected && styles.effectItemSelected,
                  !isAvailable && styles.effectItemLocked,
                ]}
                onPress={() => handleEffectToggle(effect)}
              >
                <View style={styles.effectIcon}>
                  <Ionicons 
                    name={effect.icon as any} 
                    size={32} 
                    color={isSelected ? '#ff3040' : isAvailable ? 'white' : 'rgba(255,255,255,0.3)'} 
                  />
                  {effect.premium && (
                    <View style={styles.premiumBadge}>
                      <Ionicons name="diamond" size={12} color="#ffd700" />
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.effectName,
                  !isAvailable && styles.effectNameLocked,
                ]}>
                  {effect.name}
                </Text>
                <Text style={[
                  styles.effectDescription,
                  !isAvailable && styles.effectDescriptionLocked,
                ]}>
                  {effect.description}
                </Text>
                {isSelected && (
                  <View style={styles.selectedIndicator}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Popular Combinations */}
        <View style={styles.combinationsSection}>
          <Text style={styles.sectionTitle}>✨ Popular Combinations</Text>
          {VideoEffectsService.getPopularCombinations().map((combo, index) => (
            <TouchableOpacity
              key={index}
              style={styles.comboItem}
              onPress={() => {
                const effects = combo.effects
                  .map(effectId => VideoEffectsService.getEffectById(effectId))
                  .filter(Boolean) as VideoEffect[];
                setSelectedEffects(effects);
              }}
            >
              <View style={styles.comboInfo}>
                <Text style={styles.comboName}>{combo.name}</Text>
                <Text style={styles.comboDescription}>{combo.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.6)" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderAdjustTab = () => {
    return (
      <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
        <View style={styles.adjustmentSection}>
          <Text style={styles.sectionTitle}>🎨 Manual Adjustments</Text>
          
          {/* Brightness */}
          <View style={styles.adjustmentItem}>
            <View style={styles.adjustmentHeader}>
              <Ionicons name="sunny" size={20} color="white" />
              <Text style={styles.adjustmentLabel}>Brightness</Text>
              <Text style={styles.adjustmentValue}>{brightness}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={brightness}
              onValueChange={setBrightness}
              minimumTrackTintColor="#ff3040"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Contrast */}
          <View style={styles.adjustmentItem}>
            <View style={styles.adjustmentHeader}>
              <Ionicons name="contrast" size={20} color="white" />
              <Text style={styles.adjustmentLabel}>Contrast</Text>
              <Text style={styles.adjustmentValue}>{contrast}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={contrast}
              onValueChange={setContrast}
              minimumTrackTintColor="#ff3040"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Saturation */}
          <View style={styles.adjustmentItem}>
            <View style={styles.adjustmentHeader}>
              <Ionicons name="color-palette" size={20} color="white" />
              <Text style={styles.adjustmentLabel}>Saturation</Text>
              <Text style={styles.adjustmentValue}>{saturation}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={-100}
              maximumValue={100}
              value={saturation}
              onValueChange={setSaturation}
              minimumTrackTintColor="#ff3040"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Blur */}
          <View style={styles.adjustmentItem}>
            <View style={styles.adjustmentHeader}>
              <Ionicons name="ellipse-outline" size={20} color="white" />
              <Text style={styles.adjustmentLabel}>Blur</Text>
              <Text style={styles.adjustmentValue}>{blur}</Text>
            </View>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              value={blur}
              onValueChange={setBlur}
              minimumTrackTintColor="#ff3040"
              maximumTrackTintColor="rgba(255,255,255,0.3)"
            />
          </View>

          {/* Reset Button */}
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => {
              setBrightness(0);
              setContrast(0);
              setSaturation(0);
              setBlur(0);
            }}
          >
            <Ionicons name="refresh" size={20} color="white" />
            <Text style={styles.resetButtonText}>Reset All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  };

  const renderPremiumModal = () => (
    <Modal
      visible={showPremiumModal}
      transparent
      animationType="slide"
      onRequestClose={() => setShowPremiumModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.premiumModal}>
          <View style={styles.premiumHeader}>
            <Ionicons name="diamond" size={40} color="#ffd700" />
            <Text style={styles.premiumTitle}>Unlock Premium Effects</Text>
            <Text style={styles.premiumSubtitle}>
              Get access to all advanced effects and filters
            </Text>
          </View>
          
          <View style={styles.premiumFeatures}>
            <View style={styles.premiumFeature}>
              <Ionicons name="sparkles" size={20} color="#ffd700" />
              <Text style={styles.premiumFeatureText}>Advanced Beauty Effects</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="brush" size={20} color="#ffd700" />
              <Text style={styles.premiumFeatureText}>Artistic Filters</Text>
            </View>
            <View style={styles.premiumFeature}>
              <Ionicons name="flash" size={20} color="#ffd700" />
              <Text style={styles.premiumFeatureText}>Special Effects</Text>
            </View>
          </View>

          <View style={styles.premiumActions}>
            <TouchableOpacity
              style={styles.premiumButton}
              onPress={() => {
                setShowPremiumModal(false);
                // In a real app, navigate to subscription screen
                Alert.alert('Premium', 'Premium subscription feature coming soon!');
              }}
            >
              <Text style={styles.premiumButtonText}>Upgrade Now</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.premiumCancel}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.premiumCancelText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Ionicons name="close" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Effects</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.previewToggle}>
            <Text style={styles.previewText}>Preview</Text>
            <Switch
              value={previewMode}
              onValueChange={setPreviewMode}
              trackColor={{ false: '#767577', true: '#ff3040' }}
              thumbColor={previewMode ? '#fff' : '#f4f3f4'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Video Preview */}
      <View style={styles.videoContainer}>
        <Video
          source={{ uri: videoUri }}
          style={styles.videoPreview}
          shouldPlay={previewMode}
          isLooping
          isMuted
          resizeMode={ResizeMode.COVER}
        />
        {selectedEffects.length > 0 && (
          <View style={styles.effectsOverlay}>
            <Text style={styles.effectsCount}>
              {selectedEffects.length} effect{selectedEffects.length !== 1 ? 's' : ''} selected
            </Text>
          </View>
        )}
      </View>

      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        {[
          { id: 'filters', label: 'Filters', icon: 'camera' },
          { id: 'effects', label: 'Effects', icon: 'sparkles' },
          { id: 'adjust', label: 'Adjust', icon: 'options' },
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
      {activeTab === 'filters' && renderFiltersTab()}
      {activeTab === 'effects' && renderEffectsTab()}
      {activeTab === 'adjust' && renderAdjustTab()}

      {/* Apply Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.applyButton,
            processing && styles.applyButtonDisabled,
          ]}
          onPress={applyEffects}
          disabled={processing}
        >
          {processing ? (
            <Text style={styles.applyButtonText}>Processing...</Text>
          ) : (
            <Text style={styles.applyButtonText}>Apply Effects</Text>
          )}
        </TouchableOpacity>
      </View>

      {renderPremiumModal()}
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
  headerRight: {
    width: 100,
    alignItems: 'flex-end',
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  previewText: {
    color: 'white',
    fontSize: 14,
  },
  videoContainer: {
    height: 200,
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  videoPreview: {
    width: '100%',
    height: '100%',
  },
  effectsOverlay: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  effectsCount: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
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
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  filterItem: {
    width: (screenWidth - 56) / 3,
    alignItems: 'center',
    position: 'relative',
  },
  filterItemSelected: {
    transform: [{ scale: 1.05 }],
  },
  filterPreview: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  filterVideo: {
    width: '100%',
    height: '100%',
  },
  filterOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  filterName: {
    color: 'white',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ff3040',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectsGrid: {
    gap: 12,
    marginBottom: 24,
  },
  effectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    position: 'relative',
  },
  effectItemSelected: {
    borderColor: '#ff3040',
    borderWidth: 2,
    backgroundColor: 'rgba(255,48,64,0.1)',
  },
  effectItemLocked: {
    opacity: 0.5,
  },
  effectIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    position: 'relative',
  },
  premiumBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ffd700',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  effectNameLocked: {
    color: 'rgba(255,255,255,0.5)',
  },
  effectDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    position: 'absolute',
    bottom: 16,
    left: 80,
  },
  effectDescriptionLocked: {
    color: 'rgba(255,255,255,0.3)',
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  combinationsSection: {
    marginTop: 24,
  },
  comboItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  comboInfo: {
    flex: 1,
  },
  comboName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  comboDescription: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
  },
  adjustmentSection: {
    gap: 24,
  },
  adjustmentItem: {
    gap: 12,
  },
  adjustmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  adjustmentLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  adjustmentValue: {
    color: '#ff3040',
    fontSize: 16,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderThumb: {
    backgroundColor: '#ff3040',
    width: 20,
    height: 20,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  resetButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  applyButton: {
    backgroundColor: '#ff3040',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  applyButtonDisabled: {
    backgroundColor: 'rgba(255,48,64,0.5)',
  },
  applyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  premiumModal: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 350,
  },
  premiumHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  premiumTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  premiumSubtitle: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
    textAlign: 'center',
  },
  premiumFeatures: {
    gap: 16,
    marginBottom: 24,
  },
  premiumFeature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  premiumFeatureText: {
    color: 'white',
    fontSize: 16,
  },
  premiumActions: {
    gap: 12,
  },
  premiumButton: {
    backgroundColor: '#ffd700',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
  },
  premiumCancel: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  premiumCancelText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 16,
  },
});

export default EffectsScreen;
