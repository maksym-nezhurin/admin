import { Button, Group } from "@mantine/core";
import axios from "axios";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import { useScrapper } from "../../contexts/ScrapperContext";

const BASE_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export const ScrapperNavigation = () => {
    const { t } = useTranslation();
    const { requests, setRequests } = useScrapper();
    
    const onCheckProgress = async (taskId: string) => {
        setRequests(requests.map(r => {
            if (r.id === taskId) {
                return { ...r, loading: true };
            }
            return r;
        }));

        const res = await apiClient.get(`/progress/${taskId}`);
        const { processed, total, percent } = res.data;

        setRequests(requests.map(r => {
            if (r.task_id === taskId) {
                return { ...r, status: res.data.status, processed, total, percent, loading: false };
            }
            return r;
        }));
    }

    return <div>
        <ul style={{
            listStyleType: 'none',
            marginTop: '1.5rem',
            padding: 0,
        }}>
            <h3>{t('scrapper.tasks_list')}</h3>
            
            {
                (requests || []).length === 0
                 ? <li>{t('scrapper.no_tasks_found')}</li>
                 : requests.map((request, index) => {
                    const isFinished = request.status === 'finished';

                    return (
                        <li key={index}>
                            <Group spacing="xs" mt={8}>
                                <div style={{ fontSize: '14px' }}>
                                    <span style={{ marginRight: '8px' }}>
                                        {
                                            isFinished ? `🟢` : `🔴`
                                        }
                                    </span>
                                    
                                    <span>
                                        {t('scrapper.task')}
                                        <span style={{ fontStyle: 'italic' }}>
                                            {
                                             isFinished && request.duration_seconds
                                             ? ' (' + t('scrapper.finished_in_seconds', { seconds: parseInt(String(request.duration_seconds), 10) }) + ')'
                                             : <strong>
                                                {' '}{request.status === 'enqueued' ? t('scrapper.in_queue') : request.status}
                                               </strong>
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
                                                </span>
                                            ) : null
                                        }
                                    </span>
                                    

                                </div>
                                <div>
                                    <Group spacing="xs">
                                        <Button onClick={() => onCheckProgress(request.task_id)} loading={request.loading} disabled={isFinished || request.loading}>{t('scrapper.view_progress')}</Button>
                                
                                        <Link to={`task/${request.task_id}`} download={true}>{t('scrapper.details')}</Link>
                        
                                        <Link to={`${BASE_URL}/export/task/${request.task_id}.xlsx`} download={true}>{t('scrapper.generate_xls')}</Link>
                                    </Group>
                                </div>
                            </Group>
                        </li>
                    )
                 })
            }
        </ul>
    </div>;
}