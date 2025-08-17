import { render, screen, fireEvent } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

describe('DeckCard Component - Action Buttons', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  it('should render Edit button when onEdit is provided', () => {
    const mockOnEdit = jest.fn();
    
    render(<DeckCard deck={mockDeck} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
  });

  it('should render Study button when onStudy is provided', () => {
    const mockOnStudy = jest.fn();
    
    render(<DeckCard deck={mockDeck} onStudy={mockOnStudy} />);
    
    const studyButton = screen.getByRole('button', { name: /study/i });
    expect(studyButton).toBeInTheDocument();
  });

  it('should call onEdit when Edit button is clicked', () => {
    const mockOnEdit = jest.fn();
    
    render(<DeckCard deck={mockDeck} onEdit={mockOnEdit} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockDeck);
  });

  it('should call onStudy when Study button is clicked', () => {
    const mockOnStudy = jest.fn();
    
    render(<DeckCard deck={mockDeck} onStudy={mockOnStudy} />);
    
    const studyButton = screen.getByRole('button', { name: /study/i });
    fireEvent.click(studyButton);
    
    expect(mockOnStudy).toHaveBeenCalledWith(mockDeck);
  });

  it('should render all action buttons when all handlers are provided', () => {
    const mockOnEdit = jest.fn();
    const mockOnStudy = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(
      <DeckCard 
        deck={mockDeck} 
        onEdit={mockOnEdit}
        onStudy={mockOnStudy}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /study/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should stop event propagation when action buttons are clicked', () => {
    const mockOnEdit = jest.fn();
    const mockOnSelect = jest.fn();
    
    render(
      <DeckCard 
        deck={mockDeck} 
        onEdit={mockOnEdit}
        onSelect={mockOnSelect}
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockDeck);
    expect(mockOnSelect).not.toHaveBeenCalled();
  });
});
