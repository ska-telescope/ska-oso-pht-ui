import { describe, test } from 'vitest';
import { render } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import '@testing-library/jest-dom';
import TimedAlert from './TimedAlert';

describe('<TimedAlert />', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <TimedAlert color={undefined} testId={''} text={''} />
      </StoreProvider>
    );
  });
});
