import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import AddDataProduct from './AddDataProduct';

vi.mock('@/components/layout/pageBannerPPT/PageBannerPPT', () => ({
  default: () => <div data-testid="page-banner">PageBannerPPT</div>
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  Spacer: ({ size, axis }: { size: number; axis: string }) => (
    <div data-testid="spacer">{`Spacer ${size} ${axis}`}</div>
  ),
  SPACER_VERTICAL: 'vertical',
  LABEL_POSITION: 'top',
  TELESCOPE_LOW: {
    code: 'low',
    name: 'LOW'
  },
  TELESCOPE_MID: {
    code: 'mid',
    name: 'MID'
  }
}));

vi.mock('@/pages/entry/DataProduct/DataProduct', () => ({
  default: () => <div data-testid="data-product">DataProduct</div>
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('AddDataProduct', () => {
  it('renders all expected components', () => {
    wrapper(<AddDataProduct />);

    expect(screen.getByTestId('page-banner')).toBeInTheDocument();
    expect(screen.getByTestId('spacer')).toBeInTheDocument();
    expect(screen.getByTestId('data-product')).toBeInTheDocument();
  });
});
