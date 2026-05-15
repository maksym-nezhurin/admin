import { useCallback, useState } from "react";
import {
    Stack,
    Title,
    Text,
    Button,
    Group,
    Divider,
    Select,
    Collapse,
    ActionIcon,
    Paper,
    Box,
} from "@mantine/core";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
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

const DETAILS_MAX_HEIGHT = 220;

export const RedisQueueStatus = () => {
    const { t } = useTypedTranslation();
    const [isActionLoading, setIsActionLoading] = useState(false);
    const [detailsOpen, setDetailsOpen] = useState(false);
    const [queueSimpleStatus, setQueueSimpleStatus] = useState<IQueueSimpleStatus | null>(null);
    const [websocketStatus, setWebsocketStatus] = useState<IWebsocketConnectionsStatus | null>(null);
    const [queueJobs, setQueueJobs] = useState<IQueueJob[] | null>(null);
    const [queueJobsStatus, setQueueJobsStatus] = useState<QueueJobStatus>("waiting");

    const scrapperContext = useScrapper();
    const { redisQueueStatus, fetchQueueStatus } = scrapperContext;
    const {
        pauseQueue,
        resumeQueue,
        cleanQueue,
        getQueueSimpleStatus,
        getWebsocketStatus,
        getQueueJobs,
    } = scrapperServices;

    const { total_stuck_messages, total_active_messages, active_workers } =
        redisQueueStatus || ({} as IQueueStatus);

    const hasLoadedDetails = Boolean(queueSimpleStatus || websocketStatus || queueJobs);

    const loadDetails = useCallback(async () => {
        const [queueData, wsData, jobsData] = await Promise.all([
            getQueueSimpleStatus(),
            getWebsocketStatus(),
            getQueueJobs({ status: queueJobsStatus, limit: 20 }),
        ]);
        setQueueSimpleStatus(queueData);
        setWebsocketStatus(wsData);
        setQueueJobs(jobsData.jobs);
    }, [getQueueSimpleStatus, getWebsocketStatus, getQueueJobs, queueJobsStatus]);

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
            await cleanQueue({ status: "failed", grace: 0, limit: 1000 });
            await fetchQueueStatus();
            if (detailsOpen) {
                await loadDetails();
            }
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleLoadDetails = async () => {
        setIsActionLoading(true);
        try {
            await loadDetails();
            setDetailsOpen(true);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleRefreshDetails = async () => {
        if (!detailsOpen) return;
        setIsActionLoading(true);
        try {
            await loadDetails();
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleToggleDetails = async () => {
        if (detailsOpen) {
            setDetailsOpen(false);
            return;
        }
        if (!hasLoadedDetails) {
            await handleLoadDetails();
            return;
        }
        setDetailsOpen(true);
    };

    const handleQueueJobsStatusChange = async (value: string | null) => {
        if (!value) return;
        const nextStatus = value as QueueJobStatus;
        setQueueJobsStatus(nextStatus);
        if (!detailsOpen) return;
        setIsActionLoading(true);
        try {
            const jobsData = await getQueueJobs({ status: nextStatus, limit: 20 });
            setQueueJobs(jobsData.jobs);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <Paper withBorder p="sm" radius="md" w="100%">
            <Stack spacing="xs">
                <Group position="apart" align="center" spacing="xs">
                    <Title order={4}>{t("scrapper.redis_queue_status.title")}</Title>
                    <ActionIcon
                        variant="subtle"
                        size="lg"
                        aria-label={
                            detailsOpen
                                ? t("scrapper.redis_queue_status.hide_details")
                                : t("scrapper.redis_queue_status.show_details")
                        }
                        onClick={() => void handleToggleDetails()}
                        disabled={isActionLoading}
                    >
                        {detailsOpen ? <IconChevronUp size={18} /> : <IconChevronDown size={18} />}
                    </ActionIcon>
                </Group>

                {redisQueueStatus && (
                    <Group spacing="md">
                        <Text size="xs" c="dimmed">
                            {t("scrapper.redis_queue_status.amount_of_active_workers", {
                                count: active_workers ?? 0,
                            })}
                        </Text>
                        <Text size="xs" c="dimmed">
                            {t("scrapper.redis_queue_status.total_active_messages", {
                                count: total_active_messages ?? 0,
                            })}
                        </Text>
                        <Text size="xs" c={total_stuck_messages ? "red" : "green"}>
                            {t("scrapper.redis_queue_status.total_stuck_messages", {
                                count: total_stuck_messages ?? 0,
                            })}
                        </Text>
                    </Group>
                )}

                <Collapse in={detailsOpen}>
                    <Box
                        mt="xs"
                        sx={{
                            maxHeight: DETAILS_MAX_HEIGHT,
                            overflowY: "auto",
                            overflowX: "hidden",
                        }}
                    >
                        {hasLoadedDetails ? (
                            <Group align="flex-start" spacing="xl" wrap="wrap">
                                {queueSimpleStatus && (
                                    <Stack spacing={4}>
                                        <Title order={6}>
                                            {t("scrapper.redis_queue_status.queue_counters")}
                                        </Title>
                                        <Text size="xs">Waiting: {queueSimpleStatus.waiting}</Text>
                                        <Text size="xs">Active: {queueSimpleStatus.active}</Text>
                                        <Text size="xs">Completed: {queueSimpleStatus.completed}</Text>
                                        <Text size="xs">Failed: {queueSimpleStatus.failed}</Text>
                                        <Text size="xs">Delayed: {queueSimpleStatus.delayed}</Text>
                                        <Text
                                            size="xs"
                                            c={queueSimpleStatus.paused > 0 ? "red" : "dimmed"}
                                        >
                                            Paused: {queueSimpleStatus.paused}
                                        </Text>
                                    </Stack>
                                )}

                                {websocketStatus && (
                                    <Stack spacing={4}>
                                        <Title order={6}>
                                            {t("scrapper.redis_queue_status.websocket_connections")}
                                        </Title>
                                        <Text size="xs">
                                            Total connections: {websocketStatus.totalConnections}
                                        </Text>
                                        <Text size="xs">
                                            Tasks with subscribers: {websocketStatus.tasks.length}
                                        </Text>
                                    </Stack>
                                )}

                                <Stack spacing={4} maw={360}>
                                    <Group spacing="xs" align="center">
                                        <Title order={6}>
                                            {t("scrapper.redis_queue_status.queue_jobs")}
                                        </Title>
                                        <Select
                                            size="xs"
                                            data={[
                                                { value: "waiting", label: "waiting" },
                                                { value: "active", label: "active" },
                                                { value: "completed", label: "completed" },
                                                { value: "failed", label: "failed" },
                                                { value: "delayed", label: "delayed" },
                                                { value: "paused", label: "paused" },
                                            ]}
                                            value={queueJobsStatus}
                                            onChange={(value) => void handleQueueJobsStatusChange(value)}
                                        />
                                    </Group>
                                    {queueJobs && queueJobs.length > 0 ? (
                                        queueJobs.slice(0, 10).map((job) => (
                                            <Stack key={job.id} spacing={2}>
                                                <Text size="xs" fw={500}>
                                                    {job.name} · {job.state} · {job.id}
                                                </Text>
                                                <Text size="xs">taskId: {job.data.taskId ?? "-"}</Text>
                                                {job.data.url && (
                                                    <Text size="xs" c="dimmed" lineClamp={1}>
                                                        url: {job.data.url}
                                                    </Text>
                                                )}
                                                <Text size="xs" c="dimmed">
                                                    total: {job.data.total ?? "-"} / chunks:{" "}
                                                    {job.data.totalChunks ?? "-"}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    created: {new Date(job.timestamp).toLocaleString()}
                                                </Text>
                                            </Stack>
                                        ))
                                    ) : (
                                        <Text size="xs" c="dimmed">
                                            {t("scrapper.redis_queue_status.no_jobs")}
                                        </Text>
                                    )}
                                </Stack>
                            </Group>
                        ) : (
                            <Text size="sm" c="dimmed">
                                {t("scrapper.redis_queue_status.details_hint")}
                            </Text>
                        )}
                    </Box>
                    <Divider my="xs" />
                </Collapse>

                <Group spacing="xs">
                    <Button
                        variant="outline"
                        color="yellow"
                        size="xs"
                        disabled={isActionLoading}
                        onClick={handlePauseQueue}
                    >
                        {t("scrapper.redis_queue_status.pause_queue")}
                    </Button>

                    <Button
                        variant="outline"
                        color="green"
                        size="xs"
                        disabled={isActionLoading}
                        onClick={handleResumeQueue}
                    >
                        {t("scrapper.redis_queue_status.resume_queue")}
                    </Button>

                    {!detailsOpen && (
                        <Button
                            variant="outline"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={handleLoadDetails}
                        >
                            {t("scrapper.redis_queue_status.load_details")}
                        </Button>
                    )}

                    {detailsOpen && hasLoadedDetails && (
                        <Button
                            variant="subtle"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={handleRefreshDetails}
                        >
                            {t("scrapper.redis_queue_status.refresh_details")}
                        </Button>
                    )}

                    {detailsOpen && (
                        <Button
                            variant="subtle"
                            size="xs"
                            disabled={isActionLoading}
                            onClick={() => setDetailsOpen(false)}
                        >
                            {t("scrapper.redis_queue_status.hide_details")}
                        </Button>
                    )}

                    <Button
                        size="xs"
                        disabled={total_stuck_messages === 0 || isActionLoading}
                        onClick={handleCleanFailed}
                    >
                        {t("scrapper.redis_queue_status.clean_stucked")}
                    </Button>
                </Group>
            </Stack>
        </Paper>
    );
};
