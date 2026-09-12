import React, { useState } from 'react';
import { Link, ArrowRight, Clipboard, Loader2, AlertCircle } from 'lucide-react';

interface ShortenerFormProps {
  onShorten: (url: string) => Promise<void>;
  isLoading: boolean;
}

export const ShortenerForm: React.FC<ShortenerFormProps> = ({ onShorten, isLoading }) => {
  const [url, setUrl] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setError(null);
      }
    } catch {
      // Clipboard permissions denied
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError('Please enter a destination URL');
      return;
    }

    try {
      setError(null);
      await onShorten(trimmed);
      setUrl('');
    } catch (err: any) {
      setError(err.message || 'Failed to shorten URL');
    }
  };

  return (
    <div className="shortener-box glass-panel">
      <form onSubmit={handleSubmit} className="shortener-form">
        <div className="input-group">
          <div className="input-icon">
            <Link size={20} />
          </div>

          <input
            type="text"
            className="url-input"
            placeholder="Paste your long link here (e.g. https://super-long-domain.com/path...)"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
            autoFocus
          />

          {!url && (
            <button
              type="button"
              className="paste-btn"
              onClick={handlePaste}
              title="Paste from clipboard"
            >
              <Clipboard size={16} />
              <span>Paste</span>
            </button>
          )}

          <button
            type="submit"
            className="btn btn-primary submit-btn"
            disabled={isLoading || !url.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Shortening...</span>
              </>
            ) : (
              <>
                <span>Shorten</span>
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </form>

      {error && (
        <div className="error-message animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="form-footer-hint">
        <span>Branded short links with instant redirect and click tracking</span>
      </div>
    </div>
  );
};
