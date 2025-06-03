import { Group, Text, Badge, Divider, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import type { ICar } from '../types/car';

type ICarInfoProps = ICar & { withGallery: boolean, images?: string[] };

export const CarInfo = (props: ICarInfoProps) => {
    const { withGallery, brand, model, type, engine, complectation, price, year, mileage, description, images } = props;

    return (
        <div>
            {withGallery && (images && images.length > 0 ? (
                <Carousel
                    withIndicators
                    height={250}
                    slideSize="100%"
                    loop
                    styles={{ indicator: { background: '#228be6' } }}
                    >
                    {images.map((img: string, idx: number) => (
                        <Carousel.Slide key={idx}>
                        <Image
                            src={img}
                            height={250}
                            alt={`${model} car ${idx + 1}`}
                            fit="cover"
                            radius={0}
                        />
                        </Carousel.Slide>
                    ))}
                </Carousel>
            ) : (
                <Image src="https://placehold.co/320x160" height={250} alt={`${model} car`} />
            ))}
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