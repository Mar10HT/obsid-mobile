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

  const projectId = Constants.expoConfig?.extra?.eas?.projectId as string | undefined;
  if (__DEV__ && !projectId) {
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

export function usePushNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  // Configure foreground notification display inside the hook (not at module level)
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
    return () => {
      Notifications.setNotificationHandler(null);
    };
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and save token when user is logged in
    registerForPushNotifications()
      .then((token) => {
        if (token) {
          savePushToken(token).catch((err) => {
            if (__DEV__) console.warn('[PushNotifications] Failed to save token:', err);
          });
        }
      })
      .catch((err) => {
        if (__DEV__) console.warn('[PushNotifications] Failed to register:', err);
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
