import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { DashboardPage } from './pages/DashboardPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { PortfolioPage } from './pages/PortfolioPage';
import { JournalPage } from './pages/JournalPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/journal" element={<JournalPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
