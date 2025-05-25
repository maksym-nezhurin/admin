import { Center, Loader as Lo } from '@mantine/core';

export const Loader = () => {
    return (
        <Center>
            <Lo size="lg" variant="bars" />
        </Center>
    );
}