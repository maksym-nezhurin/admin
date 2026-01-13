/**
 * Native WebSocket Service (NOT Socket.IO)
 * 
 * This service uses native WebSocket API instead of Socket.IO.
 * Backend endpoint: ws://localhost:8000/queue/status/ws
 */

import type { IQueueStatus } from '../constants/scrapper';

export interface SocketServiceConfig {
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectDelayMax?: number;
  timeout?: number;
}

export interface SocketStatus {
  connected: boolean;
  connecting: boolean;
  error: string | null;
  lastConnected: Date | null;
  reconnectAttempts: number;
}

export class SocketService {
  private ws: WebSocket | null = null;
  private status: SocketStatus = {
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0
  };
  private statusCallbacks: Set<(status: SocketStatus) => void> = new Set();
  private queueStatusCallbacks: Set<(data: IQueueStatus) => void> = new Set();
  private config: SocketServiceConfig;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentBaseUrl: string = '';
  private shouldReconnect: boolean = true;
  private connectionTimeout: NodeJS.Timeout | null = null;

  constructor(config: SocketServiceConfig = {}) {
    this.config = {
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectDelayMax: 30000, // Max 30 seconds
      timeout: 10000,
      ...config
    };
  }

  /**
   * Update the base URL and reconnect if needed
   */
  updateBaseUrl(baseUrl: string): void {
    if (this.currentBaseUrl !== baseUrl) {
      this.currentBaseUrl = baseUrl;
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('🔄 Base URL changed, reconnecting socket...');
        this.disconnect();
        // Auto-reconnect with new URL after a short delay
        setTimeout(() => this.connect(), 100);
      }
    }
  }

  /**
   * Connect to WebSocket with provided base URL
   */
  async connect(baseUrl?: string): Promise<boolean> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return true;
    }

    if (this.status.connecting) {
      return new Promise((resolve) => {
        const checkConnection = () => {
          if (this.status.connected) {
            resolve(true);
          } else if (!this.status.connecting) {
            resolve(false);
          } else {
            setTimeout(checkConnection, 100);
          }
        };
        checkConnection();
      });
    }

    try {
      this.updateStatus({ connecting: true, error: null });
      
      // Use provided URL or current base URL
      const targetUrl = baseUrl || this.currentBaseUrl;
      if (!targetUrl) {
        throw new Error('No base URL provided for socket connection');
      }
      
      // Get WebSocket URL
      const wsUrl = this.getWebSocketUrl(targetUrl);
      
      console.log(`🔌 Connecting to WebSocket: ${wsUrl}`);

      // Create native WebSocket connection
      this.ws = new WebSocket(wsUrl);

      // Set connection timeout
      this.connectionTimeout = setTimeout(() => {
        if (this.ws?.readyState !== WebSocket.OPEN) {
          console.error('⏱️ Connection timeout');
          this.ws?.close();
          this.handleReconnect();
        }
      }, this.config.timeout);

      this.setupEventListeners();
      
      return new Promise((resolve) => {
        const onOpen = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          resolve(true);
        };
        
        const onError = () => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          this.ws?.removeEventListener('open', onOpen);
          this.ws?.removeEventListener('error', onError);
          resolve(false);
        };
        
        this.ws?.addEventListener('open', onOpen);
        this.ws?.addEventListener('error', onError);
      });

    } catch (error) {
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      this.updateStatus({ 
        connecting: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      });
      return false;
    }
  }

  /**
   * Disconnect from WebSocket
   */
  disconnect(): void {
    this.shouldReconnect = false;
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    this.updateStatus({ 
      connected: false, 
      connecting: false,
      error: null 
    });
  }

  /**
   * Subscribe to queue status updates
   */
  subscribeToQueueStatus(callback: (data: IQueueStatus) => void): () => void {
    this.queueStatusCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.queueStatusCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to socket status changes
   */
  subscribeToStatus(callback: (status: SocketStatus) => void): () => void {
    this.statusCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  /**
   * Get current socket status
   */
  getStatus(): SocketStatus {
    return { ...this.status };
  }

  /**
   * Check if socket is healthy
   */
  isHealthy(): boolean {
    return this.status.connected && !this.status.error;
  }

  private setupEventListeners(): void {
    if (!this.ws) return;

    this.ws.addEventListener('open', () => {
      console.log('✅ WebSocket connected');
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      this.updateStatus({
        connected: true,
        connecting: false,
        error: null,
        lastConnected: new Date(),
        reconnectAttempts: 0
      });
      this.shouldReconnect = true;
    });

    this.ws.addEventListener('close', (event) => {
      console.log('🔌 WebSocket disconnected:', event.code, event.reason);
      
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }

      this.updateStatus({
        connected: false,
        connecting: false,
        error: `Disconnected: ${event.reason || `Code ${event.code}`}`
      });

      // Handle reconnection if not a manual disconnect
      if (event.code !== 1000 && this.shouldReconnect) {
        this.handleReconnect();
      }
    });

    this.ws.addEventListener('error', (error) => {
      console.error('❌ WebSocket error:', error);
      if (this.connectionTimeout) {
        clearTimeout(this.connectionTimeout);
        this.connectionTimeout = null;
      }
      this.updateStatus({
        connected: false,
        connecting: false,
        error: 'WebSocket connection error'
      });
    });

    this.ws.addEventListener('message', (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if it's an error message
        if (data.error) {
          console.error('❌ Server error:', data.error);
          this.updateStatus({
            error: data.error
          });
          return;
        }

        // Queue status update
        console.log('📊 Queue status update:', data);
        this.notifyQueueStatusCallbacks(data as IQueueStatus);
      } catch (error) {
        console.error('❌ Error parsing message:', error);
      }
    });
  }

  private handleReconnect(): void {
    if (!this.config.reconnection || !this.shouldReconnect) {
      return;
    }

    if (this.status.reconnectAttempts >= (this.config.reconnectionAttempts || 5)) {
      console.error('❌ Max reconnection attempts reached');
      this.updateStatus({
        error: 'Max reconnection attempts reached',
        reconnectAttempts: this.status.reconnectAttempts
      });
      return;
    }

    const attemptNumber = this.status.reconnectAttempts + 1;
    console.log(`🔄 Reconnection attempt ${attemptNumber}/${this.config.reconnectionAttempts}`);

    // Exponential backoff with max delay
    const delay = Math.min(
      (this.config.reconnectionDelay || 1000) * Math.pow(2, attemptNumber - 1),
      this.config.reconnectDelayMax || 30000
    );

    this.updateStatus({
      reconnectAttempts: attemptNumber
    });

    this.reconnectTimeout = setTimeout(() => {
      this.connect();
    }, delay);
  }

  private getWebSocketUrl(httpUrl: string): string {
    try {
      const url = new URL(httpUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      // ✅ Correct endpoint: /queue/status/ws (NOT /socket.io/)
      const wsUrl = `${protocol}//${url.host}/queue/status/ws`;
      return wsUrl;
    } catch (error) {
      console.error('Invalid URL:', httpUrl);
      // Fallback for localhost
      return httpUrl.replace(/^https?/, 'ws') + '/queue/status/ws';
    }
  }

  private updateStatus(updates: Partial<SocketStatus>): void {
    this.status = { ...this.status, ...updates };
    this.notifyStatusCallbacks(this.status);
  }

  private notifyStatusCallbacks(status: SocketStatus): void {
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in status callback:', error);
      }
    });
  }

  private notifyQueueStatusCallbacks(data: IQueueStatus): void {
    this.queueStatusCallbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Error in queue status callback:', error);
      }
    });
  }
}

// Singleton instance
let socketServiceInstance: SocketService | null = null;

export const getSocketService = (config?: SocketServiceConfig): SocketService => {
  if (!socketServiceInstance) {
    socketServiceInstance = new SocketService(config);
  }
  return socketServiceInstance;
};

export default socketServiceInstance;

