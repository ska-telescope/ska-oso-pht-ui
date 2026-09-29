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

export const DISPERSION_MEASURE_MIN = 0;
export const dispersionMeasureSchema = z.number().min(DISPERSION_MEASURE_MIN);

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
  const minimumErrorMessage = t(FIELD + '.minimum.error', { min: DISPERSION_MEASURE_MIN });
  const validateDispersionMeasure = React.useCallback(
    (num: number) => (dispersionMeasureSchema.safeParse(num).success ? '' : minimumErrorMessage),
    [minimumErrorMessage]
  );

  return (
    <QuantityField
      value={value}
      setValue={(nextValue) => setValue?.(nextValue)}
      required={required}
      disabled={disabled}
      minValue={DISPERSION_MEASURE_MIN}
      requiredMessage={minimumErrorMessage}
      rangeMessage={minimumErrorMessage}
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
