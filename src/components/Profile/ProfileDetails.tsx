import { useAuth } from "../../contexts/AuthContext";
import { useTypedTranslation } from "../../i18n";
import { Loader } from "../Loader";
import { Paper, Group, ThemeIcon, Stack, Text, Card, Badge, Divider } from "@mantine/core";
import { IconUserCircle, IconUser, IconMail, IconCheck, IconX, IconBuilding } from "@tabler/icons-react";
import { format } from "date-fns";
import type { ICompany } from "../../types/auth";

function isCompanyObject(company: string | ICompany | null | undefined): company is ICompany {
  return typeof company === 'object' && company !== null && 'name' in company;
}

export const ProfileDetails = () => {
  const { userInfo, loading } = useAuth();
  const { t } = useTypedTranslation();

  // Якщо ще вантажимо дані або немає інформації про користувача – показати лоадер
  if (loading || !userInfo) {
    return <Loader />;
  }

  const {
    firstName,
    lastName,
    username,
    email,
    emailVerified,
    roles,
    company,
  } = userInfo;

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder>
      <Group position="center" mb="lg">
        <ThemeIcon size={72} radius="xl" color="blue" variant="light">
          <IconUserCircle size={48} />
        </ThemeIcon>
      </Group>

      <Stack spacing="md">
        {/* Basic user info */}
        <Stack spacing={4} align="center">
          <Text size="xl" fw={700}>
            {firstName} {lastName}
          </Text>
          <Group spacing={8}>
            <Group spacing={6}>
              <ThemeIcon color="gray" size="sm" variant="light">
                <IconUser size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                {t('auth.username')}: {username}
              </Text>
            </Group>
            <Divider orientation="vertical" />
            <Group spacing={6}>
              <ThemeIcon color="gray" size="sm" variant="light">
                <IconMail size={16} />
              </ThemeIcon>
              <Text size="sm" c="dimmed">
                {t('auth.email')}: {email}
              </Text>
              <ThemeIcon
                color={emailVerified ? "green" : "red"}
                size="sm"
                variant="light"
              >
                {emailVerified ? <IconCheck size={14} /> : <IconX size={14} />}
              </ThemeIcon>
            </Group>
          </Group>
        </Stack>

        {/* Company block */}
        {company && (
          <Card shadow="sm" radius="md" withBorder>
            <Stack spacing="xs">
              <Group spacing={8}>
                <ThemeIcon size="sm" color="teal" variant="light">
                  <IconBuilding size={14} />
                </ThemeIcon>
                <Text fw={600}>{t('profile.company')}</Text>
              </Group>
              {isCompanyObject(company) ? (
                <>
                  <Text size="sm">
                    {company.name}
                  </Text>
                  {company.createdAt && (
                    <Text size="xs" c="dimmed">
                      {t('profile.company.createdAt')}: {format(new Date(company.createdAt), "yyyy-MM-dd")}
                    </Text>
                  )}
                  {company.metadata && (
                    <Text size="xs" c="dimmed">
                      {t('profile.company.metadata')}: {JSON.stringify(company.metadata)}
                    </Text>
                  )}
                </>
              ) : typeof company === 'string' ? (
                <Text size="sm">
                  {company}
                </Text>
              ) : null}
            </Stack>
          </Card>
        )}

        {/* Roles block */}
        {roles && roles.length > 0 && (
          <Stack spacing={4}>
            <Text size="sm" fw={600}>
              {t('profile.roles')}:
            </Text>
            <Group spacing={6}>
              {roles.map((r) => (
                <Badge key={r.role.id} color="blue" variant="light" size="sm">
                  {r.role.name}
                </Badge>
              ))}
            </Group>
          </Stack>
        )}
      </Stack>
    </Paper>
  );
};
