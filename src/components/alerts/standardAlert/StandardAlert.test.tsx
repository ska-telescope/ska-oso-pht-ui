import { describe, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StoreProvider } from '@utils/storage/store';
import '@testing-library/jest-dom';
import { AlertColorTypes } from '@ska-telescope/ska-gui-components';
import StandardAlert from './StandardAlert';

const wrapper = (component: React.ReactElement) => {
  return render(<StoreProvider>{component}</StoreProvider>);
};

describe('<StandardAlert />', () => {
  const mockActionClose = vi.fn();
  test('renders correctly (SUCCESS)', () => {
    wrapper(
      <StandardAlert closeFunc={mockActionClose} color={AlertColorTypes.Success} text={''} />
    );
    screen.getByRole('button', { name: 'closeBtn.label' }).click();
  });
  test('renders correctly (INFO)', () => {
    wrapper(<StandardAlert closeFunc={mockActionClose} color={AlertColorTypes.Info} text={''} />);
    screen.getByRole('button', { name: 'closeBtn.label' }).click();
  });
  test('renders correctly (WARNING)', () => {
    wrapper(
      <StandardAlert closeFunc={mockActionClose} color={AlertColorTypes.Warning} text={''} />
    );
    screen.getByRole('button', { name: 'closeBtn.label' }).click();
  });
  test('renders correctly (ERROR)', () => {
    wrapper(<StandardAlert closeFunc={mockActionClose} color={AlertColorTypes.Error} text={''} />);
    screen.getByRole('button', { name: 'closeBtn.label' }).click();
  });
});
