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
import { useTranslation } from 'react-i18next';
import type { IRegisterForm } from '../types/auth';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, /*user, error */} = useAuth();
  const { t } = useTranslation();

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
        value.length < 2 ? t('username_min_length', { count: 2 }) : null,
      firstName: (value: string) =>
        value.length < 2 ? 'FirstName must have at least 2 letters' : null,
      lastName: (value: string) =>
        value.length < 2 ? 'LastName must have at least 2 letters' : null,
      email: (value: string) =>
        /^\S+@\S+$/.test(value) ? null : t('invalid_email'),
      password: (value: string) =>
        value.length < 4 ? t('password_min_length', { count: 4 }) : null,
      confirmPassword: (value: string | undefined, values: IRegisterForm) =>
        value !== values.password ? t('passwords_do_not_match') : null,
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
          {t('register')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('have_account')} <Anchor size="sm" component={Link} to="/login" underline>{t('sign_in')}</Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label={t('username')}
                placeholder={t('your_username')}
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
                label={t('email')}
                placeholder={t('your_email')}
                icon={<IconMail style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('email')}
              />

              <PasswordInput
                required
                label={t('password')}
                placeholder={t('your_password')}
                icon={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('password')}
              />

              <PasswordInput
                required
                label={t('confirmPassword')}
                placeholder={t('confirm_password')}
                icon={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('confirmPassword')}
              />

              <Button type="submit" radius="md" fullWidth mt="xl">
                {t('register')}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
};
