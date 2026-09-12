import React, { useState } from 'react';

interface TicketUnitProps {
  onCutTicket: (url: string) => Promise<void>;
  isLoading: boolean;
  issuedTicket: {
    shortURL: string;
    originalURL: string;
    shortCode: string;
  } | null;
  onOpenQR: (url: string, code: string) => void;
}

export const TicketUnit: React.FC<TicketUnitProps> = ({
  onCutTicket,
  isLoading,
  issuedTicket,
  onOpenQR,
}) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
        setError(null);
      }
    } catch {
      // Clipboard denied
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const target = url.trim();
    if (!target) {
      setError('enter a destination url');
      return;
    }

    try {
      setError(null);
      await onCutTicket(target);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'failed to cut ticket');
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard write failed
    }
  };

  return (
    <div className="ticket-unit">
      {/* Upper Ticket: Claim Issuer */}
      <div className="ticket-issue-pane">
        <label htmlFor="url-input" className="ticket-field-label">
          paste a link
        </label>

        <form onSubmit={handleSubmit} className="input-row">
          <div className="ticket-input-wrapper">
            <input
              id="url-input"
              type="text"
              className="paper-input"
              placeholder="https://..."
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              autoFocus
            />
          </div>

          <div className="ticket-issue-actions">
            <button
              type="button"
              className="paste-link-action"
              onClick={handlePaste}
            >
              paste from clipboard
            </button>

            <button
              type="submit"
              className="btn-ticket"
              disabled={isLoading || !url.trim()}
            >
              {isLoading ? 'cutting ticket...' : '[ Cut ticket ]'}
            </button>
          </div>
        </form>

        {error && <div className="error-notice">{error}</div>}
      </div>

      {/* Perforated Tear Line */}
      <div className="tear-divider">
        <div className="tear-notch-left" />
        <hr className="tear-line-rule" />
        <span className="tear-label">tear line</span>
        <div className="tear-notch-right" />
      </div>

      {/* Lower Ticket: Issued Claim Stub */}
      {issuedTicket && (
        <div className="ticket-stub-pane stamp-in" key={issuedTicket.shortCode}>
          <div className="stub-meta">
            <span className="stub-claim-label">issued claim stub</span>
            <span className="stub-id mono">#{issuedTicket.shortCode}</span>
          </div>

          <a
            href={issuedTicket.shortURL}
            target="_blank"
            rel="noopener noreferrer"
            className="stub-code-url"
          >
            {issuedTicket.shortURL}
          </a>

          <div className="stub-destination">
            <span className="stub-arrow">&rarr;</span>
            <span>{issuedTicket.originalURL}</span>
          </div>

          <div className="stub-actions">
            <button
              type="button"
              className={`stub-btn-action ${copied ? 'copied' : ''}`}
              onClick={() => handleCopy(issuedTicket.shortURL)}
            >
              {copied ? 'copied to clipboard' : '[ copy ]'}
            </button>

            <a
              href={issuedTicket.shortURL}
              target="_blank"
              rel="noopener noreferrer"
              className="stub-btn-action"
            >
              [ test link ]
            </a>

            <button
              type="button"
              className="stub-btn-action"
              onClick={() => onOpenQR(issuedTicket.shortURL, issuedTicket.shortCode)}
            >
              [ qr code ]
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
