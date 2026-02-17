import { useState } from 'react';
import { Button } from '@mantine/core';
import { useTypedTranslation } from '../../i18n';

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
    const { t } = useTypedTranslation();
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
        console.log('🎬 onHandleStart called');
        console.log('   taskProgressEnabled:', taskProgressEnabled);
        
        setLoadingRequests(true);
        const params = getParams();
        
        console.log('📡 Calling API /start with params:', params);
        const data = await scrapperServices.createScrapperRequest(params);
        const { task_id, status, websocket_url } = data;

        console.log('📦 API Response:', data);
        console.log('   Task ID:', task_id);
        console.log('   WebSocket URL:', websocket_url);

        console.log('➕ Adding task to requests list:', task_id);
        setRequests([...requests, { task_id, status, id: task_id, market, items_count: 0, duration_seconds: 0 }]);
        console.log('✅ Task added to requests list');

        // Auto-connect to WebSocket for the new task if real-time progress is enabled
        console.log('🔍 Checking if should auto-connect...');
        console.log('   taskProgressEnabled:', taskProgressEnabled);
        
        if (taskProgressEnabled) {
            console.log('✅ Task progress is enabled, proceeding with connection...');
            if (!websocket_url) {
                console.error('❌ No websocket_url in API response!');
                console.error('   Response:', JSON.stringify(data, null, 2));
                console.error('   Backend might not be updated to return websocket_url');
                
                // Fallback: generate URL manually
                const currentClient = apiClientManager.getClient();
                let baseUrl = currentClient.defaults.baseURL || '';
                // Remove trailing slash from baseURL
                baseUrl = baseUrl.replace(/\/$/, '');
                const wsUrl = baseUrl.replace(/^http/, 'ws') + `/progress/${task_id}/ws`;
                console.warn('⚠️ Using fallback WebSocket URL:', wsUrl);
                
                try {
                    await connectToTaskProgress(wsUrl, task_id);
                } catch (error) {
                    console.error('❌ Failed to connect with fallback URL:', error);
                }
            } else {
                try {
                    console.log('🚀 Starting new scraping task:', task_id);
                    console.log('   WebSocket URL:', websocket_url);
                    await connectToTaskProgress(websocket_url, task_id);
                } catch (error) {
                    console.error('❌ Failed to connect to task progress WebSocket:', error);
                }
            }
        } else {
            console.log('❌ Task progress is DISABLED - not connecting to WebSocket');
        }

        setLoadingRequests(false);
        console.log('🏁 onHandleStart completed');
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
