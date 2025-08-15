import { render, screen, fireEvent } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

describe('DeckCard Component - Selection', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  it('should call onSelect when deck card is clicked', () => {
    const mockOnSelect = jest.fn();
    
    render(<DeckCard deck={mockDeck} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    fireEvent.click(card);
    
    expect(mockOnSelect).toHaveBeenCalledWith(mockDeck);
  });

  it('should not call onSelect when no handler provided', () => {
    render(<DeckCard deck={mockDeck} />);
    
    const card = screen.getByRole('article');
    // Should not throw error when clicked without handler
    expect(() => fireEvent.click(card)).not.toThrow();
  });

  it('should show selected state when isSelected is true', () => {
    render(<DeckCard deck={mockDeck} isSelected={true} />);
    
    const card = screen.getByRole('article');
    expect(card).toHaveClass('ring-2', 'ring-blue-500');
  });

  it('should not show selected state when isSelected is false', () => {
    render(<DeckCard deck={mockDeck} isSelected={false} />);
    
    const card = screen.getByRole('article');
    expect(card).not.toHaveClass('ring-2', 'ring-blue-500');
  });

  it('should be keyboard accessible', () => {
    const mockOnSelect = jest.fn();
    
    render(<DeckCard deck={mockDeck} onSelect={mockOnSelect} />);
    
    const card = screen.getByRole('button');
    expect(card).toBeInTheDocument();
    
    // Test Enter key
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(mockOnSelect).toHaveBeenCalledWith(mockDeck);
    
    // Test Space key
    fireEvent.keyDown(card, { key: ' ' });
    expect(mockOnSelect).toHaveBeenCalledTimes(2);
  });

  it('should have proper ARIA attributes when selectable', () => {
    render(<DeckCard deck={mockDeck} onSelect={jest.fn()} isSelected={true} />);
    
    const card = screen.getByRole('button');
    expect(card).toHaveAttribute('aria-pressed', 'true');
  });
});
