import { render, screen } from '@testing-library/react';
import { OfflineIndicator } from '@/components/common/OfflineIndicator';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';

// Mock the useNetworkStatus hook
jest.mock('@/hooks/useNetworkStatus');
const mockUseNetworkStatus = useNetworkStatus as jest.MockedFunction<typeof useNetworkStatus>;

describe('OfflineIndicator', () => {
  it('should not render when online', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: true,
      isOffline: false,
    });

    render(<OfflineIndicator />);
    
    expect(screen.queryByText('You are offline')).not.toBeInTheDocument();
  });

  it('should render offline message when offline', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
    });

    render(<OfflineIndicator />);
    
    expect(screen.getByText('You are offline')).toBeInTheDocument();
    expect(screen.getByText('Your data will be saved locally and synced when you reconnect.')).toBeInTheDocument();
  });

  it('should have proper styling when offline', () => {
    mockUseNetworkStatus.mockReturnValue({
      isOnline: false,
      isOffline: true,
    });

    render(<OfflineIndicator />);
    
    const indicator = screen.getByRole('alert');
    expect(indicator).toHaveClass('bg-yellow-50');
    expect(indicator).toHaveClass('border-yellow-200');
  });
});
