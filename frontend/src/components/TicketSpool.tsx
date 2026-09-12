import React from 'react';
import type { URLStats } from '../services/api';

interface TicketSpoolProps {
  tickets: URLStats[];
  selectedCode: string | null;
  onSelectTicket: (code: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const TicketSpool: React.FC<TicketSpoolProps> = ({
  tickets,
  selectedCode,
  onSelectTicket,
  onRefresh,
  isRefreshing,
}) => {
  const formatPutAgo = (dateStr: string): string => {
    try {
      const diff = Date.now() - new Date(dateStr).getTime();
      const mins = Math.max(0, Math.floor(diff / 60000));
      if (mins < 1) return 'put just now';
      if (mins < 60) return `put ${mins}m ago`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `put ${hours}h ago`;
      const days = Math.floor(hours / 24);
      return `put ${days}d ago`;
    } catch {
      return dateStr;
    }
  };

  const cleanDestination = (url: string): string => {
    try {
      const parsed = new URL(url);
      const host = parsed.host.replace(/^www\./, '');
      const path = parsed.pathname === '/' ? '' : parsed.pathname;
      const combined = host + path;
      if (combined.length > 34) {
        return combined.substring(0, 31) + '…';
      }
      return combined;
    } catch {
      return url.length > 34 ? url.substring(0, 31) + '…' : url;
    }
  };

  return (
    <div className="spool-section">
      <div className="spool-header">
        <h2 className="spool-heading">Recent</h2>
        <button
          type="button"
          className="spool-refresh"
          onClick={onRefresh}
          disabled={isRefreshing}
        >
          {isRefreshing ? 'refreshing...' : 'refresh spool'}
        </button>
      </div>

      <hr className="spool-divider" />

      {tickets.length === 0 ? (
        <div className="spool-empty">
          no ticket stubs on file. paste a link above to issue your first claim.
        </div>
      ) : (
        <div className="spool-list">
          {tickets.map((t) => {
            const isSelected = selectedCode === t.shortCode;
            return (
              <div
                key={t.shortCode}
                className={`spool-row ${isSelected ? 'selected' : ''}`}
                onClick={() => onSelectTicket(t.shortCode)}
                title="Click to view punch record"
              >
                <span className="spool-code mono">{t.shortCode}</span>
                <span className="spool-destination mono" title={t.originalURL}>
                  {cleanDestination(t.originalURL)}
                </span>
                <div className="spool-meta">
                  <span className="spool-ago mono">{formatPutAgo(t.createdAt)}</span>
                  <span className="spool-clicks mono">{t.clicks} {t.clicks === 1 ? 'click' : 'clicks'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
