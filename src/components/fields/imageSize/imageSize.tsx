import React from 'react';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import QuantityField from '@/components/fields/quantity/quantity';

interface ImageSizeFieldProps {
  disabled?: boolean;
  required?: boolean;
  onFocus?: () => void;
  setValue?: (value: number) => void;
  units?: number;
  setUnits?: (unit: number) => void;
  value: number;
}

export const imageSizeSchema = z.number().finite().gt(0);

export default function ImageSizeField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  units = 0,
  setUnits,
  value
}: ImageSizeFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'imageSize';
  const errorMessage = t(FIELD + '.error');
  const validateImageSize = React.useCallback(
    (num: number) => (imageSizeSchema.safeParse(num).success ? '' : errorMessage),
    [errorMessage]
  );

  return (
    <QuantityField
      value={value}
      setValue={(nextValue) => setValue?.(nextValue)}
      required={required}
      disabled={disabled}
      minValue={0}
      minInclusive={false}
      step={1}
      requiredMessage={errorMessage}
      rangeMessage={errorMessage}
      validate={validateImageSize}
      unitOptions={[0, 1, 2].map((unit) => ({
        label: t(FIELD + '.' + unit),
        value: unit
      }))}
      units={units}
      setUnits={setUnits}
      unitsTestId={FIELD + 'Units'}
      unitsMinWidth={90}
      topPadding={1}
      label={t(FIELD + '.label')}
      onFocus={onFocus}
      onUnitsFocus={onFocus}
    />
  );
}
