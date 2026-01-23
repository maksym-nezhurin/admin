import React from 'react';
import { 
  Title, 
  Stack, 
  Text, 
  Container,
  Paper,
  ThemeIcon,
  Anchor
} from "@mantine/core";
import { IconShieldOff } from '@tabler/icons-react';

export const PayableAccessOnly: React.FC = () => {
  return (
    <Container size="md" py={16}>
      <Paper 
        radius="lg" 
        shadow="md" 
        p={50} 
        withBorder
        sx={(theme) => ({
          background: `linear-gradient(135deg, ${theme.colors.green[1]} 0%, ${theme.colors.green[1]} 100%)`,
          borderColor: theme.colors.green[2],
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
              background: theme.colors.green[5],
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
              c="green.7"
              ta="center"
            >
              Change your plan for access this area
            </Title>
            <Text 
              size="md" 
              c="dimmed"
              ta="center"
              maw={450}
            >
              This area available just for more hight user's plan
            </Text>
          </Stack>

          {/* Additional Help */}
          <Stack align="center" spacing="xs">
            <Text size="sm" c="dimmed">
              Need payable plan? Contact your support
            </Text>
            <Anchor 
              size="sm" 
              href="mailto:support@example.com"
              c="green.6"
            >
              Request payable plan
            </Anchor>
          </Stack>
        </Stack>
      </Paper>
    </Container>
  );
};