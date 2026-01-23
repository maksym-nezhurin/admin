import React from 'react';
import { 
  Title, 
  Stack, 
  Text, 
  Container,
  Paper,
  Group,
  ThemeIcon,
  Button,
  Anchor
} from "@mantine/core";
import { IconShieldOff, IconArrowLeft, IconHome } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

export const AccessDenied: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container size="md" py={16}>
      <Paper 
        radius="lg" 
        shadow="md" 
        p={50}
        withBorder
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.colors.blue[0]} 0%, ${theme.colors.cyan[0]} 100%)`,
          borderColor: theme.colors.blue[2],
        })}
      >
        <Stack align="center" spacing="xl">
          {/* Shield Icon */}
          <ThemeIcon 
            size={70} 
            radius="20%" 
            color="blue"
            variant="light"
            sx={(theme) => ({
              background: theme.colors.blue[5],
              color: theme.white,
            })}
          >
            <IconShieldOff size={35} stroke={1.5} />
          </ThemeIcon>

          {/* Title */}
          <Stack align="center" spacing={0}>
            <Title 
              order={1} 
              size={36}
              fw={600}
              c="blue.7"
              ta="center"
            >
              Access Restricted
            </Title>
            <Text 
              size="md" 
              c="dimmed"
              ta="center"
              maw={450}
            >
              This area requires special permissions to access. If you need access to this feature, please reach out to your team administrator.
            </Text>
          </Stack>

          {/* Action Buttons */}
          <Group spacing="md">
            <Button
              variant="outline"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
            <Button
              variant="filled"
              leftSection={<IconHome size={16} />}
              onClick={() => navigate('/dashboard')}
            >
              Dashboard
            </Button>
          </Group>

          {/* Additional Help */}
          <Stack align="center" spacing="xs">
            <Text size="sm" c="dimmed">
              Need access? Contact your administrator
            </Text>
            <Anchor 
              size="sm" 
              href="mailto:support@example.com"
              c="blue.6"
            >
              Request Access
            </Anchor>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};