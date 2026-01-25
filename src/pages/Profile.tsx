import React from 'react';
import { Stack } from '@mantine/core';
import { SessionManager } from '../components/Profile/SessionManager';
import { ProfileDetails } from '../components/Profile/ProfileDetails';

const Profile: React.FC = () => {

  return (
    <Stack>
        <ProfileDetails />

        <SessionManager
          onRefresh={() => {}}
          compact={false}
        />
    </Stack>
  );
};

export default Profile;