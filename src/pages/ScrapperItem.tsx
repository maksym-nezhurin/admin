import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTypedTranslation } from '../i18n';

import { Button, Group, Stack, Paper, Text, Title, Divider } from "@mantine/core";
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
    const {
        itemsWithoutPhone,
        withActiveStatus,
    } = scrapperItemDetails.reduce((acc, item) => {
        if (!item.phone) {
            acc.itemsWithoutPhone = [...acc.itemsWithoutPhone, item];
        }
        if (item.status === 'active') {
            acc.withActiveStatus = [...acc.withActiveStatus, item];
        }
        return acc;
    }, { itemsWithoutPhone: [] as IParsedCarItem[], withActiveStatus: [] as IParsedCarItem[] });
    const activeAndWithoutPhone = scrapperItemDetails.length - (withActiveStatus.length + itemsWithoutPhone.length);

    const onHanldeClick = async () => {
        const refreshData = await scrapperServices.refreshScrapperItemDetails({
            user_id: userInfo?.id,
            urls: itemsWithoutPhone.map(item => item.url),
            market: market || null,
            task_id: id || '',
        });

        const { taskId: newTaskId, websocket_url: wsUrlFromApi } = refreshData;

        if (!newTaskId) {
            return;
        }

        const websocketUrl = wsUrlFromApi || (() => {
            const baseUrl = (apiClientManager.getClient().defaults.baseURL || '').replace(/\/$/, '');
            return baseUrl.replace(/^http/, 'ws') + `/progress/${newTaskId}/ws`;
        })();

        console.log('websocketUrl', taskProgressEnabled && !activeTaskProgressSubscriptions.has(newTaskId));
        if (taskProgressEnabled && !activeTaskProgressSubscriptions.has(newTaskId)) {
            try {
                console.log('attempt to connect to websocket', websocketUrl);
                await connectToTaskProgress(websocketUrl, newTaskId);
            } catch {
                setLoading(false);
            }
        }
    }
    const getScrapperItemDetails = async (itemId: string) => {
        const { total, items } = await scrapperServices.getTaskDataItems(itemId);

        setScrapperItemDetails(items);

        setTotalEstimated(total);
        setLoading(false);
    };

    useEffect(() => {
        setLoading(true);
        try {
            getScrapperItemDetails(id || '');
        } catch {
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
            </Stack>

            <Paper p="md" shadow="xs" radius="md" withBorder>
                <Title order={4} mb="sm">{t('scrapper.scrapper_items')}</Title>
                <Stack spacing={6}>
                    <Text size="sm" c="dimmed">
                        {t('scrapper.total_items_count')} {loading ? t('scrapper.loading') : `${totalAmount} / ${totalEstimated}`}
                    </Text>
                    <Text size="sm" c="dimmed">
                        {t('scrapper.items_without_phones', { count: itemsWithoutPhone.length })}
                    </Text>
                </Stack>
                <Divider my="md" />
                <Group position="apart" align="center">
                    <Text size="sm">
                        {t('scrapper.active_and_without_phone_count', { count: activeAndWithoutPhone })}
                    </Text>

                    <Group spacing="xs">
                        <Button
                            size="sm"
                            onClick={onHanldeClick}
                            disabled={itemsWithoutPhone.length === 0 || activeAndWithoutPhone === 0}
                        >
                            {t('scrapper.refresh_items')}
                        </Button>

                        {
                            loading ? t('scrapper.please_wait') : (
                                <Link to={getXLSUrl(id || '')} download={true}>{t('scrapper.generate_xls')}</Link>
                            )
                        }
                    </Group>
                    
                </Group>
            </Paper>

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