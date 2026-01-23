import { Button, Group, Paper, Switch, Badge, Alert, Text, Table } from "@mantine/core";
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import { scrapperServices } from "../../services/scrapper";
import apiClientManager from "../../api/apiClientManager";
import { formatDuration } from "../../utils/timeUtils";
import { useState, useMemo } from "react";

import { useApiClient } from "../../contexts/ApiClientContext";
import { useScrapper } from "../../contexts/ScrapperContext";
import { Loader } from "../Loader";

export const ScrapperTaskList = () => {
    const { t } = useTranslation();
    const { getXLSUrl } = useApiClient();
    const [sortBy, setSortBy] = useState<'created_at' | 'status' | 'progress'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const { 
        requests, 
        setRequests, 
        loading, 
        taskProgressEnabled,
        setTaskProgressEnabled,
        connectToTaskProgress,
        disconnectTaskProgress,
        taskProgressSocketStatus,
        activeTaskProgressSubscriptions
    } = useScrapper();

    const onCheckProgress = async (taskId: string) => {
        // If task progress is enabled and socket is connected, don't make HTTP request
        if (taskProgressEnabled && taskProgressSocketStatus === 'connected' && activeTaskProgressSubscriptions.has(taskId)) {
            console.log('Task progress is already being tracked via socket for task:', taskId);
            return;
        }

        setRequests(requests.map(r => {
            if (r.id === taskId) {
                return { ...r, loading: true };
            }
            return r;
        }));

        try {
            console.log('taskProgressEnabled', taskProgressEnabled); 
            // Try to connect to task progress socket first
            if (taskProgressEnabled) {
                const currentClient = apiClientManager.getClient();
                const baseUrl = currentClient.defaults.baseURL;
                if (!baseUrl) {
                    throw new Error('Base URL is not configured');
                }
                const socketConnected = await connectToTaskProgress(baseUrl, taskId);
                if (socketConnected) {
                    console.log('Connected to task progress socket for task:', taskId);
                    setRequests(requests.map(r => {
                        if (r.task_id === taskId) {
                            return { ...r, loading: false };
                        }
                        return r;
                    }));
                    return;
                }
            } else {
                const data = await scrapperServices.getTaskDetails(taskId);
                const { processed, status, total, percent, actual_total, items_without_phone } = data;

                setRequests(requests.map(r => {
                    if (r.task_id === taskId) {
                        return { ...r, status, processed, total, percent, items_without_phone, actual_total, loading: false };
                    }
                    return r;
                }));
            }
        } catch (error) {
            console.error('Failed to get task progress:', error);
            setRequests(requests.map(r => {
                if (r.task_id === taskId) {
                    return { ...r, loading: false };
                }
                return r;
            }));
        }
    };

    const getTaskProgressStatus = (taskId: string) => {
        if (!taskProgressEnabled) {
            return { color: 'gray', text: t('scrapper.disabled'), variant: 'light' as const };
        }
        
        // Check if this specific task is being tracked
        if (activeTaskProgressSubscriptions.has(taskId)) {
            return { color: 'green', text: t('scrapper.live'), variant: 'light' as const };
        }
        
        if (taskProgressSocketStatus === 'connecting') {
            return { color: 'yellow', text: t('scrapper.connecting'), variant: 'light' as const };
        }
        
        return { color: 'orange', text: t('scrapper.manual'), variant: 'light' as const };
    };

    // Sort and memoize requests
    const sortedRequests = useMemo(() => {
        const sorted = [...requests];
        return sorted.sort((a, b) => {
            let aValue: any, bValue: any;
            
            switch (sortBy) {
                case 'created_at':
                    aValue = new Date(a.created_at || 0);
                    bValue = new Date(b.created_at || 0);
                    break;
                case 'status':
                    aValue = a.status || '';
                    bValue = b.status || '';
                    break;
                case 'progress':
                    aValue = a.percent || 0;
                    bValue = b.percent || 0;
                    break;
                default:
                    return 0;
            }
            
            if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }, [requests, sortBy, sortOrder]);

    const handleSort = (field: 'created_at' | 'status' | 'progress') => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc');
        }
    };

    return <Paper withBorder shadow="md" p={20} radius="md">
        <Group position="apart" align="center" mb="md">
            <h3>{t('scrapper.tasks_list')}</h3>
            <Group>
                <Switch
                    label={t('scrapper.real_time_progress')}
                    checked={taskProgressEnabled}
                    onChange={(event) => {
                        const enabled = event.currentTarget.checked;
                        setTaskProgressEnabled(enabled);
                        if (!enabled) {
                            disconnectTaskProgress();
                        }
                    }}
                    size="sm"
                />
                <Badge 
                    color={taskProgressSocketStatus === 'connected' ? 'green' : taskProgressSocketStatus === 'connecting' ? 'yellow' : 'gray'} 
                    variant="light"
                    size="sm"
                >
                    {taskProgressSocketStatus === 'connected' ? t('scrapper.live') : taskProgressSocketStatus === 'connecting' ? t('scrapper.connecting') : t('scrapper.offline')}
                </Badge>
            </Group>
        </Group>

        {!taskProgressEnabled && (
            <Alert color="blue" title={t('scrapper.real_time_updates_disabled')} mb="md">
                <Text size="sm">
                    {t('scrapper.real_time_updates_disabled_message')}
                </Text>
            </Alert>
        )}

        {loading ? <Loader /> : sortedRequests.length === 0 ? (
            <Text align="center" c="dimmed">{t('scrapper.no_tasks_found')}</Text>
        ) : (
            <Table striped highlightOnHover withColumnBorders>
                <thead>
                    <tr>
                        <th 
                            onClick={() => handleSort('created_at')}
                            style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}
                        >
                            {t('scrapper.created_at')} {sortBy === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th 
                            onClick={() => handleSort('status')}
                            style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}
                        >
                            {t('scrapper.status_duration')} {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}>
                            {t('scrapper.progress')}
                        </th>
                        <th 
                            onClick={() => handleSort('progress')}
                            style={{ cursor: 'pointer', backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}
                        >
                            {t('scrapper.percent_complete')} {sortBy === 'progress' && (sortOrder === 'asc' ? '↑' : '↓')}
                        </th>
                        <th style={{ backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}>
                            {t('scrapper.details')}
                        </th>
                        <th style={{ backgroundColor: '#f8f9fa', padding: '12px', fontWeight: 600 }}>
                            {t('scrapper.actions')}
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {sortedRequests.map((request, index) => {
                        const isFinished = request.status === 'finished';
                        const itemsWithoutPhone = request.items_without_phone && request.items_without_phone > 0;
                        const taskStatus = getTaskProgressStatus(request.task_id);

                        return (
                            <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <Text size="sm">
                                        {(() => {
                                            const date = new Date(request.created_at || '');
                                            return isNaN(date.getTime()) 
                                                ? new Date().toLocaleString() 
                                                : date.toLocaleString();
                                        })()}
                                    </Text>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <Group spacing="xs">
                                        <span style={{ marginRight: '8px' }}>
                                            {isFinished ? (!itemsWithoutPhone ? `🟢` : `🟠` ) : `🔴`}
                                        </span>
                                        <Text size="sm" weight={500}>
                                            {isFinished && request.duration_seconds
                                                ? formatDuration(parseInt(String(request.duration_seconds), 10), t)
                                                : request.status === 'enqueued' 
                                                    ? t('scrapper.in_queue') 
                                                    : request.status
                                            }
                                        </Text>
                                    </Group>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    {request.processed ? (
                                        <Text size="sm" weight={500}>
                                            {request.processed} / {request.total} ({request.percent}%)
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">-</Text>
                                    )}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <Text size="sm">{isFinished ? 100 : request.percent || 0}%</Text>
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    {request.items_count ? (
                                        <Text size="sm">
                                            {request.items_count} items
                                            {itemsWithoutPhone ? (
                                                <Text c="orange" size="xs">
                                                    ({request.items_without_phone} without phone)
                                                </Text>
                                            ) : null}
                                        </Text>
                                    ) : (
                                        <Text size="sm" c="dimmed">-</Text>
                                    )}
                                </td>
                                <td style={{ padding: '12px', borderBottom: '1px solid #dee2e6' }}>
                                    <Group spacing="xs">
                                         {!isFinished ? (
                                            <Button 
                                                onClick={() => onCheckProgress(request.task_id)} 
                                                loading={request.loading} 
                                                disabled={
                                                    isFinished || 
                                                    request.loading || 
                                                    (taskProgressEnabled && activeTaskProgressSubscriptions.has(request.task_id))
                                                }
                                                size="sm"
                                            >
                                                {taskProgressEnabled && activeTaskProgressSubscriptions.has(request.task_id) ? <>
                                                    {t('scrapper.tracking_live')} {' '}
                                                    <Badge 
                                                        color={taskStatus.color} 
                                                        variant={taskStatus.variant}
                                                        size="sm"
                                                    >
                                                        {taskStatus.text}
                                                    </Badge>
                                                </> : t('scrapper.view_progress')}
                                            </Button>
                                        ) : null}
                                        <Link to={`task/${request.task_id}`} download={true}>
                                            <Button variant="outline" size="sm">
                                                {t('scrapper.details')}
                                            </Button>
                                        </Link>
                                        <Link to={getXLSUrl(request.task_id)} download={true}>
                                            <Button variant="outline" size="sm">
                                                {t('scrapper.generate_xls')}
                                            </Button>
                                        </Link>
                                    </Group>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </Table>
        )}
    </Paper>;
};

export default ScrapperTaskList;