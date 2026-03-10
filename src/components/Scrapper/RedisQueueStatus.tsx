import { useState } from "react";
import { Stack, Title, Text, Button, Group, Divider, Select } from "@mantine/core";
import { useScrapper } from "../../contexts/ScrapperContext";
import { scrapperServices } from "../../services/scrapper";
import type {
    IQueueStatus,
    IQueueSimpleStatus,
    IWebsocketConnectionsStatus,
    IQueueJob,
    QueueJobStatus,
} from "../../constants/scrapper";
import { useTypedTranslation } from "../../i18n";

export const RedisQueueStatus = () => {
    const { t } = useTypedTranslation();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [queueSimpleStatus, setQueueSimpleStatus] = useState<IQueueSimpleStatus | null>(null);
    const [websocketStatus, setWebsocketStatus] = useState<IWebsocketConnectionsStatus | null>(null);
    const [queueJobs, setQueueJobs] = useState<IQueueJob[] | null>(null);
    const [queueJobsStatus, setQueueJobsStatus] = useState<QueueJobStatus>('waiting');
    // Hook must be called unconditionally
    const scrapperContext = useScrapper();

    // WebSocket-based Redis socket status (socketStatus/connectSocket/disconnectSocket)
    // is not used in this UI section anymore; we rely on HTTP status instead.
    const { redisQueueStatus, fetchQueueStatus } = scrapperContext;
    const {
        pauseQueue,
        resumeQueue,
        cleanQueue,
        getQueueSimpleStatus,
        getWebsocketStatus,
        getQueueJobs,
    } = scrapperServices;
    
    const { total_stuck_messages } = redisQueueStatus || ({} as IQueueStatus);

    // Previous WebSocket-based connection status helpers are intentionally disabled:
    // const connectionStatus = getConnectionStatus();
    // const handleConnectSocket = async () => { await connectSocket(); };
    // const handleDisconnectSocket = () => { disconnectSocket(); };

    const handlePauseQueue = async () => {
        setIsActionLoading(true);
        try {
            await pauseQueue();
            await fetchQueueStatus();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleResumeQueue = async () => {
        setIsActionLoading(true);

        try {
            await resumeQueue();
            await fetchQueueStatus();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleCleanFailed = async () => {
        setIsActionLoading(true);

        try {
            await cleanQueue({ status: 'failed', grace: 0, limit: 1000 });
            await fetchQueueStatus();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLoadDetails = async () => {
        setIsActionLoading(true);
    
        try {
            const [queueData, wsData, jobsData] = await Promise.all([
                getQueueSimpleStatus(),
                getWebsocketStatus(),
                getQueueJobs({ status: queueJobsStatus, limit: 20 }),
            ]);
            setQueueSimpleStatus(queueData);
            setWebsocketStatus(wsData);
            setQueueJobs(jobsData.jobs);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <Stack>
            <Group position="apart" align="center">
                <Title order={4}>{t('scrapper.redis_queue_status.title')}</Title>
            </Group>

            {/* WebSocket connection status badge + alert are disabled; HTTP-based metrics are shown below */}

            {/* <Stack spacing="xs"
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between'
                }}
            >
                <Stack>
                    <Text size="xs">
                        {t('scrapper.redis_queue_status.amount_of_active_workers', { count: active_workers })}
                    </Text>

                    <Text size="xs">
                        {t('scrapper.redis_queue_status.total_active_messages', { count: total_active_messages })}
                    </Text>

                    <Text size="xs">
                        {
                            total_stuck_messages ? (
                                <Text c="red">
                            {t('scrapper.redis_queue_status.total_stuck_messages', { count: total_stuck_messages })}
                        </Text>
                    ) : (
                        <Text c="green">
                            {t('scrapper.redis_queue_status.total_stuck_messages', { count: total_stuck_messages })}
                        </Text>
                    )
                }
                    </Text>
                </Stack>

                <div
                    style={{
                        maxHeight: '100px',
                        overflow: 'auto',
                        fontSize: '12px',
                        padding: '4px 8px',
                        borderRadius: 4,
                        backgroundColor: '#f8f9fa',
                    }}
                >
                    {activeMessages.length === 0 ? (
                        <Text size="xs" c="dimmed">
                            {t('scrapper.redis_queue_status.no_active_messages' as TranslationKey)}
                        </Text>
                    ) : (
                        <Stack spacing={4}>
                            {activeMessages.map((msg) => (
                                <Group
                                    key={msg.message_id}
                                    position="apart"
                                    spacing={4}
                                    align="flex-start"
                                >
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                        <Text size="xs" weight={500} lineClamp={1}>
                                            {msg.actor}
                                        </Text>
                                        <Text size="xs" c="dimmed" lineClamp={1}>
                                            id: {msg.message_id}
                                        </Text>
                                    </div>
                                    <Stack spacing={2} align="flex-end">
                                        <Badge
                                            size="xs"
                                            color={msg.is_stuck ? 'red' : 'green'}
                                            variant="light"
                                        >
                                            {msg.is_stuck
                                                ? t('scrapper.redis_queue_status.stuck' as TranslationKey)
                                                : t('scrapper.redis_queue_status.processing' as TranslationKey)}
                                        </Badge>
                                        <Text size="xs" c="dimmed">
                                            {msg.age_minutes}
                                            {' '}
                                            {t('scrapper.redis_queue_status.minutes' as TranslationKey)}
                                        </Text>
                                    </Stack>
                                </Group>
                            ))}
                        </Stack>
                    )}
                </div>
            </Stack> */}

            {(queueSimpleStatus || websocketStatus || queueJobs) && (
                <>
                    <Divider my="sm" />
                    <Group align="flex-start" spacing="xl">
                        {queueSimpleStatus && (
                            <Stack spacing={4}>
                                <Title order={6}>Queue counters</Title>
                                <Text size="xs">Waiting: {queueSimpleStatus.waiting}</Text>
                                <Text size="xs">Active: {queueSimpleStatus.active}</Text>
                                <Text size="xs">Completed: {queueSimpleStatus.completed}</Text>
                                <Text size="xs">Failed: {queueSimpleStatus.failed}</Text>
                                <Text size="xs">Delayed: {queueSimpleStatus.delayed}</Text>
                                <Text size="xs" c={queueSimpleStatus.paused > 0 ? 'red' : 'dimmed'}>
                                    Paused: {queueSimpleStatus.paused}
                                </Text>
                            </Stack>
                        )}

                        {websocketStatus && (
                            <Stack spacing={4}>
                                <Title order={6}>WebSocket connections</Title>
                                <Text size="xs">
                                    Total connections: {websocketStatus.totalConnections}
                                </Text>
                                <Text size="xs">
                                    Tasks with subscribers: {websocketStatus.tasks.length}
                                </Text>
                            </Stack>
                        )}

                        {(
                            <Stack spacing={4} maw={360}>
                                <Group spacing="xs" align="center">
                                    <Title order={6}>Queue jobs</Title>
                                    <Select
                                        size="xs"
                                        data={[
                                            { value: 'waiting', label: 'waiting' },
                                            { value: 'active', label: 'active' },
                                            { value: 'completed', label: 'completed' },
                                            { value: 'failed', label: 'failed' },
                                            { value: 'delayed', label: 'delayed' },
                                            { value: 'paused', label: 'paused' },
                                        ]}
                                        value={queueJobsStatus}
                                        onChange={(value) => {
                                            if (value) {
                                                setQueueJobsStatus(value as QueueJobStatus);
                                            }
                                        }}
                                    />
                                </Group>
                                {queueJobs && queueJobs.length > 0 && queueJobs.slice(0, 10).map((job) => (
                                    <Stack key={job.id} spacing={2}>
                                        <Text size="xs" fw={500}>
                                            {job.name} · {job.state} · {job.id}
                                        </Text>
                                        <Text size="xs">
                                            taskId: {job.data.taskId ?? '-'}
                                        </Text>
                                        {job.data.url && (
                                            <Text size="xs" c="dimmed">
                                                url: {job.data.url}
                                            </Text>
                                        )}
                                        <Text size="xs" c="dimmed">
                                            total: {job.data.total ?? '-'} / chunks: {job.data.totalChunks ?? '-'}
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            created: {new Date(job.timestamp).toLocaleString()}
                                        </Text>
                                    </Stack>
                                ))}
                            </Stack>
                        )}
                    </Group>
                </>
            )}

            <Group variant="subtle">
                {/* <Button onClick={() => fetchQueueStatus()} disabled={websocketStatus === 'connected'}>
                    {t('scrapper.redis_queue_status.refresh')}
                </Button>
                
                {websocketStatus === 'disconnected' || websocketStatus === 'fallback' ? (
                    <Button onClick={handleConnectSocket} color="green" disabled={isActionLoading}>
                        {t('scrapper.redis_queue_status.connect_socket')}
                    </Button>
                ) : (
                    <Button onClick={handleDisconnectSocket} color="red" variant="outline" disabled={isActionLoading}>
                        {t('scrapper.redis_queue_status.disconnect_socket')}
                    </Button>
                )} */}

                <Button
                    variant="outline"
                    color="yellow"
                    disabled={isActionLoading}
                    onClick={handlePauseQueue}
                >
                    Pause queue
                </Button>

                <Button
                    variant="outline"
                    color="green"
                    disabled={isActionLoading}
                    onClick={handleResumeQueue}
                >
                    Resume queue
                </Button>

                <Button
                    variant="outline"
                    disabled={isActionLoading}
                    onClick={handleLoadDetails}
                >
                    Load details
                </Button>

                <Button
                    disabled={total_stuck_messages === 0 || isActionLoading}
                    onClick={handleCleanFailed}
                >
                    {t('scrapper.redis_queue_status.clean_stucked')}
                </Button>
            </Group>
        </Stack>
    );
};