import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import App from './App';
import { AppFlowProvider } from '@/utils/appFlow/AppFlowContext';

describe('<App />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <AppFlowProvider>
          <App />
        </AppFlowProvider>
      </StoreProvider>
    );
  });
});
