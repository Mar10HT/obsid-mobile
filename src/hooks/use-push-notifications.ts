import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { apiFetch } from '@features/auth/client';
import { API_ENDPOINTS } from '@constants/api';

// Show notifications as banners even when the app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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

  const token = await Notifications.getExpoPushTokenAsync();
  return token.data;
}

async function savePushToken(token: string): Promise<void> {
  await apiFetch(API_ENDPOINTS.pushToken, {
    method: 'PATCH',
    body: JSON.stringify({ token }),
  });
}

async function clearPushToken(): Promise<void> {
  await apiFetch(API_ENDPOINTS.pushToken, {
    method: 'PATCH',
    body: JSON.stringify({ token: null }),
  });
}

export function usePushNotifications(isAuthenticated: boolean) {
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Register and save token when user is logged in
    registerForPushNotifications()
      .then((token) => {
        if (token) savePushToken(token).catch(() => {});
      })
      .catch(() => {});

    // Listen for incoming notifications while app is in foreground
    notificationListener.current = Notifications.addNotificationReceivedListener(() => {
      // Notification is shown automatically via setNotificationHandler above
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

  useEffect(() => {
    if (isAuthenticated) return;

    // Clear token on logout so we don't send notifications to logged out devices
    clearPushToken().catch(() => {});
  }, [isAuthenticated]);
}
