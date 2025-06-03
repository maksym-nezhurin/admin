import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Box, Text, Group, Badge, Paper, Divider, ThemeIcon, Stack, Grid, Loader as MLoader } from '@mantine/core';
import { IconUser, IconMail, IconId, IconCheck, IconX, IconUserCircle, IconDeviceDesktop } from '@tabler/icons-react';
import { useUserSessions } from '../hooks/useUserSessions';
import { Loader } from '../components/Loader';
import { format } from 'date-fns';
import type { ISession } from '../types/auth';
import { useTranslation } from 'react-i18next';

export const Profile: React.FC = () => {
  const { userInfo } = useAuth();
  const { data: userSessions, isLoading: sessionsLoading } = useUserSessions(userInfo?.sub);
  const { t } = useTranslation();

  if (!userInfo) {
    return <Loader />;
  }

  return (
    <Grid gutter="xl" maw={900} mx="auto" mt="xl">
      <Grid.Col span={12} md={6}>
        <Paper shadow="md" radius="lg" p="xl" withBorder>
          <Group position="center" mb="md">
            <ThemeIcon size={64} radius="xl" color="blue" variant="light">
              <IconUserCircle size={48} />
            </ThemeIcon>
          </Group>
          <Stack spacing="xs" align="center">
            <Text size="xl" weight={700}>
              {userInfo.firstName} {userInfo.lastName}
            </Text>
            <Group spacing={6}>
              <ThemeIcon color="gray" size="sm" variant="light">
                <IconUser size={16} />
              </ThemeIcon>
              <Text size="md">{t('username')}: {userInfo.username}</Text>
            </Group>
            <Group spacing={6}>
              <ThemeIcon color="gray" size="sm" variant="light">
                <IconMail size={16} />
              </ThemeIcon>
              <Text size="md">{t('email')}: {userInfo.email}</Text>
              <ThemeIcon color={userInfo.email_verified ? "green" : "red"} size="sm" variant="light">
                {userInfo.email_verified ? <IconCheck size={16} /> : <IconX size={16} />}
              </ThemeIcon>
            </Group>
            <Group spacing={6}>
              <ThemeIcon color="gray" size="sm" variant="light">
                <IconId size={16} />
              </ThemeIcon>
              <Text size="sm" color="dimmed">
                {t('id')}: {userInfo.sub}
              </Text>
            </Group>
          </Stack>
        </Paper>
      </Grid.Col>

      {/* Right section: User sessions */}
      <Grid.Col span={12} md={6}>
        <Paper shadow="md" radius="lg" p="xl" withBorder>
          <Group spacing={8} mb="md">
            <ThemeIcon color="teal" size="lg" variant="light">
              <IconDeviceDesktop size={20} />
            </ThemeIcon>
            <Text size="lg" weight={600}>{t('active_sessions')}</Text>
          </Group>
          <Divider mb="sm" />
          <Stack spacing="sm" align="center">
            {sessionsLoading ? (
              <MLoader size="sm" />
            ) : !userSessions || userSessions.length === 0 ? (
              <Text color="dimmed">{t('no_active_sessions')}</Text>
            ) : (
              userSessions.map((session: ISession) => (
               <Group position="apart" key={session.id} style={{ width: '100%' }}>
                  <Box>
                    <Text size="sm" weight={500}>{session.username}</Text>
                    <Text size="xs" color="dimmed">{t('ip')}: {session.ipAddress}</Text>
                  </Box>
                  <Box>
                    <Text size="sm" weight={500}>{t('last_active')}:</Text>
                    <Text size="xs" color="dimmed">
                      {session.lastAccess ? format(new Date(session.lastAccess), 'yyyy-MM-dd HH:mm:ss') : 'N/A'}
                    </Text>
                  </Box>
                  <Box>
                    <Badge color='green' variant="light">
                      {t('active')}
                    </Badge>
                  </Box>
                </Group>
              ))
            )}
          </Stack>
        </Paper>
      </Grid.Col>
    </Grid>
  );
};