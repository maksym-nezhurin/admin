import React, { useState, useEffect } from 'react';
import {
  Title,
  Stack,
  Paper,
  Group,
  Text,
  Badge,
  Button,
  Table,
  Card,
  Grid,
  Code,
  ActionIcon,
  Tooltip,
  Alert,
} from '@mantine/core';
import { useTypedTranslation } from '../i18n';
import {
  IconRefresh,
  IconServer,
  IconDatabase,
  IconCloud,
  IconSettings,
  IconInfoCircle,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconClock,
} from '@tabler/icons-react';

interface ServiceInfo {
  name: string;
  url: string;
  status: 'healthy' | 'unhealthy' | 'unknown';
  version?: string;
  lastChecked?: Date;
}

const SystemPage: React.FC = () => {
  const { t, i18n } = useTypedTranslation();
  const [services, setServices] = useState<ServiceInfo[]>([
    {
      name: 'gateway',
      url: 'https://gateway-dawn-wildflower-3519.fly.dev',
      status: 'unknown',
    },
    {
      name: 'auth',
      url: 'https://auth-service-still-silence-9406.fly.dev',
      status: 'unknown',
    },
    {
      name: 'user',
      url: 'https://user-service.fly.dev',
      status: 'unknown',
    },
    {
      name: 'car',
      url: 'https://car-service.fly.dev',
      status: 'unknown',
    },
    {
      name: 'calendar',
      url: 'https://calendar-service.fly.dev',
      status: 'unknown',
    },
  ]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);
  const [showSensitive, setShowSensitive] = useState(false);

  // System information (client-side only)
  const systemInfo = {
    nodeVersion: typeof window !== 'undefined' ? 'N/A (Browser)' : process.version,
    platform: typeof window !== 'undefined' ? navigator.platform : process.platform,
    userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'N/A',
    language: typeof window !== 'undefined' ? navigator.language : 'N/A',
    memory: typeof window !== 'undefined' && 'memory' in performance
      ? `${Math.round((performance as any).memory.usedJSHeapSize / 1024 / 1024)} MB`
      : 'N/A',
  };

  const checkServiceHealth = async (service: ServiceInfo): Promise<'healthy' | 'unhealthy' | 'unknown'> => {
    try {
      const response = await fetch(`${service.url}/health`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      return 'unknown';
    }
  };

  const handleRefresh = async () => {
    setChecking(true);
    const updatedServices = await Promise.all(
      services.map(async (service) => {
        const status = await checkServiceHealth(service);
        return {
          ...service,
          status,
          lastChecked: new Date(),
        };
      })
    );
    setServices(updatedServices);
    setLastChecked(new Date());
    setChecking(false);
  };

  // Ensure 'system' namespace is loaded
  useEffect(() => {
    const loadSystemNamespace = async () => {
      if (!i18n.hasResourceBundle(i18n.language, 'system')) {
        await i18n.loadNamespaces('system');
      }
    };
    loadSystemNamespace();
  }, [i18n, i18n.language]);

  useEffect(() => {
    // Auto-refresh on mount
    handleRefresh();
  }, []);

  const getStatusBadge = (status: ServiceInfo['status']) => {
    switch (status) {
      case 'healthy':
        return <Badge color="green" leftSection={<IconCheck size={12} />}>{t('system.status_healthy')}</Badge>;
      case 'unhealthy':
        return <Badge color="red" leftSection={<IconX size={12} />}>{t('system.status_unhealthy')}</Badge>;
      default:
        return <Badge color="gray" leftSection={<IconAlertCircle size={12} />}>{t('system.status_unknown')}</Badge>;
    }
  };

  const futureFeatures = [
    { key: 'future_health_checks', icon: <IconCheck size={16} /> },
    { key: 'future_metrics', icon: <IconServer size={16} /> },
    { key: 'future_logs', icon: <IconDatabase size={16} /> },
    { key: 'future_performance', icon: <IconCloud size={16} /> },
    { key: 'future_database', icon: <IconDatabase size={16} /> },
    { key: 'future_cache', icon: <IconSettings size={16} /> },
    { key: 'future_jobs', icon: <IconClock size={16} /> },
    { key: 'future_rate_limiting', icon: <IconAlertCircle size={16} /> },
    { key: 'future_error_tracking', icon: <IconAlertCircle size={16} /> },
    { key: 'future_uptime', icon: <IconClock size={16} /> },
  ];

  return (
    <Stack spacing="xl">
      <Group position="apart" align="center">
        <Title order={2}>{t('system.title')}</Title>
        <Button
          leftIcon={<IconRefresh size={16} />}
          onClick={handleRefresh}
          loading={checking}
          variant="light"
        >
          {t('system.refresh')}
        </Button>
      </Group>

      <Text c="dimmed" size="sm">
        {t('system.description')}
      </Text>

      {/* System Overview */}
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Title order={3} mb="md">{t('system.overview')}</Title>
        <Grid>
          <Grid.Col span={12} md={6}>
            <Card shadow="xs" padding="md" radius="sm" withBorder>
              <Group position="apart">
                <div>
                  <Text size="sm" c="dimmed">{t('system.node_version')}</Text>
                  <Text fw={600}>{systemInfo.nodeVersion}</Text>
                </div>
                <IconServer size={24} color="gray" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={12} md={6}>
            <Card shadow="xs" padding="md" radius="sm" withBorder>
              <Group position="apart">
                <div>
                  <Text size="sm" c="dimmed">{t('system.platform')}</Text>
                  <Text fw={600}>{systemInfo.platform}</Text>
                </div>
                <IconCloud size={24} color="gray" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={12} md={6}>
            <Card shadow="xs" padding="md" radius="sm" withBorder>
              <Group position="apart">
                <div>
                  <Text size="sm" c="dimmed">{t('system.memory')}</Text>
                  <Text fw={600}>{systemInfo.memory}</Text>
                </div>
                <IconDatabase size={24} color="gray" />
              </Group>
            </Card>
          </Grid.Col>
          <Grid.Col span={12} md={6}>
            <Card shadow="xs" padding="md" radius="sm" withBorder>
              <Group position="apart">
                <div>
                  <Text size="sm" c="dimmed">{t('system.language')}</Text>
                  <Text fw={600}>{systemInfo.language}</Text>
                </div>
                <IconInfoCircle size={24} color="gray" />
              </Group>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {/* Services Status */}
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Group position="apart" mb="md">
          <Title order={3}>{t('system.services')}</Title>
          {lastChecked && (
            <Text size="xs" c="dimmed">
              {t('system.last_checked')}: {lastChecked.toLocaleTimeString()}
            </Text>
          )}
        </Group>
        <Table striped highlightOnHover>
          <thead>
            <tr>
              <th>{t('system.service_name')}</th>
              <th>{t('system.service_status')}</th>
              <th>{t('system.service_url')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.name}>
                <td>
                  <Text fw={500}>{t(`system.${service.name}` as any)}</Text>
                </td>
                <td>{getStatusBadge(service.status)}</td>
                <td>
                  <Code>{service.url}</Code>
                </td>
                <td>
                  <Group spacing="xs">
                    <Tooltip label={t('system.view_logs')}>
                      <ActionIcon variant="light" size="sm">
                        <IconDatabase size={16} />
                      </ActionIcon>
                    </Tooltip>
                    <Tooltip label={t('system.restart_service')}>
                      <ActionIcon variant="light" color="orange" size="sm">
                        <IconRefresh size={16} />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Paper>

      {/* Environment Variables (Mock - for future implementation) */}
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Group position="apart" mb="md">
          <Title order={3}>{t('system.environment')}</Title>
          <Button
            size="xs"
            variant="subtle"
            onClick={() => setShowSensitive(!showSensitive)}
          >
            {showSensitive ? t('system.hide_sensitive') : t('system.show_all')}
          </Button>
        </Group>
        <Alert color="blue" icon={<IconInfoCircle size={16} />}>
          <Text size="sm">
            {t('system.no_env_vars')} - {t('system.coming_soon')}
          </Text>
        </Alert>
      </Paper>

      {/* Future Features */}
      <Paper shadow="sm" radius="md" p="lg" withBorder>
        <Title order={3} mb="md">{t('system.future_features')}</Title>
        <Grid>
          {futureFeatures.map((feature) => (
            <Grid.Col key={feature.key} span={12} md={6} lg={4}>
              <Card shadow="xs" padding="md" radius="sm" withBorder style={{ opacity: 0.7 }}>
                <Group>
                  {feature.icon}
                  <div>
                    <Text size="sm" fw={500}>{t(`system.${feature.key}` as any)}</Text>
                    <Badge size="xs" color="gray" variant="light" mt={4}>
                      {t('system.coming_soon')}
                    </Badge>
                  </div>
                </Group>
              </Card>
            </Grid.Col>
          ))}
        </Grid>
      </Paper>
    </Stack>
  );
};

export default SystemPage;
