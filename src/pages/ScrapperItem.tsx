import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

import { Button, Group, Stack } from "@mantine/core";
import { scrapperServices } from '../services/scrapper';
import { useScrapper } from '../contexts/ScrapperContext';
import type { IParsedCarItem } from '../types/scrapper';
import { useAuth } from '../contexts/AuthContext';

import { ScrapperProvider } from '../contexts/ScrapperContext';
import { ScrapperTable } from '../components/Scrapper/Table';

const BASE_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000/';

const ScrapperItem = () => {
    const { t } = useTranslation();
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const { market } = useScrapper();
    const [scrapperItemDetails, setScrapperItemDetails] = useState<IParsedCarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const totalAmount = scrapperItemDetails.length;
    const itemsWithoutPhone = scrapperItemDetails.filter((item: IParsedCarItem) => !item.phone);

    const onHanldeClick = async () => {
        // const res = await scrapperServices.refreshScrapperItemDetails({
        //     user_id: userInfo?.id,
        //     urls: itemsWithoutPhone.map(item => item.url),
        //     market: market || null, 
        // });
        const res = await axios.post(`http://localhost:8000/start/urls`, {
            user_id: userInfo?.id,
            urls: itemsWithoutPhone.map(item => item.url),
            market: market || null, 
        });
        console.log('Refreshing scrapper item details for id:', id, res);
    }
    const getScrapperItemDetails = async (itemId: string) => {
        const items = await scrapperServices.getTaskDataItems(itemId);

        setScrapperItemDetails(items);
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
                            <Link to={`${BASE_URL}export/task/${id}.xlsx`} download={true}>{t('scrapper.generate_xls')}</Link>
                        )
                    }
                </Group>
            </Stack>

            <div>
                <h4>{t('scrapper.scrapper_items')}</h4>
                <p>{t('scrapper.total_items_count')} {loading ? t('scrapper.loading') : totalAmount}</p>

                <Group spacing="xl" mt={8}>
                    <div>
                        <p>{t('scrapper.items_without_phones')} {loading ? t('scrapper.loading') : itemsWithoutPhone.length}</p>
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

const ScrapperItemPage: React.FC = () => {
    return (
      <ScrapperProvider>
        <ScrapperItem />
      </ScrapperProvider>
    );
};

export default ScrapperItemPage;