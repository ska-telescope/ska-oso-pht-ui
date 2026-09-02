import React from 'react';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import QuantityField from '@/components/fields/quantity/quantity';

interface DispersionMeasureFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export const DISPERSION_MEASURE_RANGE = { min: 0, max: 100000 };
export const dispersionMeasureSchema = z
  .number()
  .min(DISPERSION_MEASURE_RANGE.min)
  .max(DISPERSION_MEASURE_RANGE.max);

export default function DispersionMeasureField({
  disabled = false,
  required = false,
  setValue,
  value
}: DispersionMeasureFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'dispersionMeasure';
  const DISPERSION_MEASURE_UNIT_VALUE = 0;
  const rangeErrorMessage = t(FIELD + '.range.error', DISPERSION_MEASURE_RANGE);
  const validateDispersionMeasure = React.useCallback(
    (num: number) => (dispersionMeasureSchema.safeParse(num).success ? '' : rangeErrorMessage),
    [rangeErrorMessage]
  );

  return (
    <QuantityField
      value={value}
      setValue={(nextValue) => setValue?.(nextValue)}
      required={required}
      disabled={disabled}
      minValue={DISPERSION_MEASURE_RANGE.min}
      maxValue={DISPERSION_MEASURE_RANGE.max}
      step={1}
      requiredMessage={rangeErrorMessage}
      rangeMessage={rangeErrorMessage}
      validate={validateDispersionMeasure}
      unitOptions={[{ label: t(FIELD + '.units'), value: DISPERSION_MEASURE_UNIT_VALUE }]}
      units={DISPERSION_MEASURE_UNIT_VALUE}
      setUnits={() => {}}
      unitsTestId={FIELD + 'Units'}
      unitsDisabled
      unitsMinWidth={90}
      topPadding={1}
      label={t(FIELD + '.label')}
      onFocus={() => setHelp(FIELD)}
      onUnitsFocus={() => setHelp(FIELD)}
    />
  );
}
