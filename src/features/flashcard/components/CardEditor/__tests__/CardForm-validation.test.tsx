import { render, screen, fireEvent } from '@testing-library/react';
import { CardForm } from '../CardForm';

describe('CardForm - Validation', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show error when front content is empty', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    fireEvent.change(frontInput, { target: { value: '' } });
    fireEvent.blur(frontInput);
    
    expect(screen.getByText(/front content is required/i)).toBeInTheDocument();
  });

  it('should show error when back content is empty', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const backInput = screen.getByLabelText(/back/i);
    fireEvent.change(backInput, { target: { value: '' } });
    fireEvent.blur(backInput);
    
    expect(screen.getByText(/back content is required/i)).toBeInTheDocument();
  });

  it('should show error when front content is too long', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const longContent = 'a'.repeat(1001);
    fireEvent.change(frontInput, { target: { value: longContent } });
    fireEvent.blur(frontInput);
    
    expect(screen.getByText(/front content must be 1000 characters or less/i)).toBeInTheDocument();
  });

  it('should show error when back content is too long', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const backInput = screen.getByLabelText(/back/i);
    const longContent = 'a'.repeat(1001);
    fireEvent.change(backInput, { target: { value: longContent } });
    fireEvent.blur(backInput);
    
    expect(screen.getByText(/back content must be 1000 characters or less/i)).toBeInTheDocument();
  });

  it('should not submit when validation fails', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    fireEvent.click(saveButton);
    
    expect(screen.getByText(/front content is required/i)).toBeInTheDocument();
    expect(screen.getByText(/back content is required/i)).toBeInTheDocument();
    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should clear error when valid content is entered', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    
    // Trigger error
    fireEvent.change(frontInput, { target: { value: '' } });
    fireEvent.blur(frontInput);
    expect(screen.getByText(/front content is required/i)).toBeInTheDocument();
    
    // Clear error
    fireEvent.change(frontInput, { target: { value: 'Valid content' } });
    expect(screen.queryByText(/front content is required/i)).not.toBeInTheDocument();
  });
});
