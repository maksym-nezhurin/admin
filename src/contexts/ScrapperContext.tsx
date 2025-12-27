import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_FILTERS_CONFIG, ADDITIONAL_FILTERS_CONFIG, GET_SCRAPPING_SOURCES_BY_MARKET, SCRAPPING_MARKETS_ENUM } from '../constants/scrapper';
import type { FilterConfig } from '../constants/scrapper';
import type { TSelectOption } from '../types/common';
import { scrapperServices } from '../services/scrapper';

export interface IFilters {
  [key: string]: string | number | Array<string | number> | undefined;
}

interface IRequest {
    id: string;
    status: string;
    processed?: number;
    total?: number;
    percent?: number;
    loading?: boolean;
}

interface ScrapperContextType {
  market: string;
  setMarket: (m: string) => void;
  filters: IFilters;
  filtersConfig: FilterConfig[];
  setFilters: (f: IFilters) => void;
  allowedMarkets: TSelectOption[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  requests: IRequest[];
  setRequests: (r: IRequest[]) => void;
}

const ScrapperContext = createContext<ScrapperContextType | undefined>(undefined);

export const useScrapper = (): ScrapperContextType => {
  const ctx = useContext(ScrapperContext);
  if (!ctx) throw new Error('useScrapper must be used inside ScrapperProvider');
  return ctx;
};

export const ScrapperProvider = ({ userId, children }: { children: ReactNode }) => {
  const [market, setMarket] = useState<string>('');
  const [requests, setRequests] = useState<IRequest[]>([]);
  const [filtersConfig, setFiltersConfig] = useState<FilterConfig[]>([]);
  const [filters, setFilters] = useState<IFilters>({
    user_id: userId,
  });
  const [allowedMarkets, setAllowedMarkets] = useState<TSelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);
  const { getMyRequests } = scrapperServices;

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
      const defaultMarket: string = String(permData.defaultMarket ?? allowed[0].value);
      
      setAllowedMarkets(allowed);
      setMarket(prev => prev || defaultMarket);
    } catch (err: Error | any) {
      setError(err?.message ?? 'unknown');
    } finally {
      setLoading(false);
    }
  }, []);

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
    const fetchRequests = async () => {
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

    if (userId) {
        fetchRequests();
    }
  }, []);

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
      }}
    >
      {children}
    </ScrapperContext.Provider>
  );
};