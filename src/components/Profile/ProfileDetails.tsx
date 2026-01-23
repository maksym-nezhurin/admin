import { useAuth } from "../../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import { Loader } from "../Loader";
import { Paper, Group, ThemeIcon, Stack, Text } from "@mantine/core";
import { IconUserCircle, IconUser, IconMail, IconCheck, IconX } from "@tabler/icons-react";

export const ProfileDetails = () => {
  const { userInfo, loading } = useAuth();
  const { t } = useTranslation();

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
    isCompanyRepresentative,
    company,
  } = userInfo;

  return (
    <Paper shadow="md" radius="lg" p="xl" withBorder>
      <Group position="center" mb="md">
        <ThemeIcon size={64} radius="xl" color="blue" variant="light">
          <IconUserCircle size={48} />
        </ThemeIcon>
      </Group>
      <Stack spacing="xs" align="center">
        <Text size="xl" weight={700}>
          {firstName} {lastName}
        </Text>
        <Group spacing={6}>
          <ThemeIcon color="gray" size="sm" variant="light">
            <IconUser size={16} />
          </ThemeIcon>
          <Text size="md">
            {t("username")}: {username}
          </Text>
        </Group>
        <Group spacing={6}>
          <ThemeIcon color="gray" size="sm" variant="light">
            <IconMail size={16} />
          </ThemeIcon>
          <Text size="md">
            {t("email")}: {email}
          </Text>

          <ThemeIcon
            color={emailVerified ? "green" : "red"}
            size="sm"
            variant="light"
          >
            {emailVerified ? <IconCheck size={16} /> : <IconX size={16} />}
          </ThemeIcon>
        </Group>

        {
            isCompanyRepresentative && (
                <Group spacing={6}>
                    <Text>{t("company")}: {company}</Text>
                </Group> 
            )
        }

        {
            roles && (
                <Group spacing={6}>
                    <Text>{t("roles")}: {roles.map(r => r.role.name).join(", ")}</Text>
                </Group> 
            )
        }
      </Stack>
    </Paper>
  );
};
