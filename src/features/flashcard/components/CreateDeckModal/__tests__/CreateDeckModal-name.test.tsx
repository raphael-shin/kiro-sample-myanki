import { render, screen, fireEvent } from '@testing-library/react';
import { CreateDeckModal } from '../CreateDeckModal';

describe('CreateDeckModal - Name Input', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render name input field', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    expect(nameInput).toBeInTheDocument();
    expect(nameInput).toHaveAttribute('type', 'text');
  });

  it('should update name state when typing', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: 'Test Deck' } });
    
    expect(nameInput).toHaveValue('Test Deck');
  });

  it('should show error when name is empty', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    fireEvent.change(nameInput, { target: { value: '' } });
    fireEvent.blur(nameInput);
    
    expect(screen.getByText(/deck name is required/i)).toBeInTheDocument();
  });

  it('should show error when name is too long', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    const longName = 'a'.repeat(101);
    fireEvent.change(nameInput, { target: { value: longName } });
    fireEvent.blur(nameInput);
    
    expect(screen.getByText(/deck name must be 100 characters or less/i)).toBeInTheDocument();
  });
});
