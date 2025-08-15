import { useNetworkStatus } from '@/hooks/useNetworkStatus';

export function OfflineIndicator() {
  const { isOffline } = useNetworkStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div 
      role="alert"
      className="fixed top-0 left-0 right-0 z-50 bg-yellow-50 border-b border-yellow-200 px-4 py-2"
    >
      <div className="flex items-center justify-center text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
          <span className="font-medium text-yellow-800">You are offline</span>
        </div>
        <span className="ml-2 text-yellow-700">
          Your data will be saved locally and synced when you reconnect.
        </span>
      </div>
    </div>
  );
}
