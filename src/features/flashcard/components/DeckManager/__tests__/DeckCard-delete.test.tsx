import { render, screen, fireEvent } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

// Mock window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

describe('DeckCard Component - Delete', () => {
  const mockDeck: Deck = {
    id: 1,
    name: 'Test Deck',
    description: 'Test Description',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  };

  beforeEach(() => {
    mockConfirm.mockClear();
  });

  it('should show delete button when onDelete handler provided', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not show delete button when no onDelete handler provided', () => {
    render(<DeckCard deck={mockDeck} />);
    
    const deleteButton = screen.queryByRole('button', { name: /delete/i });
    expect(deleteButton).not.toBeInTheDocument();
  });

  it('should show confirmation dialog when delete button clicked', () => {
    const mockOnDelete = jest.fn();
    mockConfirm.mockReturnValue(true);
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockConfirm).toHaveBeenCalledWith(
      expect.stringContaining('Are you sure you want to delete "Test Deck"?')
    );
  });

  it('should call onDelete when user confirms deletion', () => {
    const mockOnDelete = jest.fn();
    mockConfirm.mockReturnValue(true);
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockDeck);
  });

  it('should not call onDelete when user cancels deletion', () => {
    const mockOnDelete = jest.fn();
    mockConfirm.mockReturnValue(false);
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it('should prevent event propagation when delete button clicked', () => {
    const mockOnSelect = jest.fn();
    const mockOnDelete = jest.fn();
    mockConfirm.mockReturnValue(true);
    
    render(<DeckCard deck={mockDeck} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    // onSelect should not be called when delete button is clicked
    expect(mockOnSelect).not.toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(mockDeck);
  });

  it('should have proper accessibility attributes', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    expect(deleteButton).toHaveAttribute('aria-label', expect.stringContaining('Delete Test Deck'));
  });
});
