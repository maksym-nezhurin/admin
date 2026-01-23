import React, { useState, useEffect } from 'react';
import { Button, Group, Select, TextInput, Title, Stack, Paper, Text, MultiSelect } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';
import { LANGUAGES, countryNameToCode } from '../types/constants';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/auth';

const Settings: React.FC = () => {
  const { userInfo, setUserInfo } = useAuth();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const [firstName, setFirstName] = useState(userInfo?.firstName || '');
  const [lastName, setLastName] = useState(userInfo?.lastName || '');
  const [countryCode, setCountryCode] = useState(userInfo?.countryCode || '');
  const [preferredCountries, setPreferredCountries] = useState<string[]>(userInfo?.preferredCountries || []);
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

  // Profile update via API
  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = await authService.updateUserProfile({
        firstName,
        lastName,
        countryCode,
        preferredCountries,
      });
      setUserInfo(updatedUser);
      // TODO: optionally refresh userInfo in AuthContext
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
  }, [theme]);

  return (
    <Paper
      withBorder
      shadow="sm"
      radius="md"
      p="lg"
    >
      <Stack spacing="xl">
        {/* Appearance section */}
        <Stack spacing="md">
          <Title order={4}>{t('appearance', 'Appearance')}</Title>

          <Group position="apart" align="center">
            <Text>{t('theme')}</Text>
            <Select
              data={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
              ]}
              value={theme}
              onChange={handleThemeChange}
              style={{ width: 140 }}
            />
          </Group>

          <Group align="center" position="apart">
            <Text>{t('language')}</Text>
            <Select
              data={LANGUAGES}
              value={language}
              onChange={handleLanguageChange}
              style={{ width: 180 }}
            />
          </Group>
        </Stack>

        {/* Location section */}
        <Stack spacing="md">
          <Title order={4}>{t('location', 'Location')}</Title>

          <Group align="center" position="apart">
            <Text>{t('nativeCountry', 'Native country')}</Text>
            <Text c="dimmed">{userInfo?.nativeCountry || '-'}</Text>
          </Group>

          <Group align="center" position="apart">
            <Text>{t('countryCode', 'Current country')}</Text>
            <Select
              data={Object.keys(countryNameToCode).map((key) => ({ value: countryNameToCode[key], label: key }))}
              value={countryCode}
              onChange={(value) => setCountryCode(value || '')}
              style={{ width: 180 }}
            />
          </Group>

          <Group align="flex-start" position="apart">
            <Text mt={6}>{t('preferredCountries', 'Preferred countries')}</Text>
            <MultiSelect
              data={Object.keys(countryNameToCode).map((key) => ({ value: countryNameToCode[key], label: key }))}
              value={preferredCountries}
              onChange={(value) => setPreferredCountries(value)}
              style={{ width: 220 }}
              searchable
            />
          </Group>
        </Stack>

        {/* Profile section */}
        <Stack spacing="md">
          <Title order={4}>{t('profile', 'Profile')}</Title>

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

              <Stack spacing="sm">
                <Button type="submit" loading={saving} mt={8}>
                  {t('saveProfile')}
                </Button>
              </Stack>
            </Stack>
          </form>
        </Stack>
      </Stack>
    </Paper>
  );
};

export default Settings;