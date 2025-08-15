import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardForm } from '../CardForm';

describe('CardForm - Save Functionality', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading state during save', async () => {
    const slowOnSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <CardForm 
        onSave={slowOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(frontInput, { target: { value: 'Test front' } });
    fireEvent.change(backInput, { target: { value: 'Test back' } });
    fireEvent.click(saveButton);
    
    expect(screen.getByText(/saving/i)).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    
    await waitFor(() => {
      expect(screen.queryByText(/saving/i)).not.toBeInTheDocument();
    });
  });

  it('should disable inputs during save', async () => {
    const slowOnSave = jest.fn(() => new Promise(resolve => setTimeout(resolve, 50)));
    
    render(
      <CardForm 
        onSave={slowOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(frontInput, { target: { value: 'Test front' } });
    fireEvent.change(backInput, { target: { value: 'Test back' } });
    fireEvent.click(saveButton);
    
    expect(frontInput).toBeDisabled();
    expect(backInput).toBeDisabled();
    
    await waitFor(() => {
      expect(frontInput).not.toBeDisabled();
      expect(backInput).not.toBeDisabled();
    });
  });

  it('should handle save errors gracefully', async () => {
    const errorOnSave = jest.fn(() => Promise.reject(new Error('Save failed')));
    
    render(
      <CardForm 
        onSave={errorOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(frontInput, { target: { value: 'Test front' } });
    fireEvent.change(backInput, { target: { value: 'Test back' } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to save card/i)).toBeInTheDocument();
    });
    
    expect(saveButton).not.toBeDisabled();
  });

  it('should call onSave with trimmed values', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    const saveButton = screen.getByRole('button', { name: /save/i });
    
    fireEvent.change(frontInput, { target: { value: '  Test front  ' } });
    fireEvent.change(backInput, { target: { value: '  Test back  ' } });
    fireEvent.click(saveButton);
    
    expect(mockOnSave).toHaveBeenCalledWith('Test front', 'Test back');
  });
});
