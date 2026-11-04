import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import AddDataProduct from './AddDataProduct';

vi.mock('@/components/layout/pageBannerPPT/PageBannerPPT', () => ({
  default: () => <div>PageBannerPPT</div>
}));

vi.mock('@ska-telescope/ska-gui-components', () => ({
  Spacer: ({ size, axis }: { size: number; axis: string }) => <div>{`Spacer ${size} ${axis}`}</div>,
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
  default: () => <div>DataProduct</div>
}));

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('AddDataProduct', () => {
  it('renders all expected components', () => {
    wrapper(<AddDataProduct />);

    expect(screen.getByText('PageBannerPPT')).toBeInTheDocument();
    expect(screen.getByText(/^Spacer /)).toBeInTheDocument();
    expect(screen.getByText('DataProduct')).toBeInTheDocument();
  });
});
