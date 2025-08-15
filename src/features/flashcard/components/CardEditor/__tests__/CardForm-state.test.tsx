import { render, screen, fireEvent } from '@testing-library/react';
import { CardForm } from '../CardForm';

describe('CardForm - State Management', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update front input value when typing', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    fireEvent.change(frontInput, { target: { value: 'Front content' } });
    
    expect(frontInput).toHaveValue('Front content');
  });

  it('should update back input value when typing', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const backInput = screen.getByLabelText(/back/i);
    fireEvent.change(backInput, { target: { value: 'Back content' } });
    
    expect(backInput).toHaveValue('Back content');
  });

  it('should initialize with provided initial values', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel}
        initialFront="Initial front"
        initialBack="Initial back"
      />
    );
    
    expect(screen.getByLabelText(/front/i)).toHaveValue('Initial front');
    expect(screen.getByLabelText(/back/i)).toHaveValue('Initial back');
  });

  it('should call onSave with current input values', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(frontInput, { target: { value: 'Test front' } });
    fireEvent.change(backInput, { target: { value: 'Test back' } });
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith('Test front', 'Test back');
  });

  it('should call onCancel when cancel button clicked', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });
});
