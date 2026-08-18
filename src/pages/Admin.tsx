import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Tabs,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { b2bAdminService } from '../services/b2bAdmin';
import type { AdminCompanyRow, AdminOverview, AdminUserRow } from '../types/b2bAdmin';
import { RoleGuard } from '../components/RoleGuard';
import { useTypedTranslation, type TranslationKey } from '../i18n';
import { formatLocalizedDate } from '../utils/timeUtils';

const VERIFICATION_OPTIONS = [
  { value: 'UNVERIFIED', label: 'UNVERIFIED' },
  { value: 'PENDING', label: 'PENDING' },
  { value: 'VERIFIED', label: 'VERIFIED' },
  { value: 'REJECTED', label: 'REJECTED' },
];

const LISTING_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'PENDING_REVIEW', label: 'PENDING_REVIEW' },
  { value: 'PUBLISHED', label: 'PUBLISHED' },
  { value: 'SUSPENDED', label: 'SUSPENDED' },
];

const COMPANY_STATUS_OPTIONS = [
  { value: 'DRAFT', label: 'DRAFT' },
  { value: 'PENDING_REVIEW', label: 'PENDING_REVIEW' },
  { value: 'ACTIVE', label: 'ACTIVE' },
  { value: 'SUSPENDED', label: 'SUSPENDED' },
];

function StatCard({ label, value, hint }: { label: string; value: number | string; hint?: string }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed" tt="uppercase" fw={600}>
        {label}
      </Text>
      <Text size="xl" fw={700} mt={4}>
        {value}
      </Text>
      {hint ? (
        <Text size="xs" c="dimmed" mt={4}>
          {hint}
        </Text>
      ) : null}
    </Paper>
  );
}

const AdminPage = () => {
  const { t, i18n } = useTypedTranslation();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [companies, setCompanies] = useState<AdminCompanyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, u, c] = await Promise.all([
        b2bAdminService.getOverview(),
        b2bAdminService.getUsers(),
        b2bAdminService.getCompanies(),
      ]);
      setOverview(ov);
      setUsers(u);
      setCompanies(c);
    } catch (e) {
      console.error(e);
      setError(t('admin.page.loadError' as TranslationKey));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        `${u.firstName ?? ''} ${u.lastName ?? ''}`.toLowerCase().includes(q),
    );
  }, [users, search]);

  const filteredCompanies = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        (c.owner?.email ?? '').toLowerCase().includes(q),
    );
  }, [companies, search]);

  const onVerification = async (userId: string, status: string | null) => {
    if (!status) return;
    setBusyKey(`v-${userId}`);
    try {
      await b2bAdminService.setPersonVerification(userId, status);
      await load();
    } catch (e) {
      console.error(e);
      setError(t('admin.page.verificationError' as TranslationKey));
    } finally {
      setBusyKey(null);
    }
  };

  const onListingStatus = async (listingId: string, status: string | null) => {
    if (!status) return;
    setBusyKey(`l-${listingId}`);
    try {
      await b2bAdminService.setPartnerListingStatus(listingId, status);
      await load();
    } catch (e) {
      console.error(e);
      setError(t('admin.page.listingError' as TranslationKey));
    } finally {
      setBusyKey(null);
    }
  };

  const onCompanyStatus = async (companyId: string, status: string | null) => {
    if (!status) return;
    setBusyKey(`c-${companyId}`);
    try {
      await b2bAdminService.setCompanyStatus(companyId, status);
      await load();
    } catch (e) {
      console.error(e);
      setError(t('admin.page.companyError' as TranslationKey));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <RoleGuard
      roles={['ADMIN', 'SUPER_ADMIN']}
      fallback={<Alert color="red">{t('admin.page.noAccess' as TranslationKey)}</Alert>}
    >
      <Stack>
        <Group position="apart">
          <div>
            <Title order={2}>{t('admin.page.title' as TranslationKey)}</Title>
            <Text size="sm" c="dimmed">
              {t('admin.page.description' as TranslationKey)}
            </Text>
          </div>
          <Button
            variant="light"
            leftIcon={<IconRefresh size={16} />}
            onClick={() => void load()}
            loading={loading}
          >
            {t('admin.page.refresh' as TranslationKey)}
          </Button>
        </Group>

        {error ? (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        ) : null}

        {overview ? (
          <SimpleGrid cols={4} breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'xs', cols: 1 }]}>
            <StatCard label={t('admin.page.stats.users' as TranslationKey)} value={overview.users.total} />
            <StatCard
              label={t('admin.page.stats.newUsers' as TranslationKey)}
              value={overview.users.last7Days}
              hint={t('admin.page.stats.newUsersHint' as TranslationKey, {
                last30: overview.users.last30Days,
              })}
            />
            <StatCard
              label={t('admin.page.stats.companies' as TranslationKey)}
              value={overview.companies.total}
              hint={t('admin.page.stats.companiesHint' as TranslationKey, {
                last7: overview.companies.last7Days,
                last30: overview.companies.last30Days,
              })}
            />
            <StatCard
              label={t('admin.page.stats.partners' as TranslationKey)}
              value={overview.partnerListings.published}
              hint={t('admin.page.stats.partnersHint' as TranslationKey, {
                pending: overview.partnerListings.byStatus.PENDING_REVIEW ?? 0,
              })}
            />
          </SimpleGrid>
        ) : null}

        <TextInput
          placeholder={t('admin.page.searchPlaceholder' as TranslationKey)}
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
        />

        <Tabs defaultValue="users">
          <Tabs.List>
            <Tabs.Tab value="users">
              {t('admin.page.tabs.users' as TranslationKey, { count: users.length })}
            </Tabs.Tab>
            <Tabs.Tab value="companies">
              {t('admin.page.tabs.companies' as TranslationKey, { count: companies.length })}
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="users" pt="md">
            <Paper withBorder>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>{t('admin.page.usersTable.user' as TranslationKey)}</th>
                    <th>{t('admin.page.usersTable.registered' as TranslationKey)}</th>
                    <th>{t('admin.page.usersTable.roles' as TranslationKey)}</th>
                    <th>{t('admin.page.usersTable.verification' as TranslationKey)}</th>
                    <th>{t('admin.page.usersTable.companies' as TranslationKey)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.id}>
                      <td>
                        <Text size="sm" fw={600}>
                          {u.email}
                        </Text>
                        <Text size="xs" c="dimmed">
                          @{u.username}
                        </Text>
                      </td>
                      <td>
                        <Text size="xs">{formatLocalizedDate(u.createdAt, i18n.language)}</Text>
                      </td>
                      <td>
                        <Group spacing={4}>
                          {(u.roles.length ? u.roles : ['USER']).map((r) => (
                            <Badge key={r} size="xs" variant="light">
                              {r}
                            </Badge>
                          ))}
                        </Group>
                      </td>
                      <td>
                        <Select
                          size="xs"
                          data={VERIFICATION_OPTIONS}
                          value={u.personVerificationStatus}
                          disabled={busyKey === `v-${u.id}`}
                          onChange={(v) => void onVerification(u.id, v)}
                        />
                      </td>
                      <td>
                        {u.companies.length === 0 ? (
                          <Text size="xs" c="dimmed">
                            —
                          </Text>
                        ) : (
                          <Stack spacing={4}>
                            {u.companies.map((c) => (
                              <div key={c.id}>
                                <Group spacing={4} noWrap>
                                  <Text size="xs">{c.displayName}</Text>
                                  <Select
                                    size="xs"
                                    w={140}
                                    data={COMPANY_STATUS_OPTIONS}
                                    value={c.status}
                                    disabled={busyKey === `c-${c.id}`}
                                    onChange={(v) => void onCompanyStatus(c.id, v)}
                                  />
                                </Group>
                                {c.partnerListing ? (
                                  <Select
                                    size="xs"
                                    mt={4}
                                    data={LISTING_STATUS_OPTIONS}
                                    value={c.partnerListing.status}
                                    disabled={busyKey === `l-${c.partnerListing.id}`}
                                    onChange={(v) =>
                                      void onListingStatus(c.partnerListing!.id, v)
                                    }
                                  />
                                ) : (
                                  <Text size="xs" c="dimmed">
                                    {t('admin.page.usersTable.noListing' as TranslationKey)}
                                  </Text>
                                )}
                              </div>
                            ))}
                          </Stack>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Tabs.Panel>

          <Tabs.Panel value="companies" pt="md">
            <Paper withBorder>
              <Table striped highlightOnHover>
                <thead>
                  <tr>
                    <th>{t('admin.page.companiesTable.company' as TranslationKey)}</th>
                    <th>{t('admin.page.companiesTable.owner' as TranslationKey)}</th>
                    <th>{t('admin.page.companiesTable.companyStatus' as TranslationKey)}</th>
                    <th>{t('admin.page.companiesTable.catalog' as TranslationKey)}</th>
                    <th>{t('admin.page.companiesTable.publication' as TranslationKey)}</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <Text size="sm" fw={600}>
                          {c.displayName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {c.countryCode}
                        </Text>
                      </td>
                      <td>
                        {c.owner ? (
                          <>
                            <Text size="xs">{c.owner.email}</Text>
                            <Badge size="xs" variant="outline" mt={4}>
                              {c.owner.personVerificationStatus}
                            </Badge>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td>
                        <Select
                          size="xs"
                          data={COMPANY_STATUS_OPTIONS}
                          value={c.status}
                          disabled={busyKey === `c-${c.id}`}
                          onChange={(v) => void onCompanyStatus(c.id, v)}
                        />
                      </td>
                      <td>
                        {c.partnerListing ? (
                          <>
                            <Text size="xs">/partners/{c.partnerListing.slug}</Text>
                            <Badge size="xs" mt={4}>
                              {c.partnerListing.status}
                            </Badge>
                          </>
                        ) : (
                          <Text size="xs" c="dimmed">
                            {t('admin.page.companiesTable.none' as TranslationKey)}
                          </Text>
                        )}
                      </td>
                      <td>
                        {c.partnerListing ? (
                          <Select
                            size="xs"
                            data={LISTING_STATUS_OPTIONS}
                            value={c.partnerListing.status}
                            disabled={busyKey === `l-${c.partnerListing.id}`}
                            onChange={(v) => void onListingStatus(c.partnerListing!.id, v)}
                          />
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Paper>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </RoleGuard>
  );
};

export default AdminPage;
