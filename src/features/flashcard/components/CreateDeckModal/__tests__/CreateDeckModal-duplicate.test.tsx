import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDeckModal } from '../CreateDeckModal';

describe('CreateDeckModal - Duplicate Name Validation', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error when deck name already exists', async () => {
    const existingDecks = ['Existing Deck', 'Another Deck'];
    
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate}
        existingDeckNames={existingDecks}
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: 'Existing Deck' } });
    fireEvent.blur(nameInput);
    
    expect(screen.getByText(/deck name already exists/i)).toBeInTheDocument();
  });

  it('should not show error when deck name is unique', async () => {
    const existingDecks = ['Existing Deck', 'Another Deck'];
    
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate}
        existingDeckNames={existingDecks}
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: 'New Unique Deck' } });
    fireEvent.blur(nameInput);
    
    expect(screen.queryByText(/deck name already exists/i)).not.toBeInTheDocument();
  });

  it('should prevent submission when deck name is duplicate', async () => {
    const existingDecks = ['Existing Deck'];
    
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate}
        existingDeckNames={existingDecks}
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(nameInput, { target: { value: 'Existing Deck' } });
    fireEvent.click(createButton);
    
    expect(screen.getByText(/deck name already exists/i)).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('should be case insensitive for duplicate check', async () => {
    const existingDecks = ['Existing Deck'];
    
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate}
        existingDeckNames={existingDecks}
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: 'EXISTING DECK' } });
    fireEvent.blur(nameInput);
    
    expect(screen.getByText(/deck name already exists/i)).toBeInTheDocument();
  });

  it('should work without existingDeckNames prop', async () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate}
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: 'Any Name' } });
    fireEvent.blur(nameInput);
    
    expect(screen.queryByText(/deck name already exists/i)).not.toBeInTheDocument();
  });
});
