import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  Alert,
  Badge,
  Button,
  Code,
  Drawer,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
  Tooltip,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertTriangle } from '@tabler/icons-react';
import { isAxiosError } from 'axios';
import { historyModerationService } from '../../services/historyModeration';
import type {
  HistoryChangeRequestDetail,
  HistoryRecordState,
} from '../../types/historyModeration';
import { useTypedTranslation, type TranslationKey } from '../../i18n';
import { formatLocalizedDate } from '../../utils/timeUtils';
import {
  CHECK_CODES,
  formatVehicle,
  statusBadgeColor,
} from './historyModerationFormat';

const NOTE_MIN_LENGTH = 3;

type Props = {
  requestId: string | null;
  onClose: () => void;
  /** Called after a decision, or after learning the request was already decided. */
  onDecided: () => void;
};

type LineItem = { name?: string; lineTotal?: number | null };

export function ChangeRequestDrawer({ requestId, onClose, onDecided }: Props) {
  const { t, i18n } = useTypedTranslation();
  const tk = useCallback(
    (key: string, options?: Record<string, string | number | undefined>) =>
      t(`admin.historyModeration.${key}` as TranslationKey, options),
    [t],
  );

  const [detail, setDetail] = useState<HistoryChangeRequestDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [noteError, setNoteError] = useState<string | null>(null);
  const [busy, setBusy] = useState<'approve' | 'reject' | null>(null);

  useEffect(() => {
    if (!requestId) return;
    let cancelled = false;
    setDetail(null);
    setError(null);
    setNote('');
    setNoteError(null);
    setLoading(true);
    historyModerationService
      .get(requestId)
      .then((result) => {
        if (!cancelled) setDetail(result);
      })
      .catch((e: unknown) => {
        console.error(e);
        if (!cancelled) setError(tk('detail.loadError'));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, tk]);

  const formatDate = (value: string, withTime = false) =>
    formatLocalizedDate(value, i18n.language, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...(withTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });

  const formatValue = (field: string, value: unknown): ReactNode => {
    if (value === null || value === undefined || value === '') return '—';
    if (field === 'performedAt' && typeof value === 'string') return formatDate(value);
    if (field === 'lineItems' && Array.isArray(value)) {
      const items = value as LineItem[];
      return (
        <Stack spacing={2}>
          <Text size="xs" c="dimmed">
            {tk('detail.lineItems', { count: items.length })}
          </Text>
          {items.map((item, index) => (
            <Text size="xs" key={index}>
              {item.name ?? '—'}
              {item.lineTotal != null ? ` · ${item.lineTotal}` : ''}
            </Text>
          ))}
        </Stack>
      );
    }
    if (typeof value === 'object') {
      return (
        <Code block style={{ whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(value, null, 2)}
        </Code>
      );
    }
    return <span style={{ whiteSpace: 'pre-wrap' }}>{String(value)}</span>;
  };

  const decide = async (decision: 'approve' | 'reject') => {
    if (!detail) return;
    const trimmed = note.trim();
    if (decision === 'reject' && trimmed.length < NOTE_MIN_LENGTH) {
      setNoteError(tk('detail.noteRequired'));
      return;
    }
    setNoteError(null);
    setBusy(decision);
    try {
      if (decision === 'approve') {
        const result = await historyModerationService.approve(detail.id, trimmed || undefined);
        const stale = result.status === 'STALE';
        notifications.show({
          color: stale ? 'yellow' : 'green',
          message: tk(stale ? 'detail.staleResult' : 'detail.approved'),
        });
      } else {
        await historyModerationService.reject(detail.id, trimmed);
        notifications.show({ color: 'green', message: tk('detail.rejected') });
      }
      onDecided();
      onClose();
    } catch (e) {
      console.error(e);
      if (isAxiosError(e) && e.response?.status === 409) {
        notifications.show({ color: 'yellow', message: tk('detail.alreadyProcessed') });
        onDecided();
        onClose();
      } else {
        notifications.show({ color: 'red', message: tk('detail.actionError') });
      }
    } finally {
      setBusy(null);
    }
  };

  const renderDiff = (request: HistoryChangeRequestDetail) => {
    const isDelete = request.action === 'DELETE';
    const before: HistoryRecordState = request.snapshotBefore ?? {};
    const proposed: HistoryRecordState = request.proposed ?? {};
    const current = request.current?.state;
    const showCurrent = request.isStale && !!current;
    const fields = isDelete ? Object.keys(before) : request.changedFields;

    if (!isDelete && fields.length === 0) {
      return (
        <Text size="sm" c="dimmed">
          {tk('detail.noChanges')}
        </Text>
      );
    }

    return (
      <Table fontSize="sm" withBorder withColumnBorders>
        <thead>
          <tr>
            <th>{tk('detail.field')}</th>
            <th>{tk('detail.before')}</th>
            {isDelete ? null : <th>{tk('detail.proposed')}</th>}
            {showCurrent ? <th>{tk('detail.current')}</th> : null}
          </tr>
        </thead>
        <tbody>
          {fields.map((field) => (
            <tr key={field}>
              <td>
                <Text size="sm" fw={500}>
                  {tk(`fields.${field}`, { defaultValue: field })}
                </Text>
              </td>
              <td>{formatValue(field, before[field])}</td>
              {isDelete ? null : <td>{formatValue(field, proposed[field])}</td>}
              {showCurrent ? <td>{formatValue(field, current?.[field])}</td> : null}
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  const renderBody = (request: HistoryChangeRequestDetail) => {
    const pending = request.status === 'PENDING';
    return (
      <Stack>
        <Group position="apart" align="flex-start">
          <div>
            <Text fw={600}>
              {tk(`targetType.${request.targetType}`)} · {tk(`action.${request.action}`)}
            </Text>
            <Text size="xs" c="dimmed">
              {formatVehicle(request.vehicle)}
            </Text>
          </div>
          <Badge color={statusBadgeColor(request.status)}>{request.status}</Badge>
        </Group>

        <Stack spacing={4}>
          <Text size="sm">
            <Text span c="dimmed">
              {tk('detail.submittedAt')}:
            </Text>{' '}
            {formatDate(request.createdAt, true)}
          </Text>
          <Text size="sm">
            <Text span c="dimmed">
              {tk('detail.requestedBy')}:
            </Text>{' '}
            <Code>{request.requestedByUserId}</Code>
          </Text>
        </Stack>

        <div>
          <Text size="sm" c="dimmed">
            {tk('detail.reason')}
          </Text>
          <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
            {request.reason || tk('detail.noReason')}
          </Text>
        </div>

        {request.action === 'DELETE' ? (
          <Alert color="orange">{tk('detail.deleteNotice')}</Alert>
        ) : null}
        {pending && request.isStale ? (
          <Alert color="yellow" icon={<IconAlertTriangle size={16} />}>
            {tk('detail.staleNotice')}
          </Alert>
        ) : null}

        {renderDiff(request)}

        <div>
          <Title order={5} mb={4}>
            {tk('detail.warningsTitle')}
          </Title>
          {request.checks.length === 0 ? (
            <Text size="sm" c="dimmed">
              {tk('detail.noWarnings')}
            </Text>
          ) : (
            <Stack spacing={4}>
              {request.checks.map((check, index) => (
                <Tooltip key={index} label={check.message} multiline width={320} withinPortal>
                  <Group spacing={6} noWrap>
                    <IconAlertTriangle size={14} color="orange" />
                    <Text size="sm">
                      {tk(`checks.${CHECK_CODES.has(check.code) ? check.code : 'UNKNOWN'}`)}
                    </Text>
                  </Group>
                </Tooltip>
              ))}
            </Stack>
          )}
        </div>

        {pending ? (
          <Stack>
            <Textarea
              label={tk('detail.noteLabel')}
              placeholder={tk('detail.notePlaceholder')}
              value={note}
              error={noteError}
              onChange={(e) => setNote(e.currentTarget.value)}
              autosize
              minRows={2}
              maxLength={2000}
            />
            <Group position="right">
              <Button
                color="red"
                variant="light"
                loading={busy === 'reject'}
                disabled={busy !== null}
                onClick={() => void decide('reject')}
              >
                {tk('detail.reject')}
              </Button>
              <Button
                color="green"
                loading={busy === 'approve'}
                disabled={busy !== null}
                onClick={() => void decide('approve')}
              >
                {tk('detail.approve')}
              </Button>
            </Group>
          </Stack>
        ) : (
          <Stack spacing={4}>
            {request.reviewedAt ? (
              <Text size="sm">
                <Text span c="dimmed">
                  {tk('detail.reviewedAt')}:
                </Text>{' '}
                {formatDate(request.reviewedAt, true)}
              </Text>
            ) : null}
            {request.reviewedByUserId ? (
              <Text size="sm">
                <Text span c="dimmed">
                  {tk('detail.reviewedBy')}:
                </Text>{' '}
                <Code>{request.reviewedByUserId}</Code>
              </Text>
            ) : null}
            {request.reviewNote ? (
              <div>
                <Text size="sm" c="dimmed">
                  {tk('detail.reviewNote')}
                </Text>
                <Text size="sm" style={{ whiteSpace: 'pre-wrap' }}>
                  {request.reviewNote}
                </Text>
              </div>
            ) : null}
          </Stack>
        )}
      </Stack>
    );
  };

  return (
    <Drawer
      opened={requestId !== null}
      onClose={onClose}
      position="right"
      size="xl"
      padding="md"
      title={tk('detail.title')}
      styles={{
        title: { fontWeight: 600, fontSize: 18 },
        // body is display:flex (src/index.css), so the portal lands after #root and a
        // fixed container without `left` renders off-screen. Pin it to the viewport.
        inner: { left: 0, right: 0 },
      }}
    >
      {loading ? <Loader /> : null}
      {error ? <Alert color="red">{error}</Alert> : null}
      {detail ? renderBody(detail) : null}
    </Drawer>
  );
}
