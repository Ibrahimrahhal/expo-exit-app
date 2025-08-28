import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useExitApp, ExitStrategy, ExitResult } from '../src';

export default function App() {
  const {
    exit,
    exitWithStrategy,
    isBackHandlerSupported,
    isReloadSupported,
    getSupportedStrategies,
  } = useExitApp();

  const [lastResult, setLastResult] = useState<ExitResult | null>(null);
  const [supportedStrategies, setSupportedStrategies] = useState<ExitStrategy[]>([]);

  useEffect(() => {
    setSupportedStrategies(getSupportedStrategies());
  }, [getSupportedStrategies]);

  const handleGracefulExit = () => {
    Alert.alert(
      'Graceful Exit',
      'This will try multiple exit strategies with fallbacks.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            const result = await exit({
              errorMessage: 'User requested graceful exit',
              useReload: true,
              forceDelay: 100,
            });
            setLastResult(result);
          },
        },
      ]
    );
  };

  const handleStrategyExit = (strategy: ExitStrategy) => {
    const strategyNames = {
      [ExitStrategy.BACK_HANDLER]: 'BackHandler',
      [ExitStrategy.RELOAD]: 'Reload',
      [ExitStrategy.FORCE_CRASH]: 'Force Crash',
      [ExitStrategy.GRACEFUL]: 'Graceful',
    };

    Alert.alert(
      `${strategyNames[strategy]} Exit`,
      `This will use the ${strategyNames[strategy]} strategy.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          style: 'destructive',
          onPress: async () => {
            const result = await exitWithStrategy(strategy, {
              errorMessage: `User requested ${strategy} exit`,
            });
            setLastResult(result);
          },
        },
      ]
    );
  };

  const handleRegionCheckDemo = () => {
    Alert.alert(
      'Region Check Demo',
      'This simulates your original region check code.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start Demo',
          onPress: () => {
            // Simulate the 3-second delay from your original code
            setTimeout(() => {
              Alert.alert(
                'Region Not Supported',
                "Your region isn't supported",
                [
                  {
                    text: 'OK',
                    onPress: async () => {
                      const result = await exit({
                        errorMessage: 'App terminated due to unsupported region',
                        useReload: true,
                        forceDelay: 100,
                      });
                      setLastResult(result);
                    },
                  },
                ],
                { cancelable: false }
              );
            }, 3000);
          },
        },
      ]
    );
  };

  const renderButton = (title: string, onPress: () => void, color = '#007AFF') => (
    <Pressable
      style={[styles.button, { backgroundColor: color }]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </Pressable>
  );

  const renderStrategyButton = (strategy: ExitStrategy) => {
    const isSupported = supportedStrategies.includes(strategy);
    const strategyNames = {
      [ExitStrategy.BACK_HANDLER]: 'BackHandler Exit',
      [ExitStrategy.RELOAD]: 'Reload Exit',
      [ExitStrategy.FORCE_CRASH]: 'Force Crash Exit',
      [ExitStrategy.GRACEFUL]: 'Graceful Exit',
    };

    return renderButton(
      `${strategyNames[strategy]} ${isSupported ? '✅' : '❌'}`,
      () => handleStrategyExit(strategy),
      isSupported ? '#007AFF' : '#999999'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>expo-exit-app Demo</Text>
        <Text style={styles.subtitle}>
          Test different exit strategies for your Expo app
        </Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Platform Support</Text>
          <View style={styles.supportInfo}>
            <Text style={styles.supportText}>
              BackHandler: {isBackHandlerSupported() ? '✅ Supported' : '❌ Not Supported'}
            </Text>
            <Text style={styles.supportText}>
              Reload: {isReloadSupported() ? '✅ Supported' : '❌ Not Supported'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Exit</Text>
          {renderButton('Graceful Exit (Recommended)', handleGracefulExit, '#34C759')}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Exit Strategies</Text>
          {Object.values(ExitStrategy).map((strategy) => (
            <View key={strategy} style={styles.buttonContainer}>
              {renderStrategyButton(strategy)}
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Demo Scenarios</Text>
          {renderButton('Region Check Demo', handleRegionCheckDemo, '#FF9500')}
        </View>

        {lastResult && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Last Exit Result</Text>
            <View style={styles.resultContainer}>
              <Text style={styles.resultText}>
                Success: {lastResult.success ? '✅' : '❌'}
              </Text>
              <Text style={styles.resultText}>
                Strategy: {lastResult.strategy}
              </Text>
              {lastResult.error && (
                <Text style={styles.errorText}>
                  Error: {lastResult.error}
                </Text>
              )}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.warningTitle}>⚠️ Warning</Text>
          <Text style={styles.warningText}>
            These buttons will actually exit/crash the app! Use them carefully.
            The force crash strategy is mainly for development and testing.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonContainer: {
    marginBottom: 5,
  },
  supportInfo: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  supportText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  resultContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#333',
  },
  errorText: {
    fontSize: 16,
    marginBottom: 5,
    color: '#FF3B30',
  },
  warningTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
    color: '#FF9500',
  },
  warningText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    backgroundColor: '#FFF8E1',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
  },
});
