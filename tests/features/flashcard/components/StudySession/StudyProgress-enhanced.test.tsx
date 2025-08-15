import { render, screen } from '@testing-library/react';
import { StudyProgress } from '@/features/flashcard/components/StudySession/StudyProgress';

describe('StudyProgress Enhanced Features', () => {
  describe('Basic Structure', () => {
    it('should render progress bar with correct percentage', () => {
      render(<StudyProgress current={3} total={10} percentage={30} />);
      
      expect(screen.getByText('30%')).toBeInTheDocument();
      expect(screen.getByText('3 / 10')).toBeInTheDocument();
      expect(screen.getByText('진행률')).toBeInTheDocument();
    });

    it('should display progress bar with correct width', () => {
      render(<StudyProgress current={7} total={10} percentage={70} />);
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveStyle('width: 70%');
    });

    it('should handle zero progress correctly', () => {
      render(<StudyProgress current={0} total={10} percentage={0} />);
      
      expect(screen.getByText('0%')).toBeInTheDocument();
      expect(screen.getByText('0 / 10')).toBeInTheDocument();
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveStyle('width: 0%');
    });

    it('should handle complete progress correctly', () => {
      render(<StudyProgress current={10} total={10} percentage={100} />);
      
      expect(screen.getByText('100%')).toBeInTheDocument();
      expect(screen.getByText('10 / 10')).toBeInTheDocument();
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveStyle('width: 100%');
    });

    it('should have proper styling classes', () => {
      render(<StudyProgress current={5} total={10} percentage={50} />);
      
      const container = document.querySelector('.w-full.max-w-md.mx-auto');
      expect(container).toBeInTheDocument();
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveClass('h-2', 'rounded-full', 'transition-all', 'duration-300');
    });
  });

  describe('Time Information Display', () => {
    it('should display elapsed time when provided', () => {
      render(
        <StudyProgress 
          current={5} 
          total={10} 
          percentage={50}
          timeElapsed={120000} // 2 minutes
        />
      );
      
      expect(screen.getByText('Elapsed: 2m 0s')).toBeInTheDocument();
    });

    it('should display estimated time remaining when provided', () => {
      render(
        <StudyProgress 
          current={5} 
          total={10} 
          percentage={50}
          estimatedTimeRemaining={180000} // 3 minutes
        />
      );
      
      expect(screen.getByText('Remaining: ~3m 0s')).toBeInTheDocument();
    });

    it('should display both elapsed and remaining time', () => {
      render(
        <StudyProgress 
          current={3} 
          total={10} 
          percentage={30}
          timeElapsed={90000} // 1.5 minutes
          estimatedTimeRemaining={210000} // 3.5 minutes
        />
      );
      
      expect(screen.getByText('Elapsed: 1m 30s')).toBeInTheDocument();
      expect(screen.getByText('Remaining: ~3m 30s')).toBeInTheDocument();
    });

    it('should format time correctly for various durations', () => {
      const { rerender } = render(
        <StudyProgress 
          current={1} 
          total={10} 
          percentage={10}
          timeElapsed={45000} // 45 seconds
        />
      );
      
      expect(screen.getByText('Elapsed: 0m 45s')).toBeInTheDocument();
      
      rerender(
        <StudyProgress 
          current={1} 
          total={10} 
          percentage={10}
          timeElapsed={3665000} // 1 hour, 1 minute, 5 seconds
        />
      );
      
      expect(screen.getByText('Elapsed: 1h 1m 5s')).toBeInTheDocument();
    });

    it('should handle zero time values', () => {
      render(
        <StudyProgress 
          current={0} 
          total={10} 
          percentage={0}
          timeElapsed={0}
          estimatedTimeRemaining={0}
        />
      );
      
      expect(screen.getByText('Elapsed: 0m 0s')).toBeInTheDocument();
      expect(screen.getByText('Remaining: ~0m 0s')).toBeInTheDocument();
    });
  });

  describe('Visual Enhancements', () => {
    it('should have smooth transition animation', () => {
      render(<StudyProgress current={5} total={10} percentage={50} />);
      
      const progressBar = document.querySelector('.bg-blue-600');
      expect(progressBar).toHaveClass('transition-all', 'duration-300');
    });

    it('should support dark mode styling', () => {
      render(<StudyProgress current={5} total={10} percentage={50} />);
      
      const progressBackground = document.querySelector('.bg-gray-200');
      expect(progressBackground).toHaveClass('dark:bg-gray-700');
      
      const labels = screen.getAllByText(/진행률|5 \/ 10/);
      labels.forEach(label => {
        expect(label).toHaveClass('dark:text-gray-300');
      });
    });

    it('should have responsive design', () => {
      render(<StudyProgress current={5} total={10} percentage={50} />);
      
      const container = document.querySelector('.w-full.max-w-md.mx-auto');
      expect(container).toBeInTheDocument();
    });
  });
});
