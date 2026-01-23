import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NavLink, Group, Text, Badge, Progress, Tooltip, useMantineTheme } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { 
  IconChevronRight, 
  IconHome,
  IconFileText,
  IconTools,
  IconShield,
  IconServer,
  IconLock,
  IconStar,
  IconActivity,
  IconUser,
  IconSettings,
  IconBell,
  IconUsers,
  IconClipboard,
  IconChartBar
} from '@tabler/icons-react';

import { useMediaQuery } from '@mantine/hooks';

/**
 * 🎯 Просунута навігація з розкривними розділами
 */

// Типи для пунктів меню
interface MenuItem {
  label: string;
  path?: string;
  icon?: React.ReactNode;
  requiredLevel?: number;
  badge?: string;
  description?: string;
  isNew?: boolean;
  isPopular?: boolean;
  disabled?: boolean;
}

// Типи для розділів меню
interface MenuSection {
  label: string;
  icon?: React.ReactNode;
  requiredLevel?: number;
  badge?: string;
  defaultOpen?: boolean;
  description?: string;
  items: MenuItem[];
  color?: string;
}

// Конфігурація меню з просунутими можливостями
const MENU_SECTIONS: MenuSection[] = [
  {
    label: 'menu.sections.main',
    icon: <IconHome size={16} />,
    requiredLevel: 0,
    defaultOpen: true,
    description: 'Основні функції та налаштування',
    color: '#339af0',
    items: [
      { 
        label: 'menu.dashboard', 
        path: '', 
        requiredLevel: 0,
        description: 'Головна панель керування',
        icon: <IconActivity size={14} />
      },
      { 
        label: 'menu.profile', 
        path: 'profile', 
        requiredLevel: 0,
        description: 'Персональні дані та налаштування',
        icon: <IconUser size={14} />
      },
      { 
        label: 'menu.settings', 
        path: 'settings', 
        requiredLevel: 0,
        description: 'Загальні налаштування системи',
        icon: <IconSettings size={14} />
      },
    ]
  },
  {
    label: 'menu.sections.content',
    icon: <IconFileText size={16} />,
    requiredLevel: 0,
    description: 'Керування контентом та публікаціями',
    color: '#51cf66',
    items: [
      { 
        label: 'menu.announcements', 
        path: 'announcements', 
        requiredLevel: 0,
        description: 'Створення та керування оголошеннями',
        icon: <IconBell size={14} />,
        disabled: true,
        isNew: true
      },
    ]
  },
  {
    label: 'menu.sections.tools',
    icon: <IconTools size={16} />,
    requiredLevel: 60,
    badge: 'PRO',
    description: 'Професійні інструменти та аналітика',
    color: '#ff6b6b',
    items: [
      { 
        label: 'menu.scrapper', 
        path: 'scrapper', 
        requiredLevel: 60,
        description: 'Автоматичний збір даних',
        isPopular: true
      },
    ]
  },
  {
    label: 'menu.sections.admin',
    icon: <IconShield size={16} />,
    requiredLevel: 80,
    badge: 'ADMIN',
    description: 'Адміністрування системи та користувачів',
    color: '#845ef7',
    items: [
      { 
        label: 'menu.users', 
        path: 'users', 
        requiredLevel: 80,
        description: 'Керування користувачами та ролями',
        icon: <IconUsers size={14} />,
        isPopular: true
      },
      { 
        label: 'menu.admin_page', 
        path: 'admin', 
        requiredLevel: 80,
        description: 'Адміністративна панель',
        icon: <IconClipboard size={14} />,
        isNew: true
      },
      { 
        label: 'menu.audit', 
        path: 'audit', 
        requiredLevel: 80,
        description: 'Аудит системних дій',
        icon: <IconChartBar size={14} />
      },
      { 
        label: 'menu.role_examples', 
        path: 'role-examples', 
        requiredLevel: 80,
        description: 'Приклади системи ролей',
        icon: <IconStar size={14} />
      },
    ]
  },
  {
    label: 'menu.sections.system',
    icon: <IconServer size={16} />,
    requiredLevel: 100,
    badge: 'SUPER',
    description: 'Системні налаштування та моніторинг',
    color: '#ff922b',
    items: [
      { 
        label: 'menu.system_settings', 
        path: 'system', 
        requiredLevel: 100,
        description: 'Глибокі системні налаштування'
      },
      { 
        label: 'menu.system_logs', 
        path: 'system/logs', 
        requiredLevel: 100,
        disabled: true,
        description: 'Системні логи та діагностика'
      },
      { 
        label: 'menu.system_monitoring', 
        path: 'system/monitoring', 
        requiredLevel: 100,
        disabled: true,
        description: 'Моніторинг продуктивності',
        isNew: true
      },
    ]
  }
];

/**
 * Компонент для окремого пункту меню з просунутими можливостями
 */
const AdvancedMenuItemComponent: React.FC<{
  item: MenuItem;
  isActive: boolean;
  isMobile: boolean;
}> = ({ item, isActive, isMobile }) => {
  const { t } = useTranslation();
  const theme = useMantineTheme();
  
  const isDark = theme.colorScheme === 'dark';
  const activeColor = isDark ? theme.colors.blue[4] : '#339af0';
  const textColor = isDark ? theme.colors.gray[0] : '#495057';
  const iconColor = isDark ? theme.colors.gray[4] : '#868e96';
  
  return (
    <Tooltip 
      label={item.description} 
      position={isMobile ? 'bottom' : 'right'}
      withArrow 
      disabled={!item.description}
    >
      <NavLink
        label={
          <Group position="apart" align="center">
            <Group align="center" spacing={8}>
              {item.icon && <span style={{ color: isActive ? activeColor : iconColor, display: 'flex', alignItems: 'center' }}>{item.icon}</span>}
              <Text 
                size="sm" 
                fw={isActive ? 600 : 400}
                c={isActive ? activeColor : textColor}
                style={{ lineHeight: '1.4' }}
              >
                {t(item.label)}
              </Text>
              {item.isNew && (
                <Badge size="xs" color="green" variant="light">
                  NEW
                </Badge>
              )}
              {item.isPopular && (
                <Badge size="xs" color="orange" variant="light">
                  HOT
                </Badge>
              )}
            </Group>
            {item.badge && (
              <Badge size="xs" color="blue" variant="light">
                {item.badge}
              </Badge>
            )}
          </Group>
        }
        component={Link}
        to={item.path!}
        active={isActive}
        pl={20}
        disabled={item.disabled}
        style={{
          borderLeft: isActive ? `3px solid ${activeColor}` : '3px solid transparent',
          backgroundColor: isActive ? (isDark ? theme.colors.dark[7] : '#f8f9fa') : 'transparent',
          transition: 'all 0.2s ease',
        }}
      />
    </Tooltip>
  );
};

/**
 * Просунутий компонент для розділу меню
 */
const AdvancedMenuSectionComponent: React.FC<{
  section: MenuSection;
  isActive: (path: string) => boolean;
}> = ({ section, isActive }) => {
  const { roleLevel } = useAuth();
  const { t } = useTranslation();
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(section.defaultOpen || false);
  const [isHovered, setIsHovered] = useState(false);

  // Theme-aware colors
  const isDark = theme.colorScheme === 'dark';
  const borderColor = isDark ? theme.colors.dark[4] : '#e9ecef';
  const hoverBg = isDark ? theme.colors.dark[6] : '#fafafa';
  const activeBg = isDark ? theme.colors.dark[7] : '#f8f9fa';
  const textColor = isDark ? theme.colors.gray[0] : '#495057';
  const mutedColor = isDark ? theme.colors.gray[4] : '#868e96';
  const iconColor = isDark ? mutedColor : '#868e96';

  // Перевірити, чи є активні підпункти в цьому розділі
  const hasActiveItem = section.items.some(item => 
    item.path && isActive(item.path)
  );

  // Автоматично розкривати, якщо є активні пункти
  useEffect(() => {
    if (hasActiveItem && !opened) {
      setOpened(true);
    }
  }, [hasActiveItem, opened]);

  // Фільтрувати пункти за рівнем доступу
  const availableItems = section.items.filter(item => 
    !item.requiredLevel || (roleLevel?.level ?? 0) >= item.requiredLevel
  );

  // Перевірити, чи розділ доступний
  const isSectionAccessible = !section.requiredLevel || (roleLevel?.level ?? 0) >= section.requiredLevel;

  if (!isSectionAccessible || availableItems.length === 0) return null;

  const isMobile = useMediaQuery('(max-width: 768px)');
  const canAccess = (roleLevel?.level ?? 0) >= (section.requiredLevel || 0);
  const accessPercentage = Math.min(((roleLevel?.level ?? 0) / (section.requiredLevel || 1)) * 100, 100);

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Заголовок розділу з просунутим дизайном */}
      <div
        onClick={() => setOpened(!opened)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          padding: '12px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `1px solid ${borderColor}`,
          backgroundColor: hasActiveItem ? activeBg : (isHovered ? hoverBg : 'transparent'),
          transition: 'all 0.2s ease',
          borderLeft: hasActiveItem ? `3px solid ${section.color || (isDark ? theme.colors.blue[4] : '#339af0')}` : '3px solid transparent',
        }}
      >
        <Group align="center">
          <span style={{ color: section.color || iconColor, display: 'flex', alignItems: 'center' }}>{section.icon}</span>
          <div>
            <Group align="center" spacing={8}>
              <Text 
                fw={hasActiveItem ? 600 : 500} 
                size="sm"
                c={hasActiveItem ? (section.color || (isDark ? theme.colors.blue[4] : '#339af0')) : textColor}
                style={{ lineHeight: '1.4' }}
              >
                {t(section.label)}
              </Text>
              {section.badge && (
                <Badge size="xs" color={section.color || (isDark ? 'blue' : 'blue')} variant="light">
                  {section.badge}
                </Badge>
              )}
            </Group>
            {section.description && (
              <Text size="xs" c={mutedColor} mt={2}>
                { isMobile ? null : section.description}
              </Text>
            )}
          </div>
        </Group>
        
        <Group>
          {/* Індикатор доступу */}
          {!canAccess && (
            <Tooltip label="Потрібен вищий рівень доступу">
              <IconLock size={14} color="#ff6b6b" />
            </Tooltip>
          )}
          
          {/* Іконка розкриття справа */}
          <div style={{ 
            transition: 'transform 0.2s ease',
            transform: opened ? 'rotate(90deg)' : 'rotate(0deg)'
          }}>
            <IconChevronRight size={16} color={iconColor} />
          </div>
        </Group>
      </div>

      {/* Прогрес-бар доступу (якщо розділ недоступний) */}
      {!canAccess && (
        <div style={{ padding: '0 16px 8px' }}>
          <Progress
            value={accessPercentage} 
            size="xs" 
            color="#ff6b6b"
            style={{ marginTop: 4 }}
          />
          <Text size="xs" c={mutedColor} mt={2}>
            Потрібен рівень: {section.requiredLevel} (ваш: {roleLevel?.level})
          </Text>
        </div>
      )}

      {/* Підпункти з анімацією */}
      <div 
        style={{
          maxHeight: opened ? '500px' : '0',
          overflow: 'hidden',
          transition: 'max-height 0.3s ease',
          backgroundColor: isDark ? theme.colors.dark[8] : '#fafafa',
        }}
      >
        {availableItems.map((item) => (
          <AdvancedMenuItemComponent
            isMobile={isMobile}
            key={item.path}
            item={item}
            isActive={item.path ? isActive(item.path) : false}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Головний компонент просунутої навігації
 */
export const AdvancedCollapsibleNav: React.FC = () => {
  const location = useLocation();
  const { t } = useTranslation();
  const { roleLevel } = useAuth();
  const theme = useMantineTheme();

  const isActive = (path: string) => {
    return location.pathname === path || 
           location.pathname === `/${path}` ||
           location.pathname.startsWith(`/dashboard/${path}`);
  };

  // Theme-aware colors
  const isDark = theme.colorScheme === 'dark';
  const borderColor = isDark ? theme.colors.dark[4] : '#e9ecef';
  const textColor = isDark ? theme.colors.gray[0] : '#495057';
  const mutedColor = isDark ? theme.colors.gray[4] : '#868e96';

  return (
    <div style={{ height: '100vh', overflowY: 'auto', padding: '16px' }}>
      {/* Інформація про поточного користувача з просунутим дизайном */}
      {roleLevel && (
        <div 
          style={{ 
            padding: '16px',
            marginBottom: '8px',
            backgroundColor: isDark ? theme.colors.dark[8] : '#f8f9fa',
            borderRadius: '8px',
            border: `1px solid ${borderColor}`
          }}
        >
          <Group position="apart" align="center">
            <div>
              <Text size="sm" fw={600} c={textColor}>
                {t('menu.current_role', 'Поточна роль')}
              </Text>
              <Text size="lg" fw={700} c={isDark ? theme.colors.blue[4] : '#339af0'}>
                {roleLevel.name}
              </Text>
              <Text size="xs" c={mutedColor}>
                Level {roleLevel.level}
              </Text>
            </div>
            <div>
              <Progress 
                value={(roleLevel.level / 100) * 100} 
                size="sm" 
                color={isDark ? theme.colors.blue[6] : '#339af0'}
                style={{ width: 60 }}
              />
            </div>
          </Group>
        </div>
      )}

      {/* Розділи меню з просунутими можливостями */}
      <div>
        {MENU_SECTIONS.map((section) => (
          <AdvancedMenuSectionComponent
            key={section.label}
            section={section}
            isActive={isActive}
          />
        ))}
      </div>
    </div>
  );
};
