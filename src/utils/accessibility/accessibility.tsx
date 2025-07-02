export const COLOR_BLINDNESS_OPTIONS = [
  { value: 0, label: 'No Color Blindness' },
  { value: 1, label: 'Protanopia (Red-Blind)' },
  { value: 2, label: 'Deuteranopia (Green-Blind)' },
  { value: 3, label: 'Tritanopia (Blue-Blind)' },
  { value: 4, label: 'Protanomaly (Red-Weak)' },
  { value: 5, label: 'Deuteranomaly (Green-Weak)' },
  { value: 6, label: 'Tritanomaly (Blue-Weak)' },
  { value: 7, label: 'Achromatopsia (Complete Color Blindness)' }
];

export const COLOR_PALETTES = [
  [
    '#EF4444', // red-500
    '#F97316', // orange-500
    '#EAB308', // yellow-500
    '#22C55E', // green-500
    '#06B6D4', // cyan-500
    '#3B82F6', // blue-500
    '#8B5CF6', // violet-500
    '#EC4899' // pink-500
  ],
  [
    // Red-blind friendly palette
    '#1F2937', // dark gray instead of red
    '#F59E0B', // amber
    '#EAB308', // yellow
    '#10B981', // emerald
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899' // pink
  ],
  [
    // Green-blind friendly palette
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#1F2937', // dark gray instead of green
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899' // pink
  ],
  [
    // Blue-blind friendly palette
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#1F2937', // dark gray instead of cyan
    '#6B7280', // gray instead of blue
    '#7C3AED', // purple
    '#EC4899' // pink
  ],
  [
    // Red-weak friendly palette (muted reds)
    '#991B1B', // darker red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899' // pink
  ],
  [
    // Green-weak friendly palette (muted greens)
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#166534', // darker green
    '#06B6D4', // cyan
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899' // pink
  ],
  [
    // Blue-weak friendly palette (muted blues)
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#0891B2', // darker cyan
    '#1D4ED8', // darker blue
    '#7C3AED', // purple
    '#EC4899' // pink
  ],
  [
    // Grayscale palette for complete color blindness
    '#1F2937', // very dark gray
    '#374151', // dark gray
    '#4B5563', // medium-dark gray
    '#6B7280', // medium gray
    '#9CA3AF', // light-medium gray
    '#D1D5DB', // light gray
    '#E5E7EB', // very light gray
    '#F3F4F6' // almost white
  ]
];

export // Text colors optimized for each palette
const TEXT_COLOR_PALETTES = [
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#000000', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF'],
  ['#FFFFFF', '#FFFFFF', '#FFFFFF', '#FFFFFF', '#000000', '#000000', '#000000', '#000000']
];

export // Color names for better UX
const COLOR_NAMES = [
  ['Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Violet', 'Pink'],
  ['Dark Gray', 'Amber', 'Yellow', 'Emerald', 'Cyan', 'Blue', 'Violet', 'Pink'],
  ['Red', 'Orange', 'Yellow', 'Dark Gray', 'Cyan', 'Blue', 'Violet', 'Pink'],
  ['Red', 'Orange', 'Yellow', 'Green', 'Dark Gray', 'Gray', 'Purple', 'Pink'],
  ['Dark Red', 'Orange', 'Yellow', 'Green', 'Cyan', 'Blue', 'Violet', 'Pink'],
  ['Red', 'Orange', 'Yellow', 'Dark Green', 'Cyan', 'Blue', 'Violet', 'Pink'],
  ['Red', 'Orange', 'Yellow', 'Green', 'Dark Cyan', 'Dark Blue', 'Purple', 'Pink'],
  [
    'Very Dark',
    'Dark',
    'Medium-Dark',
    'Medium',
    'Light-Medium',
    'Light',
    'Very Light',
    'Almost White'
  ]
];
