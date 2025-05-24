// import React from 'react';
import { CarNotify } from './CarNotify';
import { Card, Image, Text, Badge, Button, Group } from '@mantine/core';

interface CarCardProps {
  id: string;
  ownerId: string;
  model: string;
  type: string;
  engine: string;
  complectation: string;
}

export function CarCard({ id, ownerId, model, type, engine, complectation }: CarCardProps) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder style={{ maxWidth: 320 }}>
      <Card.Section>
        <Image src="https://placehold.co/320x160" height={160} alt={`${model} car`} />
      </Card.Section>

        <div style={{ position: 'absolute', left: 'auto', right: '10px', top: '10px' }}>
        <CarNotify carId={id} ownerId={ownerId} />
        </div>


      <Group position="apart" mt="md" mb="xs">
        <Text weight={500}>{model}</Text>
        <Badge color="blue" variant="light">
          {type}
        </Badge>
      </Group>

      <Text size="sm" color="dimmed">
        Engine: {engine}
      </Text>
      <Text size="sm" color="dimmed">
        Complectation: {complectation}
      </Text>

      <Button variant="light" color="blue" fullWidth mt="md" radius="md">
        Details
      </Button>
    </Card>
  );
}
