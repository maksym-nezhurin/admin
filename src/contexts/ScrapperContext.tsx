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

interface IRequest {
    id: string;
    task_id: string;
    items_count?: number;
    duration_seconds?: number;
    market?: SCRAPPING_MARKETS_ENUM | null;
    status: string;
    processed?: number;
    total?: number;
    percent?: number;
    loading?: boolean;
    items_without_phone?: number;
    created_at?: string;
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
  connectToTaskProgress: (baseUrl: string, taskId: string) => Promise<boolean>;
  connectTaskProgress: (taskId: string, baseUrl?: string) => Promise<boolean>;
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
    console.log('fetchRequests', userId);
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
    console.log('fetchQueueStatus');
    
    // Clear existing timeout
    if (fetchQueueStatusRef.current) {
      clearTimeout(fetchQueueStatusRef.current);
    }
    
    // Debounce the API call
    fetchQueueStatusRef.current = setTimeout(async () => {
      // If socket is healthy, no need to fetch via HTTP
      if (isSocketHealthy()) {
        console.log('Socket is healthy, skipping HTTP fetch');
        return;
      }
      
      try {
        const status = await getQueueStatus();
        console.log('Queue status (HTTP fallback):', status);
        setRedisQueueStatus(status);
      } catch (err: Error | any) {
        console.error('Failed to fetch queue status:', err);
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
      console.log('Socket connection result:', connected);
      
      if (connected) {
        setSocketStatus('connected');
        console.log('✅ Socket connected successfully');
      } else {
        setSocketStatus('disconnected');
        console.log('❌ Socket connection failed');
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
    console.log('🔌 Socket disconnected');
  }, []);

  // Task progress connection management
  const handleConnectTaskProgress = useCallback(async (taskId: string): Promise<boolean> => {
    if (!taskProgressEnabled) {
      console.log('Task progress is disabled');
      return false;
    }

    try {
      const currentClient = getClient();
      const baseUrl = currentClient.defaults.baseURL;
      
      const connected = await connectToTaskProgress(baseUrl, taskId);
      console.log('Task progress socket connection result:', connected);
      
      if (connected) {
        setTaskProgressSocketStatus('connected');
        setActiveTaskProgressSubscriptions(prev => new Set(prev).add(taskId));
        console.log('✅ Task progress socket connected successfully');
      } else {
        setTaskProgressSocketStatus('disconnected');
        console.log('❌ Task progress socket connection failed');
      }
      return connected;
    } catch (error) {
      console.error('Task progress socket connection error:', error);
      setTaskProgressSocketStatus('disconnected');
      return false;
    }
  }, [taskProgressEnabled, getClient, connectToTaskProgress]);

  const handleDisconnectTaskProgress = useCallback(() => {
    disconnectTaskProgress();
    setTaskProgressSocketStatus('disconnected');
    setActiveTaskProgressSubscriptions(new Set());
    console.log('🔌 Task progress socket disconnected');
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

    // Subscribe to task progress socket status changes
    const socketService = getSocketService();
    const unsubscribeTaskProgressStatus = socketService.subscribeToTaskProgressStatus((status) => {
      console.log('📊 Task progress socket status changed:', status);
      if (status.connected) {
        setTaskProgressSocketStatus('connected');
        // Refresh queue status and requests when WebSocket connects
        if (userId) {
          console.log('🔄 Refreshing queue status and requests after WebSocket connection');
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
        console.log('📈 Real-time task progress update:', data);
        
        // Check if task is finished or failed, and fetch final data
        if (data.status === 'finished' || data.status === 'failed') {
          console.log('🔌 Task finished/failed, fetching final data for:', data.task_id);
          
          // Fetch fresh task details to get accurate execution time and other final data
          try {
            console.log('🔄 Fetching final task details for:', data.task_id);
            const taskDetails = await scrapperServices.getTaskDetails(data.task_id);
            setRequests(prevRequests => 
              prevRequests.map(request => 
                request.task_id === data.task_id 
                  ? { 
                      ...request, 
                      processed: taskDetails.processed, 
                      total: taskDetails.total, 
                      percent: taskDetails.percent, 
                      status: taskDetails.status,
                      actual_total: taskDetails.actual_total,
                      items_without_phone: taskDetails.items_without_phone,
                      items_count: taskDetails.items_count,
                      duration_seconds: taskDetails.duration_seconds,
                      created_at: taskDetails.created_at || request.created_at
                    }
                  : request
              )
            );
            console.log('✅ Updated final task details for:', data.task_id);
          } catch (error) {
            console.error('❌ Failed to fetch final task details:', error);
          }
        }
        
        // Update the corresponding request in the requests array
        setRequests(prevRequests => {
          const updatedRequests = prevRequests.map(request => {
            if (request.task_id === data.task_id) {
              console.log('✅ Found matching request, updating...');
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

    // Cleanup
    return () => {
      console.log('Cleaning up subscriptions...');
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
    console.log('Fetching scrapper permissions and sources...');
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
    };
  }, []);

  // Auto-connect to task progress sockets for tasks that are in progress
  useEffect(() => {
    console.log('🔧 Auto-connect effect triggered', { taskProgressEnabled, requestsCount: requests.length, activeSubscriptionsCount: activeTaskProgressSubscriptions.size });
    if (!taskProgressEnabled) return;

    // Log all requests and their statuses for debugging
    const allStatuses = requests.map(r => ({ id: r.task_id, status: r.status }));
    console.log('📋 All requests with statuses:', allStatuses);
    
    // Count tasks by status
    const statusCounts = allStatuses.reduce<Record<string, number>>((acc, task) => {
      acc[task.status] = (acc[task.status] || 0) + 1;
      return acc;
    }, {});
    console.log('📊 Status counts:', statusCounts);

    const inProgressTasks = requests.filter(request => 
      request.status !== 'finished' && 
      request.status !== 'failed' &&
      !activeTaskProgressSubscriptions.has(request.task_id)
    );

    console.log('📊 Found in-progress tasks to connect:', inProgressTasks.length, inProgressTasks.map(t => t.task_id));

    inProgressTasks.forEach(async (request) => {
      console.log('Auto-connecting to task progress for task:', request.task_id);
      try {
        const currentClient = apiClientManager.getClient();
        const baseUrl = currentClient.defaults.baseURL || '';
        if (baseUrl) {
          const connected = await connectToTaskProgress(baseUrl, request.task_id);
          
          // Add to active subscriptions if connection was successful OR already connected
          if (connected) {
            setActiveTaskProgressSubscriptions(prev => new Set(prev).add(request.task_id));
            console.log('✅ Added task to active subscriptions:', request.task_id);
          }
          
          // Also fetch fresh data for this task to ensure we have latest status
          // setTimeout(async () => {
          //   try {
          //     const taskDetails = await scrapperServices.getTaskDetails(request.task_id);
          //     setRequests(prevRequests => 
          //       prevRequests.map(r => 
          //         r.task_id === request.task_id 
          //           ? { 
          //               ...r, 
          //               processed: taskDetails.processed, 
          //               total: taskDetails.total, 
          //               percent: taskDetails.percent, 
          //               status: taskDetails.status,
          //               actual_total: taskDetails.actual_total,
          //               items_without_phone: taskDetails.items_without_phone,
          //               items_count: taskDetails.items_count,
          //               duration_seconds: taskDetails.duration_seconds,
          //               created_at: taskDetails.created_at || r.created_at
          //             }
          //           : r
          //       )
          //     );
          //   } catch (error) {
          //     console.error('Failed to fetch task details:', error);
          //   }
          // }, 500);
        }
      } catch (error) {
        console.error('Failed to auto-connect to task progress:', error);
      }
    });
  }, [taskProgressEnabled, activeTaskProgressSubscriptions, connectToTaskProgress, requests]);

  // Separate effect to handle requests changes without triggering connections
  useEffect(() => {
    // This effect runs when requests change but doesn't trigger new connections
    // It only updates the active subscriptions tracking
    console.log('📋 Requests updated, current count:', requests.length);
  }, [requests]);

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
        connectToTaskProgress: async (baseUrl: string, taskId: string) => {
          return await scrapperServices.connectToTaskProgress(baseUrl, taskId);
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