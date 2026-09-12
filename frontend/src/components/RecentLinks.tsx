import React from 'react';
import { MousePointerClick, Calendar, ExternalLink, Copy, Check, RefreshCw, BarChart2 } from 'lucide-react';
import type { URLStats } from '../services/api';

interface RecentLinksProps {
  links: URLStats[];
  baseURL: string;
  onRefresh: () => void;
  isRefreshing: boolean;
  onSelectQR: (url: string, code: string) => void;
}

export const RecentLinks: React.FC<RecentLinksProps> = ({
  links,
  baseURL,
  onRefresh,
  isRefreshing,
  onSelectQR,
}) => {
  const [copiedCode, setCopiedCode] = React.useState<string | null>(null);

  const handleCopy = (shortCode: string) => {
    const fullURL = `${baseURL.replace(/\/$/, '')}/${shortCode}`;
    navigator.clipboard.writeText(fullURL);
    setCopiedCode(shortCode);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <section className="recent-section">
      <div className="section-header">
        <div className="section-title">
          <BarChart2 size={20} className="section-icon" />
          <h2>Recent Links & Analytics</h2>
          <span className="count-badge">{links.length}</span>
        </div>

        <button
          className="btn btn-secondary btn-sm refresh-button"
          onClick={onRefresh}
          disabled={isRefreshing}
          title="Refresh analytics data"
        >
          <RefreshCw size={14} className={isRefreshing ? 'spin' : ''} />
          <span>Refresh</span>
        </button>
      </div>

      {links.length === 0 ? (
        <div className="empty-state glass-panel">
          <p>No shortened links yet. Shorten your first URL above to track clicks and analytics!</p>
        </div>
      ) : (
        <div className="links-grid">
          {links.map((link) => {
            const shortURL = `${baseURL.replace(/\/$/, '')}/${link.shortCode}`;
            const isCopied = copiedCode === link.shortCode;

            return (
              <div key={link.shortCode} className="link-item-card glass-panel">
                <div className="link-item-top">
                  <a
                    href={shortURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-item-short"
                  >
                    /{link.shortCode}
                  </a>

                  <div className="click-badge" title="Total redirects">
                    <MousePointerClick size={13} />
                    <span>{link.clicks} {link.clicks === 1 ? 'click' : 'clicks'}</span>
                  </div>
                </div>

                <p className="link-item-original" title={link.originalURL}>
                  {link.originalURL}
                </p>

                <div className="link-item-meta">
                  <span className="timestamp">
                    <Calendar size={12} />
                    {formatDate(link.createdAt)}
                  </span>

                  <div className="item-actions">
                    <button
                      className="icon-action-btn"
                      onClick={() => handleCopy(link.shortCode)}
                      title="Copy short link"
                    >
                      {isCopied ? <Check size={14} color="#34d399" /> : <Copy size={14} />}
                    </button>

                    <button
                      className="icon-action-btn"
                      onClick={() => onSelectQR(shortURL, link.shortCode)}
                      title="Show QR Code"
                    >
                      QR
                    </button>

                    <a
                      href={shortURL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="icon-action-btn"
                      title="Visit link"
                    >
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
