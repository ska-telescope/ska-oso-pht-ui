import { alpha } from '@mui/material/styles';
import {
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  TYPE_CONTINUUM,
  TYPE_PST,
  TYPE_ZOOM
} from '../constants';

export interface PaletteSet {
  label: string;
  colors: string[];
  textColors: string[];
  names: string[];
}

const TABLEAU_10_SET: PaletteSet = {
  label: 'Tableau-10 (Default)',
  colors: [
    '#4e79a7',
    '#f2ca00',
    '#a07c5e',
    '#00af91',
    '#d37295',
    '#edc949',
    '#76b8d6',
    '#8c61d7',
    '#8595a1',
    '#e15759'
  ],
  textColors: [
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#000000',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF'
  ],
  names: ['Blue', 'Yellow', 'Brown', 'Teal', 'Pink', 'Gold', 'Light Blue', 'Purple', 'Grey', 'Red']
};

const DEFAULT_SET: PaletteSet = {
  label: 'Original Default Colors',
  colors: [
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#0288D1',
    '#7B1FA2',
    '#C2185B',
    '#5D4037',
    '#455A64',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Red',
    'Orange',
    'Yellow',
    'Green',
    'Blue',
    'Purple',
    'Pink',
    'Brown',
    'Blue Grey',
    'Grey'
  ]
};

const PROTANOPIA_SET: PaletteSet = {
  label: 'Protanopia (Red-Blind)',
  colors: [
    '#424242',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#0288D1',
    '#7B1FA2',
    '#795548',
    '#37474F',
    '#263238',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Dark Gray',
    'Orange',
    'Yellow',
    'Green',
    'Blue',
    'Purple',
    'Brown',
    'Dark Blue Grey',
    'Very Dark Blue Grey',
    'Grey'
  ]
};

const DEUTERANOPIA_SET: PaletteSet = {
  label: 'Deuteranopia (Green-Blind)',
  colors: [
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#424242',
    '#0288D1',
    '#7B1FA2',
    '#C2185B',
    '#5D4037',
    '#37474F',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Red',
    'Orange',
    'Yellow',
    'Dark Gray',
    'Blue',
    'Purple',
    'Pink',
    'Brown',
    'Dark Blue Grey',
    'Grey'
  ]
};

const TRITANOPIA_SET: PaletteSet = {
  label: 'Tritanopia (Blue-Blind)',
  colors: [
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#424242',
    '#616161',
    '#795548',
    '#5D4037',
    '#3E2723',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Red',
    'Orange',
    'Yellow',
    'Green',
    'Dark Gray',
    'Gray',
    'Brown',
    'Dark Brown',
    'Very Dark Brown',
    'Grey'
  ]
};

const PROTANOMALY_SET: PaletteSet = {
  label: 'Protanomaly (Red-Weak)',
  colors: [
    '#B71C1C',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#0288D1',
    '#7B1FA2',
    '#C2185B',
    '#5D4037',
    '#37474F',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Dark Red',
    'Orange',
    'Yellow',
    'Green',
    'Blue',
    'Purple',
    'Pink',
    'Brown',
    'Dark Blue Grey',
    'Grey'
  ]
};

const DEUTERANOMALY_SET: PaletteSet = {
  label: 'Deuteranomaly (Green-Weak)',
  colors: [
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#2E7D32',
    '#0288D1',
    '#7B1FA2',
    '#C2185B',
    '#5D4037',
    '#37474F',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Red',
    'Orange',
    'Yellow',
    'Dark Green',
    'Blue',
    'Purple',
    'Pink',
    'Brown',
    'Dark Blue Grey',
    'Grey'
  ]
};

const TRITANOMALY_SET: PaletteSet = {
  label: 'Tritanomaly (Blue-Weak)',
  colors: [
    '#D32F2F',
    '#F57C00',
    '#FBC02D',
    '#388E3C',
    '#1565C0',
    '#4A148C',
    '#880E4F',
    '#3E2723',
    '#263238',
    '#9E9E9E'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000'
  ],
  names: [
    'Red',
    'Orange',
    'Yellow',
    'Green',
    'Dark Blue',
    'Dark Purple',
    'Dark Pink',
    'Dark Brown',
    'Very Dark Blue Grey',
    'Grey'
  ]
};

const ACHROMATOPSIA_SET: PaletteSet = {
  label: 'Achromatopsia (Complete Color Blindness)',
  colors: [
    '#212121',
    '#424242',
    '#616161',
    '#757575',
    '#9E9E9E',
    '#BDBDBD',
    '#E0E0E0',
    '#EEEEEE',
    '#F5F5F5',
    '#FFFFFF'
  ],
  textColors: [
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#FFFFFF',
    '#000000',
    '#000000',
    '#000000',
    '#000000',
    '#000000',
    '#000000'
  ],
  names: [
    'Very Dark',
    'Dark',
    'Medium-Dark',
    'Medium',
    'Light-Medium',
    'Light',
    'Very Light',
    'Almost White',
    'Off White',
    'White'
  ]
};

export const COLOR_PALETTE_SETS: PaletteSet[] = [
  TABLEAU_10_SET,
  DEFAULT_SET,
  PROTANOPIA_SET,
  DEUTERANOPIA_SET,
  TRITANOPIA_SET,
  PROTANOMALY_SET,
  DEUTERANOMALY_SET,
  TRITANOMALY_SET,
  ACHROMATOPSIA_SET
];

export const COLOR_BLINDNESS_OPTIONS = COLOR_PALETTE_SETS.map((set, idx) => ({
  value: idx,
  label: set.label
}));

type ContentType = 'bg' | 'fg' | 'both';

interface GetColorsInput {
  type: string /* semantic type (observationType, telescope, boolean, etc.) */;
  colors: string | string[] /* keys to look up */;
  content?: ContentType;
  dim?: number;
  asArray?: boolean;
  paletteIndex?: number /* which blindness palette set to use */;
}

export function getColors(
  args: GetColorsInput & { asArray?: false }
): Record<string, { bg?: string; fg?: string }> | undefined;
export function getColors(args: GetColorsInput & { asArray: true }): string[] | undefined;

export function getColors({
  type,
  colors,
  content = 'both',
  dim = 1,
  asArray = false,
  paletteIndex = 0
}: GetColorsInput): any {
  const paletteSet = COLOR_PALETTE_SETS[paletteIndex];
  if (!paletteSet) return undefined;

  const paletteMap: Record<string, Record<string, [string, string]>> = {
    observationType: {
      continuum: [paletteSet.colors[0], paletteSet.textColors[0]],
      spectral: [paletteSet.colors[3], paletteSet.textColors[3]],
      pst: [paletteSet.colors[2], paletteSet.textColors[2]],
      [TYPE_CONTINUUM]: [paletteSet.colors[0], paletteSet.textColors[0]],
      [TYPE_ZOOM]: [paletteSet.colors[3], paletteSet.textColors[3]],
      [TYPE_PST]: [paletteSet.colors[2], paletteSet.textColors[2]]
    },
    telescope: {
      low: [paletteSet.colors[1], paletteSet.textColors[1]],
      mid: [paletteSet.colors[4], paletteSet.textColors[4]],
      [TELESCOPE_LOW_NUM]: [paletteSet.colors[1], paletteSet.textColors[1]],
      [TELESCOPE_MID_NUM]: [paletteSet.colors[4], paletteSet.textColors[4]]
    },
    boolean: {
      no: [paletteSet.colors[9], paletteSet.textColors[9]],
      yes: [paletteSet.colors[3], paletteSet.textColors[3]],
      false: [paletteSet.colors[9], paletteSet.textColors[9]],
      true: [paletteSet.colors[3], paletteSet.textColors[3]]
    }
  };

  // 👇 if type is invalid, fall back to default mapping of all colors
  const mapping =
    type && paletteMap[type]
      ? paletteMap[type]
      : Object.fromEntries(
          paletteSet.colors.map((c, i) => [String(i), [c, paletteSet.textColors[i]]])
        );

  const colorList =
    colors === '' || colors === '*'
      ? Object.keys(mapping)
      : Array.isArray(colors)
      ? colors
      : [colors];

  const result: Record<string, { bg?: string; fg?: string }> = {};

  colorList.forEach(level => {
    const palette = mapping[level] ?? ['#cccccc', '#000000'];
    result[level] = {};
    if (content === 'bg' || content === 'both') result[level].bg = alpha(palette[0], dim);
    if (content === 'fg' || content === 'both') result[level].fg = palette[1];
  });

  if (asArray) {
    return Object.values(result)
      .map(c => c.bg)
      .filter(Boolean) as string[];
  }

  return result;
}
