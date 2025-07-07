import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import PageFooterPMT from './PageFooterPMT';

describe('<PageFooterPMT />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <PageFooterPMT pageNo={1} />
      </StoreProvider>
    );
  });
});
