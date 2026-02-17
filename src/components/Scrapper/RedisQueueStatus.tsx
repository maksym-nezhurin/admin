import { useEffect } from "react";
import { Stack, Title, Text, Button, Group, Badge, Alert } from "@mantine/core";
import { useScrapper } from "../../contexts/ScrapperContext";
import { scrapperServices } from "../../services/scrapper";
import type { IQueueStatus } from "../../constants/scrapper";
import { useTypedTranslation } from "../../i18n";
import type { TranslationKey } from "../../i18n";

export const RedisQueueStatus = () => {
    const { t } = useTypedTranslation();
    
    // Try to get scrapper context, handle if not available
    let scrapperContext;
    try {
        scrapperContext = useScrapper();
    } catch (error) {
        console.error('❌ RedisQueueStatus: ScrapperProvider not found!', error);
        return (
            <Alert color="red" title="Error">
                RedisQueueStatus must be used inside ScrapperProvider
            </Alert>
        );
    }
    
    const { redisQueueStatus, fetchQueueStatus, socketStatus, connectSocket, disconnectSocket } = scrapperContext;
    const { cleanQueueStuckedMessage } = scrapperServices;
    
    const {
        total_stuck_messages,
        active_workers,
        total_active_messages,
    } = redisQueueStatus || ({} as IQueueStatus);

    const activeMessages = redisQueueStatus?.active_messages || [];

    console.log('redisQueueStatus', redisQueueStatus);
    // Get connection status indicator
    const getConnectionStatus = () => {
        switch (socketStatus) {
            case 'connected':
                return { color: 'green', text: '🟢 Live', variant: 'light' as const };
            case 'connecting':
                return { color: 'yellow', text: '🟡 Connecting...', variant: 'light' as const };
            case 'disconnected':
                return { color: 'red', text: '🔴 Offline', variant: 'light' as const };
            case 'fallback':
                return { color: 'orange', text: '🟡 Polling', variant: 'light' as const };
            default:
                return { color: 'gray', text: '⚪ Unknown', variant: 'light' as const };
        }
    };

    const connectionStatus = getConnectionStatus();

    // Handle manual socket connection
    const handleConnectSocket = async () => {
        const connected = await connectSocket();
        if (connected) {
            console.log('✅ Socket connected manually');
        } else {
            console.log('❌ Manual socket connection failed');
        }
    };

    const handleDisconnectSocket = () => {
        disconnectSocket();
        console.log('🔌 Socket disconnected manually');
    };

    useEffect(() => {
        console.log('redisQueueStatus', redisQueueStatus);
    }, [redisQueueStatus]);

    return (
        <Stack>
            <Group position="apart" align="center">
                <Title order={4}>{t('scrapper.redis_queue_status.title')}</Title>
                <Badge 
                    color={connectionStatus.color} 
                    variant={connectionStatus.variant}
                    size="sm"
                >
                    {connectionStatus.text}
                </Badge>
            </Group>

            {socketStatus === 'disconnected' && (
                <Alert color="yellow" title="Socket Disconnected">
                    <Text size="sm">
                        Real-time updates are unavailable. Using HTTP polling for updates.
                        You can try to reconnect manually or continue with polling mode.
                    </Text>
                </Alert>
            )}

            <Stack spacing="xs"
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

                {/* TODO: implement window with max height 100px and scrolling, fontsize small but readdalle and coloring support understanf the. situation */}
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
            </Stack>

            <Group variant="subtle">
                <Button onClick={() => fetchQueueStatus()} disabled={socketStatus === 'connected'}>
                    {t('scrapper.redis_queue_status.refresh')}
                </Button>
                
                {socketStatus === 'disconnected' || socketStatus === 'fallback' ? (
                    <Button onClick={handleConnectSocket} color="green">
                        Connect Socket
                    </Button>
                ) : (
                    <Button onClick={handleDisconnectSocket} color="red" variant="outline">
                        Disconnect Socket
                    </Button>
                )}
                
                <Button 
                    disabled={total_stuck_messages === 0} 
                    onClick={() => cleanQueueStuckedMessage('test')}
                >
                    {t('scrapper.redis_queue_status.clean_stucked')}
                </Button>
            </Group>
        </Stack>
    );
};