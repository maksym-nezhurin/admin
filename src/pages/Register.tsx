import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Flex,
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
  Text,
  Anchor,
  Stack,
  rem,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock, IconMail } from '@tabler/icons-react';
import type { IRegisterForm } from '../types/auth';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, /*user, error */} = useAuth();

  const form = useForm<IRegisterForm>({
    initialValues: {
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      username: (value: string) =>
        value.length < 2 ? 'Username must have at least 2 letters' : null,
      firstName: (value: string) =>
        value.length < 2 ? 'FirstName must have at least 2 letters' : null,
      lastName: (value: string) =>
        value.length < 2 ? 'LastName must have at least 2 letters' : null,
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : 'Invalid email address',
      password: (value: string) =>
        value.length < 4 ? 'Password must have at least 4 characters' : null,
      confirmPassword: (value: string | undefined, values: IRegisterForm) =>
        value !== values.password ? 'Passwords do not match' : null,
    },
  });

  const handleSubmit = async (values: IRegisterForm) => {
    try {
      await register({
        username: values.username,
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password,
      });

      notifications.show({
        title: 'Success',
        message: 'Account created successfully. Please log in.',
        color: 'green',
      });

      navigate('/login');
    } catch (error) {
      console.log('error', error);
      
      notifications.show({
        title: 'Error',
        message: 'Registration failed',
        color: 'red',
      });
    }
  };

  return (
    <Flex justify="center" align="center" style={{ height: '100vh', width: '100vw' }}>
      <Container size={420} my={40} mx="lg">
        <Title ta="center" fw={900}>
          Create an account
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Already have an account?{' '}
          <Anchor size="sm" component={Link} to="/login">
            Sign in
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label="Username"
                placeholder="Your username"
                icon={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('username')}
              />  

              <TextInput
                required
                label="FirstName"
                placeholder="Your firstName"
                icon={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('firstName')}
              />

              <TextInput
                required
                label="LastName"
                placeholder="Your LastName"
                icon={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('lastName')}
              />    

              <TextInput
                required
                label="Email"
                placeholder="you@email.com"
                icon={<IconMail style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                icon={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                required
                label="Confirm password"
                placeholder="Repeat password"
                icon={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('confirmPassword')}
              />

              <Button type="submit" radius="md" fullWidth mt="xl">
                Create account
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
};
