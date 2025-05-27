// Car type select options
export const CAR_TYPE_OPTIONS = [
  { value: 'sedan', label: 'Sedan' },
  { value: 'hatchback', label: 'Hatchback' },
  { value: 'suv', label: 'SUV' },
  { value: 'coupe', label: 'Coupe' },
];

// Language select options
export const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'uk', label: 'Українська' },
  { value: 'pl', label: 'Polski' },
];

// Country name to code map for flags
export const countryNameToCode: Record<string, string> = {
  'Ukraine': 'UA',
  'United States': 'US',
  'Germany': 'DE',
  'France': 'FR',
  'Italy': 'IT',
  'Japan': 'JP',
  'United Kingdom': 'GB',
  'China': 'CN',
  'South Korea': 'KR',
  'Spain': 'ES',
  'Czech Republic': 'CZ',
  'Poland': 'PL',
  'Sweden': 'SE',
  'India': 'IN',
  // ...add more as needed
};
