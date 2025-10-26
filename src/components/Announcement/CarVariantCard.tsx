import React from 'react';
import { Card, Text, Group, Badge, Divider } from '@mantine/core';
import type { ICarModel } from '../../types/car';
import { countryNameToCode } from '../../types/constants';

// Utility for country flag emoji
const getFlagEmoji = (country: string) => {
  if (!country) return '';
  let code = country;
  if (country.length > 2) {
    code = countryNameToCode[country] || '';
  }
  if (code.length === 2) {
    return code
      .toUpperCase()
      .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
  }
  return '';
};

export const CarVariantCard = ({ variant, selectedVariant, onSelect }: { variant: ICarModel, selectedVariant: string, onSelect: (id: string) => void }) => {
  const isSelected = selectedVariant === (variant.id);

  return (
    <Card
      shadow={isSelected ? "md" : "sm"}
      padding="lg"
      radius="lg"
      withBorder
      style={{
        minWidth: 280,
        marginBottom: 8,
        cursor: 'pointer',
        background: isSelected ? 'linear-gradient(135deg, #e0e7ff 0%, #f0f4ff 100%)' : '#fff',
        transition: 'all 0.2s',
      }}
      onClick={() => onSelect(variant.id)}
    >
      <Group position="apart" mb="xs">
        <Text weight={700} size="md" color={isSelected ? 'blue' : 'dark'}>
          {variant.makeDisplay + ' (' + variant.name + ')'}
        </Text>
        <Group spacing={8} align="center">
          <Badge color={ isSelected ? 'blue' : 'dark' } variant="filled">
             {variant.engineFuel}
          </Badge>
        </Group>
      </Group>
      <Divider my="xs" />
      <Group position="apart" mb="xs">
        <Text weight="bold">Description:</Text>
        <Text size="md" mb={4}>
          {variant.trim || '-'}
        </Text>
      </Group>
      <Divider my="xs" />
      <Group spacing={8} mb={4}>
        <Badge color="blue" variant="dot"><b>Engine:</b> {variant.engineCc ? `${variant.engineCc} (${variant.enginePowerPs})` : '-'}</Badge>
        <Badge color="blue" variant="dot"><b>Weight:</b> {variant.weightKg || '-'}</Badge>
      </Group>      
      <Group spacing={8}>
        <Text size="sm"><b>Transmission:</b> {variant.transmissionType || '-'}</Text>
        <Text size="sm"><b>Country:</b> {variant.makeCountry || '-'}</Text>
        <Text size="lg" style={{ lineHeight: 1 }}>{getFlagEmoji(variant.makeCountry)}</Text>
        <Text size="sm"><b>Fuel consumption:</b> City ({variant.lkmCity || '-'}) / Road ({variant.lkmHwy}) / Mixed ({variant.lkmMixed})</Text>
      </Group>
    </Card>
  );
};