/**
 * Native WebSocket Service (NOT Socket.IO)
 * 
 * This service uses native WebSocket API instead of Socket.IO.
 * Backend endpoint: ws://localhost:8000/queue/status/ws
 */

import type { IQueueStatus, ITaskProgress } from '../constants/scrapper';

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

// Task progress socket status has same shape as main SocketStatus
type TaskProgressSocketStatus = SocketStatus;

export class SocketService {
  private ws: WebSocket | null = null;
  private status: SocketStatus = {
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0
  };
  private activeConnections: Set<string> = new Set(); // Track active connections
  private statusCallbacks: Set<(status: SocketStatus) => void> = new Set();
  private queueStatusCallbacks: Set<(data: IQueueStatus) => void> = new Set();
  private taskProgressCallbacks: Set<(data: ITaskProgress) => void> = new Set();
  private taskProgressWs: WebSocket | null = null;
  private taskProgressStatus: TaskProgressSocketStatus = {
    connected: false,
    connecting: false,
    error: null,
    lastConnected: null,
    reconnectAttempts: 0
  };
  private taskProgressStatusCallbacks: Set<(status: TaskProgressSocketStatus) => void> = new Set();
  private config: SocketServiceConfig;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private currentBaseUrl: string = '';
  private shouldReconnect: boolean = true;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private taskProgressReconnectTimeout: NodeJS.Timeout | null = null;
  private taskProgressConnectionTimeout: NodeJS.Timeout | null = null;
  private taskProgressReconnectAttempts: number = 0;
  private lastConnectionTaskId: string = '';
  private lastConnectionAttemptTime: number = 0;
  private shouldReconnectTaskProgress: boolean = true;
  
  // Global rate limiting
  private connectionAttemptsPerMinute: Map<number, number[]> = new Map();
  private maxConnectionsPerMinute: number = 10;

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
    console.log('🔄 Base URL changed, reconnecting socket...');
    if (this.currentBaseUrl !== baseUrl) {
      this.currentBaseUrl = baseUrl;
      if (this.ws?.readyState === WebSocket.OPEN) {
        console.log('🔄 Base URL changed, reconnecting socket...');
        this.disconnect();
        // Auto-reconnect with new URL after a short delay
        // setTimeout(() => this.connect(), 100);
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
   * Connect to task progress WebSocket for specific task
   */
  async connectToTaskProgress(baseUrl: string, taskId: string): Promise<boolean> {
    if (this.taskProgressWs && this.taskProgressWs.readyState === WebSocket.OPEN && this.lastConnectionTaskId === taskId) {
      console.log('Task progress WebSocket already connected for this task:', taskId);
      return true;
    }

    // Check global rate limiting
    const now = Date.now();
    const currentMinute = Math.floor(now / 60000); // Current minute
    const recentAttempts = this.connectionAttemptsPerMinute.get(currentMinute) || [];
    
    // Check if we've exceeded the maximum connections per minute
    if (recentAttempts.length >= this.maxConnectionsPerMinute) {
      console.log(` Rate limit exceeded. Max ${this.maxConnectionsPerMinute} connections per minute allowed. Current attempts: ${recentAttempts.length}`);
      return false;
    }
    
    // Record this attempt
    recentAttempts.push(now);
    this.connectionAttemptsPerMinute.set(currentMinute, recentAttempts);
    
    // Clean old attempts (older than 1 minute)
    for (const [minute] of this.connectionAttemptsPerMinute.entries()) {
      if (minute < currentMinute - 1) {
        this.connectionAttemptsPerMinute.delete(minute);
      }
    }
    
    // Prevent too many reconnection attempts for the same task within a short time
    const timeSinceLastAttempt = now - this.lastConnectionAttemptTime;
    
    // If same task was attempted within the last 10 seconds, prevent it
    if (this.lastConnectionTaskId === taskId && timeSinceLastAttempt < 10000) {
      console.log('Preventing duplicate connection attempt for task:', taskId, 'Time since last attempt:', timeSinceLastAttempt);
      return false;
    }
    
    // Limit maximum concurrent connections to prevent server overload
    if (this.activeConnections.size >= 3) {
      console.log('Maximum active connections reached, rejecting new connection for task:', taskId);
      return false;
    }
    
    this.lastConnectionTaskId = taskId;
    this.lastConnectionAttemptTime = now;
    
    const wsUrl = this.getTaskProgressWebSocketUrl(baseUrl, taskId);
    console.log('Connecting to task progress WebSocket:', wsUrl);
    
    // Validate WebSocket URL
    if (!wsUrl || !wsUrl.startsWith('ws://') && !wsUrl.startsWith('wss://')) {
      console.error('❌ Invalid WebSocket URL:', wsUrl);
      this.updateTaskProgressStatus({
        connected: false,
        connecting: false,
        error: 'Invalid WebSocket URL',
        lastConnected: this.taskProgressStatus.lastConnected,
        reconnectAttempts: this.taskProgressReconnectAttempts
      });
      return false;
    }

    this.updateTaskProgressStatus({
      connected: false,
      connecting: true,
      error: null,
      lastConnected: this.taskProgressStatus.lastConnected,
      reconnectAttempts: this.taskProgressReconnectAttempts,
    });

    // Store the task ID we're connecting to
    this.lastConnectionTaskId = taskId;
    console.log('🎯 Connecting to task progress for task:', taskId);

    try {
      this.taskProgressWs = new WebSocket(wsUrl);
      console.log('🔗 Created task progress WebSocket for task:', taskId);
      
      // Set up event listeners
      this.setupTaskProgressEventListeners(taskId);
      
      // Set connection timeout
      this.taskProgressConnectionTimeout = setTimeout(() => {
        if (this.taskProgressWs && this.taskProgressWs.readyState === WebSocket.CONNECTING) {
          console.log('⏰ Task progress WebSocket connection timeout');
          this.taskProgressWs.close();
          this.updateTaskProgressStatus({
            connected: false,
            connecting: false,
            error: 'Connection timeout',
            lastConnected: this.taskProgressStatus.lastConnected,
            reconnectAttempts: this.taskProgressReconnectAttempts
          });
        }
      }, 10000); // 10 second timeout
      
      this.taskProgressWs.onopen = () => {
        console.log('✅ Task progress WebSocket connected for task:', taskId);
        this.updateTaskProgressStatus({
          connected: true,
          connecting: false,
          error: null,
          lastConnected: new Date(),
          reconnectAttempts: 0,
        });
        this.taskProgressReconnectAttempts = 0;
        
        // Add to active connections
        this.activeConnections.add(taskId);
        console.log('📊 Active connections:', Array.from(this.activeConnections));
        
        // Clear connection timeout since we connected successfully
        if (this.taskProgressConnectionTimeout) {
          clearTimeout(this.taskProgressConnectionTimeout);
          this.taskProgressConnectionTimeout = null;
        }
        
        // Keep lastConnectionTaskId to prevent duplicate connections
        // this.lastConnectionTaskId = '';
        // this.lastConnectionAttemptTime = 0;
      };

      // Successfully initiated connection
      return true;
    } catch (error) {
      console.error('❌ Failed to connect to task progress WebSocket:', error);
      this.updateTaskProgressStatus({
        connected: false,
        connecting: false,
        error: 'Connection error',
        lastConnected: this.taskProgressStatus.lastConnected,
        reconnectAttempts: this.taskProgressReconnectAttempts
      });
      return false;
    } finally {
      // Only clear timeout if connection failed (not on successful open)
      if (this.taskProgressConnectionTimeout && this.taskProgressWs?.readyState !== WebSocket.OPEN) {
        clearTimeout(this.taskProgressConnectionTimeout);
        this.taskProgressConnectionTimeout = null;
      }
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
   * Disconnect from task progress WebSocket
   */
  disconnectTaskProgress(): void {
    this.shouldReconnectTaskProgress = false;
    
    if (this.taskProgressReconnectTimeout) {
      clearTimeout(this.taskProgressReconnectTimeout);
      this.taskProgressReconnectTimeout = null;
    }

    if (this.taskProgressConnectionTimeout) {
      clearTimeout(this.taskProgressConnectionTimeout);
      this.taskProgressConnectionTimeout = null;
    }

    if (this.taskProgressWs) {
      this.taskProgressWs.close(1000, 'Manual disconnect');
      this.taskProgressWs = null;
    }

    // Reset task progress connection tracking
    this.lastConnectionTaskId = '';
    this.lastConnectionAttemptTime = 0;
    this.taskProgressReconnectAttempts = 0;
    this.activeConnections.clear();

    this.updateTaskProgressStatus({
      connected: false,
      connecting: false,
      error: null,
      lastConnected: this.taskProgressStatus.lastConnected,
      reconnectAttempts: 0
    });
  }

  /**
   * Disconnect from all WebSockets
   */
  disconnectAll(): void {
    this.disconnect();
    this.disconnectTaskProgress();
    
    // Reset all connection tracking to prevent infinite loops
    this.lastConnectionTaskId = '';
    this.lastConnectionAttemptTime = 0;
    this.taskProgressReconnectAttempts = 0;
    this.activeConnections.clear();
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
   * Subscribe to task progress updates
   */
  subscribeToTaskProgress(callback: (data: ITaskProgress) => void): () => void {
    this.taskProgressCallbacks.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.taskProgressCallbacks.delete(callback);
    };
  }

  /**
   * Subscribe to task progress socket status changes
   */
  subscribeToTaskProgressStatus(callback: (status: SocketStatus) => void): () => void {
    this.taskProgressStatusCallbacks.add(callback);
    
    // Send current status immediately
    callback(this.taskProgressStatus);
    
    // Return unsubscribe function
    return () => {
      this.taskProgressStatusCallbacks.delete(callback);
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
   * Get current task progress socket status
   */
  getTaskProgressStatus(): SocketStatus {
    return { ...this.taskProgressStatus };
  }

  /**
   * Check if socket is healthy
   */
  isHealthy(): boolean {
    return this.status.connected && !this.status.error;
  }

  /**
   * Check if task progress socket is healthy
   */
  isTaskProgressHealthy(): boolean {
    return this.taskProgressStatus.connected && !this.taskProgressStatus.error;
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

  private notifyTaskProgressCallbacks(data: ITaskProgress): void {
    console.log('📈 Task progress data received:', data);
    console.log('📊 Active task progress callbacks:', this.taskProgressCallbacks.size);
    
    this.taskProgressCallbacks.forEach(callback => {
      try {
        console.log('🔄 Calling task progress callback with data:', data);
        callback(data);
      } catch (error) {
        console.error('❌ Error in task progress callback:', error);
      }
    });
  }

  private notifyTaskProgressStatusCallbacks(status: SocketStatus): void {
    this.taskProgressStatusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in task progress status callback:', error);
      }
    });
  }

  private setupTaskProgressEventListeners(taskId: string): void {
    console.log('🔧 Setting up task progress event listeners for task:', taskId);
    if (!this.taskProgressWs) {
      console.error('❌ No task progress WebSocket available for event listeners');
      return;
    }
    console.log('✅ Task progress WebSocket available, setting up listeners');

    this.taskProgressWs.addEventListener('open', () => {
      console.log('✅ Task Progress WebSocket connected');
      if (this.taskProgressConnectionTimeout) {
        clearTimeout(this.taskProgressConnectionTimeout);
        this.taskProgressConnectionTimeout = null;
      }
      this.updateTaskProgressStatus({
        connected: true,
        connecting: false,
        error: null,
        lastConnected: new Date(),
        reconnectAttempts: 0
      });
      this.shouldReconnectTaskProgress = true;
    });

    this.taskProgressWs.addEventListener('close', (event) => {
      console.log('🔌 Task Progress WebSocket disconnected:', event.code, event.reason);
      
      if (this.taskProgressConnectionTimeout) {
        clearTimeout(this.taskProgressConnectionTimeout);
        this.taskProgressConnectionTimeout = null;
      }

      this.updateTaskProgressStatus({
        connected: false,
        connecting: false,
        error: `Disconnected: ${event.reason || `Code ${event.code}`}`
      });

      // Handle reconnection if not a manual disconnect
      if (event.code !== 1000 && this.shouldReconnectTaskProgress) {
        this.handleTaskProgressReconnect(taskId);
      }
    });

    this.taskProgressWs.addEventListener('error', (error) => {
      console.error('❌ Task Progress WebSocket error:', error);
      if (this.taskProgressConnectionTimeout) {
        clearTimeout(this.taskProgressConnectionTimeout);
        this.taskProgressConnectionTimeout = null;
      }
      this.updateTaskProgressStatus({
        connected: false,
        connecting: false,
        error: 'Task Progress WebSocket connection error'
      });
    });

    this.taskProgressWs.addEventListener('message', (event) => {
      console.log('📨 Task progress message received RAW:', event.data);
      console.log('🔍 Message event type:', typeof event.data);
      console.log('🔍 WebSocket readyState:', this.taskProgressWs?.readyState);
      
      try {
        const data = JSON.parse(event.data);
        // console.log('📊 Parsed task progress data:', data);
        
        // Check if it's an error message
        if (data.error) {
          console.error('❌ Task Progress Server error:', data.error);
          this.updateTaskProgressStatus({
            error: data.error
          });
          return;
        }

        // Task progress update
        console.log('📈 Task progress update:', data);
        this.notifyTaskProgressCallbacks(data as ITaskProgress);
      } catch (error) {
        console.error('❌ Error parsing task progress message:', error);
        console.error('❌ Raw data that failed to parse:', event.data);
      }
    });
  }

  private handleTaskProgressReconnect(taskId: string): void {
    if (!this.config.reconnection || !this.shouldReconnectTaskProgress) {
      return;
    }

    if (this.taskProgressStatus.reconnectAttempts >= (this.config.reconnectionAttempts || 5)) {
      console.error('❌ Max task progress reconnection attempts reached');
      this.updateTaskProgressStatus({
        error: 'Max task progress reconnection attempts reached',
        reconnectAttempts: this.taskProgressStatus.reconnectAttempts
      });
      return;
    }

    const attemptNumber = this.taskProgressStatus.reconnectAttempts + 1;
    console.log(`🔄 Task Progress Reconnection attempt ${attemptNumber}/${this.config.reconnectionAttempts}`);

    // Exponential backoff with max delay
    const delay = Math.min(
      (this.config.reconnectionDelay || 1000) * Math.pow(2, attemptNumber - 1),
      this.config.reconnectDelayMax || 30000
    );

    this.updateTaskProgressStatus({
      reconnectAttempts: attemptNumber
    });

    this.taskProgressReconnectTimeout = setTimeout(() => {
      this.connectToTaskProgress(this.currentBaseUrl, taskId);
    }, delay);
  }

  private getTaskProgressWebSocketUrl(httpUrl: string, taskId: string): string {
    try {
      const url = new URL(httpUrl);
      const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      // Task progress endpoint: /progress/{task_id}/ws
      const wsUrl = `${protocol}//${url.host}/progress/${taskId}/ws`;
      return wsUrl;
    } catch (error) {
      console.error('Invalid URL:', httpUrl);
      // Fallback for localhost
      return httpUrl.replace(/^https?/, 'ws') + `/progress/${taskId}/ws`;
    }
  }

  private updateTaskProgressStatus(updates: Partial<SocketStatus>): void {
    this.taskProgressStatus = { ...this.taskProgressStatus, ...updates };
    // Notify status callbacks
    this.notifyTaskProgressStatusCallbacks(this.taskProgressStatus);
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

