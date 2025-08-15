import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateDeckModal } from '../CreateDeckModal';

describe('CreateDeckModal - Submit', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render create and cancel buttons', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    expect(screen.getByRole('button', { name: /create/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should call onCreate when form is submitted with valid data', async () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    const descriptionInput = screen.getByLabelText(/description/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Deck' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('Test Deck', 'Test Description');
    });
  });

  it('should call onCreate with only name when description is empty', async () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Deck' } });
    fireEvent.click(createButton);
    
    await waitFor(() => {
      expect(mockOnCreate).toHaveBeenCalledWith('Test Deck', '');
    });
  });

  it('should not submit when name is empty', async () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const createButton = screen.getByRole('button', { name: /create/i });
    fireEvent.click(createButton);
    
    expect(screen.getByText(/deck name is required/i)).toBeInTheDocument();
    expect(mockOnCreate).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', async () => {
    const slowOnCreate = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={slowOnCreate} 
      />
    );
    
    const nameInput = screen.getByLabelText(/deck name/i);
    const createButton = screen.getByRole('button', { name: /create/i });
    
    fireEvent.change(nameInput, { target: { value: 'Test Deck' } });
    fireEvent.click(createButton);
    
    expect(screen.getByText(/creating/i)).toBeInTheDocument();
    expect(createButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.queryByText(/creating/i)).not.toBeInTheDocument();
    });
  });

  it('should call onClose when cancel button clicked', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
