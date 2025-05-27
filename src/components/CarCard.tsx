import { Card, Image, NavLink, ActionIcon, Tooltip, Flex } from '@mantine/core';
import { Link } from 'react-router-dom';
import { CarInfo } from './CarInfo';
import { CarNotify } from './CarNotify';
import { IconEdit, IconTrash } from '@tabler/icons-react';
import type { ICar } from '../types/general';

export function CarCard(props: ICar & { onEdit?: (car: ICar) => void; onDelete?: (id: string) => void }) {
  const { id, ownerId, onEdit, onDelete, ...rest } = props;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 320, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Card.Section>
        <Image src="https://placehold.co/320x160" height={160} alt={`${rest.model} car`} />

         <div style={{ position: 'absolute', left: 10, top: 10, display: 'flex', gap: 8, zIndex: 2 }}>
          <CarNotify carId={id} ownerId={ownerId} />
        </div>

        <div style={{ position: 'absolute', right: 10, top: 10, display: 'flex', gap: 8, zIndex: 2 }}>
          <Tooltip label="Edit" withArrow>
            <ActionIcon color="blue" variant="light" onClick={() => onEdit?.(props)}>
              <IconEdit size={18} />
            </ActionIcon>
          </Tooltip>
          <Tooltip label="Delete" withArrow>
            <ActionIcon color="red" variant="light" onClick={() => onDelete?.(id)}>
              <IconTrash size={18} />
            </ActionIcon>
          </Tooltip>
        </div>
      </Card.Section>

      <Flex justify="space-between" direction="column" style={{ flex: 1 }} align="center" mt="md" mb="xs">
        <CarInfo {...props} />

        <NavLink variant='light' color='blue' mt="md" radius="md" label="Details" component={Link} to={`/dashboard/announcements/${id}`} />
      </Flex>
    </Card>
  );
}
