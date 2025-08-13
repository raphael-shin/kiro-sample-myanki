import { useEffect } from 'react';
import { useAppStore, selectTheme, selectIsLoading, selectThemeActions, selectLoadingActions } from './store/appStore';
import { Button } from './components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent } from './components/ui/Card';
import { ThemeToggle } from './components/common/ThemeToggle';
import { LoadingSpinner } from './components/common/LoadingSpinner';

function App() {
  // Zustand state management integration
  const theme = useAppStore(selectTheme);
  const isLoading = useAppStore(selectIsLoading);
  const { toggleTheme } = useAppStore(selectThemeActions);
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

  // Simulate loading state for demonstration
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, [setLoading]);

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
      {/* Header with theme toggle */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-primary-600 dark:text-primary-400">
            MyAnki
          </h1>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        <Card variant="elevated" padding="lg" className="max-w-2xl mx-auto animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl text-primary-600 dark:text-primary-400">
              환영합니다!
            </CardTitle>
            <p className="text-lg text-secondary-600 dark:text-secondary-300">
              모든 기술 스택이 성공적으로 통합되었습니다.
            </p>
          </CardHeader>
          <CardContent>
          
          {/* Technology stack integration demonstration */}
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                variant="primary"
                onClick={() => {
                  setLoading(true);
                  setTimeout(() => setLoading(false), 1000);
                }}
              >
                Zustand 테스트
              </Button>
              <Button 
                variant="secondary"
                onClick={toggleTheme}
              >
                테마 변경
              </Button>
            </div>

            {/* Current state display */}
            <div className="p-4 bg-secondary-50 dark:bg-secondary-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-secondary-700 dark:text-secondary-300 mb-3">
                현재 상태:
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">테마:</span>
                  <span className="font-medium text-secondary-800 dark:text-secondary-200">
                    {theme === 'light' ? '라이트 모드' : '다크 모드'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary-600 dark:text-secondary-400">로딩 상태:</span>
                  <span className="font-medium text-secondary-800 dark:text-secondary-200">
                    {isLoading ? '로딩 중' : '완료'}
                  </span>
                </div>
              </div>
            </div>

            {/* Technology stack status */}
            <div className="p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <h3 className="text-lg font-semibold text-primary-700 dark:text-primary-300 mb-3">
                통합 완료된 기술 스택:
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { name: 'React 18 + TypeScript', status: 'completed' },
                  { name: 'Vite 빌드 도구', status: 'completed' },
                  { name: 'Tailwind CSS', status: 'completed' },
                  { name: 'Zustand 상태 관리', status: 'completed' },
                  { name: 'Dexie.js 데이터베이스', status: 'completed' },
                  { name: 'Jest 테스팅 환경', status: 'completed' },
                ].map((tech, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-secondary-700 dark:text-secondary-300">
                      {tech.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 text-center text-secondary-500 dark:text-secondary-400">
        <p className="text-sm">
          MyAnki - 간격 반복 학습 애플리케이션
        </p>
      </footer>
    </div>
  );
}

export default App;