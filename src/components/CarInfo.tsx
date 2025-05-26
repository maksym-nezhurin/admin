import { Group, Text, Badge } from '@mantine/core';
import type { ICar } from '../types/general';

export const CarInfo = (props: ICar) => {
    const { brand, model, type, engine, complectation, price, year, mileage, description } = props;

    return (
        <>
            <Group position="apart" mt="md" mb="xs">
                <Text weight={500}>{brand} ({model})</Text>
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
            <Text size="sm" color="dimmed">
                Price: {price}
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
        </>
    )
}