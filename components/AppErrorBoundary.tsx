import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import ErrorBoundary from 'react-native-error-boundary';
import { Ionicons } from '@expo/vector-icons';
import PerformanceService from '../services/PerformanceService';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const handleReport = () => {
    PerformanceService.handleError(error, 'ErrorBoundary');
  };

  return (
    <View style={styles.container}>
      <View style={styles.errorIcon}>
        <Ionicons name="warning" size={64} color="#ff6b6b" />
      </View>
      
      <Text style={styles.title}>Oops! Something went wrong</Text>
      <Text style={styles.message}>
        We're sorry for the inconvenience. The app encountered an unexpected error.
      </Text>
      
      <View style={styles.errorDetails}>
        <Text style={styles.errorText}>{error.message}</Text>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={resetError}>
          <Ionicons name="refresh" size={20} color="white" style={styles.buttonIcon} />
          <Text style={styles.primaryButtonText}>Try Again</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.secondaryButton} onPress={handleReport}>
          <Ionicons name="bug" size={20} color="#ff3040" style={styles.buttonIcon} />
          <Text style={styles.secondaryButtonText}>Report Issue</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.suggestion}>
        If the problem persists, try restarting the app or check your internet connection.
      </Text>
    </View>
  );
};

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

const AppErrorBoundary: React.FC<AppErrorBoundaryProps> = ({ children }) => {
  const handleError = (error: Error, stackTrace: string) => {
    console.log('ErrorBoundary caught an error:', error);
    PerformanceService.handleError(error, 'App ErrorBoundary');
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  errorIcon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
  },
  errorDetails: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    width: '100%',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6b6b',
  },
  errorText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#e74c3c',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#ff3040',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ff3040',
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#ff3040',
    fontWeight: 'bold',
    fontSize: 16,
  },
  buttonIcon: {
    marginRight: 8,
  },
  suggestion: {
    fontSize: 14,
    color: '#95a5a6',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default AppErrorBoundary;
