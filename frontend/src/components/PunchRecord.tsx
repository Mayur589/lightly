import React from 'react';
import type { URLStats } from '../services/api';

interface PunchRecordProps {
  stats: URLStats | null;
  onClose: () => void;
  baseURL: string;
}

export const PunchRecord: React.FC<PunchRecordProps> = ({
  stats,
  onClose,
  baseURL,
}) => {
  if (!stats) return null;

  // Generate a calibrated mono punch histogram for aesthetic data feel
  const generatePunchMarks = (clicks: number): string => {
    if (clicks === 0) return '          ';
    const blocks = [' ', '▂', '▃', '▄', '▅', '▆', '▇', '█'];
    // Distribute clicks visually across a 10-column timeline
    const pattern = [0.1, 0.25, 0.4, 0.2, 0.7, 0.9, 0.6, 0.4, 0.8, 1.0];
    return pattern
      .map((p) => {
        const index = Math.min(blocks.length - 1, Math.floor(p * Math.min(clicks, 7)));
        return blocks[index];
      })
      .join('');
  };

  const fullShortURL = `${baseURL.replace(/\/$/, '')}/${stats.shortCode}`;

  return (
    <div className="punch-record-section">
      <div className="punch-header">
        <h3 className="punch-title">
          <span className="punch-code mono">{stats.shortCode}</span> &mdash; punch record
        </h3>
        <button type="button" className="punch-close" onClick={onClose}>
          [ close ]
        </button>
      </div>

      <hr className="perf-line" />

      <div className="punch-data-grid">
        <div className="punch-data-row">
          <span className="punch-data-label">clicks</span>
          <span className="punch-clicks-large mono">{stats.clicks}</span>
        </div>

        <div className="punch-chart-row">
          <div className="punch-chart-title">punch activity</div>
          <div className="punch-sparkline mono">{generatePunchMarks(stats.clicks)}</div>
          <div className="punch-chart-axis mono">t-7d . . . . . . . . . now</div>
        </div>

        <div className="punch-data-row">
          <span className="punch-data-label">destination</span>
          <a
            href={stats.originalURL}
            target="_blank"
            rel="noopener noreferrer"
            className="punch-data-val mono"
            title={stats.originalURL}
          >
            {stats.originalURL.length > 36
              ? stats.originalURL.substring(0, 34) + '…'
              : stats.originalURL}
          </a>
        </div>

        <div className="punch-data-row">
          <span className="punch-data-label">claim URL</span>
          <a
            href={fullShortURL}
            target="_blank"
            rel="noopener noreferrer"
            className="punch-data-val mono"
          >
            {fullShortURL}
          </a>
        </div>

        <div className="punch-data-row">
          <span className="punch-data-label">issued</span>
          <span className="punch-data-val mono">
            {new Date(stats.createdAt).toLocaleString(undefined, {
              dateStyle: 'medium',
              timeStyle: 'short',
            })}
          </span>
        </div>

        {stats.lastAccessedAt && (
          <div className="punch-data-row">
            <span className="punch-data-label">last redeemed</span>
            <span className="punch-data-val mono">
              {new Date(stats.lastAccessedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
