"use client";

import { useState, useEffect } from 'react';
import { getManifestData, fallbackManifestData } from '../../../lib/manifest';

interface PWAStatusProps {
  className?: string;
}

export default function PWAStatus({ className = "" }: PWAStatusProps) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [isStandalone, setIsStandalone] = useState(false);
  const [appName, setAppName] = useState(fallbackManifestData.shortName);

  useEffect(() => {
    // Load manifest data for dynamic app name
    getManifestData().then(data => {
      setAppName(data.shortName);
    });

    // Check if app is installed/standalone using modern API
    const checkInstallStatus = () => {
      const standalone = window.matchMedia('(display-mode: standalone)').matches;
      setIsStandalone(standalone);
      setIsInstalled(standalone);
    };

    // Check online status
    const checkOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    // Initial checks
    checkInstallStatus();
    checkOnlineStatus();

    // Listen for changes
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleDisplayModeChange = () => checkInstallStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.matchMedia('(display-mode: standalone)').addEventListener('change', handleDisplayModeChange);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.matchMedia('(display-mode: standalone)').removeEventListener('change', handleDisplayModeChange);
    };
  }, []);

  if (!isInstalled && isOnline) {
    return null; // Don't show anything if not installed and online
  }

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Online/Offline Status */}
        {!isOnline && (
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse"></div>
            Offline
          </div>
        )}

        {/* PWA Status */}
        {isInstalled && (
          <div className="bg-green-100 border border-green-400 text-green-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            {appName}
          </div>
        )}

        {/* Sync Status */}
        {isOnline && isInstalled && (
          <div className="bg-blue-100 border border-blue-400 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Synced
          </div>
        )}
      </div>
    </div>
  );
} 