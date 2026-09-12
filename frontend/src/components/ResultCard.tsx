import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode, Sparkles } from 'lucide-react';

interface ResultCardProps {
  shortURL: string;
  originalURL: string;
  shortCode: string;
  onShowQR: () => void;
}

export const ResultCard: React.FC<ResultCardProps> = ({
  shortURL,
  originalURL,
  shortCode,
  onShowQR,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortURL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch (err) {
      console.error('Failed to copy text', err);
    }
  };

  return (
    <div className="result-card glass-panel animate-fade-in">
      <div className="result-card-header">
        <div className="result-badge">
          <Sparkles size={14} />
          <span>Your shortened link is ready!</span>
        </div>
        <span className="code-tag">ID: {shortCode}</span>
      </div>

      <div className="result-main">
        <div className="result-url-box">
          <a
            href={shortURL}
            target="_blank"
            rel="noopener noreferrer"
            className="result-short-url"
          >
            {shortURL}
          </a>
          <div className="result-original-url" title={originalURL}>
            Redirects to: <span>{originalURL}</span>
          </div>
        </div>

        <div className="result-actions">
          <button
            className={`btn ${copied ? 'btn-copied' : 'btn-primary'}`}
            onClick={handleCopy}
            title="Copy shortened link"
          >
            {copied ? <Check size={18} /> : <Copy size={18} />}
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={onShowQR}
            title="Show QR Code"
          >
            <QrCode size={18} />
            <span>QR Code</span>
          </button>

          <a
            href={shortURL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-secondary icon-only"
            title="Test in new tab"
          >
            <ExternalLink size={18} />
          </a>
        </div>
      </div>
    </div>
  );
};
