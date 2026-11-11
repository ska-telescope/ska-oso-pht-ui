import { describe, expect, test } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FormProvider, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ControlledCheckboxGroup } from './controlledCheckboxGroup';

const OPTIONS = [
  { label: 'I', value: 'I' },
  { label: 'Q', value: 'Q' },
  { label: 'U', value: 'U' }
];

const schema = z.object({ field: z.array(z.string()).min(1, 'Pick one') });

// Shows the form value, so a test can check what the group stored
const StoredValue = () => {
  const value = useWatch({ name: 'field' });
  return <output data-testid="stored">{JSON.stringify(value)}</output>;
};

const Wrapper = ({ defaultValue, columns }: { defaultValue: string[]; columns?: number }) => {
  const methods = useForm({
    mode: 'onChange',
    resolver: zodResolver(schema),
    defaultValues: { field: defaultValue }
  });
  return (
    <FormProvider {...methods}>
      <ControlledCheckboxGroup
        name="field"
        label="Polarisations"
        options={OPTIONS}
        columns={columns}
      />
      <StoredValue />
    </FormProvider>
  );
};

const stored = () => JSON.parse(screen.getByTestId('stored').textContent ?? 'null');

describe('ControlledCheckboxGroup', () => {
  test('ticks the options in the form value', () => {
    render(<Wrapper defaultValue={['Q']} />);

    expect(screen.getByLabelText('Q')).toBeChecked();
    expect(screen.getByLabelText('I')).not.toBeChecked();
  });

  test('adds a ticked option to the value and removes an unticked one', () => {
    render(<Wrapper defaultValue={['Q']} />);

    fireEvent.click(screen.getByLabelText('I'));
    expect(stored()).toEqual(['Q', 'I']);

    fireEvent.click(screen.getByLabelText('Q'));
    expect(stored()).toEqual(['I']);
  });

  test("shows the form's error for the field", async () => {
    render(<Wrapper defaultValue={['Q']} />);

    fireEvent.click(screen.getByLabelText('Q'));

    expect(await screen.findByText('Pick one')).toBeInTheDocument();
  });

  test('lays the options out in the given number of columns', () => {
    render(<Wrapper defaultValue={['Q']} columns={4} />);

    const group = screen.getByLabelText('Q').closest('.MuiFormGroup-root');
    expect(group).toHaveStyle({ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' });
  });
});
