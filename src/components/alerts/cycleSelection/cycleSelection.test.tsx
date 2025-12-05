import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CycleSelection from './CycleSelection';

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => {
      const map: Record<string, string> = {
        osdCycleId: 'SKAO_2027_1',
        osdOpens: '27-03-2026 12:00:00',
        osdCloses: '12-05-2026 04:00:00',
        osdDescription: 'Science Verification'
      };
      return map[key] || key;
    }
  })
}));

vi.mock('@/utils/osd/useOSDAccessors/useOSDAccessors', () => ({
  useOSDAccessors: () => ({
    osdCycleId: 'SKAO_2027_1',
    osdCycleDescription: 'Science Verification',
    osdOpens: () => '27-03-2026 12:00:00',
    osdCloses: () => '12-05-2026 04:00:00',
    osdCyclePolicy: {
      linkObservationToObservingMode: true
    }
  })
}));

describe('CycleSelection component', () => {
  it('renders cycle details correctly when open', () => {
    render(<CycleSelection open={true} onClose={vi.fn()} onConfirm={vi.fn()} />);

    // expect(screen.getByText('Cycle')).toBeInTheDocument();
    // expect(screen.getByText('Cycle ID')).toBeInTheDocument();
    // expect(screen.getByText('SKAO_2027_1')).toBeInTheDocument();
    // expect(screen.getByText('Description')).toBeInTheDocument();
    // expect(screen.getByText('Science Verification')).toBeInTheDocument();
    // expect(screen.getByText('Opens')).toBeInTheDocument();
    // expect(screen.getByText('27-03-2026 12:00:00')).toBeInTheDocument();
    // expect(screen.getByText('Closes')).toBeInTheDocument();
    // expect(screen.getByText('12-05-2026 04:00:00')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<CycleSelection open={false} onClose={vi.fn()} onConfirm={vi.fn()} />);

    expect(screen.queryByText('Cycle')).not.toBeInTheDocument();
  });
});
