import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { DEFAULT_FILTERS_CONFIG, ADDITIONAL_FILTERS_CONFIG, GET_SCRAPPING_SOURCES_BY_MARKET, SCRAPPING_MARKETS_ENUM, type ITaskProgress, type IQueueStatus } from '../constants/scrapper';
import type { FilterConfig } from '../constants/scrapper';
import type { TSelectOption } from '../types/common';
import { scrapperServices } from '../services/scrapper';
import { getSocketService } from '../services/socketService';
import { useApiClient } from '../contexts/ApiClientContext';
import apiClientManager from '../api/apiClientManager';

export interface IFilters {
  [key: string]: string | number | Array<string | number> | undefined;
}

export interface IRequest {
    id: string;
    taskId: string;
    itemsCount?: number;
    durationSec?: number;
    market?: SCRAPPING_MARKETS_ENUM | null;
    status: string;
    processed?: number;
    total?: number;
    percent?: number;
    loading?: boolean;
    itemsWithoutPhone?: number;
    createdAt?: string;
    updatedAt?: string;
    completedAt?: string;
}

interface ScrapperContextType {
  market: SCRAPPING_MARKETS_ENUM | null;
  setMarket: (m: SCRAPPING_MARKETS_ENUM | null) => void;
  filters: IFilters;
  filtersConfig: FilterConfig[];
  setFilters: (f: IFilters) => void;
  allowedMarkets: TSelectOption[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  requests: IRequest[];
  setRequests: (r: IRequest[]) => void;
  fetchRequests: (userId: string) => Promise<void>;
  fetchQueueStatus: () => Promise<void>;
  redisQueueStatus: IQueueStatus | null;
  socketStatus: 'connected' | 'disconnected' | 'fallback' | 'connecting';
  connectSocket: () => Promise<boolean>;
  disconnectSocket: () => void;
  // Task progress socket methods
  taskProgressEnabled: boolean;
  setTaskProgressEnabled: (enabled: boolean) => void;
  connectToTaskProgress: (websocketUrl: string, taskId: string) => Promise<boolean>;
  connectTaskProgress: (taskId: string, websocketUrl?: string) => Promise<boolean>;
  disconnectTaskProgress: () => void;
  taskProgressSocketStatus: 'connected' | 'disconnected' | 'connecting';
  activeTaskProgressSubscriptions: Set<string>;
}

interface ScrapperProviderProps {
  userId?: string;
  children: React.ReactNode;
}

const ScrapperContext = createContext<ScrapperContextType | undefined>(undefined);

export const useScrapper = (): ScrapperContextType => {
  const ctx = useContext(ScrapperContext);
  if (!ctx) throw new Error('useScrapper must be used inside ScrapperProvider');
  return ctx;
};

export const ScrapperProvider: React.FC<ScrapperProviderProps> = ({ userId, children }) => {
  const [market, setMarket] = useState<SCRAPPING_MARKETS_ENUM | null>(null);
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [redisQueueStatus, setRedisQueueStatus] = useState<IQueueStatus | null>(null);
  const [socketStatus, setSocketStatus] = useState<'connected' | 'disconnected' | 'fallback' | 'connecting'>('disconnected');
  const [taskProgressSocketStatus, setTaskProgressSocketStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  const [activeTaskProgressSubscriptions, setActiveTaskProgressSubscriptions] = useState<Set<string>>(new Set());
  const [filtersConfig, setFiltersConfig] = useState<FilterConfig[]>([]);
  const [filters, setFilters] = useState<IFilters>({
    user_id: userId ?? undefined,
  });
  const [allowedMarkets, setAllowedMarkets] = useState<TSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>();
  const [taskProgressEnabled, setTaskProgressEnabled] = useState(true);
  
  // Debounce refs to prevent rapid API calls
  const fetchRequestsRef = useRef<NodeJS.Timeout | null>(null);
  const fetchQueueStatusRef = useRef<NodeJS.Timeout | null>(null);
  const autoConnectRef = useRef<NodeJS.Timeout | null>(null);
  const connectedTasksRef = useRef<Set<string>>(new Set());

  const { getMyRequests, getQueueStatus, subscribeToQueueStatus, subscribeToSocketStatus, connectSocket, disconnectSocket, isSocketHealthy, connectToTaskProgress, disconnectTaskProgress, subscribeToTaskProgress } = scrapperServices;
  const { getClient } = useApiClient();

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Replace with your real API endpoints
      // const permRes = await fetch('/api/scrapper/permissions');
      // if (!permRes.ok) throw new Error('permissions fetch failed');
      // const permData = await permRes.json();
      const permissions: SCRAPPING_MARKETS_ENUM[] = [
        'UA',
        'SK', 
      ];
      const allowed: TSelectOption[] = permissions.reduce((acc: TSelectOption[], permission: SCRAPPING_MARKETS_ENUM) => {
        const sources = GET_SCRAPPING_SOURCES_BY_MARKET(permission);
        return acc.concat(sources);
      }, []);

      const permData = { defaultMarket: allowed[0].value };
      const defaultMarket: SCRAPPING_MARKETS_ENUM = String(permData.defaultMarket ?? allowed[0].value) as SCRAPPING_MARKETS_ENUM;
      
      setAllowedMarkets(allowed);
      setMarket(prev => prev || (defaultMarket as SCRAPPING_MARKETS_ENUM) || null);
    } catch (err: Error | any) {
      setError(err?.message ?? 'unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchRequests = useCallback(async (userId: string) => {
    if (!userId) return;
    
    // Clear existing timeout
    if (fetchRequestsRef.current) {
      clearTimeout(fetchRequestsRef.current);
    }
    
    // Debounce the API call
    fetchRequestsRef.current = setTimeout(async () => {
      setLoading(true);
      setError(undefined);
      try {
        const tasks = await getMyRequests(userId);
        setRequests(tasks || []);
      } catch (err: Error | any) {
        setError(err?.message ?? 'unknown');
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  }, [getMyRequests]);

  const fetchQueueStatus = useCallback(async () => {
    // Clear existing timeout
    if (fetchQueueStatusRef.current) {
      clearTimeout(fetchQueueStatusRef.current);
    }
    
    // Debounce the API call
    fetchQueueStatusRef.current = setTimeout(async () => {
      try {
        const status = await getQueueStatus();
        setRedisQueueStatus(status);
      } catch (err: Error | any) {
        setError(err?.message ?? 'unknown');
      }
    }, 300); // 300ms debounce
  }, [getQueueStatus, isSocketHealthy]);

  // Socket connection management
  const handleConnectSocket = useCallback(async (): Promise<boolean> => {
    try {
      const currentClient = getClient();
      const baseUrl = currentClient.defaults.baseURL;
      
      const connected = await connectSocket(baseUrl);
      if (connected) {
        setSocketStatus('connected');
      } else {
        setSocketStatus('disconnected');
      }
      return connected;
    } catch (error) {
      console.error('Socket connection error:', error);
      setSocketStatus('disconnected');
      return false;
    }
  }, [getClient, connectSocket]);

  const handleDisconnectSocket = useCallback(() => {
    disconnectSocket();
    setSocketStatus('disconnected');
  }, []);

  // Task progress connection management
  const handleConnectTaskProgress = useCallback(async (taskId: string, websocketUrl?: string): Promise<boolean> => {
    if (!taskProgressEnabled) {
      return false;
    }

    if (!websocketUrl) {
      console.error('❌ WebSocket URL is required');
      return false;
    }

    try {
      const connected = await connectToTaskProgress(websocketUrl, taskId);
      if (connected) {
        setTaskProgressSocketStatus('connected');
        setActiveTaskProgressSubscriptions(prev => new Set(prev).add(taskId));
      } else {
        setTaskProgressSocketStatus('disconnected');
      }
      return connected;
    } catch (error) {
      console.error('Task progress socket connection error:', error);
      setTaskProgressSocketStatus('disconnected');
      return false;
    }
  }, [taskProgressEnabled, connectToTaskProgress]);

  const handleDisconnectTaskProgress = useCallback(() => {
    disconnectTaskProgress();
    setTaskProgressSocketStatus('disconnected');
    setActiveTaskProgressSubscriptions(new Set());
  }, []);

  // Initialize socket subscriptions
  useEffect(() => {
    let unsubscribeQueueStatus: (() => void) | null = null;
    let unsubscribeSocketStatus: (() => void) | null = null;
    let unsubscribeTaskProgress: (() => void) | null = null;

    // Always subscribe to main socket status (independent of task progress)
    unsubscribeSocketStatus = subscribeToSocketStatus((status) => {
      setSocketStatus(status.connected ? 'connected' : status.connecting ? 'connecting' : 'disconnected');
    });

    // Subscribe to queue status (independent of task progress)
    unsubscribeQueueStatus = subscribeToQueueStatus((data) => {
      setRedisQueueStatus(data);
    });

    // Initial fetch of queue status so workers/queue data is visible even before WebSocket
    fetchQueueStatus();

    // Subscribe to task progress socket status changes
    const socketService = getSocketService();
    const unsubscribeTaskProgressStatus = socketService.subscribeToTaskProgressStatus((status) => {
      if (status.connected) {
        setTaskProgressSocketStatus('connected');
        if (userId) {
          fetchQueueStatus();
          fetchRequests(userId);
        }
      } else if (status.connecting) {
        setTaskProgressSocketStatus('connecting');
      } else {
        setTaskProgressSocketStatus('disconnected');
      }
    });

    // Subscribe to task progress updates ONLY if enabled
    if (taskProgressEnabled) {
      unsubscribeTaskProgress = subscribeToTaskProgress(async (data: ITaskProgress) => {
        if (data.status === 'finished' || data.status === 'failed') {
          // Remove from connected tasks tracking so it can be retried if needed
          connectedTasksRef.current.delete(data.taskId);
          
          // Fetch fresh task details to get accurate execution time and other final data
          try {
            const taskDetails = await scrapperServices.getTaskDetails(data.taskId);
            setRequests(prevRequests => 
              prevRequests.map(request => 
                request.taskId === data.taskId 
                  ? { 
                      ...request, 
                      processed: taskDetails.processed, 
                      total: taskDetails.total, 
                      percent: taskDetails.percent, 
                      status: taskDetails.status,
                      actual_total: taskDetails.actual_total,
                      itemsWithoutPhone: taskDetails.itemsWithoutPhone,
                      items_count: taskDetails.items_count,
                      duration_seconds: taskDetails.duration_seconds,
                      createdAt: taskDetails.createdAt || request.createdAt
                    }
                  : request
              )
            );
          } catch {
            // ignore
          }
        }

        // Update the corresponding request in the requests array
        setRequests(prevRequests => {
          const updatedRequests = prevRequests.map(request => {
            if (request.taskId === data.taskId) {
              return { 
                ...request, 
                processed: data.processed, 
                total: data.total, 
                percent: data.percent, 
                status: data.status,
                actual_total: data.actual_total,
                loading: false
              };
            }
            return request;
          });
          return updatedRequests;
        });
        
        // Also refresh requests list to ensure we have the latest data
        // if (userId && (data.status === 'finished' || data.status === 'failed')) {
        //   setTimeout(() => {
        //     fetchRequests(userId);
        //   }, 1000);
        // }
      });
    }

    return () => {
      if (unsubscribeQueueStatus) unsubscribeQueueStatus();
      if (unsubscribeSocketStatus) unsubscribeSocketStatus();
      if (unsubscribeTaskProgress) unsubscribeTaskProgress();
      if (unsubscribeTaskProgressStatus) unsubscribeTaskProgressStatus();
      
      // Clear active task progress subscriptions
      setActiveTaskProgressSubscriptions(new Set());
      
      // handleDisconnectSocket();
      // handleDisconnectTaskProgress();
    };
  }, [handleDisconnectTaskProgress, taskProgressEnabled, userId]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  useEffect(() => {
    if (!market) return;

    setFiltersConfig(
        [
          ...DEFAULT_FILTERS_CONFIG,
          ...(ADDITIONAL_FILTERS_CONFIG[market] || []),
        ]
    );
  }, [market]);

  useEffect(() => {
    if (userId) {
      fetchRequests(userId);
      fetchQueueStatus();
    }
  }, [userId]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (fetchRequestsRef.current) {
        clearTimeout(fetchRequestsRef.current);
      }
      if (fetchQueueStatusRef.current) {
        clearTimeout(fetchQueueStatusRef.current);
      }
      if (autoConnectRef.current) {
        clearTimeout(autoConnectRef.current);
      }
      // Clear connected tasks tracking on unmount
      connectedTasksRef.current.clear();
    };
  }, []);

  // Auto-connect to task progress sockets for tasks that are in progress
  useEffect(() => {
    if (!taskProgressEnabled) {
      return;
    }

    // Use functional update to get current activeTaskProgressSubscriptions
    // This avoids needing it in dependencies
    let currentSubscriptions: Set<string> = new Set();
    setActiveTaskProgressSubscriptions(prev => {
      currentSubscriptions = prev;
      return prev;
    });
    
    const inProgressTasks = requests.filter(request => 
      request.status !== 'finished' && 
      request.status !== 'failed' &&
      !currentSubscriptions.has(request.taskId)
    );

    if (inProgressTasks.length === 0) {
      return;
    }

    inProgressTasks.forEach(async (request) => {
      if (connectedTasksRef.current.has(request.taskId)) {
        return;
      }
      connectedTasksRef.current.add(request.taskId);
      try {
        const taskDetails = await scrapperServices.getTaskDetails(request.taskId);
        let websocket_url = taskDetails.websocket_url;
        if (!websocket_url) {
          const currentClient = apiClientManager.getClient();
          const baseUrl = (currentClient.defaults.baseURL || '').replace(/\/$/, '');
          websocket_url = baseUrl.replace(/^http/, 'ws') + `/progress/${request.taskId}/ws`;
        }
        const connected = await connectToTaskProgress(websocket_url, request.taskId);
        if (connected) {
          setActiveTaskProgressSubscriptions(prev => new Set(prev).add(request.taskId));
        }
      } catch {
        // ignore
      }
    });
    
    // IMPORTANT: Don't include activeTaskProgressSubscriptions in dependencies
    // to avoid infinite loop when adding subscriptions!
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskProgressEnabled, connectToTaskProgress, requests]);


  const refresh = useCallback(async () => {
    await fetchPermissions();
  }, [fetchPermissions]);

  return (
    <ScrapperContext.Provider
      value={{
        market,
        setMarket,
        filters,
        setFilters,
        filtersConfig,
        allowedMarkets,
        loading,
        error,
        refresh,
        requests,
        setRequests,
        fetchRequests,
        fetchQueueStatus,
        redisQueueStatus,
        socketStatus,
        connectSocket: handleConnectSocket,
        disconnectSocket: handleDisconnectSocket,
        // Task progress methods
        taskProgressEnabled,
        setTaskProgressEnabled,
        connectToTaskProgress: async (websocketUrl: string, taskId: string) => {
          return await scrapperServices.connectToTaskProgress(websocketUrl, taskId);
        },
        connectTaskProgress: handleConnectTaskProgress,
        disconnectTaskProgress: handleDisconnectTaskProgress,
        taskProgressSocketStatus,
        activeTaskProgressSubscriptions,
      }}
    >
      {children}
    </ScrapperContext.Provider>
  );
};