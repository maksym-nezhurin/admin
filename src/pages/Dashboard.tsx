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

function formatDate(value: string) {
  try {
    return new Date(value).toLocaleDateString('pl-PL', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return value;
  }
}

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

const AdminDashboardStats: React.FC = () => {
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
      setError('Nie udało się załadować statystyk (wymagana rola ADMIN).');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const verified = overview?.users.byPersonVerification.VERIFIED ?? 0;
  const pendingReview = overview?.partnerListings.byStatus.PENDING_REVIEW ?? 0;

  return (
    <Stack>
      <Group position="apart">
        <div>
          <Title order={2}>Panel administracyjny</Title>
          <Text size="sm" c="dimmed">
            Rejestracje użytkowników, firm B2B oraz pojazdy w garażu
          </Text>
        </div>
        <Button
          variant="light"
          leftIcon={<IconRefresh size={16} />}
          onClick={() => void load()}
          loading={loading}
        >
          Odśwież
        </Button>
      </Group>

      {error ? (
        <Alert color="red" onClose={() => setError(null)} withCloseButton>
          {error}
        </Alert>
      ) : null}

      {!overview && loading ? (
        <Text c="dimmed">Ładowanie statystyk…</Text>
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
              label="Użytkownicy"
              value={overview.users.total}
              hint={`+${overview.users.last7Days} (7 dni) · +${overview.users.last30Days} (30 dni) · zweryfikowani: ${verified}`}
              icon={<IconUsers size={18} stroke={1.5} />}
            />
            <StatCard
              label="Nowi użytkownicy"
              value={overview.users.last7Days}
              hint={`Ostatnie 30 dni: ${overview.users.last30Days}`}
              icon={<IconUsers size={18} stroke={1.5} />}
            />
            <StatCard
              label="Firmy"
              value={overview.companies.total}
              hint={`+${overview.companies.last7Days} (7 dni) · +${overview.companies.last30Days} (30 dni)`}
              icon={<IconBuilding size={18} stroke={1.5} />}
            />
            <StatCard
              label="Partnerzy w katalogu"
              value={overview.partnerListings.published}
              hint={`Oczekują na publikację: ${pendingReview}`}
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
                  label="Pojazdy (rekordy)"
                  value={overview.garage.vehicles.total}
                  hint={`+${overview.garage.vehicles.last7Days} (7 dni) · +${overview.garage.vehicles.last30Days} (30 dni)`}
                  icon={<IconCar size={18} stroke={1.5} />}
                />
                <StatCard
                  label="Garaż (aktywne)"
                  value={overview.garage.garage.entriesTotal}
                  hint={`+${overview.garage.garage.last7Days} (7 dni) · +${overview.garage.garage.last30Days} (30 dni)`}
                  icon={<IconCar size={18} stroke={1.5} />}
                />
                <StatCard
                  label="Ogłoszenia sprzedaży"
                  value={overview.garage.saleListings.active}
                  hint="Status ACTIVE"
                  icon={<IconCar size={18} stroke={1.5} />}
                />
              </>
            ) : (
              <Paper withBorder p="md" radius="md" style={{ gridColumn: '1 / -1' }}>
                <Text size="sm" c="dimmed">
                  Statystyki garażu niedostępne — uruchom car-service i ustaw{' '}
                  <Text span ff="monospace" size="xs">
                    CAR_SERVICE_URL
                  </Text>{' '}
                  w user-service.
                </Text>
              </Paper>
            )}
          </SimpleGrid>

          <Group spacing="md">
            <Anchor component={Link} to={`${ROUTES.DASHBOARD}/${ROUTES.USERS}`} size="sm">
              Wszyscy użytkownicy →
            </Anchor>
            <Anchor component={Link} to={`${ROUTES.DASHBOARD}/${ROUTES.ADMIN}`} size="sm">
              B2B — firmy i weryfikacja →
            </Anchor>
          </Group>

          <Paper withBorder p="md" radius="md">
            <Title order={4} mb="md">
              Ostatnia aktywność
            </Title>
            <SimpleGrid cols={2} breakpoints={[{ maxWidth: 'md', cols: 1 }]}>
              <Stack spacing="xs">
                <Text size="sm" fw={600}>
                  Nowi użytkownicy
                </Text>
                {overview.recent.users.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    Brak danych
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
                          <td>{formatDate(String(u.createdAt))}</td>
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
                  Nowe firmy
                </Text>
                {overview.recent.companies.length === 0 ? (
                  <Text size="sm" c="dimmed">
                    Brak danych
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
                          <td>{formatDate(String(c.createdAt))}</td>
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

const DashboardPage: React.FC = () => {
  return (
    <RoleGuard
      roles={['ADMIN', 'SUPER_ADMIN']}
      fallback={
        <Paper withBorder p="lg" radius="md">
          <Title order={3} mb="sm">
            Witaj w panelu
          </Title>
          <Text c="dimmed">
            Statystyki platformy są dostępne dla administratorów. Skontaktuj się z
            administratorem, jeśli potrzebujesz dostępu.
          </Text>
        </Paper>
      }
    >
      <AdminDashboardStats />
    </RoleGuard>
  );
};

export default DashboardPage;
