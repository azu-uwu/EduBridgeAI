import { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Navbar } from './components/Navbar';
import { ExplainWordPage } from './pages/ExplainWordPage';
import { HomePage } from './pages/HomePage';
import { SimplifyPage } from './pages/SimplifyPage';
import { SummarizePage } from './pages/SummarizePage';
import { stopSpeaking } from './utils/speech';

function RouteEffects() {
  const { pathname } = useLocation();

  useEffect(() => {
    stopSpeaking();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <BrowserRouter>
      <RouteEffects />
      <div className="flex min-h-screen flex-col bg-[#F8FAFC]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-xl focus:bg-blue-600 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
        >
          Chuyển đến nội dung chính
        </a>

        <Navbar />

        <main
          id="main-content"
          className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/don-gian-hoa" element={<SimplifyPage />} />
            <Route path="/giai-thich-tu" element={<ExplainWordPage />} />
            <Route path="/tom-tat" element={<SummarizePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;

