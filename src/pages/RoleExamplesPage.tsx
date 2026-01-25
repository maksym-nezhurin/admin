import { Stack, Title, Alert } from '@mantine/core';
import { 
  AccessControlPage,
  RoleBasedNavigation,
  DynamicForm 
} from '../examples/RoleBasedAccessExamples';

/**
 * 🎯 Сторінка з прикладами використання системи ролей
 */
const RoleExamplesPage = () => {
  return (
    <Stack spacing="lg" p="md">
      <Title order={1}>🎯 Приклади системи контролю доступу</Title>
      
      <Alert color="blue" title="Інформація">
        Ця сторінка демонструє різні способи використання системи ролей та обмежень доступу.
        Спробуйте змінити роль користувача в системі, щоб побачити різні рівні доступу.
      </Alert>
      
      <AccessControlPage />
      <RoleBasedNavigation />
      <DynamicForm />
    </Stack>
  );
};

export default RoleExamplesPage;
