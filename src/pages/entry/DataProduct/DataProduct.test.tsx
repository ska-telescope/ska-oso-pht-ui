import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataProduct from './DataProduct';

vi.mock('@/components/layout/pageBannerPPT/PageBannerPPT', () => ({
  default: () => <div data-testid="page-banner">PageBannerPPT</div>
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  Spacer: ({ size, axis }: { size: number; axis: string }) => (
    <div data-testid="spacer">{`Spacer ${size} ${axis}`}</div>
  ),
  SPACER_VERTICAL: 'vertical'
}));

vi.mock('@/pages/entry/DataProduct/DataProduct', () => ({
  default: () => <div data-testid="data-product">DataProduct</div>
}));

describe('DataProduct', () => {
  it('renders all expected components', () => {
    render(<DataProduct />);
    expect(screen.getByTestId('data-product')).toBeInTheDocument();
  });
});
