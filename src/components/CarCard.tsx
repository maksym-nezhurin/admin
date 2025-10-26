import { Card, NavLink, ActionIcon, Tooltip, Flex, Image } from '@mantine/core';
import { Link } from 'react-router-dom';
import { CarInfo } from './CarInfo';
import { CarNotify } from './CarNotify';
import { IconEdit, IconTrash, IconCreditCard } from '@tabler/icons-react';
import type { ICar } from '../types/car';

export function CarCard(props: ICar & { onEdit?: (car: ICar) => void; onDelete?: (id: string) => void }) {
  const {
    id,
    ownerId, 
    isRentable, 
    onEdit, 
    onDelete, 
    media, 
    model,
  } = props;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 320, position: 'relative', display: 'flex', flexDirection: 'column' }}>
      <Card.Section>
        {
          media && media.length > 0 ? (
            <Image src={media[0].url} height={160} alt={`${model} car`} />
          ) : (
            <Image src="https://placehold.co/320x160" height={160} alt={`${model} car`} />
          )
        }

         <div style={{ position: 'absolute', left: 10, top: 10, display: 'flex', gap: 8, zIndex: 2 }}>
          <CarNotify carId={id} ownerId={ownerId} />

          {
            isRentable && <ActionIcon color='green'variant="light" ><IconCreditCard /></ActionIcon>
          }
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
        <CarInfo withGallery={false} {...props} />

        <NavLink variant='light' color='blue' mt="md" radius="md" label="Details" component={Link} to={`/dashboard/announcements/${id}`} />
      </Flex>
    </Card>
  );
}
