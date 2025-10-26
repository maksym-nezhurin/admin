import React, { useState, useEffect } from 'react';
import { Button, Group, Select, TextInput, Title, Stack } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';
import { LANGUAGES } from '../types/constants';
import { useTranslation } from 'react-i18next';

const Settings: React.FC = () => {
  const { userInfo } = useAuth();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const [firstName, setFirstName] = useState(userInfo?.firstName || '');
  const [lastName, setLastName] = useState(userInfo?.lastName || '');
  const [saving, setSaving] = useState(false);
  const { t, i18n } = useTranslation();

  // Theme switcher
  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark') setTheme(value);
  };

  // Language selector
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    i18n.changeLanguage(value);
    localStorage.setItem('lang', value);
    // Here you would trigger i18n change if using i18next
  };

  // Profile update (demo: just local state)
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      // Here you would call backend API to update user profile
      // and update AuthContext if needed
      alert('Profile updated!');
    }, 800);
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <div style={{ maxWidth: 420, margin: '0 0', padding: 24 }}>
      <Title order={2} mb={24}>{t('settings')}</Title>
      <Stack spacing="lg">
        <Group position="apart">
          <span>{t('theme')}</span>
          <Select
            data={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            value={theme}
            onChange={handleThemeChange}
            style={{ width: 120 }}
          />
        </Group>
        <Group position="apart">
          <span>{t('language')}</span>
          <Select
            data={LANGUAGES}
            value={language}
            onChange={handleLanguageChange}
            style={{ width: 160 }}
          />
        </Group>
        <form onSubmit={handleProfileSave}>
          <Stack spacing="sm">
            <TextInput
              label={t('firstName')}
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <TextInput
              label={t('lastName')}
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
            <Button type="submit" loading={saving} mt={8}>
              {t('saveProfile')}
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
};

export default Settings;