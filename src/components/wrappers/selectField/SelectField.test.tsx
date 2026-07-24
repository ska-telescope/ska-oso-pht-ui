import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import SelectField from './SelectField';

const OPTIONS = [
  { label: '226.06 Hz', value: 5 },
  { label: '452.11 Hz', value: 6 },
  { label: '904.22 Hz', value: 7 },
  { label: '1808.45 Hz', value: 8 }
];

describe('<SelectField />', () => {
  test('renders the current value label', () => {
    render(<SelectField testId="resolution" options={OPTIONS} value={8} setValue={vi.fn()} />);
    expect(screen.getByTestId('resolution')).toHaveTextContent('1808.45 Hz');
  });

  test('opens the menu on a click anywhere in the display and selects a new value', async () => {
    const setValue = vi.fn();
    render(<SelectField testId="resolution" options={OPTIONS} value={8} setValue={setValue} />);

    await userEvent.click(screen.getByTestId('resolution'));
    const option = await screen.findByRole('option', { name: '226.06 Hz' });
    await userEvent.click(option);

    expect(setValue).toHaveBeenCalledWith(5);
  });

  test('restricted option list only shows the passed-in options', async () => {
    render(
      <SelectField
        testId="resolution"
        options={OPTIONS.filter((o) => o.value >= 5)}
        value={5}
        setValue={vi.fn()}
      />
    );
    await userEvent.click(screen.getByTestId('resolution'));
    expect(screen.queryByRole('option', { name: '14.13 Hz' })).not.toBeInTheDocument();
  });
});
