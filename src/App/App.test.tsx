import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';

describe('<App />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );
  });
});
