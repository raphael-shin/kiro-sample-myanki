import { useState, useEffect } from 'react';
import { useAppStore, selectTheme, selectIsLoading, selectThemeActions, selectLoadingActions } from './store/appStore';
import { ThemeToggle } from './components/common/ThemeToggle';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { OfflineIndicator } from './components/common/OfflineIndicator';
import { Card } from './components/ui/Card';
import { DeckManagerPage } from './features/flashcard/components/DeckManager/DeckManagerPage';
import { CardEditorPage } from './features/flashcard/components/CardEditor/CardEditorPage';
import { StudyInterface } from './features/flashcard/components/StudySession/StudyInterface';

type AppView = 'deck-management' | 'card-editor' | 'study-session';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('deck-management');
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  
  // Zustand state management integration
  const theme = useAppStore(selectTheme);
  const isLoading = useAppStore(selectIsLoading);
  const { setLoading } = useAppStore(selectLoadingActions);

  // Apply theme to document root for proper dark mode support
  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  // Initialize app - remove loading simulation
  useEffect(() => {
    // App is ready immediately
    setLoading(false);
  }, [setLoading]);

  const handleDeckSelect = (deckId: number) => {
    setSelectedDeckId(deckId);
    setCurrentView('card-editor');
  };

  const handleStartStudy = (deckId: number) => {
    setSelectedDeckId(deckId);
    setCurrentView('study-session');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <Card padding="lg" variant="elevated">
          <LoadingSpinner size="lg" text="MyAnki 로딩 중..." />
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Header with navigation */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              MyAnki
            </h1>
            <ThemeToggle />
          </div>
          
          {/* Navigation */}
          <nav className="mt-4">
            <div className="flex space-x-4">
              <button
                onClick={() => setCurrentView('deck-management')}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'deck-management'
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                덱 관리
              </button>
              <button
                onClick={() => selectedDeckId && setCurrentView('card-editor')}
                disabled={!selectedDeckId}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'card-editor'
                    ? 'bg-primary-600 text-white'
                    : selectedDeckId
                    ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                카드 편집
              </button>
              <button
                onClick={() => selectedDeckId && setCurrentView('study-session')}
                disabled={!selectedDeckId}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  currentView === 'study-session'
                    ? 'bg-primary-600 text-white'
                    : selectedDeckId
                    ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    : 'text-gray-400 cursor-not-allowed'
                }`}
              >
                학습 세션
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">
        {currentView === 'deck-management' && (
          <DeckManagerPage onDeckSelect={handleDeckSelect} />
        )}
        {currentView === 'card-editor' && selectedDeckId && (
          <CardEditorPage 
            deckId={selectedDeckId} 
            onBack={() => setCurrentView('deck-management')}
          />
        )}
        {currentView === 'study-session' && selectedDeckId && (
          <StudyInterface 
            deckId={selectedDeckId}
            onComplete={() => setCurrentView('deck-management')}
          />
        )}
      </main>
    </div>
  );
}

export default App;