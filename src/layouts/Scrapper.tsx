import { Group, Title } from "@mantine/core";
import { Outlet } from 'react-router-dom';

const Layout: React.FC = () => {
    return (
        <>
            <Group dir="column">
                <Title level={3}>Scrapper</Title>
            </Group>

            <div>
                <Outlet />
            </div>
        </>
        
    )
}

export default Layout;