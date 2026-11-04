import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import HomeButton from './Home';
import '@testing-library/jest-dom';
import { ThemeA11yProvider } from '@/utils/colors/ThemeAllyContext';

const wrapper = (component: React.ReactElement) => {
  return render(
    <StoreProvider>
      <ThemeA11yProvider>{component}</ThemeA11yProvider>
    </StoreProvider>
  );
};

describe('Home Button', () => {
  test('renders correctly', () => {
    wrapper(<HomeButton />);
    screen.getByRole('button', { name: 'homeBtn.label' }).click();
  });
  test('renders correctly with tooltip empty', () => {
    wrapper(<HomeButton toolTip="" />);
    expect(screen.getByRole('button', { name: 'homeBtn.label' })).toBeInTheDocument();
  });
});
