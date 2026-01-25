import { useEffect } from "react";
import { Stack, Title, Text, Button, Group, Badge, Alert } from "@mantine/core";
import { useScrapper } from "../../contexts/ScrapperContext";
import { scrapperServices } from "../../services/scrapper";
import type { IQueueStatus } from "../../constants/scrapper";
import { useTypedTranslation } from "../../i18n";

export const RedisQueueStatus = () => {
    const { t } = useTypedTranslation();
    const { redisQueueStatus, fetchQueueStatus, socketStatus, connectSocket, disconnectSocket } = useScrapper();
    const { cleanQueueStuckedMessage } = scrapperServices;
    
    const {
        total_stuck_messages,
        active_workers,
        total_active_messages,
    } = redisQueueStatus || ({} as IQueueStatus);

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
                <div style={{
                    maxHeight: '100px',
                    overflow: 'auto',
                    fontSize: '12px',
                    color: total_stuck_messages > 0 ? 'red' : 'black',
                }}>
                    <code>
                        <pre>{JSON.stringify(redisQueueStatus, null, 2)}</pre>
                    </code>
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