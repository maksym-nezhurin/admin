import React, { useState, useEffect } from 'react';
import { Button, Group, Select, TextInput, Title, Stack, Paper, Text, MultiSelect } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';
import { LANGUAGES, countryNameToCode } from '../types/constants';
import { useTypedTranslation, type TranslationKey } from '../i18n';
import { authService } from '../services/auth';
import i18n from '../i18n';

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
  const { t } = useTypedTranslation();

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
          <Title order={4}>{t('common.appearance' as TranslationKey)}</Title>

          <Group position="apart" align="center">
            <Text>{t('common.theme')}</Text>
            <Select
              data={[
                { value: 'light', label: t('common.light' as TranslationKey) },
                { value: 'dark', label: t('common.dark' as TranslationKey) },
              ]}
              value={theme}
              onChange={handleThemeChange}
              style={{ width: 140 }}
            />
          </Group>

          <Group align="center" position="apart">
            <Text>{t('common.language')}</Text>
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
          <Title order={4}>{t('common.location' as TranslationKey)}</Title>

          <Group align="center" position="apart">
            <Text>{t('common.nativeCountry' as TranslationKey)}</Text>
            <Text c="dimmed">{userInfo?.nativeCountry || '-'}</Text>
          </Group>

          <Group align="center" position="apart">
            <Text>{t('common.countryCode' as TranslationKey)}</Text>
            <Select
              data={Object.keys(countryNameToCode).map((key) => ({ value: countryNameToCode[key], label: key }))}
              value={countryCode}
              onChange={(value) => setCountryCode(value || '')}
              style={{ width: 180 }}
            />
          </Group>

          <Group align="flex-start" position="apart">
            <Text mt={6}>{t('common.preferredCountries' as TranslationKey)}</Text>
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
          <Title order={4}>{t('profile.edit_profile')}</Title>

          <form onSubmit={handleProfileSave}>
            <Stack spacing="sm">
              <TextInput
                label={t('profile.firstName')}
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                required
              />
              <TextInput
                label={t('profile.lastName')}
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                required
              />

              <Stack spacing="sm">
                <Button type="submit" loading={saving} mt={8}>
                  {t('profile.saveProfile')}
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