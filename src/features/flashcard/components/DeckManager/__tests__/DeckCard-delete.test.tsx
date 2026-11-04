import { render, screen, fireEvent } from '@testing-library/react';
import { DeckCard } from '../DeckCard';
import { Deck } from '../../../../../types/flashcard';

// Deletion is confirmed in DeleteConfirmModal, not window.confirm
const mockConfirm = jest.fn();
Object.defineProperty(window, 'confirm', {
  writable: true,
  value: mockConfirm,
});

const openDeleteDialog = () => {
  fireEvent.click(screen.getByRole('button', { name: 'More options' }));
  fireEvent.click(screen.getByRole('button', { name: '덱 삭제' }));
};

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
    fireEvent.click(screen.getByRole('button', { name: 'More options' }));
    
    const deleteButton = screen.getByRole('button', { name: '덱 삭제' });
    expect(deleteButton).toBeInTheDocument();
  });

  it('should not show delete button when no onDelete handler provided', () => {
    render(<DeckCard deck={mockDeck} />);
    
    // No actions at all means no kebab menu and no delete entry
    expect(screen.queryByRole('button', { name: 'More options' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '덱 삭제' })).not.toBeInTheDocument();
  });

  it('should show confirmation dialog when delete button clicked', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    openDeleteDialog();
    
    expect(screen.getByRole('heading', { name: '덱 삭제' })).toBeInTheDocument();
    expect(
      screen.getByText('"Test Deck" 덱을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')
    ).toBeInTheDocument();
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(mockConfirm).not.toHaveBeenCalled();
  });

  it('should call onDelete when user confirms deletion', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    
    expect(mockOnDelete).toHaveBeenCalledWith(mockDeck);
  });

  it('should not call onDelete when user cancels deletion', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole('heading', { name: '덱 삭제' })).not.toBeInTheDocument();
  });

  it('should prevent event propagation when delete button clicked', () => {
    const mockOnSelect = jest.fn();
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onSelect={mockOnSelect} onDelete={mockOnDelete} />);
    openDeleteDialog();
    fireEvent.click(screen.getByRole('button', { name: '삭제' }));
    
    // onSelect should not be called when delete button is clicked
    expect(mockOnSelect).not.toHaveBeenCalled();
    expect(mockOnDelete).toHaveBeenCalledWith(mockDeck);
  });

  it('should have proper accessibility attributes', () => {
    const mockOnDelete = jest.fn();
    
    render(<DeckCard deck={mockDeck} onDelete={mockOnDelete} />);
    
    // The icon-only menu trigger needs an accessible name
    const menuButton = screen.getByRole('button', { name: 'More options' });
    expect(menuButton).toHaveAttribute('aria-label', 'More options');

    // The confirmation names the deck being deleted
    openDeleteDialog();
    expect(screen.getByText(/"Test Deck" 덱을 삭제하시겠습니까/)).toBeInTheDocument();
  });
});
