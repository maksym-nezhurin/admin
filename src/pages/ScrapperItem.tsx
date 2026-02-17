import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '../i18n';

import { Button, Group, Stack } from "@mantine/core";
import { scrapperServices } from '../services/scrapper';
import { useScrapper } from '../contexts/ScrapperContext';
import type { IParsedCarItem } from '../types/scrapper';
import { useAuth } from '../contexts/AuthContext';

import { ScrapperTable } from '../components/Scrapper/Table';
import { useApiClient } from '../contexts/ApiClientContext';
import apiClientManager from '../api/apiClientManager';

const ScrapperItemPage: React.FC = () => {
    const { t } = useTypedTranslation();
    const { getXLSUrl } = useApiClient();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const { 
        market,
        taskProgressEnabled,
        connectToTaskProgress,
        activeTaskProgressSubscriptions,
    } = useScrapper();
    const [scrapperItemDetails, setScrapperItemDetails] = useState<IParsedCarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalEstimated, setTotalEstimated] = useState<number>(0);
    const totalAmount = scrapperItemDetails.length;
    const itemsWithoutPhone = scrapperItemDetails.filter((item: IParsedCarItem) => !item.phone);

    const onHanldeClick = async () => {
        const refreshData = await scrapperServices.refreshScrapperItemDetails({
            user_id: userInfo?.id,
            urls: itemsWithoutPhone.map(item => item.url),
            market: market || null,
            taskId: id || '',
        });

        console.log('📦 Refresh response:', refreshData);
        
        let { task_id: newTaskId, websocket_url } = refreshData;

        if (!newTaskId) {
            return;
        }

        console.log('🔄 Refreshing items for task:', newTaskId);

        // Generate fallback URL if not provided
        if (!websocket_url) {
            console.warn('⚠️ No WebSocket URL in refresh response, generating fallback');
            const currentClient = apiClientManager.getClient();
            let baseUrl = currentClient.defaults.baseURL || '';
            // Remove trailing slash from baseURL
            baseUrl = baseUrl.replace(/\/$/, '');
            websocket_url = baseUrl.replace(/^http/, 'ws') + `/progress/${newTaskId}/ws`;
            console.log('   Fallback URL:', websocket_url);
        }

        // Якщо реальний час увімкнено і підписки ще немає, спробувати підключитися до прогресу задачі через WebSocket
        if (taskProgressEnabled && !activeTaskProgressSubscriptions.has(newTaskId)) {
            try {
                console.log('🚀 Connecting to WebSocket for refresh task:', newTaskId);
                console.log('   WebSocket URL:', websocket_url);
                await connectToTaskProgress(websocket_url, newTaskId);
            } catch (error) {
                console.error('❌ Failed to connect to task progress socket from ScrapperItemPage:', error);
            }
        }
    }
    const getScrapperItemDetails = async (itemId: string) => {
        const { total_estimate, items } = await scrapperServices.getTaskDataItems(itemId);

        setScrapperItemDetails(items);
        setTotalEstimated(total_estimate);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        try {
            getScrapperItemDetails(id || '');
        } catch(error) {
            console.log(error);
            setLoading(false);
        }
    }, [id]);

    return (
        <>
            <Stack spacing="md" mb={20}>
                <Group spacing={4} align='center' style={{ justifyContent: 'space-between' }}>
                    <h4>{t('scrapper.details_for_task')} {id}</h4>

                    <Button onClick={() => navigate('/dashboard/scrapper')}>{t('scrapper.back_to_scrapper')}</Button>
                </Group>
                

                <Group spacing="xs" mt={8}>
                    {
                        loading ? t('scrapper.please_wait') : (
                            <Link to={getXLSUrl(id || '')} download={true}>{t('scrapper.generate_xls')}</Link>
                        )
                    }
                </Group>
            </Stack>

            <div>
                <h4>{t('scrapper.scrapper_items')}</h4>
                <p>{t('scrapper.total_items_count')} {loading ? t('scrapper.loading') : totalAmount + '/' + totalEstimated}</p>

                <Group spacing="xl" mt={8}>
                    <div>
                        <p>{t('scrapper.items_without_phone')} {loading ? t('scrapper.loading') : itemsWithoutPhone.length}</p>
                    </div>
                    <div>
                        <Button onClick={onHanldeClick} disabled={itemsWithoutPhone.length === 0}>{t('scrapper.refresh_items')}</Button>
                    </div>
                </Group>
            </div>

            <div>
                {
                    scrapperItemDetails.length > 0 ? (
                        <ScrapperTable rowData={scrapperItemDetails} />
                    ) : (
                        <p>{t('scrapper.no_items_available')}</p>
                    )
                }
            </div>
        </>
    );
};

export default ScrapperItemPage;