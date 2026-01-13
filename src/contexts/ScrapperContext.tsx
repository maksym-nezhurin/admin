import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEFAULT_FILTERS_CONFIG, ADDITIONAL_FILTERS_CONFIG, GET_SCRAPPING_SOURCES_BY_MARKET, SCRAPPING_MARKETS_ENUM } from '../constants/scrapper';
import type { FilterConfig } from '../constants/scrapper';
import type { TSelectOption } from '../types/common';
import { scrapperServices } from '../services/scrapper';
import type { IQueueStatus } from '../constants/scrapper';
import { useApiClient } from '../contexts/ApiClientContext';

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
  const [filtersConfig, setFiltersConfig] = useState<FilterConfig[]>([]);
  const [filters, setFilters] = useState<IFilters>({
    user_id: userId ?? undefined,
  });
  const [allowedMarkets, setAllowedMarkets] = useState<TSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const { getMyRequests, getQueueStatus, subscribeToQueueStatus, subscribeToSocketStatus, connectSocket, disconnectSocket, isSocketHealthy } = scrapperServices;
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

  const fetchRequests = async (userId: string) => {
    console.log('fetchRequests', userId);
    if (!userId) return;
    
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
  };

  const fetchQueueStatus = async () => {
    console.log('fetchQueueStatus');
    
    // If socket is healthy, no need to fetch via HTTP
    if (isSocketHealthy()) {
      console.log('Socket is healthy, skipping HTTP fetch');
      return;
    }
    
    try {
      const status = await getQueueStatus();
      console.log('Queue status (HTTP fallback):', status);
      setRedisQueueStatus(status);
      setSocketStatus('fallback');
    } catch (err: Error | any) {
      console.error('Failed to fetch queue status:', err);
      setSocketStatus('fallback');
    }
  };

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

  // Initialize socket subscriptions
  useEffect(() => {
    let unsubscribeQueueStatus: (() => void) | null = null;
    let unsubscribeSocketStatus: (() => void) | null = null;

    const setupSubscriptions = () => {
      // Subscribe to queue status updates
      unsubscribeQueueStatus = subscribeToQueueStatus((data: IQueueStatus) => {
        console.log('📊 Real-time queue status update:', data);
        setRedisQueueStatus(data);
        setSocketStatus('connected');
      });

      // Subscribe to socket status changes
      unsubscribeSocketStatus = subscribeToSocketStatus((status) => {
        if (status.connected) {
          setSocketStatus('connected');
        } else if (status.connecting) {
          setSocketStatus('connecting');
        } else {
          setSocketStatus('disconnected');
        }
      });
    };

    // Try to connect socket
    handleConnectSocket().then(connected => {
      console.log('Socket connection result:', connected);
      if (connected) {
        setupSubscriptions();
      } else {
        // Fallback to HTTP polling
        console.log('⚠️ Using HTTP fallback');
        setSocketStatus('fallback');
      }
    });

    // Cleanup
    return () => {
      if (unsubscribeQueueStatus) unsubscribeQueueStatus();
      if (unsubscribeSocketStatus) unsubscribeSocketStatus();
      handleDisconnectSocket();
    };
  }, [handleConnectSocket, handleDisconnectSocket]);

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
      }}
    >
      {children}
    </ScrapperContext.Provider>
  );
};