// errorConfig.js
import { LogBox } from 'react-native';

// Disable all error overlays
LogBox.ignoreAllLogs();

// OR disable specific error messages (recommended approach)
// LogBox.ignoreLogs([
//   'Warning: Do not call Hooks inside useEffect',
//   '(NOBRIDGE) ERROR',
//   // Add other error patterns you want to hide
// ]);

export default function configureErrorHandling() {
  // You can add additional error handling configuration here
  console.log('Error overlays disabled, errors will only show in console');
}