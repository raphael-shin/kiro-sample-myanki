import { render, screen, fireEvent } from '@testing-library/react';
import { CardList } from '../CardList';
import { Card } from '../../../../types/flashcard';

describe('CardList Component', () => {
  const mockCards: Card[] = [
    { id: 1, deckId: 1, front: 'Front 1', back: 'Back 1', createdAt: new Date('2023-01-01'), updatedAt: new Date('2023-01-01') },
    { id: 2, deckId: 1, front: 'Front 2', back: 'Back 2', createdAt: new Date('2023-01-02'), updatedAt: new Date('2023-01-02') },
  ];

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render list of cards', () => {
    render(
      <CardList 
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Front 1')).toBeInTheDocument();
    expect(screen.getByText('Back 1')).toBeInTheDocument();
    expect(screen.getByText('Front 2')).toBeInTheDocument();
    expect(screen.getByText('Back 2')).toBeInTheDocument();
  });

  it('should show empty state when no cards', () => {
    render(
      <CardList 
        cards={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/no cards found/i)).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <CardList 
        cards={[]}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        isLoading={true}
      />
    );
    
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    render(
      <CardList 
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockCards[0]);
  });

  it('should call onDelete when delete button clicked', () => {
    render(
      <CardList 
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockCards[0]);
  });

  it('should display cards in grid layout', () => {
    render(
      <CardList 
        cards={mockCards}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const cardList = screen.getByTestId('card-list');
    expect(cardList).toHaveClass('grid');
  });
});
