import {
  Controller,
  FieldPath,
  FieldValues,
  useFormContext,
  RegisterOptions
} from 'react-hook-form';
import { TextField, TextFieldProps } from '@mui/material';
import { ChangeEventHandler } from 'react';

type ControlledTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
> = {
  name: TName;
  label?: TName;
  variant?: string;
  rules?: RegisterOptions<TFieldValues, TName>;
  onChange?: ChangeEventHandler<HTMLTextAreaElement | HTMLInputElement>;
} & TextFieldProps;

export const ControlledTextField = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>
>({
  name,
  label,
  variant = 'standard',
  fullWidth = true,
  type = 'text',
  rules = undefined,
  onChange = undefined,
  ...otherProps
}: ControlledTextFieldProps<TFieldValues, TName>): JSX.Element => {
  const { control } = useFormContext<TFieldValues>();
  const { placeholder, slotProps: textFieldSlotProps, ...textFieldProps } = otherProps;

  const slotProps = placeholder
    ? {
        ...textFieldSlotProps,
        inputLabel: {
          ...textFieldSlotProps?.inputLabel,
          shrink: true
        }
      }
    : textFieldSlotProps;

  return (
    <Controller
      control={control}
      name={name}
      key={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          // Default here required to prevent
          // "Warning: A component is changing an uncontrolled input to be controlled.""
          value={field.value ?? ''}
          label={label}
          type={type}
          variant={variant}
          fullWidth={fullWidth}
          helperText={fieldState.error?.message ?? textFieldProps.helperText ?? null}
          error={!!fieldState.error}
          placeholder={placeholder}
          onChange={(evt) => {
            field.onChange(evt); // RHF manages its own onChange to track the form field value so need to call that here
            onChange?.(evt);
          }}
          slotProps={slotProps}
          {...textFieldProps}
        />
      )}
    />
  );
};
