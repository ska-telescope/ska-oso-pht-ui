import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import Visualization from './visualization';
import GetVisibility from '@services/axios/get/getVisibilitySVG/getVisibilitySVG.tsx';

// Mock async API call
vi.mock('@services/axios/get/getVisibilitySVG/getVisibilitySVG.tsx', () => ({
  default: vi.fn()
}));

// Mock translation hook
vi.mock('@/services/i18n/useScopedTranslation', () => ({
  useScopedTranslation: () => ({
    t: (key: string) => key // passthrough
  })
}));

describe('Visualization', () => {
  const mockTarget = {
    id: 1,
    name: 'Test Target',
    raStr: '12:34:56',
    decStr: '-45:67:89',
    redshift: '0.5',
    velType: 1,
    sourceType: 'galaxy',
    longitude: 188.685,
    latitude: -45.0,
    vel: '0',
    velUnit: 0,
    kind: 0
  };

  it('shows loading placeholder while fetching', () => {
    (GetVisibility as any).mockResolvedValue({ data: '<svg>test</svg>' });

    render(<Visualization target={mockTarget} show={true} />);

    expect(screen.getByText('visualization.loading')).toBeInTheDocument();
  });

  it('renders SVG once loaded', async () => {
    (GetVisibility as any).mockResolvedValue({ data: '<svg>test</svg>' });

    render(<Visualization target={mockTarget} show={true} />);

    await waitFor(() => {
      const img = screen.getByRole('img');
      expect(img).toBeInTheDocument();
      expect(img.getAttribute('src')).toContain('data:image/svg+xml');
    });
  });

  it('renders nothing when show=false', () => {
    render(<Visualization target={mockTarget} show={false} />);
    expect(screen.queryByText('visualization.loading')).toBeNull();
  });

  it('renders nothing when target is undefined', () => {
    render(<Visualization target={undefined} show={true} />);
    expect(screen.queryByText('visualization.loading')).toBeNull();
  });
});
