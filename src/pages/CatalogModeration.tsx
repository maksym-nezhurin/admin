import { useState } from 'react';
import {
  Alert,
  Badge,
  Button,
  Group,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { catalogAdminService } from '../services/catalogAdmin';
import type { CatalogAdminGeneration, CatalogReviewStatus } from '../types/catalogAdmin';
import { RoleGuard } from '../components/RoleGuard';

const REVIEW_STATUS_OPTIONS: { value: CatalogReviewStatus; label: string }[] = [
  { value: 'approved', label: 'approved' },
  { value: 'draft', label: 'draft' },
  { value: 'rejected', label: 'rejected' },
];

function reviewBadgeColor(status: CatalogReviewStatus): string {
  if (status === 'approved') return 'green';
  if (status === 'draft') return 'yellow';
  return 'red';
}

/** Splits "vw/golf/golf-vii" (also accepts leading/trailing slashes) into 3 slugs. */
function parsePathInput(value: string): [string, string, string] | null {
  const parts = value.trim().split('/').filter(Boolean);
  if (parts.length !== 3) return null;
  return [parts[0], parts[1], parts[2]];
}

const CatalogModerationPage = () => {
  const [pathInput, setPathInput] = useState('');
  const [generation, setGeneration] = useState<CatalogAdminGeneration | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');

  const runLookup = async () => {
    const parsed = parsePathInput(pathInput);
    if (!parsed) {
      setError('Podaj ścieżkę w formacie marka/model/generacja, np. vw/golf/golf-vii');
      return;
    }
    setLoading(true);
    setError(null);
    setGeneration(null);
    try {
      const [makeSlug, modelSlug, generationSlug] = parsed;
      const result = await catalogAdminService.lookupGeneration(
        makeSlug,
        modelSlug,
        generationSlug,
      );
      setGeneration(result);
      setDisplayName(result.displayName);
      setCoverImageUrl(result.coverImageUrl ?? '');
    } catch (e) {
      console.error(e);
      setError('Nie znaleziono generacji (lub brak uprawnień ADMIN).');
    } finally {
      setLoading(false);
    }
  };

  const saveGenerationField = async (patch: {
    reviewStatus?: CatalogReviewStatus;
    displayName?: string;
    coverImageUrl?: string;
  }) => {
    if (!generation) return;
    setBusyKey('generation');
    setError(null);
    try {
      await catalogAdminService.updateGeneration(generation.id, patch);
      setGeneration({ ...generation, ...patch });
    } catch (e) {
      console.error(e);
      setError('Aktualizacja generacji nie powiodła się.');
    } finally {
      setBusyKey(null);
    }
  };

  const onTrimReviewStatus = async (trimId: string, status: string | null) => {
    if (!status || !generation) return;
    setBusyKey(`trim-${trimId}`);
    setError(null);
    try {
      await catalogAdminService.updateTrimReviewStatus(trimId, status as CatalogReviewStatus);
      setGeneration({
        ...generation,
        trims: generation.trims.map((t) =>
          t.id === trimId ? { ...t, reviewStatus: status as CatalogReviewStatus } : t,
        ),
      });
    } catch (e) {
      console.error(e);
      setError('Aktualizacja trimu nie powiodła się.');
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<Alert color="red">Brak dostępu</Alert>}>
      <Stack>
        <div>
          <Title order={2}>Katalog — moderacja</Title>
          <Text size="sm" c="dimmed">
            Flaguj wadliwe generacje/trimy (approved / draft / rejected) i popraw nazwę lub
            okładkę generacji. Draft/rejected znika z publicznego /catalog, ale zostaje w
            wyszukiwarce tutaj.
          </Text>
        </div>

        {error ? (
          <Alert color="red" onClose={() => setError(null)} withCloseButton>
            {error}
          </Alert>
        ) : null}

        <Paper withBorder p="md">
          <Group align="flex-end">
            <TextInput
              label="Ścieżka generacji"
              placeholder="vw/golf/golf-vii"
              value={pathInput}
              onChange={(e) => setPathInput(e.currentTarget.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void runLookup();
              }}
              style={{ flex: 1 }}
            />
            <Button leftIcon={<IconSearch size={16} />} onClick={() => void runLookup()} loading={loading}>
              Szukaj
            </Button>
          </Group>
        </Paper>

        {generation ? (
          <Paper withBorder p="md">
            <Stack>
              <Group position="apart">
                <div>
                  <Text fw={600}>
                    {generation.make.name} {generation.model.name} — {generation.displayName}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {generation.slug} · {generation.yearFrom ?? '—'}–{generation.yearTo ?? '—'} ·
                    supportTier: {generation.supportTier}
                  </Text>
                </div>
                <Badge color={reviewBadgeColor(generation.reviewStatus)}>
                  {generation.reviewStatus}
                </Badge>
              </Group>

              <Group align="flex-end">
                <Select
                  label="Status generacji"
                  data={REVIEW_STATUS_OPTIONS}
                  value={generation.reviewStatus}
                  disabled={busyKey === 'generation'}
                  onChange={(v) =>
                    v ? void saveGenerationField({ reviewStatus: v as CatalogReviewStatus }) : null
                  }
                  style={{ width: 180 }}
                />
                <TextInput
                  label="Nazwa (displayName)"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <TextInput
                  label="Cover image URL"
                  value={coverImageUrl}
                  onChange={(e) => setCoverImageUrl(e.currentTarget.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  variant="light"
                  disabled={busyKey === 'generation'}
                  onClick={() =>
                    void saveGenerationField({
                      displayName,
                      coverImageUrl: coverImageUrl || undefined,
                    })
                  }
                >
                  Zapisz
                </Button>
              </Group>

              <Table striped highlightOnHover mt="md">
                <thead>
                  <tr>
                    <th>Trim</th>
                    <th>Silnik</th>
                    <th>Skrzynia</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {generation.trims.map((t) => (
                    <tr key={t.id}>
                      <td>
                        <Text size="sm">{t.displayName}</Text>
                        <Text size="xs" c="dimmed">
                          {t.slug}
                        </Text>
                      </td>
                      <td>
                        <Text size="xs">
                          {t.engine ?? '—'} {t.powerHp ? `· ${t.powerHp} KM` : ''}
                        </Text>
                      </td>
                      <td>
                        <Text size="xs">{t.transmission ?? '—'}</Text>
                      </td>
                      <td>
                        <Select
                          size="xs"
                          data={REVIEW_STATUS_OPTIONS}
                          value={t.reviewStatus}
                          disabled={busyKey === `trim-${t.id}`}
                          onChange={(v) => void onTrimReviewStatus(t.id, v)}
                          style={{ width: 130 }}
                        />
                      </td>
                    </tr>
                  ))}
                  {generation.trims.length === 0 ? (
                    <tr>
                      <td colSpan={4}>
                        <Text size="xs" c="dimmed">
                          Brak trimów.
                        </Text>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </Table>
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </RoleGuard>
  );
};

export default CatalogModerationPage;
