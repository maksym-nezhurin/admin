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
  rem
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconAt, IconLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTypedTranslation } from '../i18n';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, user, error } = useAuth();
  const navigate = useNavigate();
  const { t } = useTypedTranslation();

  const form = useForm<LoginForm>({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 2 ? t('auth.username_min_length', { count: 2 }) : null),
      password: (value) => (value.length < 4 ? t('auth.password_min_length', { count: 4 }) : null),
    },
  });

  const handleSubmit = async (values: LoginForm) => {
    try {
      await login(values.username, values.password);
      notifications.show({
        title: t('common.success'),
        message: t('auth.login_success'),
        color: 'green',
      });
      // Navigation will happen in useEffect when user state is updated
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      form.setErrors({ password: error, username: error })
      
      notifications.show({
        title: t('common.error'),
        message: error || t('auth.invalid_credentials'),
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
          {t('auth.welcome_back')}
        </Title>
        <Text c="dimmed" size="sm" ta="center" mt={5}>
          {t('auth.no_account')} <Anchor size="sm" component={Link} to="/register" underline>{t('auth.create_account')}</Anchor>
        </Text>

        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                required
                label={t('auth.username')}
                placeholder={t('auth.your_username')}
                icon={<IconAt style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('username')}
              />

              <PasswordInput
                required
                label={t('auth.password')}
                placeholder={t('auth.your_password')}
                icon={<IconLock style={{ width: rem(16), height: rem(16) }} stroke={1.5} />}
                radius="md"
                {...form.getInputProps('password')}
              />

              <Button type="submit" radius="md" fullWidth mt="xl">
                {t('auth.sign_in')}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Container>
    </Flex>
  );
};

export default Login;