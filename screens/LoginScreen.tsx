import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const LoginScreen: React.FC = () => {
  const { signInWithGoogle } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Logo/Title */}
        <View style={styles.header}>
          <Text style={styles.logo}>TikTok Clone</Text>
          <Text style={styles.subtitle}>Share your moments</Text>
        </View>

        {/* Feature highlights */}
        <View style={styles.features}>
          <View style={styles.featureItem}>
            <Ionicons name="videocam" size={24} color="#ff3040" />
            <Text style={styles.featureText}>Create amazing videos</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="heart" size={24} color="#ff3040" />
            <Text style={styles.featureText}>Like and interact</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Ionicons name="people" size={24} color="#ff3040" />
            <Text style={styles.featureText}>Connect with friends</Text>
          </View>
        </View>

        {/* Login button */}
        <View style={styles.loginSection}>
          <TouchableOpacity style={styles.googleButton} onPress={signInWithGoogle}>
            <Ionicons name="logo-google" size={24} color="white" />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>
          
          <Text style={styles.termsText}>
            By continuing, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 48,
  },
  header: {
    alignItems: 'center',
    marginTop: 80,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#ff3040',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: 'white',
    opacity: 0.8,
  },
  features: {
    alignItems: 'center',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    width: '100%',
    maxWidth: 250,
  },
  featureText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 16,
  },
  loginSection: {
    alignItems: 'center',
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4285f4',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    marginBottom: 24,
    width: SCREEN_WIDTH - 64,
    justifyContent: 'center',
  },
  googleButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  termsText: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    paddingHorizontal: 16,
    lineHeight: 18,
  },
});

export default LoginScreen;
