import React, { useState, useEffect } from 'react';
import { Button, Group, Select, TextInput, Title, Stack } from '@mantine/core';
import { useAuth } from '../contexts/AuthContext';
import { useUIStore } from '../store/uiStore';

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Українська' },
  { value: 'pl', label: 'Polski' },
];

export const Settings: React.FC = () => {
  const { userInfo } = useAuth();
  const theme = useUIStore((state) => state.theme);
  const setTheme = useUIStore((state) => state.setTheme);
  const [language, setLanguage] = useState(() => localStorage.getItem('lang') || 'en');
  const [firstName, setFirstName] = useState(userInfo?.firstName || '');
  const [lastName, setLastName] = useState(userInfo?.lastName || '');
  const [saving, setSaving] = useState(false);

  // Theme switcher
  const handleThemeChange = (value: string) => {
    if (value === 'light' || value === 'dark') setTheme(value);
  };

  // Language selector
  const handleLanguageChange = (value: string) => {
    setLanguage(value);
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
      <Title order={2} mb={24}>Settings</Title>
      <Stack spacing="lg">
        <Group position="apart">
          <span>Theme</span>
          <Select
            data={[{ value: 'light', label: 'Light' }, { value: 'dark', label: 'Dark' }]}
            value={theme}
            onChange={handleThemeChange}
            style={{ width: 120 }}
          />
        </Group>
        <Group position="apart">
          <span>Language</span>
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
              label="First Name"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
            <TextInput
              label="Last Name"
              value={lastName}
              onChange={e => setLastName(e.target.value)}
              required
            />
            <Button type="submit" loading={saving} mt={8}>
              Save Profile
            </Button>
          </Stack>
        </form>
      </Stack>
    </div>
  );
};