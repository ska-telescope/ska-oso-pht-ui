import { Controller, FieldValues, FieldPath, useFormContext } from 'react-hook-form';
import {
  MenuItem,
  Select,
  FormControlProps,
  InputLabel,
  FormControl,
  SelectChangeEvent,
  FormHelperText
} from '@mui/material';

export type SelectOptionType = string | number;

export type SelectOption<Type extends SelectOptionType> = {
  label: string;
  value: Type;
  disabled?: boolean;
};

export const createSelectOptions = <Type extends SelectOptionType>(
  opts: Record<string, Type>
): SelectOption<Type>[] => {
  return Object.values(opts).map((val) => ({
    label: val.toString(),
    value: val
  }));
};

type ControlledSelectProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TValue extends SelectOptionType
> = {
  name: TName;
  options: SelectOption<TValue>[];
  label?: string;
  onChange?: (event: SelectChangeEvent) => void;
  defaultValue?: string;
  value?: string;
  // This flag decides whether the change should call the RHF change handler and cause the form to update. It should only be set to false
  // if an onChange is provided that will handle the form update within the component (for example after a confirmation dialog has been clicked).
  withFormUpdate?: boolean;
  // The Omit here clarifies that we are always expecting SelectChangeEvent rather than
  // a merge of SelectChangeEvent and the onChange type defined by FormControlProps
} & Omit<FormControlProps, 'onChange'>;

export const ControlledSelect = <
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
  TValue extends SelectOptionType
>({
  name,
  options,
  label = '',
  onChange = undefined,
  defaultValue = '',
  fullWidth = true,
  value = undefined,
  withFormUpdate = true,
  ...otherProps
}: ControlledSelectProps<TFieldValues, TName, TValue>): JSX.Element => {
  const { control } = useFormContext<TFieldValues>();
  const labelId = `${name}-label`;
  if (!withFormUpdate && !onChange) {
    throw new Error(
      "An onChange function that handles the form update should be passed if you don't want this ControlledSelect component to update the form"
    );
  }
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <FormControl fullWidth={fullWidth} {...otherProps}>
          <InputLabel id={labelId}>{label}</InputLabel>
          <Select
            {...field}
            label={label}
            labelId={labelId}
            value={value ?? field.value ?? ''}
            onChange={(evt: SelectChangeEvent) => {
              if (withFormUpdate) {
                field.onChange(evt); // RHF manages its own onChange to track the form field value so need to call that here
              }
              if (onChange) {
                onChange(evt);
              }
            }}
            defaultValue={defaultValue}
            error={!!fieldState.error}
          >
            {options?.map((opt: SelectOption<TValue>) => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
          <FormHelperText error={true}>{fieldState.error?.message}</FormHelperText>
        </FormControl>
      )}
    />
  );
};
