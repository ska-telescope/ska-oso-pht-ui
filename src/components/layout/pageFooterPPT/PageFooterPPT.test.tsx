import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageFooterPPT from './PageFooterPPT';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('<PageFooterPPT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <MockedLoginProvider>
          <PageFooterPPT pageNo={1} />
        </MockedLoginProvider>
      </StoreProvider>
    );
  });
});
