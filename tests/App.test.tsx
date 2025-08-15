import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '@/App';

// Mock the stores
jest.mock('@/store/DeckStore', () => ({
  useDeckStore: () => ({
    decks: [],
    currentDeck: null,
    loading: false,
    error: null,
    loadDecks: jest.fn(),
    selectDeck: jest.fn()
  })
}));

jest.mock('@/store/StudySessionStore', () => ({
  useStudySessionStore: () => ({
    currentSession: null,
    startSession: jest.fn()
  })
}));

describe('App', () => {
  it('should render main navigation and default to deck management', async () => {
    render(<App />);
    
    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.getByText('MyAnki')).toBeInTheDocument();
    });
    
    // Check navigation buttons
    expect(screen.getByRole('button', { name: '덱 관리' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '카드 편집' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '학습 세션' })).toBeInTheDocument();
  });
});
