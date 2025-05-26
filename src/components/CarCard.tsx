import { Card, Image, NavLink } from '@mantine/core';
import { Link } from 'react-router-dom';
import { CarInfo } from './CarInfo';
import { CarNotify } from './CarNotify';
import type { ICar } from '../types/general';

export function CarCard(props: ICar) {
  const { id, ownerId, ...rest } = props;

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 320 }}>
      <Card.Section>
        <Image src="https://placehold.co/320x160" height={160} alt={`${rest.model} car`} />
      </Card.Section>

       <div style={{ position: 'absolute', left: 'auto', right: '10px', top: '10px' }}>
          <CarNotify carId={id} ownerId={ownerId} />
        </div>

      <CarInfo {...props} />
      
      <NavLink variant='light' color='blue' mt="md" radius="md" label="Details" component={Link} to={`/dashboard/announcements/${id}`} />
    </Card>
  );
}
