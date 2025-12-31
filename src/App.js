import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
import { HotToaster } from '@/components/ui/toast';
import { AuthProvider } from '@/contexts/AuthContext';
import { TyphoonAlertWatcher } from '@/components/TyphoonAlertWatcher';
import AppContent from './AppContent';

// PWA Installation Handler
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button or UI element to trigger installation
  console.log('PWA installation is available');
});

function App() {
  // Handle messages from service worker
  React.useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type === 'SYNC_COMPLETE') {
        const { synced, failed } = event.data;
        if (synced > 0) {
          toast.success(`Synced ${synced} offline reports successfully!`);
        }
        if (failed > 0) {
          toast.error(`Failed to sync ${failed} reports. They remain in the queue.`);
        }
      }
    };

    // Add message listener
    navigator.serviceWorker.addEventListener('message', handleMessage);

    // Cleanup listener on unmount
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Function to trigger PWA installation
  const triggerPWAInstall = () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(`User response to install: ${choiceResult.outcome}`);
        deferredPrompt = null;
      });
    }
  };

  // Make the install function globally available
  window.triggerPWAInstall = triggerPWAInstall;

  return (
    <BrowserRouter>
        <TyphoonAlertWatcher />
        <Toaster position="top-center" expand={true} richColors />
        <HotToaster position="top-center" />
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;