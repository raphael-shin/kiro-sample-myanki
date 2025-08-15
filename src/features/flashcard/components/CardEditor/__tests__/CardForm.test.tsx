import { render, screen } from '@testing-library/react';
import { CardForm } from '../CardForm';

describe('CardForm Component', () => {
  const mockOnSave = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render front and back input fields', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByLabelText(/front/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/back/i)).toBeInTheDocument();
  });

  it('should render save and cancel buttons', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('should have proper accessibility attributes', () => {
    render(
      <CardForm 
        onSave={mockOnSave} 
        onCancel={mockOnCancel} 
      />
    );
    
    const frontInput = screen.getByLabelText(/front/i);
    const backInput = screen.getByLabelText(/back/i);
    
    expect(frontInput).toHaveAttribute('type', 'text');
    expect(backInput).toHaveAttribute('type', 'text');
    expect(frontInput).toHaveAttribute('id');
    expect(backInput).toHaveAttribute('id');
  });
});
