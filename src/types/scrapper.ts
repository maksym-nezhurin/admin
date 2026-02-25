import { SCRAPPING_MARKETS_ENUM } from "../constants/scrapper";

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
export interface IParsedCarItem {
    id?: string | number;
    title?: string;
    price: string;
    phone: string;
    url: string;
    status?: string;
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
