const DATE_LOCALE_BY_LANGUAGE: Record<string, string> = {
  en: 'en-GB',
  uk: 'uk-UA',
  pl: 'pl-PL',
};

/**
 * Format a date string using the active i18n language rather than a hardcoded locale.
 * @param value ISO date string
 * @param language Active i18n language (e.g. i18n.language from useTypedTranslation)
 * @param options Intl.DateTimeFormat options
 */
export const formatLocalizedDate = (
  value: string,
  language: string,
  options?: Intl.DateTimeFormatOptions,
): string => {
  try {
    const locale = DATE_LOCALE_BY_LANGUAGE[language] ?? DATE_LOCALE_BY_LANGUAGE.en;
    return new Date(value).toLocaleDateString(locale, options);
  } catch {
    return value;
  }
};

/**
 * Convert seconds to human-readable format (hours, minutes, seconds)
 * @param totalSeconds Total seconds to convert
 * @param t Translation function
 * @returns Formatted time string
 */
export const formatDuration = (totalSeconds: number, t?: (key: string | any) => string): string => {
  if (totalSeconds < 60) {
    const seconds = t ? t('time.seconds') : 'seconds';
    return `${totalSeconds} ${totalSeconds !== 1 ? seconds : t ? t('time.second') : 'second'}`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const parts = [];
  
  if (hours > 0) {
    const hourText = t ? t('time.hours') : 'hours';
    const hourSingle = t ? t('time.hour') : 'hour';
    parts.push(`${hours} ${hours !== 1 ? hourText : hourSingle}`);
  }
  
  if (minutes > 0) {
    const minuteText = t ? t('time.minutes') : 'minutes';
    const minuteSingle = t ? t('time.minute') : 'minute';
    parts.push(`${minutes} ${minutes !== 1 ? minuteText : minuteSingle}`);
  }
  
  if (seconds > 0 || parts.length === 0) {
    const secondText = t ? t('time.seconds') : 'seconds';
    const secondSingle = t ? t('time.second') : 'second';
    parts.push(`${seconds} ${seconds !== 1 ? secondText : secondSingle}`);
  }

  return parts.join(' ');
};

/**
 * Convert seconds to compact format (HH:MM:SS or MM:SS)
 * @param totalSeconds Total seconds to convert
 * @param showHours Whether to show hours if less than 1 hour
 * @returns Formatted time string
 */
export const formatTimeCompact = (totalSeconds: number, showHours: boolean = true): string => {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (showHours && hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
