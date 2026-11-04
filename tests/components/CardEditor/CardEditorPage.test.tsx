import { render, screen } from '@testing-library/react';
import { CardEditorPage } from '@/features/flashcard/components/CardEditor/CardEditorPage';

// Mock the store
jest.mock('@/store/DeckStore', () => ({
  useDeckStore: () => ({
    currentDeck: { id: 1, name: '테스트 덱', description: '테스트용 덱' },
    selectDeck: jest.fn()
  })
}));

// The page loads its cards and AI history through these services.
// Plain classes (not jest.fn implementations) so `restoreMocks` does not wipe them.
const mockGetCardsByDeckId = jest.fn();
jest.mock('@/services/CardService', () => ({
  CardService: class {
    getCardsByDeckId(deckId: number) {
      return mockGetCardsByDeckId(deckId);
    }
  }
}));
jest.mock('@/services/AICardGenerationService', () => ({
  AICardGenerationService: class {
    getGenerationHistory() {
      return Promise.resolve([]);
    }
  }
}));

describe('CardEditorPage', () => {
  beforeEach(() => {
    mockGetCardsByDeckId.mockResolvedValue([
      { id: 1, deckId: 1, front: '앞면 1', back: '뒷면 1', createdAt: new Date(), updatedAt: new Date() }
    ]);
  });

  it('should render CardEditor page with CardForm and CardList', async () => {
    render(<CardEditorPage deckId={1} deckName="테스트 덱" onBack={jest.fn()} />);
    
    // Header shows the deck being edited, then the toolbar and the card list
    expect(await screen.findByRole('heading', { name: '테스트 덱' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('카드 검색...')).toBeInTheDocument();
    // The list is filled by a follow-up effect after loading ends, so wait for it
    expect(await screen.findByText('앞면 1')).toBeInTheDocument();
    expect(mockGetCardsByDeckId).toHaveBeenCalledWith(1);
  });
});
