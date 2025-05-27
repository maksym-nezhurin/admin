import { carsService } from "../services/cars";
import { ActionIcon } from "@mantine/core";

interface CarNotifyProps {
  carId: string;
  ownerId: string;
}

export const CarNotify: React.FC<CarNotifyProps> = (props) => {
    const { carId, ownerId } = props;

    const hanldeNotify = async () => {
        const res = await carsService.notifyCar({
            carId,
            ownerId,
        });
        console.log('trigger for online service or create DB record', res);
    }

    
    return (
        <ActionIcon color="blue" variant="light" onClick={() => hanldeNotify?.()}>
            ❤️
        </ActionIcon>
    )
}