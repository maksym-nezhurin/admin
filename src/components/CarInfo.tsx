import { Group, Text, Badge, Divider, Image } from '@mantine/core';
import { Carousel } from '@mantine/carousel';
import { formatPrice } from '../utils/convertPrice';
import type { ICar } from '../types/car';

type ICarInfoProps = ICar & { withGallery: boolean, images?: string[] };

export const CarInfo = (props: ICarInfoProps) => {
    const {
        withGallery,
        media,
        brand = '',
        model = '',
        type,
        engineVolume,
        // complectation,
        drive,
        transmission,
        price,
        year,
        mileage,
        description,
    } = props;

    return (
        <div>
            {withGallery && (media && media.length > 0 ? (
                <Carousel
                    withIndicators
                    height={250}
                    slideSize="100%"
                    loop
                    styles={{ indicator: { background: '#228be6' } }}
                    >
                    {media.map(({ url, id, position }) => (
                        <Carousel.Slide key={id}>
                        <Image
                            src={url}
                            height={250}
                            alt={`${model} car ${position}`}
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
                <Badge size='xl' color="red" variant="light" ml={8}>
                    {
                        formatPrice(price, 'USD')
                    }
                </Badge>
            </Group>
    
            <Text size="sm">
                Transmission: {transmission}
            </Text>

            <Divider my="xs" />

            <Text size="sm" color="dimmed">
                Engine: {engineVolume} <sup>ml</sup>
            </Text>

            <Text size="sm" color="dimmed">
                Drive: {drive}
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

            <Divider my="xs" />

            <Text size="sm">
                Description: {description}
            </Text>
        </div>
    )
}