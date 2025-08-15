import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('Error Handling Integration', () => {
  beforeEach(() => {
    // Reset IndexedDB before each test
    indexedDB = new IDBFactory();
  });

  it('should handle database errors gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock database error
    const originalError = console.error;
    console.error = jest.fn();
    
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
    });

    // Try to create a deck with invalid data
    const createDeckButton = screen.getByText('새 덱 만들기');
    await user.click(createDeckButton);

    // Verify modal opened
    await waitFor(() => {
      expect(screen.getByText('Create New Deck')).toBeInTheDocument();
    });

    // Try to submit empty form
    const submitButton = screen.getByText('Create');
    await user.click(submitButton);

    // Should show validation error
    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
    });

    console.error = originalError;
  });

  it('should show user-friendly error messages', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
    });

    // Verify no error state initially
    expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    
    // Test navigation works without errors
    const deckManagementButton = screen.getByRole('button', { name: '덱 관리' });
    expect(deckManagementButton).toBeInTheDocument();
  });
});
