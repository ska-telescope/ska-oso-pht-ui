import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@utils/storage/store';
import App from './App';

describe('<App />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <App />
      </StoreProvider>
    );
  });
});
