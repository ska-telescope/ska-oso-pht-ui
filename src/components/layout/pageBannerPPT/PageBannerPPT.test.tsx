import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageBannerPPT from './PageBannerPPT';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<PageBannerPPT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <PageBannerPPT pageNo={1} />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
