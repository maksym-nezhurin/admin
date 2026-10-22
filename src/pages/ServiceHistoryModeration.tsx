import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  Pagination,
  Paper,
  SegmentedControl,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { historyModerationService } from '../services/historyModeration';
import {
  HISTORY_CHANGE_STATUSES,
  type HistoryChangeRequestPage,
  type HistoryChangeStatus,
  type HistoryTargetType,
} from '../types/historyModeration';
import { RoleGuard } from '../components/RoleGuard';
import { ChangeRequestDrawer } from '../components/HistoryModeration/ChangeRequestDrawer';
import {
  formatVehicle,
  statusBadgeColor,
} from '../components/HistoryModeration/historyModerationFormat';
import { useTypedTranslation, type TranslationKey } from '../i18n';
import { formatLocalizedDate } from '../utils/timeUtils';

const PAGE_SIZE = 20;
const ALL_TYPES = 'ALL';

const ServiceHistoryModerationPage = () => {
  const { t, i18n } = useTypedTranslation();
  const tk = useCallback(
    (key: string, options?: Record<string, string | number | undefined>) =>
      t(`admin.historyModeration.${key}` as TranslationKey, options),
    [t],
  );

  const [status, setStatus] = useState<HistoryChangeStatus>('PENDING');
  const [targetType, setTargetType] = useState<HistoryTargetType | typeof ALL_TYPES>(ALL_TYPES);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<HistoryChangeRequestPage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await historyModerationService.list({
        status,
        targetType: targetType === ALL_TYPES ? undefined : targetType,
        page,
        pageSize: PAGE_SIZE,
      });
      setData(result);
    } catch (e) {
      console.error(e);
      setError(tk('loadError'));
    } finally {
      setLoading(false);
    }
  }, [status, targetType, page, tk]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<Alert color="red">{tk('noAccess')}</Alert>}>
      <Stack>
        <Group position="apart" align="flex-start">
          <div>
            <Title order={2}>{tk('title')}</Title>
            <Text size="sm" c="dimmed">
              {tk('description')}
            </Text>
          </div>
          <Button
            variant="light"
            leftIcon={<IconRefresh size={16} />}
            onClick={() => void load()}
            loading={loading}
          >
            {tk('refresh')}
          </Button>
        </Group>

        <Paper withBorder p="md">
          <Group align="flex-end">
            <div>
              <Text size="sm" fw={500} mb={4}>
                {tk('filters.status')}
              </Text>
              <SegmentedControl
                value={status}
                onChange={(value) => {
                  setStatus(value as HistoryChangeStatus);
                  setPage(1);
                }}
                data={HISTORY_CHANGE_STATUSES.map((s) => ({ value: s, label: s }))}
              />
            </div>
            <Select
              label={tk('filters.targetType')}
              value={targetType}
              onChange={(value) => {
                setTargetType((value ?? ALL_TYPES) as HistoryTargetType | typeof ALL_TYPES);
                setPage(1);
              }}
              data={[
                { value: ALL_TYPES, label: tk('filters.allTypes') },
                { value: 'MAINTENANCE', label: tk('targetType.MAINTENANCE') },
                { value: 'SERVICE_VISIT', label: tk('targetType.SERVICE_VISIT') },
              ]}
              style={{ width: 220 }}
            />
          </Group>
        </Paper>

        {error ? (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        ) : null}

        <Paper withBorder p="md">
          {loading && !data ? <Loader /> : null}
          {data ? (
            <Stack>
              <Text size="xs" c="dimmed">
                {tk('total', { count: data.total })}
              </Text>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>{tk('table.createdAt')}</th>
                    <th>{tk('table.vehicle')}</th>
                    <th>{tk('table.target')}</th>
                    <th>{tk('table.action')}</th>
                    <th>{tk('table.warnings')}</th>
                    <th>{tk('table.status')}</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {data.items.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <Text size="sm">
                          {formatLocalizedDate(request.createdAt, i18n.language, {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </Text>
                      </td>
                      <td>
                        <Text size="sm">{formatVehicle(request.vehicle)}</Text>
                      </td>
                      <td>
                        <Text size="sm">{tk(`targetType.${request.targetType}`)}</Text>
                      </td>
                      <td>
                        <Badge color={request.action === 'DELETE' ? 'red' : 'blue'} variant="light">
                          {tk(`action.${request.action}`)}
                        </Badge>
                      </td>
                      <td>
                        {request.checks.length > 0 ? (
                          <Badge color="orange" variant="light">
                            {request.checks.length}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </td>
                      <td>
                        <Badge color={statusBadgeColor(request.status)}>{request.status}</Badge>
                      </td>
                      <td>
                        <Button size="xs" variant="light" onClick={() => setOpenId(request.id)}>
                          {tk('table.open')}
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {data.items.length === 0 ? (
                    <tr>
                      <td colSpan={7}>
                        <Text size="sm" c="dimmed">
                          {tk('empty')}
                        </Text>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
              {totalPages > 1 ? (
                <Pagination value={page} onChange={setPage} total={totalPages} />
              ) : null}
            </Stack>
          ) : null}
        </Paper>
      </Stack>

      <ChangeRequestDrawer
        requestId={openId}
        onClose={() => setOpenId(null)}
        onDecided={() => void load()}
      />
    </RoleGuard>
  );
};

export default ServiceHistoryModerationPage;
