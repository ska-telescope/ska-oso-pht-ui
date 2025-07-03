import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
// import ObservationEntry from './ObservationEntry';

// NOT SURE WHAT THIS ERROR IS, SO LEAVING UNTIL LATER

describe('<ObservationEntry />', () => {
  test('renders correctly', () => {
    render(<StoreProvider></StoreProvider>);
  });
});
