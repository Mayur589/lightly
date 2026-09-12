// API Client directly communicates with the Go backend (CORS-enabled)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface ShortenResponse {
  success: boolean;
  shortCode?: string;
  shortURL?: string;
  error?: string;
}

export interface URLStats {
  shortCode: string;
  originalURL: string;
  clicks: number;
  createdAt: string;
  lastAccessedAt: string | null;
}

export interface RecentResponse {
  success: boolean;
  data: URLStats[];
  error?: string;
}

export interface HealthResponse {
  status: string;
  service: string;
}

export const api = {
  // Shorten a new URL
  async shorten(url: string): Promise<ShortenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/shorten`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || `Error ${response.status}: Failed to shorten URL`);
    }
    return data;
  },

  // Fetch click statistics for a specific shortcode
  async getStats(code: string): Promise<URLStats> {
    const response = await fetch(`${API_BASE_URL}/api/stats/${encodeURIComponent(code)}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch statistics');
    }
    return data.data;
  },

  // Fetch recently shortened links
  async getRecent(limit = 10): Promise<URLStats[]> {
    const response = await fetch(`${API_BASE_URL}/api/recent?limit=${limit}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch recent links');
    }
    return data.data || [];
  },

  // Check backend server health
  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return false;
      const data = await response.json();
      return data.status === 'healthy';
    } catch {
      return false;
    }
  },
};
