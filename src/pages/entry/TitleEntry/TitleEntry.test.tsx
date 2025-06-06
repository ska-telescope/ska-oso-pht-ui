import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import TitleEntry from './TitleEntry';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<TitleEntry />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TitleEntry page={0} />
      </StoreProvider>
    );
  });
});
