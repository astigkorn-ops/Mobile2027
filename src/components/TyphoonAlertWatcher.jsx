import { useEffect, useState } from 'react';
import notificationManager from '../utils/notifications';

const TyphoonAlertWatcher = () => {
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const initNotifications = async () => {
      try {
        // Check if notifications are supported
        if (!notificationManager.isSupported()) {
          console.log('Push notifications not supported in this browser');
          return;
        }

        // Request notification permission if not already granted
        if (Notification.permission !== 'granted') {
          const permission = await notificationManager.requestPermission();
          if (!permission) {
            console.log('Notification permission not granted');
            return;
          }
        }

        // Subscribe to push notifications
        if (!await notificationManager.isSubscribed()) {
          const subscription = await notificationManager.subscribe();
          if (subscription) {
            await notificationManager.sendSubscriptionToServer(subscription);
            setSubscribed(true);
            console.log('Successfully subscribed to push notifications');
          }
        } else {
          setSubscribed(true);
          console.log('Already subscribed to push notifications');
        }
      } catch (error) {
        console.error('Error initializing notifications:', error);
      }
    };

    initNotifications();

    // Listen for messages from service worker about notifications
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'NOTIFICATION_RECEIVED') {
        console.log('Notification received:', event.data.payload);
      }
    };

    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Cleanup listener
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Function to handle typhoon alert updates
  const handleTyphoonAlert = (typhoonData) => {
    if (subscribed && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'TYPHOON_ALERT',
          data: typhoonData
        });
      });
    }
  };

  // Function to handle signal warning updates
  const handleSignalWarning = (warningData) => {
    if (subscribed && 'serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.active?.postMessage({
          type: 'SIGNAL_WARNING',
          data: warningData
        });
      });
    }
  };

  return null; // This component doesn't render anything
};

export { TyphoonAlertWatcher };