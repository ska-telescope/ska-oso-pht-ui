import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@ska-telescope/ska-gui-local-storage';
import HomeButton from './Home';
import '@testing-library/jest-dom';

describe('Home Button', () => {
  test('renders correctly', () => {
    render(
      <StoreProvider>
        <HomeButton />
      </StoreProvider>
    );
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
    screen.getByTestId('homeButtonTestId').click();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <StoreProvider>
        <HomeButton toolTip="" />
      </StoreProvider>
    );
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
  });
});
