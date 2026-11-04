import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock IndexedDB
import 'fake-indexeddb/auto';

describe('Full Workflow Integration', () => {
  beforeEach(() => {
    // Reset IndexedDB before each test
    indexedDB = new IDBFactory();
  });

  it('should complete basic workflow: create deck modal opens', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
    });

    // Step 1: Open create deck modal
    const createDeckButton = screen.getByText('새 덱 만들기');
    await user.click(createDeckButton);

    // Verify modal opened
    await waitFor(() => {
      expect(screen.getByText('Create New Deck')).toBeInTheDocument();
    });

    // Fill deck creation form (using actual labels)
    const nameInput = screen.getByLabelText('Deck Name');
    const descriptionInput = screen.getByLabelText('Description (Optional)');
    
    await user.type(nameInput, '테스트 덱');
    await user.type(descriptionInput, '통합 테스트용 덱');

    // Verify form inputs work
    expect(nameInput).toHaveValue('테스트 덱');
    expect(descriptionInput).toHaveValue('통합 테스트용 덱');

    // Close modal
    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    // Verify modal closed
    await waitFor(() => {
      expect(screen.queryByText('Create New Deck')).not.toBeInTheDocument();
    });
  });

  it('should handle navigation between views', async () => {
    render(<App />);

    // Wait for app to load
    await waitFor(() => {
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
    });

    // The top navigation bar (덱 관리/카드 편집/학습 세션) was removed in the deck UI renewal;
    // the app starts on the deck management view and other views are opened from deck cards.
    expect(screen.getByRole('heading', { name: '덱 관리' })).toBeInTheDocument();
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '새 덱 만들기' })).toBeInTheDocument();

    // Verify deck management page content is shown
    expect(await screen.findByText('No decks found. Create your first deck to get started!')).toBeInTheDocument();
  });
});
