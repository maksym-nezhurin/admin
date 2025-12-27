import { useState } from 'react';
import axios from 'axios';
import { Button } from '@mantine/core';

import { useScrapper } from '../../contexts/ScrapperContext';
import { AVAILABLE_FILTERS, DEFAULT_FILTERS_VALUES } from '../../constants/scrapper';

interface IParsedCarItem {
    title: string;
    price: string;
    phone: string;
    url: string;
}

interface IResponse<T> {
    items: T[];
    total: number;
    limit: number;
    offset: number;
    count: number;
}

interface IRequestStatus {
    id: string;
    status: string;
    processed?: number;
    total?: number;
    percent?: number;
    loading?: boolean;
}

interface IEstimateResponse {
    url_tested: string;
    total_estimate: number;
    per_page: number;
    note: string;
}

const BASE_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export const ScrapperNavigation = () => {
    const { filters, market, requests, setRequests } = useScrapper();
    const [estimate, setEstimates] = useState<IEstimateResponse>({
        url_tested: '',
        total_estimate: 0,
        per_page: 0,
        note: '',
    });
    const [loadingEstimate, setLoadingEstimate] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const getParams = () => {
        const params = {
            ...filters,
            market,
            mileage_from: filters.mileage_from ?? DEFAULT_FILTERS_VALUES.mileage_from,
            mileage_to: filters.mileage_to ?? DEFAULT_FILTERS_VALUES.mileage_to,
            price_from: filters.price_from ?? DEFAULT_FILTERS_VALUES.price_from,
            price_to: filters.price_to ?? DEFAULT_FILTERS_VALUES.price_to,
            year_from: filters.year_from ?? DEFAULT_FILTERS_VALUES.year_from,
            year_to: filters.year_to ?? DEFAULT_FILTERS_VALUES.year_to,
            gearbox: 31393,
            // filters store fuel under AVAILABLE_FILTERS.FUEL_TYPE (e.g. 'fuel_type_ids'), map it to API param 'fuel_type'
            fuel_type: (filters as Record<string, any>)[AVAILABLE_FILTERS.FUEL_TYPE] ?? DEFAULT_FILTERS_VALUES[AVAILABLE_FILTERS.FUEL_TYPE],
            // "location": 100000000,
            user_type: 2,
        };
        return params;
    };

    const onHandleEstimate = async () => {
        setLoadingEstimate(true);
        const params = getParams();
        const res = await apiClient.post('/estimate', params);

        setEstimates(res.data);
        setLoadingEstimate(false);
    };

    const onHandleStart = async () => {
        setLoadingRequests(true);
        const params = getParams();
        const res = await apiClient.post('/start', params);

        const { task_id, status } = res.data;

        setRequests([...requests, { task_id, status }]);

        setLoadingRequests(false);
    };

    return <div>
         <nav>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '10px' }}>
                <li>
                    <Button onClick={onHandleEstimate} disabled={loadingEstimate}>Estimate request</Button>
                </li>
                <li>
                    <Button onClick={onHandleStart} disabled={loadingRequests}>Start request</Button>
                </li>
            </ul>
        </nav>

         {
            estimate?.url_tested && <div>
                <h4>Estimate Result:</h4>
                <span style={{ fontSize: '12px' }}>
                    Scrapping{' '}
                    <a
                     href={estimate.url_tested}
                     target="_blank" rel="noopener noreferrer"
                     >
                        url
                    </a>
                </span>
                <pre style={{ fontSize: '10px', whiteSpace: 'normal' }}
                >{
                    JSON.stringify({
                     "total_estimate": estimate.total_estimate,
                     "per_page": estimate.per_page,
                     "note": estimate.note,
                     })
                }</pre>
            </div>
        }
    </div>;
}
