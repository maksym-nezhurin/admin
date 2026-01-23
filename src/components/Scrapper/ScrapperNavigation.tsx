import { useState } from 'react';
import { Button } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { useScrapper } from '../../contexts/ScrapperContext';
import { AVAILABLE_FILTERS, DEFAULT_FILTERS_VALUES } from '../../constants/scrapper';
import { scrapperServices } from '../../services/scrapper';
import apiClientManager from '../../api/apiClientManager';

interface IEstimateResponse {
    url_tested: string;
    total_estimate: number;
    per_page: number;
    note: string;
}

export const ScrapperNavigation = () => {
    const { t } = useTranslation();
    const { filters, market, requests, setRequests, taskProgressEnabled, connectToTaskProgress } = useScrapper();
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
        const data = await scrapperServices.getRequestEstimate(params);

        setEstimates(data);
        setLoadingEstimate(false);
    };

    const onHandleStart = async () => {
        setLoadingRequests(true);
        const params = getParams();
        const data = await scrapperServices.createScrapperRequest(params);
        const { task_id, status } = data;

        setRequests([...requests, { task_id, status, id: task_id, market, items_count: 0, duration_seconds: 0 }]);

        // Auto-connect to WebSocket for the new task if real-time progress is enabled
        if (taskProgressEnabled) {
            try {
                const currentClient = apiClientManager.getClient();
                const baseUrl = currentClient.defaults.baseURL || '';
                await connectToTaskProgress(baseUrl, task_id);
            } catch (error) {
                console.error('Failed to connect to task progress WebSocket:', error);
            }
        }

        setLoadingRequests(false);
    };

    return <div>
         <nav>
            <ul style={{ listStyleType: 'none', padding: 0, display: 'flex', gap: '10px' }}>
                <li>
                    <Button onClick={onHandleEstimate} disabled={loadingEstimate}>{t('scrapper.estimate_request')}</Button>
                </li>
                <li>
                    <Button onClick={onHandleStart} disabled={loadingRequests}>{t('scrapper.start_request')}</Button>
                </li>
            </ul>
        </nav>

         {
            estimate?.url_tested && <div>
                <h4>{t('scrapper.estimate_result')}</h4>
                <span style={{ fontSize: '12px' }}>
                    {t('scrapper.scrapping_url')}{' '}
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
