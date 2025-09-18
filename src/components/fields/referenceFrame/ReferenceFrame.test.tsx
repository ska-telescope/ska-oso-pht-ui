import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import ReferenceFrame from './ReferenceFrame';

describe('<ReferenceFrame />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <ReferenceFrame value={0} />
      </StoreProvider>
    );
  });
});
