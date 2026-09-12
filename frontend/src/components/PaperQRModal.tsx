import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface PaperQRModalProps {
  url: string;
  shortCode: string;
  onClose: () => void;
}

export const PaperQRModal: React.FC<PaperQRModalProps> = ({ url, shortCode, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(
        canvasRef.current,
        url,
        {
          width: 200,
          margin: 1,
          color: {
            dark: '#20242B',
            light: '#FFFFFF',
          },
        },
        (error) => {
          if (error) console.error('QR code generation error:', error);
        }
      );
    }
  }, [url]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const a = document.createElement('a');
    a.download = `ticket-${shortCode}-qr.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="paper-modal-overlay" onClick={onClose}>
      <div className="paper-modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="paper-modal-header">
          <span className="paper-modal-title">QR Claim Ticket</span>
          <button type="button" className="paper-modal-close" onClick={onClose}>
            [ close ]
          </button>
        </div>

        <div className="paper-qr-body">
          <canvas ref={canvasRef} className="paper-qr-canvas"></canvas>
          <div className="paper-qr-url mono">{url}</div>
        </div>

        <div className="paper-modal-actions">
          <button
            type="button"
            className="btn-secondary-flat"
            onClick={handleCopy}
          >
            {copied ? 'copied' : 'copy link'}
          </button>
          <button
            type="button"
            className="btn-ticket"
            onClick={handleDownload}
          >
            download png
          </button>
        </div>
      </div>
    </div>
  );
};
