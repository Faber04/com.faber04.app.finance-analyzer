import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { AnalyzePage } from './pages/AnalyzePage';
import { PortfolioPage } from './pages/PortfolioPage';
import { JournalPage } from './pages/JournalPage';

function App() {
  return (
    <HashRouter>
      <div className="min-h-screen bg-gray-50 dark:bg-brand-navy transition-colors duration-200">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<AnalyzePage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </main>
      </div>
    </HashRouter>
  );
}

export default App;
