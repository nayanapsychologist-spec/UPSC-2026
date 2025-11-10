import React, { useState, useEffect } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import PrelimsPrep from './components/PrelimsPrep';
import MainsPrep from './components/MainsPrep';
import Header from './components/Header';
import MainsNoteMaker from './components/MainsNoteMaker';

type Screen = 'welcome' | 'prelims' | 'mains' | 'noteMaker';
type Theme = 'light' | 'dark';

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
      setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'prelims':
        return <PrelimsPrep onBack={() => setCurrentScreen('welcome')} />;
      case 'mains':
        return <MainsPrep onBack={() => setCurrentScreen('welcome')} onStartNoteMaker={() => setCurrentScreen('noteMaker')} />;
      case 'noteMaker':
        return <MainsNoteMaker onBack={() => setCurrentScreen('mains')} />;
      case 'welcome':
      default:
        return (
          <WelcomeScreen
            onSelectPrelims={() => setCurrentScreen('prelims')}
            onSelectMains={() => setCurrentScreen('mains')}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto p-4 md:p-8">
        {renderScreen()}
      </main>
    </div>
  );
};

export default App;