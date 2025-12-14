import { Button, Group, Select } from "@mantine/core";
import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

import { useScrapper } from "../../contexts/ScrapperContext";

import { DEFAULT_FILTERS_VALUES, AVAILABLE_FILTERS } from "../../constants/scrapper";

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

const limits = [10, 20, 30, 50, 100];

export const ScrapperNavigation = () => {
    const { market, filters } = useScrapper();
    const [resultTitle, setResultTitle] = useState('Items will be shown here');
    const [limit, setLimit] = useState<number>(limits[2]);
    const [requests, setRequests] = useState<IRequestStatus[]>([]);
    const [estimate, setEstimates] = useState<IEstimateResponse>({
        url_tested: '',
        total_estimate: 0,
        per_page: 0,
        note: '',
    });
    const [loadingEstimate, setLoadingEstimate] = useState(false);
    const [loadingRequests, setLoadingRequests] = useState(false);

    const handleChangeLimit = (value: string) => {
        const newLimit = parseInt(value, 10);
        setLimit(newLimit);
    }

    const [data, setItems] = useState<IResponse<IParsedCarItem>>({
        items: [],
        total: 0,
        limit: limit,
        offset: 0,
        count: 0
    });

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
    }

    const onHandleEstimate = async () => {
        setLoadingEstimate(true);
        const params = getParams();
        const res = await apiClient.post('/estimate', params);

        setEstimates(res.data);
        setLoadingEstimate(false);
    };
    
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
            if (r.id === taskId) {
                return { ...r, status: res.data.status, processed, total, percent, loading: false };
            }
            return r;
        }));
    }
    
    const onViewResults = async (taskId: string) => {
        const res = await apiClient.get(`/items/task/${taskId}`);
        setItems(res.data as IResponse<IParsedCarItem>);
        setResultTitle(`Found ${res.data.total} items for task ${taskId}.`);
    }
    const onHandleStart = async () => {
        setLoadingRequests(true);
        const params = getParams();
        const res = await apiClient.post('/start', params);

        const { task_id, status } = res.data;

        setRequests([...requests, { id: task_id, status }]);

        setLoadingRequests(false);
    };

    return <div>
        <h3>Scrapper Navigation</h3>

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

        <ul
         style={{
            listStyleType: 'none',
            marginTop: '1.5rem',
            padding: 0,
        }}>
            <h3>List of my requests</h3>
            
            {
                (requests || []).length === 0
                 ? <li>No requests found.</li>
                 : requests.map((request, index) => {
                    const isFinished = request.status === 'finished';

                    return (
                        <li key={index}>
                            <div>
                                <span style={{ marginRight: '8px' }}>
                                    {
                                        isFinished ? `🟢` : `🔴`
                                    }
                                </span>
                                Request - Status: {request.status === 'enqueued' ? 'In Queue' : request.status}

                                {
                                    request.processed && <span> - Processed: {request.processed} / {request.total}. Percent {request.percent}</span>
                                }

                            </div>
                            <div>
                                {/* groput 3 button in one */}
                                <Group spacing="xs" mt={8}>
                                    <Button onClick={() => onCheckProgress(request.id)} loading={request.loading} disabled={isFinished || request.loading}>View Progress</Button>
                                    <Button onClick={() => onViewResults(request.id)} disabled={!isFinished}>View Results</Button>
                                    {/* <Button onClick={() => generateXlsDoc(request.id)} disabled={!isFinished}>Generate XLS</Button> */}
                                    <Link to={`${BASE_URL}/export/task/${request.id}.xlsx`} download={true}>Generate XLS</Link>
                                </Group>
                            </div>
                        </li>
                    )
                 })
            }
        </ul>

        <div>
            <h4>View all items from DB</h4>

            <div style={{
                display: 'flex',
                alignItems: 'self-end',
                gap: '10px',
                marginBottom: '10px',
                width: '100%',
                justifyContent: 'space-between',
                }}>
                <Button onClick={async () => {
                    const res = await apiClient.get('/items', {
                        params: {
                            offset: 0,
                            limit: limit,
                        }
                    });

                    setItems(res.data);
                    setResultTitle(`Found ${res.data.total} items in total in DB.`);
                }}>Fetch All Items</Button>

                <Select
                    label="Limit"
                    data={limits.map((limit) => ({
                        label: limit.toString(),
                        value: limit.toString(),
                    }))}
                    value={String(limit)}
                    onChange={handleChangeLimit}
                />
            </div>

            <div>
                {
                    data.items.length > 0 ? (
                        <ul>
                            <h4>{resultTitle}</h4>
                            {data.items.map((item, index) => (
                                <li key={index}>
                                    {item.title}, {' / '}
                                    <span>
                                        <span style={{ fontStyle: 'italic', fontWeight: 'bolder', marginRight: '4px' }}>
                                            Price:
                                        </span>
                                        <span style={{ fontWeight: 'bold' }}>
                                            {item.price}
                                        </span>

                                    </span>
                                     {' / '}
                                    <span>
                                        <span style={{ fontStyle: 'italic', marginRight: '4px' }}>
                                            Phone:
                                        </span>
                                        <span style={{ fontWeight: 'bold' }}>
                                            {item.phone}
                                        </span>

                                    </span>
                                    
                                    {' - '}
                                    <Link to={`${item.url}`} target="_blank" rel="noopener noreferrer">
                                        open
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p>{resultTitle}</p>
                    )
                }

                <div
                    style={{ display: 'flex', justifyContent: 'center', gap: 15, width: '100%', marginTop: '10px' }} 
                >
                
                    <Button disabled={data.offset === 0} onClick={async () => {
                        const newOffset = Math.max(0, data.offset - data.limit);
                        const res = await apiClient.get('/items', {
                            params: {
                                offset: newOffset,
                                limit: data.limit,
                            }
                        });
                        setItems(res.data);
                    }}>Previous</Button>
                    <div
                        style={{ display: 'flex', alignItems: 'center', fontWeight: 'bold', fontSize: '12px' }}
                    >
                        Page {Math.floor(data.offset / data.limit) + 1} of {Math.ceil(data.total / data.limit)}
                    </div>
                    <Button disabled={data.offset + data.limit >= data.total} onClick={async () => {
                        const newOffset = data.offset + data.limit;
                        const res = await apiClient.get('/items', {
                            params: {
                                offset: newOffset,
                                limit: data.limit,
                            }
                        });
                        setItems(res.data);
                    }}>Next</Button>
                </div>
            </div>
        </div>
    </div>;
}