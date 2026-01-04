import { Button, Group } from "@mantine/core";
import axios from "axios";
import { Link } from "react-router-dom";

import { useScrapper } from "../../contexts/ScrapperContext";

const BASE_URL = import.meta.env.VITE_SCRAPPER_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});

export const ScrapperNavigation = () => {
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
            <h3>List of all my tasks:</h3>
            
            {
                (requests || []).length === 0
                 ? <li>No tasks found.</li>
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
                                        Task
                                        <span style={{ fontStyle: 'italic' }}>
                                            {
                                             isFinished && request.duration_seconds
                                             ? ' (finished during ' + parseInt(String(request.duration_seconds), 10) + ' seconds)'
                                             : <strong>
                                                {' '}{request.status === 'enqueued' ? 'In Queue' : request.status}
                                               </strong>
                                            }
                                        </span>

                                        <span>
                                            {' '}M/C: <strong>{request.market}</strong>
                                        </span>
                                    
                                        {
                                            request.processed ? <span style={{ fontWeight: 'bold' }}> - Processed: {request.processed} / {request.total}. Percent {request.percent}%</span> : null
                                        }

                                        {
                                            request.items_count
                                             ? (
                                                <span>
                                                    {' '} - total items: {request.items_count}
                                                </span>
                                            ) : null
                                        }
                                    </span>
                                    

                                </div>
                                <div>
                                    <Group spacing="xs">
                                        <Button onClick={() => onCheckProgress(request.task_id)} loading={request.loading} disabled={isFinished || request.loading}>View Progress</Button>
                                
                                        <Link to={`task/${request.task_id}`} download={true}>Details</Link>
                        
                                        <Link to={`${BASE_URL}/export/task/${request.task_id}.xlsx`} download={true}>Generate XLS</Link>
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