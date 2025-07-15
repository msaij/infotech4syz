"use client";

import { useState, useEffect } from 'react';
import { getManifestData, fallbackManifestData } from '../../../lib/manifest';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [appName, setAppName] = useState(fallbackManifestData.shortName);

  useEffect(() => {
    // Load manifest data for dynamic app name
    getManifestData().then(data => {
      setAppName(data.shortName);
    });

    // Check if app is already installed using modern API
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Check user preferences and timing
    const checkUserPreferences = () => {
      const lastPromptTime = localStorage.getItem('pwa-prompt-time');
      const promptCount = parseInt(localStorage.getItem('pwa-prompt-count') || '0');
      const userDismissed = localStorage.getItem('pwa-prompt-dismissed') === 'true';
      
      // Don't show if user dismissed permanently
      if (userDismissed) return false;
      
      // Don't show if prompted too recently (24 hours)
      if (lastPromptTime) {
        const timeSinceLastPrompt = Date.now() - parseInt(lastPromptTime);
        if (timeSinceLastPrompt < 24 * 60 * 60 * 1000) return false;
      }
      
      // Don't show if prompted too many times (3 times)
      if (promptCount >= 3) return false;
      
      // Don't show immediately - wait for user engagement using modern API
      const timeOnPage = Date.now() - performance.timeOrigin;
      if (timeOnPage < 30 * 1000) return false; // Wait 30 seconds
      
      return true;
    };

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Only show if conditions are met
      if (checkUserPreferences()) {
        setShowInstallPrompt(true);
        
        // Update prompt count and time
        const currentCount = parseInt(localStorage.getItem('pwa-prompt-count') || '0');
        localStorage.setItem('pwa-prompt-count', (currentCount + 1).toString());
        localStorage.setItem('pwa-prompt-time', Date.now().toString());
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      // Clear prompt data on successful install
      localStorage.removeItem('pwa-prompt-count');
      localStorage.removeItem('pwa-prompt-time');
      localStorage.removeItem('pwa-prompt-dismissed');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    
    setDeferredPrompt(null);
    setShowInstallPrompt(false);
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismissPermanently = () => {
    setShowInstallPrompt(false);
    setDeferredPrompt(null);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (isInstalled || !showInstallPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 z-50">
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900">
              Install {appName}
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Install our app for a better experience and offline access.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="mt-4 flex space-x-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-blue-500 text-white text-sm font-medium py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            Install
          </button>
          <button
            onClick={handleDismiss}
            className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Not now
          </button>
        </div>
        <div className="mt-2 text-center">
          <button
            onClick={handleDismissPermanently}
            className="text-xs text-gray-400 hover:text-gray-600 underline"
          >
            Do not show again
          </button>
        </div>
      </div>
    </div>
  );
} 