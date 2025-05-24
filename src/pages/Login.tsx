import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
// import { IconAt, IconLock } from '@tabler/icons-react';

interface LoginForm {
  username: string;
  password: string;
}

export const Login: React.FC = () => {
  const { login, user, error } = useAuth();
  const navigate = useNavigate();

  const form = useForm<LoginForm>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 2 ? 'Username must have at least 2 letters' : null),
      password: (value) => (value.length < 4 ? 'Password must have at least 4 characters' : null),
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    try {
      await login(values.username, values.password);
      notifications.show({
        title: 'Success',
        message: 'You have been successfully logged in',
        color: 'green',
      });
      navigate('/dashboard');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      form.setErrors({ password: error, username: error })
      
      notifications.show({
        title: 'Error',
        message: error || 'Invalid credentials',
        color: 'red',
      });
    }
  };

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);
  
  return (
    <Flex justify="center" align="center" style={{ height: '100vh', width: '100vw' }}>
      <Container size={420} my={40} mx="lg">
        <Title ta="center" fw={900}>
          Welcome back!
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          Do not have an account yet?{' '}
          <Anchor size="sm" component="button">
            Create account
          </Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label="Username"
                placeholder="Your username"
                // left={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                // leftSection={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('username')}
              />

              <PasswordInput
                required
                label="Password"
                placeholder="Your password"
                // leftSection={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('password')}
              />

              <Button type="submit" radius="md" fullWidth mt="xl">
                Sign in
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
};