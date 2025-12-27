import { Text } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

import { Welcome } from '../components/Main/Welcome';
import { CarTable } from '../components/Main/CarTable';
// import { CarAnalyticsChart } from '../components/CarAnalyticsChart';

const Main = () => {
  const { roleLevel } = useAuth();
  const { t } = useTranslation();

  return <>
    <Welcome />

    {
      roleLevel.level <= 60 ?
        (
            <Text color="red">{t('insufficient_role_level_warning')}</Text>
        ) : (
            <CarTable />
        )
    }
  
  </>
};

export default Main;