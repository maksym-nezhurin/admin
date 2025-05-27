import { Group, Text, Badge, Divider } from '@mantine/core';
import type { ICar } from '../types/general';

export const CarInfo = (props: ICar) => {
    const { brand, model, type, engine, complectation, price, year, mileage, description } = props;

    return (
        <div>
            <Group position="apart" mt="md" mb="xs" style={{ width: '100%' }}>
                <Text weight={500} style={{
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                    flex: 1
                }}>{brand} ({model})</Text>
                <Badge color="blue" variant="light" ml={8}>
                    {type}
                </Badge>
            </Group>
    
            <Text size="sm">
                Complectation: {complectation}
            </Text>

            <Divider my="xs" />

            <Text size="sm" color="dimmed">
                Engine: {engine}
            </Text>
            
            <Text size="sm" color="dimmed">
                Price: {typeof price === 'number' ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price) : price}
            </Text>
            <Text size="sm" color="dimmed">
                Year: {year}
            </Text>
            <Text size="sm" color="dimmed">
                Mileage: {mileage}
            </Text>
            <Text size="sm" color="dimmed">
                Description: {description}
            </Text>
        </div>
    )
}