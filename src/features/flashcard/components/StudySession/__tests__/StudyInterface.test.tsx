import { render, screen, fireEvent } from '@testing-library/react';
import { StudyInterface } from '../StudyInterface';
import { Card } from '../../../../types/flashcard';

describe('StudyInterface Component', () => {
  const mockCards: Card[] = [
    { id: 1, deckId: 1, front: 'Front 1', back: 'Back 1', createdAt: new Date(), updatedAt: new Date() },
    { id: 2, deckId: 1, front: 'Front 2', back: 'Back 2', createdAt: new Date(), updatedAt: new Date() },
  ];

  const mockOnComplete = jest.fn();
  const mockOnExit = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render study interface with current card', () => {
    render(
      <StudyInterface 
        cards={mockCards}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    expect(screen.getByText('Front 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
  });

  it('should show answer when show answer button clicked', () => {
    render(
      <StudyInterface 
        cards={mockCards}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    const showAnswerButton = screen.getByRole('button', { name: /show answer/i });
    fireEvent.click(showAnswerButton);
    
    expect(screen.getByText('Back 1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /hard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /good/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /easy/i })).toBeInTheDocument();
  });

  it('should progress to next card when answer button clicked', () => {
    render(
      <StudyInterface 
        cards={mockCards}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    // Show answer first
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    
    // Click good button
    fireEvent.click(screen.getByRole('button', { name: /good/i }));
    
    // Should show next card
    expect(screen.getByText('Front 2')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /show answer/i })).toBeInTheDocument();
  });

  it('should call onComplete when all cards are finished', () => {
    render(
      <StudyInterface 
        cards={[mockCards[0]]} // Only one card
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    // Show answer and click good
    fireEvent.click(screen.getByRole('button', { name: /show answer/i }));
    fireEvent.click(screen.getByRole('button', { name: /good/i }));
    
    expect(mockOnComplete).toHaveBeenCalledTimes(1);
  });

  it('should call onExit when exit button clicked', () => {
    render(
      <StudyInterface 
        cards={mockCards}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    const exitButton = screen.getByRole('button', { name: /exit/i });
    fireEvent.click(exitButton);
    
    expect(mockOnExit).toHaveBeenCalledTimes(1);
  });

  it('should show progress information', () => {
    render(
      <StudyInterface 
        cards={mockCards}
        onComplete={mockOnComplete}
        onExit={mockOnExit}
      />
    );
    
    expect(screen.getByText('1 / 2')).toBeInTheDocument();
  });
});
