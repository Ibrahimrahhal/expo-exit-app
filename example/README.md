# expo-exit-app Example

This is a complete example app demonstrating how to use the `expo-exit-app` package.

## 🚀 Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the Expo development server:
   ```bash
   npm start
   ```

3. Open the app on your device or simulator:
   - Press `a` for Android
   - Press `i` for iOS
   - Press `w` for Web

## 📱 Features Demonstrated

### Platform Support Detection
- Shows which exit strategies are supported on the current platform
- Displays BackHandler and Updates reload availability

### Exit Strategies
- **Graceful Exit**: Tries multiple strategies with fallbacks (recommended)
- **BackHandler Exit**: Uses `BackHandler.exitApp()` (Android only)
- **Reload Exit**: Uses `Updates.reloadAsync()` to restart the app
- **Force Crash Exit**: Forces an unhandled error to crash the app

### Demo Scenarios
- **Region Check Demo**: Simulates the original use case with a 3-second delay and region check alert

### Real-time Results
- Shows the result of the last exit attempt
- Displays success status, strategy used, and any errors

## ⚠️ Important Notes

1. **Testing**: The exit buttons will actually exit/crash the app - use them carefully!

2. **Platform Differences**:
   - Android: BackHandler works, force crash terminates the app
   - iOS: BackHandler doesn't work, force crash may show a crash dialog
   - Web: Most strategies will just reload the page

3. **Development vs Production**:
   - Force crash is mainly for development/testing
   - In production, prefer graceful strategies

## 🔧 Code Examples

The example app shows how to:

### Use the Hook
```tsx
const { exit, exitWithStrategy, isBackHandlerSupported } = useExitApp();
```

### Handle Exit Results
```tsx
const result = await exit({
  errorMessage: 'Custom exit message',
  useReload: true,
  forceDelay: 100,
});
console.log('Exit result:', result);
```

### Check Platform Support
```tsx
const isSupported = isBackHandlerSupported();
const strategies = getSupportedStrategies();
```

### Implement Region Check (Original Use Case)
```tsx
setTimeout(() => {
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
```

## 📦 Package Structure

The example demonstrates importing from the main package:

```tsx
import { useExitApp, ExitStrategy, ExitResult } from 'expo-exit-app';
```

This shows how end users will integrate the package into their apps.
