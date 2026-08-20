import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Alert,
  Anchor,
  Badge,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import {
  IconBuilding,
  IconCar,
  IconRefresh,
  IconUsers,
} from '@tabler/icons-react';
import { RoleGuard } from '../components/RoleGuard';
import { b2bAdminService } from '../services/b2bAdmin';
import type { AdminOverview } from '../types/b2bAdmin';
import { ROUTES } from '../routes/constants';
import { useTypedTranslation, type TranslationKey } from '../i18n';
import { formatLocalizedDate } from '../utils/timeUtils';

function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: number | string;
  hint?: string;
  icon?: React.ReactNode;
}) {
  return (
    <Paper withBorder p="md" radius="md">
      <Group position="apart" mb={4}>
        <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
          {label}
        </Text>
        {icon}
      </Group>
      <Text size="xl" fw={700}>
        {value}
      </Text>
      {hint ? (
        <Text size="xs" c="dimmed" mt={6}>
          {hint}
        </Text>
      ) : null}
    </Paper>
  );
}

const DATE_FORMAT_OPTIONS: Intl.DateTimeFormatOptions = {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
};

const AdminDashboardStats: React.FC = () => {
  const { t, i18n } = useTypedTranslation();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const ov = await b2bAdminService.getOverview();
      setOverview(ov);
    } catch (e) {
      console.error(e);
      setError(t('admin.dashboard.error' as TranslationKey));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const verified = overview?.users.byPersonVerification.VERIFIED ?? 0;
  const pendingReview = overview?.partnerListings.byStatus.PENDING_REVIEW ?? 0;

  return (
    <Stack>
      <Group position="apart">
        <div>
          <Title order={2}>{t('admin.dashboard.title' as TranslationKey)}</Title>
          <Text size="sm" c="dimmed">
            {t('admin.dashboard.description' as TranslationKey)}
          </Text>
        </div>
        <Button
          variant="light"
          leftIcon={<IconRefresh size={16} />}
          onClick={() => void load()}
          loading={loading}
        >
          {t('admin.dashboard.refresh' as TranslationKey)}
        </Button>
      </Group>

      {error ? (
        <Alert color="red" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      {!overview && loading ? (
        <Text c="dimmed">{t('admin.dashboard.loading' as TranslationKey)}</Text>
      ) : null}

      {overview ? (
        <>
          <SimpleGrid
            cols={4}
            breakpoints={[
              { maxWidth: 'lg', cols: 2 },
              { maxWidth: 'xs', cols: 1 },
            ]}
          >
            <StatCard
              label={t('admin.dashboard.stats.users' as TranslationKey)}
              value={overview.users.total}
              hint={t('admin.dashboard.stats.usersHint' as TranslationKey, {
                last7: overview.users.last7Days,
                last30: overview.users.last30Days,
                verified,
              })}
              icon={<IconUsers size={18} stroke={1.5} />}
            />
            <StatCard
              label={t('admin.dashboard.stats.newUsers' as TranslationKey)}
              value={overview.users.last7Days}
              hint={t('admin.dashboard.stats.newUsersHint' as TranslationKey, {
                last30: overview.users.last30Days,
              })}
              icon={<IconUsers size={18} stroke={1.5} />}
            />
            <StatCard
              label={t('admin.dashboard.stats.activeUsers' as TranslationKey)}
              value={overview.users.activeLast7Days}
              hint={t('admin.dashboard.stats.activeUsersHint' as TranslationKey, {
                last30: overview.users.activeLast30Days,
                neverLoggedIn: overview.users.neverLoggedIn,
              })}
              icon={<IconUsers size={18} stroke={1.5} />}
            />
            <StatCard
              label={t('admin.dashboard.stats.companies' as TranslationKey)}
              value={overview.companies.total}
              hint={t('admin.dashboard.stats.companiesHint' as TranslationKey, {
                last7: overview.companies.last7Days,
                last30: overview.companies.last30Days,
              })}
              icon={<IconBuilding size={18} stroke={1.5} />}
            />
            <StatCard
              label={t('admin.dashboard.stats.partners' as TranslationKey)}
              value={overview.partnerListings.published}
              hint={t('admin.dashboard.stats.partnersHint' as TranslationKey, {
                pending: pendingReview,
              })}
            />
          </SimpleGrid>

          <SimpleGrid
            cols={4}
            breakpoints={[
              { maxWidth: 'lg', cols: 2 },
              { maxWidth: 'xs', cols: 1 },
            ]}
          >
            {overview.garageAvailable && overview.garage ? (
              <>
                <StatCard
                  label={t('admin.dashboard.stats.vehicles' as TranslationKey)}
                  value={overview.garage.vehicles.total}
                  hint={t('admin.dashboard.stats.vehiclesHint' as TranslationKey, {
                    last7: overview.garage.vehicles.last7Days,
                    last30: overview.garage.vehicles.last30Days,
                  })}
                  icon={<IconCar size={18} stroke={1.5} />}
                />
                <StatCard
                  label={t('admin.dashboard.stats.garage' as TranslationKey)}
                  value={overview.garage.garage.entriesTotal}
                  hint={t('admin.dashboard.stats.garageHint' as TranslationKey, {
                    last7: overview.garage.garage.last7Days,
                    last30: overview.garage.garage.last30Days,
                  })}
                  icon={<IconCar size={18} stroke={1.5} />}
                />
                <StatCard
                  label={t('admin.dashboard.stats.saleListings' as TranslationKey)}
                  value={overview.garage.saleListings.active}
                  hint={t('admin.dashboard.stats.saleListingsHint' as TranslationKey)}
                  icon={<IconCar size={18} stroke={1.5} />}
                />
              </>
            ) : (
              <Paper withBorder p="md" radius="md" style={{ gridColumn: '1 / -1' }}>
                <Text size="sm" c="dimmed">
                  {t('admin.dashboard.garageUnavailable' as TranslationKey)}
                </Text>
              </Paper>
            )}
          </SimpleGrid>

          <Group spacing="md">
            <Anchor component={Link} to={`${ROUTES.DASHBOARD}/${ROUTES.USERS}`} size="sm">
              {t('admin.dashboard.links.allUsers' as TranslationKey)}
            </Anchor>
            <Anchor component={Link} to={`${ROUTES.DASHBOARD}/${ROUTES.ADMIN}`} size="sm">
              {t('admin.dashboard.links.b2b' as TranslationKey)}
            </Anchor>
          </Group>

          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">
              {t('admin.dashboard.recentActivity' as TranslationKey)}
            </Title>
            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
              <Stack spacing="xs">
                <Text size="sm" fw={600}>
                  {t('admin.dashboard.newUsersSection' as TranslationKey)}
                </Text>
                {overview.recent.users.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    {t('admin.dashboard.noData' as TranslationKey)}
                  </Text>
                ) : (
                  <Table fontSize="xs" verticalSpacing="xs">
                    <tbody>
                      {overview.recent.users.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <Text size="sm">{u.email}</Text>
                            <Text size="xs" c="dimmed">
                              @{u.username}
                            </Text>
                          </td>
                          <td>{formatLocalizedDate(String(u.createdAt), i18n.language, DATE_FORMAT_OPTIONS)}</td>
                          <td>
                            <Badge size="xs" variant="light">
                              {u.personVerificationStatus}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Stack>
              <Stack spacing="xs">
                <Text size="sm" fw={600}>
                  {t('admin.dashboard.newCompaniesSection' as TranslationKey)}
                </Text>
                {overview.recent.companies.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    {t('admin.dashboard.noData' as TranslationKey)}
                  </Text>
                ) : (
                  <Table fontSize="xs" verticalSpacing="xs">
                    <tbody>
                      {overview.recent.companies.map((c) => (
                        <tr key={c.id}>
                          <td>
                            <Text size="sm" fw={500}>
                              {c.displayName}
                            </Text>
                            {c.ownerEmail ? (
                              <Text size="xs" c="dimmed">
                                {c.ownerEmail}
                              </Text>
                            ) : null}
                          </td>
                          <td>{formatLocalizedDate(String(c.createdAt), i18n.language, DATE_FORMAT_OPTIONS)}</td>
                          <td>
                            <Badge size="xs" variant="outline">
                              {c.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Stack>
            </SimpleGrid>
          </Paper>
        </>
      ) : null}
    </Stack>
  );
};

const DashboardNoAccess: React.FC = () => {
  const { t } = useTypedTranslation();
  return (
    <Paper withBorder p="lg" radius="md">
      <Title order={3} mb="sm">
        {t('admin.dashboard.noAccessTitle' as TranslationKey)}
      </Title>
      <Text c="dimmed">{t('admin.dashboard.noAccessDescription' as TranslationKey)}</Text>
    </Paper>
  );
};

const DashboardPage: React.FC = () => {
  return (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<DashboardNoAccess />}>
      <AdminDashboardStats />
    </RoleGuard>
  );
};

export default DashboardPage;
