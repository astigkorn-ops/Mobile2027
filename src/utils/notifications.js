// Notification utility for handling push notifications

class NotificationManager {
  constructor() {
    this.publicKey = process.env.REACT_APP_VAPID_PUBLIC_KEY;
    this.subscription = null;
  }

  // Check if notifications are supported
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check if notifications are enabled
  isEnabled() {
    return Notification.permission === 'granted';
  }

  // Request notification permission
  async requestPermission() {
    if (!this.isSupported()) {
      throw new Error('Push notifications are not supported in this browser');
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  // Subscribe to push notifications
  async subscribe() {
    if (!this.isEnabled()) {
      throw new Error('Notifications are not enabled');
    }

    const registration = await navigator.serviceWorker.ready;
    
    // Get the VAPID public key
    if (!this.publicKey) {
      console.warn('VAPID public key not found. Push notifications may not work properly.');
      // For development, we can use a mock subscription
      return null;
    }

    try {
      // Get the push subscription
      this.subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.publicKey)
      });

      return this.subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      this.subscription = null;
      return true;
    }

    return false;
  }

  // Convert VAPID public key from base64 to Uint8Array
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Get current subscription
  async getSubscription() {
    if (this.subscription) {
      return this.subscription;
    }

    const registration = await navigator.serviceWorker.ready;
    return registration.pushManager.getSubscription();
  }

  // Send subscription to server (placeholder implementation)
  async sendSubscriptionToServer(subscription) {
    // This would be implemented to send the subscription to your backend
    // For now, we'll just log it
    console.log('Sending subscription to server:', subscription);
    
    // Example implementation:
    /*
    try {
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send subscription to server');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error sending subscription to server:', error);
      throw error;
    }
    */
  }
  
  // Check if subscribed to push notifications
  async isSubscribed() {
    const subscription = await this.getSubscription();
    return !!subscription;
  }
}

// Export singleton instance
const notificationManager = new NotificationManager();
export default notificationManager;