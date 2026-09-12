import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { ShortenerForm } from './components/ShortenerForm';
import { ResultCard } from './components/ResultCard';
import { RecentLinks } from './components/RecentLinks';
import { QRModal } from './components/QRModal';
import { api, API_BASE_URL, type URLStats } from './services/api';
import { Zap, Globe, BarChart3 } from 'lucide-react';

interface ActiveQR {
  url: string;
  code: string;
}

export const App: React.FC = () => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [latestResult, setLatestResult] = useState<{
    shortURL: string;
    originalURL: string;
    shortCode: string;
  } | null>(null);
  const [recentLinks, setRecentLinks] = useState<URLStats[]>([]);
  const [activeQR, setActiveQR] = useState<ActiveQR | null>(null);

  // Health check
  const checkServerHealth = useCallback(async () => {
    const healthy = await api.checkHealth();
    setIsBackendHealthy(healthy);
  }, []);

  // Fetch recent links
  const loadRecentLinks = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getRecent(12);
      setRecentLinks(data);
    } catch (err) {
      console.warn('Could not load recent links from backend:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkServerHealth();
    loadRecentLinks();

    // Check health every 30s
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, [checkServerHealth, loadRecentLinks]);

  // Handle URL Shorten
  const handleShorten = async (targetURL: string) => {
    setIsLoading(true);
    try {
      const response = await api.shorten(targetURL);
      if (response.success && response.shortURL && response.shortCode) {
        setLatestResult({
          shortURL: response.shortURL,
          originalURL: targetURL,
          shortCode: response.shortCode,
        });

        // Add to recent links or refresh
        await loadRecentLinks();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Navbar isBackendHealthy={isBackendHealthy} />

      <main className="main-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-pill">
            <Zap size={14} />
            <span>High-Performance Base62 Engine</span>
          </div>
          <h1 className="hero-title">
            Make every link <span className="gradient-text">short & trackable</span>
          </h1>
          <p className="hero-subtitle">
            Transform lengthy, cluttered URLs into clean, memorable links with instant redirection,
            real-time click analytics, and custom domain readiness.
          </p>
        </section>

        {/* Shortener Box */}
        <ShortenerForm onShorten={handleShorten} isLoading={isLoading} />

        {/* Result Card */}
        {latestResult && (
          <ResultCard
            shortURL={latestResult.shortURL}
            originalURL={latestResult.originalURL}
            shortCode={latestResult.shortCode}
            onShowQR={() => setActiveQR({ url: latestResult.shortURL, code: latestResult.shortCode })}
          />
        )}

        {/* Recent Links & Analytics */}
        <RecentLinks
          links={recentLinks}
          baseURL={API_BASE_URL}
          onRefresh={loadRecentLinks}
          isRefreshing={isRefreshing}
          onSelectQR={(url, code) => setActiveQR({ url, code })}
        />

        {/* Feature Grid */}
        <section className="features-grid">
          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper icon-purple">
              <Zap size={22} />
            </div>
            <h3>Sub-millisecond Speed</h3>
            <p>
              Powered by a compiled Go core and PostgreSQL connection pooling for blazing-fast 302 redirects.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper icon-blue">
              <Globe size={22} />
            </div>
            <h3>Custom Domain Ready</h3>
            <p>
              Easily point branded short domains like <code>light.ly</code> or <code>go.yourdomain.com</code> via DNS.
            </p>
          </div>

          <div className="feature-card glass-panel">
            <div className="feature-icon-wrapper icon-emerald">
              <BarChart3 size={22} />
            </div>
            <h3>Real-time Analytics</h3>
            <p>
              Every redirect tracks total hits, timestamps, and activity so you never lose visibility.
            </p>
          </div>
        </section>
      </main>

      {/* QR Code Modal */}
      {activeQR && (
        <QRModal
          url={activeQR.url}
          shortCode={activeQR.code}
          onClose={() => setActiveQR(null)}
        />
      )}

      {/* Footer */}
      <footer className="footer">
        <p>Lightly &copy; {new Date().getFullYear()} &mdash; Production Ready Full-Stack Link Shortener</p>
      </footer>
    </div>
  );
};

export default App;
