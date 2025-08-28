# expo-exit-app

A React Native package for gracefully exiting Expo applications with multiple fallback strategies.

[![npm version](https://badge.fury.io/js/expo-exit-app.svg)](https://badge.fury.io/js/expo-exit-app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🚀 Features

- **Multiple Exit Strategies**: BackHandler, Updates reload, and force crash
- **Graceful Fallbacks**: Automatically tries multiple methods
- **TypeScript Support**: Fully typed for better development experience
- **React Hooks**: Easy integration with React components
- **Platform Detection**: Automatically detects available exit methods
- **Customizable**: Configure error messages, delays, and strategies

## 📦 Installation

```bash
npm install expo-exit-app
```

or

```bash
yarn add expo-exit-app
```

## 🔧 Basic Usage

### Using the Hook (Recommended)

```tsx
import React from 'react';
import { View, Button, Alert } from 'react-native';
import { useExitApp } from 'expo-exit-app';

export default function App() {
  const { exit } = useExitApp();

  const handleExit = () => {
    Alert.alert(
      'Exit App',
      'Are you sure you want to exit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Exit',
          onPress: async () => {
            const result = await exit({
              errorMessage: 'User requested app exit',
            });
            console.log('Exit result:', result);
          },
        },
      ]
    );
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Exit App" onPress={handleExit} />
    </View>
  );
}
```

### Using the Class Directly

```tsx
import { ExitApp, ExitStrategy } from 'expo-exit-app';

// Simple exit with default options
await ExitApp.exit();

// Exit with custom options
await ExitApp.exit({
  errorMessage: 'Custom exit message',
  useReload: true,
  forceDelay: 200,
});

// Exit with specific strategy
await ExitApp.exitWithStrategy(ExitStrategy.BACK_HANDLER);
```

## 📚 API Reference

### `useExitApp()` Hook

Returns an object with the following methods:

```tsx
const {
  exit,
  exitWithStrategy,
  isBackHandlerSupported,
  isReloadSupported,
  getSupportedStrategies,
} = useExitApp();
```

#### Methods

- **`exit(options?)`**: Exit using graceful strategy with fallbacks
- **`exitWithStrategy(strategy, options?)`**: Exit using a specific strategy
- **`isBackHandlerSupported()`**: Check if BackHandler.exitApp() is available
- **`isReloadSupported()`**: Check if Updates.reloadAsync() is available
- **`getSupportedStrategies()`**: Get array of supported exit strategies

### `ExitApp` Class

Static methods for app termination:

#### `ExitApp.exit(options?): Promise<ExitResult>`

Gracefully exit the app using multiple fallback strategies.

#### `ExitApp.exitWithStrategy(strategy, options?): Promise<ExitResult>`

Exit using a specific strategy.

#### Platform Detection Methods

- `ExitApp.isBackHandlerSupported(): boolean`
- `ExitApp.isReloadSupported(): boolean`
- `ExitApp.getSupportedStrategies(): ExitStrategy[]`

### Types

#### `ExitOptions`

```tsx
interface ExitOptions {
  /** Custom error message to use when forcing app termination */
  errorMessage?: string;
  /** Whether to try Updates.reloadAsync() first (default: true) */
  useReload?: boolean;
  /** Delay in milliseconds before attempting force termination (default: 100) */
  forceDelay?: number;
}
```

#### `ExitStrategy`

```tsx
enum ExitStrategy {
  BACK_HANDLER = 'backHandler',    // Use BackHandler.exitApp()
  RELOAD = 'reload',               // Use Updates.reloadAsync()
  FORCE_CRASH = 'forceCrash',      // Force crash with unhandled error
  GRACEFUL = 'graceful',           // Try all strategies with fallbacks
}
```

#### `ExitResult`

```tsx
interface ExitResult {
  /** Whether the exit attempt was successful */
  success: boolean;
  /** The strategy that was used */
  strategy: ExitStrategy;
  /** Error message if the exit failed */
  error?: string;
}
```

## 🎯 Exit Strategies

### 1. Graceful (Default)

Tries multiple strategies in order:
1. `Updates.reloadAsync()` (if enabled and `useReload: true`)
2. `BackHandler.exitApp()` (if available)
3. Force crash with unhandled error

### 2. BackHandler

Uses `BackHandler.exitApp()` - works primarily on Android.

### 3. Reload

Uses `Updates.reloadAsync()` to reload the app, effectively restarting it.

### 4. Force Crash

Forces an unhandled error to crash the app. Uses `ErrorUtils.reportFatalError()` if available, otherwise throws an error.

## 🔍 Advanced Examples

### Custom Exit Flow

```tsx
import { useExitApp, ExitStrategy } from 'expo-exit-app';

export function useCustomExit() {
  const { exitWithStrategy, getSupportedStrategies } = useExitApp();

  const customExit = async () => {
    const strategies = getSupportedStrategies();
    
    // Try BackHandler first if available
    if (strategies.includes(ExitStrategy.BACK_HANDLER)) {
      const result = await exitWithStrategy(ExitStrategy.BACK_HANDLER);
      if (result.success) return result;
    }

    // Fallback to force crash
    return exitWithStrategy(ExitStrategy.FORCE_CRASH, {
      errorMessage: 'Custom exit flow terminated app',
      forceDelay: 500,
    });
  };

  return { customExit };
}
```

### Region Check Example (Based on Your Code)

```tsx
import React, { useEffect } from 'react';
import { Alert } from 'react-native';
import { useExitApp } from 'expo-exit-app';

export function RegionCheck() {
  const { exit } = useExitApp();

  useEffect(() => {
    const timer = setTimeout(() => {
      Alert.alert(
        'Region Not Supported',
        "Your region isn't supported",
        [
          {
            text: 'OK',
            onPress: async () => {
              await exit({
                errorMessage: 'App terminated due to unsupported region',
                useReload: true,
                forceDelay: 100,
              });
            },
          },
        ],
        { cancelable: false }
      );
    }, 3000);

    return () => clearTimeout(timer);
  }, [exit]);

  return null; // This is just a utility component
}
```

## 🛠️ Platform Support

| Platform | BackHandler | Updates Reload | Force Crash |
|----------|-------------|----------------|-------------|
| Android  | ✅          | ✅             | ✅          |
| iOS      | ❌          | ✅             | ✅          |
| Web      | ❌          | ✅             | ✅          |

**Note**: iOS doesn't allow apps to programmatically exit, but force crash will work for development/testing.

## ⚠️ Important Notes

1. **iOS Behavior**: Apple doesn't allow apps to programmatically exit on iOS. The force crash method is mainly for development/testing purposes.

2. **Production Use**: Be careful when using force crash in production apps, as it may affect crash reporting and user experience.

3. **Updates.reloadAsync()**: Only works when Expo Updates is enabled and configured.

4. **Testing**: Test thoroughly on your target platforms, as behavior may vary.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Ibrahim Rahhal** - [@Ibrahimrahhal](https://github.com/Ibrahimrahhal)

- Email: ibrahim.rahhal3636@gmail.com
- Website: [rahhalesta.com](https://www.rahhalesta.com)
- Twitter: [@IbrahimRahhal18](https://twitter.com/IbrahimRahhal18)

## 🙏 Acknowledgments

- Inspired by [react-native-exit-app](https://github.com/wumke/react-native-exit-app)
- Built for the Expo ecosystem
- Thanks to the React Native and Expo communities
