import { Text } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';

export const Main = () => {
  const { userInfo } = useAuth();

  return (
    <div>
       <Text size={20}>Welcome <b>{userInfo?.firstName} {userInfo?.lastName && userInfo.lastName}</b> to admin mode</Text>
  
      <p>Use the navigation to explore different sections.</p>
    </div>
  );
}