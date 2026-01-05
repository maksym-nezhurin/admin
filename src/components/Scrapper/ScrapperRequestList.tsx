import { Button, Group, List, Paper } from "@mantine/core";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { scrapperServices } from "../../services/scrapper";
import { formatDuration } from "../../utils/timeUtils";

import { useApiClient } from "../../contexts/ApiClientContext";
import { useScrapper } from "../../contexts/ScrapperContext";
import { Loader } from "../Loader";

export const ScrapperNavigation = () => {
    const { t } = useTranslation();
    const { getXLSUrl } = useApiClient();
    const { requests, setRequests, loading } = useScrapper();
    
    const onCheckProgress = async (taskId: string) => {
        setRequests(requests.map(r => {
            if (r.id === taskId) {
                return { ...r, loading: true };
            }
            return r;
        }));

        const data = await scrapperServices.getTaskDetails(taskId);
        const { processed, status, total, percent, actual_total, items_without_phone = null } = data;

        setRequests(requests.map(r => {
            if (r.task_id === taskId) {
                return { ...r, status, processed, total, percent, items_without_phone, actual_total, loading: false };
            }
            return r;
        }));
    }

    return <Paper withBorder shadow="md" p={20} radius="md">
        <List style={{
            listStyleType: 'none',
            marginTop: '1.5rem',
            padding: 0,
        }}>
            <h3>{t('scrapper.tasks_list')}</h3>
            
            {
                loading
                 ? <Loader />
                 : (requests || []).length === 0
                    ? <List.Item>{t('scrapper.no_tasks_found')}</List.Item>
                    : requests.map((request, index) => {
                        const isFinished = request.status === 'finished';
                        const itemsWithoutPhone = request.items_without_phone && request.items_without_phone > 0;

                        return (
                            <List.Item key={index}>
                                <Group spacing="xs" mt={8}>
                                    <Group style={{ fontSize: '14px' }}>
                                        <span style={{ marginRight: '8px' }}>
                                            {
                                                isFinished ? (!itemsWithoutPhone ? `🟢` : `🟠` ) : `🔴`
                                            }
                                        </span>
                                        
                                        <span>
                                            {t('scrapper.task')}
                                            <span style={{ fontStyle: 'italic' }}>
                                                {
                                                (isFinished && request.duration_seconds)
                                                ? ' (' + formatDuration(parseInt(String(request.duration_seconds), 10), t) + ') '
                                                : (
                                                    <strong>
                                                        {' '}{request.status === 'enqueued' ? t('scrapper.in_queue') : request.status}
                                                    </strong>
                                                )
                                                }
                                            </span>

                                            {
                                                request.processed ? <span style={{ fontWeight: 'bold' }}> {' '} - {t('scrapper.processed')}: {request.processed} / {request.total}. Percent {request.percent}%</span> : null
                                            }

                                            {
                                                request.items_count
                                                ? (
                                                    <span>
                                                        {' '} - {t('scrapper.total_items')}: {request.items_count}
                                                        {
                                                            itemsWithoutPhone ? ' (' + request.items_without_phone + ' ' + t('scrapper.items_without_phone') + ') ' : null
                                                        }
                                                    </span>
                                                ) : null
                                            }
                                        </span>
                                    </Group>
                                    <Group spacing="xs">
                                        {
                                            !isFinished ? (
                                                <Button onClick={() => onCheckProgress(request.task_id)} loading={request.loading} disabled={isFinished || request.loading}>{t('scrapper.view_progress')}</Button>
                                            ) : null
                                        }

                                        <Link to={`task/${request.task_id}`} download={true}>{t('scrapper.details')}</Link>
                        
                                        <Link to={getXLSUrl(request.task_id)} download={true}>{t('scrapper.generate_xls')}</Link>
                                    </Group>
                                </Group>
                            </List.Item>
                        )
                    })
                }
        </List>
    </Paper>;
}