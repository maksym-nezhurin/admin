import React, { useState } from 'react';
import { 
  Paper, 
  Text, 
  Group, 
  Badge, 
  Button, 
  ActionIcon,
  Modal,
  Alert,
  Stack,
  Table,
  Title,
  Loader as MLoader,
} from '@mantine/core';
import { 
  IconDeviceDesktop, 
  IconDeviceMobile, 
  IconTrash,
  IconShieldLock,
  IconAlertTriangle,
  IconBan,
  IconClock,
} from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/auth';
import type { ISession } from '../../types/auth';
import { notifications } from '@mantine/notifications';
import { useUserSessions } from '../../hooks/useUserSessions';

/**
 * 🎯 Компонент для управління активними сесіями користувача
 */

interface SessionManagerProps {
  onRefresh: () => void;
  compact?: boolean; // Для використання на сторінці профілю
}

export const SessionManager: React.FC<SessionManagerProps> = ({
  onRefresh,
  compact = false
}) => {  
  const { userInfo, roleLevel } = useAuth();
  const { data: sessionsData, isLoading } = useUserSessions(userInfo?.id);
  console.log('📊 SessionsPage - sessionsData:', sessionsData);

  const sessions = sessionsData?.sessions || [] as ISession[];
  console.log('🔢 SessionsPage - sessions count:', sessions.length);
  const [selectedSession, setSelectedSession] = useState<ISession | null>(null);
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [deleteSessionModalOpen, setDeleteSessionModalOpen] = useState(false);
  const [revokeAllModalOpen, setRevokeAllModalOpen] = useState(false);

  // Check if user has admin privileges for delete operations
  const canDeleteTokens = (roleLevel?.level ?? 0) >= 80; // ADMIN+

  // Мутація для відкликання сесії
  const revokeSessionMutation = useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) => 
      authService.revokeSession(userInfo?.sub || '', sessionId),
    onSuccess: () => {
      notifications.show({
        title: 'Сесію відкликано',
        message: 'Сесію успішно деактивовано',
        color: 'green'
      });
      onRefresh();
      setRevokeModalOpen(false);
      setSelectedSession(null);
    },
    onError: () => {
      notifications.show({
        title: 'Помилка',
        message: 'Не вдалося відкликати сесію',
        color: 'red'
      });
    }
  });

  // Мутація для видалення сесії (force logout)
  const deleteSessionMutation = useMutation({
    mutationFn: ({ sessionId }: { sessionId: string }) => {
      console.log('🗑️ Attempting to delete session with ID:', sessionId);
      return authService.deleteRefreshToken(sessionId);
    },
    onSuccess: () => {
      notifications.show({
        title: 'Сесію видалено',
        message: 'Сесію успішно видалено, користувач розлогінено',
        color: 'green'
      });
      onRefresh();
      setDeleteSessionModalOpen(false);
      setSelectedSession(null);
    },
    onError: () => {
      notifications.show({
        title: 'Помилка',
        message: 'Не вдалося видалити сесію',
        color: 'red'
      });
    }
  });

  // Мутація для відкликання всіх сесій
  const revokeAllSessionsMutation = useMutation({
    mutationFn: () => authService.revokeAllSessions(userInfo?.sub || ''),
    onSuccess: () => {
      notifications.show({
        title: 'Всі сесії відкликано',
        message: 'Усі сесії успішно деактивовано',
        color: 'green'
      });
      onRefresh();
      setRevokeAllModalOpen(false);
    },
    onError: () => {
      notifications.show({
        title: 'Помилка',
        message: 'Не вдалося відкликати сесії',
        color: 'red'
      });
    }
  });

  // Визначення типу пристрою
  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <IconDeviceDesktop size={16} />;
    
    if (userAgent.includes('Mobile') || userAgent.includes('Android') || userAgent.includes('iPhone')) {
      return <IconDeviceMobile size={16} />;
    }
    return <IconDeviceDesktop size={16} />;
  };

  // Форматування дати
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Перевірка чи сесія скоро закінчиться
  const isExpiringSoon = (expiresAt: string) => {
    const expires = new Date(expiresAt);
    const now = new Date();
    const hoursUntilExpiry = (expires.getTime() - now.getTime()) / (1000 * 60 * 60);
    return hoursUntilExpiry < 24; // Менше 24 годин
  };

  const headerContent = (
    <Group position="apart" mb="md" mt={20}>
      <Group spacing={8}>
        <IconDeviceDesktop size={compact ? 16 : 20} color="teal" />
        <Text size={compact ? "md" : "lg"} fw={600}>
          {compact ? 'Активні сесії' : 'Управління сесіями'}
        </Text>
      </Group>
      {!compact && (
        <Button
          color="orange"
          variant="light"
          size="sm"
          leftSection={<IconShieldLock size={14} />}
          onClick={() => setRevokeAllModalOpen(true)}
          disabled={sessions.length === 0}
        >
          Відкликати всі
        </Button>
      )}
    </Group>
  );

  const tableContent = (
    <Table striped highlightOnHover>
      <thead>
        <tr >
          <th>{compact ? 'Пристрій' : 'Пристрій та деталі'}</th>
          {!compact && <th>IP адреса</th>}
          <th>Дії</th>
        </tr>
      </thead>
      <tbody>
        {sessions.map((session: ISession) => (
          <tr key={session.id}>
            <td>
              <Group spacing="xs">
                {getDeviceIcon()}
                <div>
                  <Text size="sm" fw={500}>
                    {session.username}
                    {session.isCurrent && (
                      <Badge size="xs" ml="xs" color="blue" variant="light">
                        Поточна
                      </Badge>
                    )}
                  </Text>
                  {!compact && (
                    <Text size="xs" c="dimmed">
                      {formatDate(session.createdAt)}
                    </Text>
                  )}
                  {isExpiringSoon(session.expiresAt) && (
                    <Group spacing={4} mt={2}>
                      <IconAlertTriangle size={12} color="orange" />
                      <Text size="xs" c="orange">Скоро закінчиться</Text>
                    </Group>
                  )}
                </div>
              </Group>
            </td>
            {!compact && (
              <td>
                <Text size="sm">{session.ipAddress}</Text>
              </td>
            )}
            <td>
              <Group>
                {!session.isCurrent && (
                  <>
                    <ActionIcon
                      color="orange"
                      variant="light"
                      size="sm"
                      onClick={() => {
                        setSelectedSession(session);
                        setRevokeModalOpen(true);
                      }}
                      title="Відкликати сесію"
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                    {canDeleteTokens && (
                      <ActionIcon
                        color="red"
                        variant="light"
                        size="sm"
                        onClick={() => {
                          setSelectedSession(session);
                          setDeleteSessionModalOpen(true);
                        }}
                        title="Видалити сесію (розлогінити)"
                      >
                        <IconBan size={14} />
                      </ActionIcon>
                    )}
                  </>
                )}
              </Group>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );

  const statsContent = (
    <Group mt="md">
      <Badge size="sm" color="blue" variant="light">
        Всього сесій: {sessions.length}
      </Badge>
      <Badge size="sm" color="green" variant="light">
        Активних пристроїв: {sessions.length}
      </Badge>
    </Group>
  );

  if (isLoading) {
    return (
      <Paper shadow="md" radius="lg" p={compact ? "md" : "xl"} withBorder>
        {headerContent}
        <Stack align="center" py="xl">
          <MLoader size="sm" />
        </Stack>
      </Paper>
    );
  }

  if (sessions.length === 0) {
    return (
      <Paper shadow="md" radius="lg" p={compact ? "md" : "xl"} withBorder>
        {headerContent}
        <Stack align="center" py="xl">
          <IconDeviceDesktop size={compact ? 32 : 48} color="dimmed" />
          <Text c="dimmed">Немає активних сесій</Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <>
      <Paper shadow="md" radius="lg" p={compact ? "md" : "xl"} withBorder>
        
        <Stack>
          <Title order={2}>Активні сесії</Title>
          <Text c="dimmed">Керування активними сесіями вашого акаунту</Text>

          {/* Інформаційна картка */}
          <Alert icon={<IconClock size={16} />} title="Інформація про сесії">
            <Text size="sm">
              Тут відображаються всі активні сесії вашого акаунту. Ви можете відкликати будь-яку сесію,
              окрім поточної. Рекомендовано періодично перевіряти активні сесії для безпеки.
            </Text>
          </Alert>
        </Stack>

        {headerContent}
        
        <Stack spacing="xs">
          {tableContent}
          {!compact && statsContent}
        </Stack>
      </Paper>

      {/* Модальне вікно відкликання сесії */}
      <Modal
        opened={revokeModalOpen}
        onClose={() => setRevokeModalOpen(false)}
        title="Відкликати сесію"
        centered
      >
        <Stack spacing="md">
          <Text>
            Ви впевнені, що хочете відкликати сесію на пристрої{' '}
            <Text fw={600} span>
              {selectedSession?.username} ({selectedSession?.email})
            </Text>?
          </Text>
          <Text size="sm" c="dimmed">
            Після відкликання сесії користувачеві доведеться знову увійти в систему.
          </Text>
          <Group position="right" spacing="sm">
            <Button
              variant="light"
              onClick={() => setRevokeModalOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              color="orange"
              onClick={() => {
                if (selectedSession) {
                  revokeSessionMutation.mutate({ sessionId: selectedSession.id });
                }
              }}
              loading={revokeSessionMutation.isPending}
            >
              Відкликати
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Модальне вікно видалення сесії */}
      <Modal
        opened={deleteSessionModalOpen}
        onClose={() => setDeleteSessionModalOpen(false)}
        title="Видалити сесію (Force Logout)"
        centered
      >
        <Stack>
          <Alert icon={<IconAlertTriangle size={16} />} color="red">
            <Text fw={600}>Увага!</Text>
            <Text size="sm">
              Ця дія назавжди видалить refresh токен сесії. Користувач буде негайно розлогінений
              і не зможе відновити сесію автоматично.
            </Text>
          </Alert>
          <Text>
            Ви впевнені, що хочете видалити сесію на пристрої{' '}
            <Text fw={600} span>
              {selectedSession?.username} ({selectedSession?.email})
            </Text>?
          </Text>
          <Group spacing="sm">
            <Button
              variant="light"
              onClick={() => setDeleteSessionModalOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              color="red"
              onClick={() => {
                if (selectedSession) {
                  deleteSessionMutation.mutate({ sessionId: selectedSession.id });
                }
              }}
              loading={deleteSessionMutation.isPending}
            >
              Видалити сесію
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Модальне вікно відкликання всіх сесій */}
      <Modal
        opened={revokeAllModalOpen}
        onClose={() => setRevokeAllModalOpen(false)}
        title="Відкликати всі сесії"
        centered
      >
        <Stack>
          <Alert icon={<IconAlertTriangle size={16} />} color="orange">
            <Text fw={600}>Увага!</Text>
            <Text size="sm">
              Ця дія відкликає всі активні сесії, включаючи поточну. 
              Вам доведеться знову увійти в систему на всіх пристроях.
            </Text>
          </Alert>
          <Group>
            <Button
              variant="light"
              onClick={() => setRevokeAllModalOpen(false)}
            >
              Скасувати
            </Button>
            <Button
              color="orange"
              onClick={() => revokeAllSessionsMutation.mutate()}
              loading={revokeAllSessionsMutation.isPending}
            >
              Відкликати всі
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
};
