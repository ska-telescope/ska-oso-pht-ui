import type { FocusEventHandler, JSX } from 'react';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormControlProps,
  FormGroup,
  FormHelperText,
  FormLabel
} from '@mui/material';
import { Controller, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

// TODO Move to ska-gui-components, next to ControlledRadioButtonGroup

export type CheckboxOption = { label: string; value: string };

type ControlledCheckboxGroupProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  name: TName;
  options: CheckboxOption[];
  label?: string;
  // Lays the tick boxes out in this many equal columns, instead of one row that wraps
  columns?: number;
  helperText?: string;
  onFocus?: FocusEventHandler<HTMLButtonElement>;
} & Omit<FormControlProps, 'onFocus'>;

/**
 * A group of tick boxes bound to an array field of the form: the values of the ticked options, in
 * the order they were ticked. The form's error for the field shows below the group.
 */
export const ControlledCheckboxGroup = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  options,
  label,
  columns,
  helperText,
  onFocus,
  fullWidth = true,
  variant = 'standard',
  ...otherProps
}: ControlledCheckboxGroupProps<TFieldValues, TName>): JSX.Element => {
  const { control } = useFormContext<TFieldValues>();
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const values: string[] = field.value ?? [];
        const toggle = (value: string, checked: boolean) =>
          field.onChange(checked ? [...values, value] : values.filter((other) => other !== value));
        return (
          <FormControl
            component="fieldset"
            fullWidth={fullWidth}
            variant={variant}
            error={!!fieldState.error}
            {...otherProps}
          >
            {label && <FormLabel component="legend">{label}</FormLabel>}
            <FormGroup
              row
              sx={
                columns ? { display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)` } : {}
              }
            >
              {options.map((option) => (
                <FormControlLabel
                  key={option.value}
                  label={option.label}
                  control={
                    <Checkbox
                      name={`${name}.${option.value}`}
                      checked={values.includes(option.value)}
                      onChange={(event) => toggle(option.value, event.target.checked)}
                      onBlur={field.onBlur}
                      onFocus={onFocus}
                    />
                  }
                />
              ))}
            </FormGroup>
            <FormHelperText>{fieldState.error?.message || helperText}</FormHelperText>
          </FormControl>
        );
      }}
    />
  );
};
