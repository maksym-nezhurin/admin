import React from 'react';
import { Button, Group, Text, Badge } from '@mantine/core';
import { useApiClient } from '../../contexts/ApiClientContext';
import { useTypedTranslation } from '../../i18n';

export const ApiClientSwitcher: React.FC = () => {
  const { currentClient, switchClient, getClientNames, isUsingLocal } = useApiClient();
  const { t } = useTypedTranslation();

  const handleSwitchClient = (clientName: string) => {
    switchClient(clientName);
  };

  return (
    <Group spacing="sm" align="center">
      <Text size="sm">{t('api.current')}:</Text>
      <Badge 
        color={isUsingLocal ? 'green' : 'blue'} 
        variant="light"
      >
        {currentClient}
      </Badge>
      
      {getClientNames().map((clientName) => (
        <Button
          key={clientName}
          size="xs"
          variant={currentClient === clientName ? 'filled' : 'outline'}
          onClick={() => handleSwitchClient(clientName)}
        >
          {t(`api.${clientName}` as any)}
        </Button>
      ))}
    </Group>
  );
};
