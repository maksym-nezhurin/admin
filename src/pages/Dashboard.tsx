import React from 'react';
import { Title, Text, Paper, Card, Badge, Button, Group, Stack } from '@mantine/core';
import { IconUsers } from '@tabler/icons-react';
// import { RoleGuard } from '../components/RoleGuard';
// import { PayableAccessOnly } from '../components/Restrictions/PayableAccessOnly';

const DashboardPage: React.FC = () => {
  return (
    <>
      <Stack>
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Group position="apart">
              <Text fw={500}>Total Users</Text>
              <IconUsers size={20} />
            </Group>
            <Text size="xl" fw={700} mt="md">
              1,234
            </Text>
            <Badge color="blue" variant="light" mt="md">
              +12% from last month
            </Badge>
          </Card>
        </Stack>
      
      <Paper shadow="sm" p="lg" radius="md" withBorder mt="xl">
        <Title order={3} mb="md">
          Recent Activity
        </Title>
        <Text c="dimmed">
          No recent activity to display.
        </Text>
        <Button variant="outline" mt="md">
          View All Activity
        </Button>
      </Paper>

      {/* <RoleGuard roles={['ADMIN', 'SUPER_ADMIN']} fallback={<PayableAccessOnly />}>
        <CarTable />
      </RoleGuard> */}
    </>
  );
};

export default DashboardPage;