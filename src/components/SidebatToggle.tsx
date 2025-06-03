import { useUIStore } from '../store/uiStore';
import { Button } from '@mantine/core';

export const SidebarToggle: React.FC = () => {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);
  const toggleSidebar = useUIStore((state) => state.toggleSidebar);

  return (
    <Button onClick={toggleSidebar}>
      {sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
    </Button>
  );
};