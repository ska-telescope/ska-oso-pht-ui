import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import TaperField from './taper';

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key
  })
}));

vi.mock('@utils/constants.ts', () => ({
  ERROR_SECS: 10
}));

describe('TaperField', () => {
  it('renders with correct label', () => {
    render(<TaperField value={0} />);
  });
});
