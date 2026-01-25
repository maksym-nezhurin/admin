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
import { notificationService, isServiceAvailable } from '../services/notification';
import { IconAt, IconLock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTypedTranslation } from '../i18n';

interface LoginForm {
  username: string;
  password: string;
}

const Login: React.FC = () => {
  const { login, user, loading } = useAuth();
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
  console.log('🟢 [Login] loading form', form);
  const handleSubmit = async (values: LoginForm, event?: React.FormEvent) => {
    // Prevent default form submission to avoid page refresh
    if (event) {
      event.preventDefault();
    }

    try {
      await login(values.username, values.password);
      // notificationService.success(t('auth.login_success'), {
      //   title: t('common.success'),
      // });
      // Navigation will happen in useEffect when user state is updated
    } catch (e) {
      console.error('❌ [Login] Error caught in handleSubmit:', e);
      // Prevent default form submission behavior
      if (event) {
        event.preventDefault();
      }
      
      // Check if service is unavailable
      const unavailabilityMessage = isServiceAvailable(e);
      
      if (unavailabilityMessage) {
        console.log('⚠️ [Login] Service unavailable, skipping error notification');
        // Service is unavailable - notification already shown by apiClient interceptor
        // Don't show login error in this case
        return;
      }
      
      // Extract error message from the error object
      let errorMessage = t('auth.invalid_credentials');
      
      if (e && typeof e === 'object') {
        // Check for axios error structure: error.response.data.message or error.response.data.data.message
        const axiosError = e as { response?: { data?: { message?: string; data?: { message?: string } } } };
        const message = axiosError?.response?.data?.data?.message || axiosError?.response?.data?.message;
        
        if (message) {
          errorMessage = message;
        } else if (e instanceof Error) {
          errorMessage = e.message;
        }
      }
      
      console.log('📢 [Login] Showing error notification:', errorMessage);
      // Show error notification only (don't modify form state to avoid refresh)
      notificationService.error(errorMessage, {
        title: t('common.error'),
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

              <Button type="submit" radius="md" fullWidth mt="xl" loading={loading}>
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