import React from 'react';
import {useQuery} from '@tanstack/react-query';
import {Link, useParams} from 'react-router-dom';
import {Anchor, Container, Group} from '@mantine/core';
import {carsService} from '../services/cars';
import {CarInfo} from '../components/CarInfo';
import {Loader} from '../components/Loader';

const fetchAnnouncement = async (id: string) => {
  return await carsService.getCar(id);
};

const Announcement: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading, error } = useQuery({
    queryKey: ['announcement', id],
    queryFn: () => id ? fetchAnnouncement(id) : Promise.resolve(undefined),
    enabled: !!id,
  });

  if (!id) {
    return <p>Invalid announcement ID.</p>;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (error instanceof Error) {
    return <p>Error: {error.message}</p>;
  }

  if (!data) {
    return <p>Announcement not found.</p>;
  }

  return (
    <Container size="md" py="xl">
      <Group position="apart" mb="md">
        <Anchor component={Link} to="/dashboard/announcements" size="sm" underline>
          Go to Announcements
        </Anchor>
      </Group>
      <div>
        <CarInfo {...data} withGallery={true} />
      </div>
    </Container>
  );
};

export default Announcement;