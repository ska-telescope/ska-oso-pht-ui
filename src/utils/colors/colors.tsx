import { TELESCOPE_LOW_NUM } from '../constants';

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

/*------------------------------------------------------------------------------*/

const COLOR_MID: [string, string] = ['#6a3f23', '#FFFFFF'];
const COLOR_LOW: [string, string] = ['#f9b34c', '#000000'];

const COLOR_OBSERVATION: Record<string, [string, string]> = {
  '0': ['#1E90FF', '#FFFFFF'],
  '1': ['#FFD700', '#000000'],
  '2': ['#32CD32', '#000000']
};

type ContentType = 'bg' | 'fg' | 'both';

interface GetColorsInput {
  type: 'observationType' | 'telescope';
  colors: string | string[];
  content: ContentType;
}

// TODO : This function will need to be moved to the library at some point soon
export function getColors({ type, colors, content }: GetColorsInput) {
  const colorList = Array.isArray(colors) ? colors : [colors];
  let results: string[] = [];
  colorList.forEach(level => {
    let palette: [string, string];

    if (type === 'observationType') {
      palette = COLOR_OBSERVATION[level];
    } else {
      palette = level === TELESCOPE_LOW_NUM.toString() ? COLOR_LOW : COLOR_MID;
    }

    if (palette !== undefined) {
      if (content === 'bg' || content === 'both') {
        results.push(palette[0]);
      }

      if (content === 'fg' || content === 'both') {
        results.push(palette[1]);
      }
    }
  });
  return results;
}

/*------------------------------------------------------------------------------*/

export const COLOR_PALETTES = [
  [
    '#D32F2F', // Red - High contrast red
    '#F57C00', // Orange - High contrast orange
    '#FBC02D', // Yellow - High contrast yellow
    '#388E3C', // Green - High contrast green
    '#0288D1', // Blue - High contrast blue
    '#7B1FA2', // Purple - High contrast purple
    '#C2185B', // Pink - High contrast pink
    '#5D4037', // Brown - High contrast brown
    '#455A64' // Blue Grey - High contrast blue grey
  ],
  [
    '#424242', // Dark grey (replaces red)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#388E3C', // Green (enhanced)
    '#0288D1', // Blue (safe)
    '#7B1FA2', // Purple (safe)
    '#795548', // Brown (safe)
    '#37474F', // Dark blue grey
    '#263238' // Very dark blue grey
  ],
  [
    '#D32F2F', // Red (safe)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#424242', // Dark grey (replaces green)
    '#0288D1', // Blue (safe)
    '#7B1FA2', // Purple (safe)
    '#C2185B', // Pink (safe)
    '#5D4037', // Brown (safe)
    '#37474F' // Dark blue grey
  ],
  [
    '#D32F2F', // Red (safe)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#388E3C', // Green (safe)
    '#424242', // Dark grey (replaces blue)
    '#616161', // Medium grey
    '#795548', // Brown (enhanced)
    '#5D4037', // Dark brown
    '#3E2723' // Very dark brown
  ],
  [
    '#B71C1C', // Dark red (enhanced)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#388E3C', // Green (safe)
    '#0288D1', // Blue (safe)
    '#7B1FA2', // Purple (safe)
    '#C2185B', // Pink (safe)
    '#5D4037', // Brown (safe)
    '#37474F' // Dark blue grey
  ],
  [
    '#D32F2F', // Red (safe)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#2E7D32', // Dark green (enhanced)
    '#0288D1', // Blue (safe)
    '#7B1FA2', // Purple (safe)
    '#C2185B', // Pink (safe)
    '#5D4037', // Brown (safe)
    '#37474F' // Dark blue grey
  ],
  [
    '#D32F2F', // Red (safe)
    '#F57C00', // Orange (safe)
    '#FBC02D', // Yellow (safe)
    '#388E3C', // Green (safe)
    '#1565C0', // Dark blue (enhanced)
    '#4A148C', // Dark purple (enhanced)
    '#880E4F', // Dark pink (enhanced)
    '#3E2723', // Dark brown
    '#263238' // Very dark blue grey
  ],
  [
    '#212121', // Very dark grey
    '#424242', // Dark grey
    '#616161', // Medium dark grey
    '#757575', // Medium grey
    '#9E9E9E', // Light medium grey
    '#BDBDBD', // Light grey
    '#E0E0E0', // Very light grey
    '#EEEEEE', // Almost white grey
    '#F5F5F5' // Off white
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
