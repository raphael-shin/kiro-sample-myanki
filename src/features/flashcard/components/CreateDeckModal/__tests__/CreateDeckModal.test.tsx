import { render, screen, fireEvent } from '@testing-library/react';
import { CreateDeckModal } from '../CreateDeckModal';

describe('CreateDeckModal Component', () => {
  const mockOnClose = jest.fn();
  const mockOnCreate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render modal when isOpen is true', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Create New Deck')).toBeInTheDocument();
  });

  it('should not render modal when isOpen is false', () => {
    render(
      <CreateDeckModal 
        isOpen={false} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should call onClose when close button clicked', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should call onClose when overlay clicked', () => {
    render(
      <CreateDeckModal 
        isOpen={true} 
        onClose={mockOnClose} 
        onCreate={mockOnCreate} 
      />
    );
    
    const overlay = screen.getByTestId('modal-overlay');
    fireEvent.click(overlay);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });
});
