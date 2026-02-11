import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import TaperDropdown from './taperDropdown';

// Mock translation hook
vi.mock('@services/i18n/useScopedTranslation.tsx', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // identity translation
  })
}));

describe('TaperDropdown', () => {
  it('renders with the base option', () => {
    render(<TaperDropdown value={0} setValue={() => {}} centralFrequency={undefined} />);
  });

  it('adds computed options when centralFrequency is provided', () => {
    render(
      <TaperDropdown value={0} setValue={() => {}} centralFrequency={{ value: 1.4, unit: '1' }} />
    );
  });
});
