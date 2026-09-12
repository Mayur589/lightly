import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import { TicketUnit } from './components/TicketUnit';
import { TicketSpool } from './components/TicketSpool';
import { PunchRecord } from './components/PunchRecord';
import { PaperQRModal } from './components/PaperQRModal';
import { api, API_BASE_URL, type URLStats } from './services/api';

export const App: React.FC = () => {
  const [isBackendHealthy, setIsBackendHealthy] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [issuedTicket, setIssuedTicket] = useState<{
    shortURL: string;
    originalURL: string;
    shortCode: string;
  } | null>(null);
  const [tickets, setTickets] = useState<URLStats[]>([]);
  const [selectedTicketCode, setSelectedTicketCode] = useState<string | null>(null);
  const [activeQR, setActiveQR] = useState<{ url: string; code: string } | null>(null);

  // Check API health
  const checkHealth = useCallback(async () => {
    const ok = await api.checkHealth();
    setIsBackendHealthy(ok);
  }, []);

  // Fetch ticket spool
  const loadTickets = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const data = await api.getRecent(15);
      setTickets(data);
    } catch (err) {
      console.warn('Could not load tickets:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    checkHealth();
    loadTickets();
    const interval = setInterval(checkHealth, 25000);
    return () => clearInterval(interval);
  }, [checkHealth, loadTickets]);

  // Handle cutting a new ticket
  const handleCutTicket = async (targetURL: string) => {
    setIsLoading(true);
    try {
      const res = await api.shorten(targetURL);
      if (res.success && res.shortURL && res.shortCode) {
        const newTicket = {
          shortURL: res.shortURL,
          originalURL: targetURL,
          shortCode: res.shortCode,
        };
        setIssuedTicket(newTicket);
        setSelectedTicketCode(res.shortCode);
        await loadTickets();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const selectedTicket = tickets.find((t) => t.shortCode === selectedTicketCode) || null;

  return (
    <div className="page-container">
      <div className="ticket-column">
        {/* System Header */}
        <header className="system-header">
          <div className="system-title">
            <span>lightly</span>
            <span className="system-sub mono">v1.0 &middot; claim ticket system</span>
          </div>

          <div className="system-status">
            <span
              className={`status-pip ${
                isBackendHealthy === true
                  ? 'online'
                  : isBackendHealthy === false
                  ? 'offline'
                  : ''
              }`}
            />
            <span className="mono">
              {isBackendHealthy === true
                ? 'api ready'
                : isBackendHealthy === false
                ? 'api offline'
                : 'connecting'}
            </span>
          </div>
        </header>

        {/* The Claim Ticket */}
        <main>
          <TicketUnit
            onCutTicket={handleCutTicket}
            isLoading={isLoading}
            issuedTicket={issuedTicket}
            onOpenQR={(url, code) => setActiveQR({ url, code })}
          />

          {/* Selected Punch Record (Analytics) */}
          {selectedTicket && (
            <PunchRecord
              stats={selectedTicket}
              onClose={() => setSelectedTicketCode(null)}
              baseURL={API_BASE_URL}
            />
          )}

          {/* Ticket Stub Spool (Recent) */}
          <TicketSpool
            tickets={tickets}
            selectedCode={selectedTicketCode}
            onSelectTicket={(code) => setSelectedTicketCode(code === selectedTicketCode ? null : code)}
            onRefresh={loadTickets}
            isRefreshing={isRefreshing}
          />
        </main>

        {/* System Footer */}
        <footer className="system-footer">
          <span>go/postgres core &middot; base62 claims</span>
          <span>lightly claim ticket</span>
        </footer>
      </div>

      {/* QR Code Modal */}
      {activeQR && (
        <PaperQRModal
          url={activeQR.url}
          shortCode={activeQR.code}
          onClose={() => setActiveQR(null)}
        />
      )}
    </div>
  );
};

export default App;
