import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Button, Group, Stack } from "@mantine/core";
import { scrapperServices } from '../services/scrapper';
import { useScrapper } from '../contexts/ScrapperContext';
import type { IParsedCarItem } from '../types/scrapper';
import { useAuth } from '../contexts/AuthContext';

import { ScrapperProvider } from '../contexts/ScrapperContext';
import { ScrapperTable } from '../components/Scrapper/Table';

const BASE_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000';

const ScrapperItem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { userInfo } = useAuth();
    const { market } = useScrapper();
    const [scrapperItemDetails, setScrapperItemDetails] = useState<IParsedCarItem[]>([]);
    const [loading, setLoading] = useState(true);
    const totalAmount = scrapperItemDetails.length;
    const itemsWithoutPhone = scrapperItemDetails.filter((item: IParsedCarItem) => !item.phone);

    const onHanldeClick = async () => {
        const res = await scrapperServices.refreshScrapperItemDetails({
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

    console.log(loading)
    return (
        <>
            <Stack spacing="md" mb={20}>
                <Group spacing={4} align='center' style={{ justifyContent: 'space-between' }}>
                    <h4>Details for Task ID: {id}</h4>

                    <Button onClick={() => navigate('/dashboard/scrapper')}>Back to scrapper</Button>
                </Group>
                

                <Group spacing="xs" mt={8}>
                    {
                        loading ? 'Please wait...' : (
                            <Link to={`${BASE_URL}export/task/${id}.xlsx`} download={true}>Generate XLS</Link>
                        )
                    }
                </Group>
            </Stack>

            <div>
                <h4>Scrapper Items</h4>
                <p>Total Items: {loading ? 'loading ...' : totalAmount}</p>

                <Group spacing="xl" mt={8}>
                    <div>
                        <p>Items without phones: {loading ? 'loading ...' : itemsWithoutPhone.length}</p>
                    </div>
                    <div>
                        <Button onClick={onHanldeClick} disabled={itemsWithoutPhone.length === 0}>Refresh Items</Button>
                    </div>
                </Group>
            </div>

            <div>
                {
                    scrapperItemDetails.length > 0 ? (
                        <ScrapperTable rowData={scrapperItemDetails} />
                    ) : (
                        <p>No items available</p>
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