import React from 'react';
import { Link2, ExternalLink } from 'lucide-react';

interface NavbarProps {
  isBackendHealthy: boolean | null;
}

export const Navbar: React.FC<NavbarProps> = ({ isBackendHealthy }) => {
  return (
    <header className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand">
          <div className="logo-icon">
            <Link2 className="icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-name">light<span className="brand-highlight">.ly</span></span>
            <span className="brand-tagline">Fast. Clean. Trackable.</span>
          </div>
        </div>

        <div className="navbar-actions">
          {/* Health Status Pill */}
          <div className={`status-pill ${isBackendHealthy === true ? 'online' : isBackendHealthy === false ? 'offline' : 'checking'}`}>
            <span className="status-dot"></span>
            <span className="status-label">
              {isBackendHealthy === true ? 'API Connected' : isBackendHealthy === false ? 'API Offline' : 'Connecting...'}
            </span>
          </div>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            <span>GitHub</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </header>
  );
};
