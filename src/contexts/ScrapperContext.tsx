import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { DEFAULT_FILTERS_CONFIG, ADDITIONAL_FILTERS_CONFIG, GET_SCRAPPING_SOURCES_BY_MARKET } from '../constants/scrapper';

interface Filters {
  [key: string]: string | number;
}

interface ScrapperContextType {
  market: string;
  setMarket: (m: string) => void;
  filters: Filters;
  setFilters: (f: Filters) => void;
  availableSources: string[];
  allowedMarkets: string[];
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
}

const ScrapperContext = createContext<ScrapperContextType | undefined>(undefined);

export const useScrapper = (): ScrapperContextType => {
  const ctx = useContext(ScrapperContext);
  if (!ctx) throw new Error('useScrapper must be used inside ScrapperProvider');
  return ctx;
};

export const ScrapperProvider = ({ children }: { children: ReactNode }) => {
  const [market, setMarket] = useState<string>('');
  const [filtersConfig, setFiltersConfig] = useState<Filters>([]);
  const [filters, setFilters] = useState<Filters>({});
  const [allowedMarkets, setAllowedMarkets] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const fetchPermissions = useCallback(async () => {
    setLoading(true);
    setError(undefined);
    try {
      // Replace with your real API endpoints
      // const permRes = await fetch('/api/scrapper/permissions');
      // if (!permRes.ok) throw new Error('permissions fetch failed');
      // const permData = await permRes.json();
      const permissions = [
        'UA',
        // 'SK', 
      ];
      const allowed: string[] = permissions.reduce((acc: string[], permission: string) => {
        const sources = GET_SCRAPPING_SOURCES_BY_MARKET(permission);
        return acc.concat(sources);
      }, []);
      const permData = { defaultMarket: allowed[0].value }; // mock default market
      const defaultMarket: string = permData.defaultMarket ?? allowed[0].value;
      
      setAllowedMarkets(allowed);
      setMarket(prev => prev || defaultMarket);
      // fetch sources for default market
      // const srcRes = await fetch(`/api/scrapper/sources?market=${encodeURIComponent(defaultMarket)}`);
      // if (!srcRes.ok) throw new Error('sources fetch failed');
      // const srcData = await srcRes.json();
      // setAvailableSources(srcData.sources ?? []);
    } catch (err: any) {
      setError(err?.message ?? 'unknown');
    } finally {
      setLoading(false);
    }
  }, []);

  // initial permissions + sources
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
      }}
    >
      {children}
    </ScrapperContext.Provider>
  );
};