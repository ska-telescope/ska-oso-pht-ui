import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import HomeButton from './Home';
import '@testing-library/jest-dom';
import { MockedLoginProvider } from '@/contexts/MockedLoginContext';

describe('Home Button', () => {
  test('renders correctly', () => {
    render(
      <MockedLoginProvider>
        <HomeButton />
      </MockedLoginProvider>
    );
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
    screen.getByTestId('homeButtonTestId').click();
  });
  test('renders correctly with tooltip empty', () => {
    render(
      <MockedLoginProvider>
        <HomeButton toolTip="" />
      </MockedLoginProvider>
    );
    expect(screen.getByTestId('homeButtonTestId')).toHaveTextContent('homeBtn.label');
  });
});
