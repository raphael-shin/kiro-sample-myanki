import { render, screen, fireEvent } from '@testing-library/react';
import { CardPreview } from '../CardPreview';

describe('CardPreview Component', () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should display front and back content', () => {
    render(
      <CardPreview 
        front="Test front content"
        back="Test back content"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText('Test front content')).toBeInTheDocument();
    expect(screen.getByText('Test back content')).toBeInTheDocument();
  });

  it('should show placeholder when content is empty', () => {
    render(
      <CardPreview 
        front=""
        back=""
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByText(/enter front content/i)).toBeInTheDocument();
    expect(screen.getByText(/enter back content/i)).toBeInTheDocument();
  });

  it('should render edit and delete buttons', () => {
    render(
      <CardPreview 
        front="Test front"
        back="Test back"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });

  it('should call onEdit when edit button clicked', () => {
    render(
      <CardPreview 
        front="Test front"
        back="Test back"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    fireEvent.click(editButton);
    
    expect(mockOnEdit).toHaveBeenCalledTimes(1);
  });

  it('should call onDelete when delete button clicked', () => {
    render(
      <CardPreview 
        front="Test front"
        back="Test back"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const deleteButton = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteButton);
    
    expect(mockOnDelete).toHaveBeenCalledTimes(1);
  });

  it('should not render buttons when handlers not provided', () => {
    render(
      <CardPreview 
        front="Test front"
        back="Test back"
      />
    );
    
    expect(screen.queryByRole('button', { name: /edit/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
  });

  it('should truncate long content', () => {
    const longContent = 'a'.repeat(200);
    
    render(
      <CardPreview 
        front={longContent}
        back="Test back"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const frontElement = screen.getByText(/aaa/);
    expect(frontElement.textContent).toHaveLength(103); // 100 chars + "..."
  });

  it('should have proper card styling', () => {
    render(
      <CardPreview 
        front="Test front"
        back="Test back"
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );
    
    const cardElement = screen.getByTestId('card-preview');
    expect(cardElement).toHaveClass('border', 'rounded-lg', 'bg-white');
  });
});
