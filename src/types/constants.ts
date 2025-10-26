// Car type select options
export const CAR_TYPE_OPTIONS = [
  { value: '87a5e4d3-f31d-4000-a1ac-de5721481f5a', label: 'Sedan' },
  { value: '34ee21eb-f211-4615-8209-05d2b9bf01b1', label: 'Hatchback' },
  { value: '613f973d-484b-4059-a0f1-c0069efb499d', label: 'SUV' },
  { value: '817a4588-6e47-40ea-a2e8-3db15287bd8d', label: 'Coupe' },
  { value: '6f5fa8dc-b485-4ef0-b15e-09da233f1f36', label: 'Convertible' },
  { value: '12c3de12-d3a2-4d88-b416-6aff7d37fc4f', label: 'Wagon' },
];

export const TRANSMISSION_OPTIONS = [
  { value: '72fabc86-9418-4d25-807b-6fb04e796a30', label: 'Manual' },
  { value: '9e192cea-0c9a-41f6-9c51-7f5c0ba4751e', label: 'Automatic' },
  { value: '494b789a-99f2-46a9-9be9-82c9911d2428', label: 'CVT' },
  { value: '308d3a1d-1eaa-4bdf-b994-6381e3a6ebc0', label: 'Robotic' },
];

export const FUEL_TYPE_OPTIONS = [
  { value: '8d9b4bf0-9a24-4fc6-97f7-be4051d34700', label: 'Petrol' },
  { value: '2ac5ab32-ca17-47bf-87ab-a28280953b54', label: 'Diesel' },
  { value: 'e020db10-e48e-4e67-afc2-1ac21d3870d5', label: 'Hybrid' },
  { value: 'f020c6e7-46d0-499c-ae5b-d805f169e66c', label: 'Electric' },
  { value: '974e54ef-5900-43e2-bb43-9952bfb54f31', label: 'LPG' },
];

export const DRIVE_OPTIONS = [
  { value: 'b73aadd0-5305-442d-8677-09d2b279fe06', label: 'FWD' },
  { value: '50bd9a43-9a4b-4463-91e4-dc107d36fa59', label: 'RWD' },
  { value: 'ff6113f6-32b1-472f-aeca-a08002d0308f', label: 'AWD' },
  { value: '62940fea-52b2-4064-8927-fbf19bdeffc1', label: '4WD' },
];

export const CONDITION_OPTIONS = [
  { value: '40cae8f7-d6da-4308-ae34-831b78a363e9', label: 'New' },
  { value: '04baa7f5-fb74-4ede-8666-57954b6c49b7', label: 'Used' },
  { value: '0cf72011-c926-4d6a-8cdd-f1fc238aa236', label: 'Damaged' },
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
