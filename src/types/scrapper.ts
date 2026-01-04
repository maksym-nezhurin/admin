export interface IRequest {
  id: string;
  status: string;
  task_id: string;
  duration_seconds?: number;
  market?: string;
  items_count?: number;
  loading?: boolean;
}

export interface IParsedCarItem {
    title: string;
    price: string;
    phone: string;
    url: string;
}

export interface IResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    count: number;
}

export interface IRequestStatus {
    id: string;
    status: string;
    processed?: number;
    total?: number;
    percent?: number;
    loading?: boolean;
}

export const SCRAPPING_SOURCES_ENUM = {
  AUTOBazar: 'autobazar',
  AUTORIA: 'autoria',
} as const;

export const SCRAPPING_MARKETS_ENUM = {
  SLOVAKIA: 'SK',
  UKRAINE: 'UA',
} as const;

export type SCRAPPING_MARKETS_ENUM = (typeof SCRAPPING_MARKETS_ENUM)[keyof typeof SCRAPPING_MARKETS_ENUM];

