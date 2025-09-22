import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import StatusWrapper from './StatusWrapper';
import { STATUS_ERROR } from '@/utils/constants';

describe('<StatusWrapper />', () => {
  test('renders correctly ( default )', () => {
    render(
      <StoreProvider>
        <StatusWrapper page={1} />
      </StoreProvider>
    );
  });
  test('renders correctly ( STATUS_ERROR  )', () => {
    render(
      <StoreProvider>
        <StatusWrapper page={1} level={STATUS_ERROR} />
      </StoreProvider>
    );
  });
  test('renders correctly ( 7 )', () => {
    render(
      <StoreProvider>
        <StatusWrapper page={1} level={7} />
      </StoreProvider>
    );
  });
});
