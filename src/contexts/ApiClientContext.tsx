import React, { createContext, useContext, useState, type ReactNode } from 'react';
import apiClientManager from '../api/apiClientManager';
import type { ApiClientConfig } from '../api/apiClientManager';

interface ApiClientContextType {
  currentClient: string;
  switchClient: (clientName: string) => void;
  registerClient: (name: string, config: ApiClientConfig) => void;
  getClientNames: () => string[];
  getClient: (name?: string) => any; // Added getClient function
  getXLSUrl: (taskId: string) => string;
  isUsingLocal: boolean;
}

const ApiClientContext = createContext<ApiClientContextType | undefined>(undefined);

interface ApiClientProviderProps {
  children: ReactNode;
}

export const ApiClientProvider: React.FC<ApiClientProviderProps> = ({ children }) => {
  const [currentClient, setCurrentClient] = useState<string>('remote');

  const switchClient = (clientName: string) => {
    apiClientManager.setDefaultClient(clientName);
    setCurrentClient(clientName);
  };

  const registerClient = (name: string, config: ApiClientConfig) => {
    apiClientManager.registerClient(name, config);
  };

  const getClientNames = () => {
    return apiClientManager.getClientNames();
  };

  const getClient = (name?: string) => {
    return apiClientManager.getClient(name);
  };

  const getXLSUrl = (taskId: string) => {
    const client = apiClientManager.getClient();

    return `${client.defaults.baseURL}export/task/${taskId}.xls`;
  };

  const isUsingLocal = currentClient === 'local';

  return (
    <ApiClientContext.Provider
      value={{
        currentClient,
        switchClient,
        registerClient,
        getClientNames,
        getClient,
        isUsingLocal,
        getXLSUrl,
      }}
    >
      {children}
    </ApiClientContext.Provider>
  );
};

export const useApiClient = (): ApiClientContextType => {
  const context = useContext(ApiClientContext);
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiClientProvider');
  }
  return context;
};
