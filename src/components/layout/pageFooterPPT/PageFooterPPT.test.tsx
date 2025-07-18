import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageFooterPPT from './PageFooterPPT';

describe('<PageFooterPPT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageFooterPPT pageNo={1} />
      </StoreProvider>
    );
  });
});
