import { render, screen, fireEvent } from '@testing-library/react';
import { CreateDeckModal } from '../CreateDeckModal';

describe('CreateDeckModal - Description Input', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render description textarea field', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const descriptionInput = screen.getByLabelText(/description/i);
    expect(descriptionInput).toBeInTheDocument();
    expect(descriptionInput.tagName).toBe('TEXTAREA');
  });

  it('should update description state when typing', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test description' } });
    
    expect(descriptionInput).toHaveValue('Test description');
  });

  it('should show error when description is too long', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const descriptionInput = screen.getByLabelText(/description/i);
    const longDescription = 'a'.repeat(501);
    fireEvent.change(descriptionInput, { target: { value: longDescription } });
    fireEvent.blur(descriptionInput);
    
    expect(screen.getByText(/description must be 500 characters or less/i)).toBeInTheDocument();
  });

  it('should show character count', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const descriptionInput = screen.getByLabelText(/description/i);
    fireEvent.change(descriptionInput, { target: { value: 'Test' } });
    
    expect(screen.getByText('4/500')).toBeInTheDocument();
  });
});
