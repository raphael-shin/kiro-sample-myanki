import { render, screen } from '@testing-library/react';
import { CardEditorPage } from '@/features/flashcard/components/CardEditor/CardEditorPage';

// Mock the store
jest.mock('@/store/DeckStore', () => ({
  useDeckStore: () => ({
    currentDeck: { id: 1, name: '테스트 덱', description: '테스트용 덱' },
    selectDeck: jest.fn()
  })
}));

describe('CardEditorPage', () => {
  it('should render CardEditor page with CardForm and CardList', () => {
    render(<CardEditorPage deckId={1} />);
    
    expect(screen.getByText('카드 편집')).toBeInTheDocument();
  });
});
