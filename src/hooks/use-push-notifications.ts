import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';

async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    // Push notifications don't work on simulators/emulators
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return null;
  }

  // Android requires a notification channel
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'Obsid Alerts',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  const rawProjectId = Constants.expoConfig?.extra?.eas?.projectId;
  const projectId = typeof rawProjectId === 'string' ? rawProjectId : undefined;
  if (!projectId) {
    console.warn('[PushNotifications] Missing EAS projectId — push token will only work in Expo Go');
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  return token.data;
}

async function savePushToken(token: string): Promise<void> {
  await apiFetch(API_ENDPOINTS.pushToken, {
    method: 'PATCH',
    body: JSON.stringify({ token }),
  });
}

/**
 * Registers and manages Expo push notifications for the current user.
 * Must be called from a single root layout component — setNotificationHandler
 * is a global singleton and calling this hook from multiple components
 * simultaneously would cause the last mount to silently override the handler.
 */
export function usePushNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Configure foreground notification display for the app's lifetime.
  // setNotificationHandler is a global singleton — intentionally no cleanup
  // so notifications keep showing if the layout remounts (e.g. hot reload).
  useEffect(() => {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and save token when user is logged in
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          savePushToken(token).catch((err) => {
            // TODO: replace with production monitoring (e.g. Sentry) when integrated
            console.warn('[PushNotifications] Failed to save token:', err);
          });
        }
      })
      .catch((err) => {
        // TODO: replace with production monitoring (e.g. Sentry) when integrated
        console.warn('[PushNotifications] Failed to register:', err);
      });

    // Listen for incoming notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification is shown automatically via the handler above
    });

    // Listen for when user taps a notification
    responseListener.current = Notifications.addNotificationResponseReceivedListener(() => {
      // Future: navigate to alerts screen based on notification data
    });

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [isAuthenticated]);
  // Token clearing on logout is handled inside authApi.logout() while the session is still valid
}
