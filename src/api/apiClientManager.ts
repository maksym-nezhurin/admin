import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { SCRAPPER_URL, LOCAL_SCRAPPER_URL } from './apiScrapperClient';

export interface ApiClientConfig {
  baseURL: string;
  headers?: Record<string, string> | any;
}

class ApiClientManager {
  private clients: Map<string, AxiosInstance> = new Map();
  private defaultClient: AxiosInstance;

  constructor() {
    this.defaultClient = this.createClient({
      baseURL: SCRAPPER_URL,
    });
  }

  private createClient(config: ApiClientConfig): AxiosInstance {
    return axios.create({
      baseURL: config.baseURL,
      headers: {
        'Content-Type': 'application/json',
        ...config.headers,
      },
    });
  }

  // Register a new client with a name
  registerClient(name: string, config: ApiClientConfig): void {
    const client = this.createClient(config);
    this.clients.set(name, client);
  }

  // Get a specific client by name
  getClient(name?: string): AxiosInstance {
    if (!name) {
      console.log(`Using default client with baseURL:`, this.defaultClient.defaults.baseURL);
      return this.defaultClient;
    }
    const client = this.clients.get(name);
    if (!client) {
      console.warn(`Client "${name}" not found. Using default client.`);
      return this.defaultClient;
    }
    console.log(`Client "${name}" found. Using client with baseURL:`, client.defaults.baseURL);
    return client;
  }

  // Update an existing client's configuration
  updateClient(name: string, config: Partial<ApiClientConfig>): void {
    const existingClient = this.clients.get(name);
    if (existingClient) {
      const newConfig = {
        baseURL: existingClient.defaults.baseURL || '',
        headers: existingClient.defaults.headers || {},
        ...config,
      };
      this.clients.set(name, this.createClient(newConfig));
    }
  }

  // Switch default client (useful for global switching)
  setDefaultClient(name: string): void {
    const client = this.clients.get(name);
    if (client) {
      this.defaultClient = client;
      this.logAllClients();
    } else {
      console.warn(`⚠️ Client "${name}" not found. Available clients:`, Array.from(this.clients.keys()));
    }
  }

  // Log all registered clients with their URLs
  logAllClients(): void {
    console.log('📋 All registered API clients:');
    this.clients.forEach((client, name) => {
      const isDefault = client === this.defaultClient;
      const status = isDefault ? '✅ ACTIVE' : '⚪ Available';
      console.log(`  ${status} "${name}": ${client.defaults.baseURL}`);
    });
  }

  // Get all registered client names
  getClientNames(): string[] {
    return Array.from(this.clients.keys());
  }

  // Remove a client
  removeClient(name: string): void {
    this.clients.delete(name);
  }
}

export const apiClientManager = new ApiClientManager();

// Initialize with default clients
console.log('🚀 Initializing API Client Manager...');
apiClientManager.registerClient('local', {
  baseURL: LOCAL_SCRAPPER_URL,
});

apiClientManager.registerClient('remote', {
  baseURL: SCRAPPER_URL,
});

// Set initial default to remote
apiClientManager.setDefaultClient('remote');
console.log('✅ API Client Manager initialization complete!');

export default apiClientManager;
