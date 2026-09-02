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
  const MAX_DISPERSION_MEASURE = 100000;

  return (
    <QuantityField
      value={value}
      setValue={(nextValue) => setValue?.(nextValue)}
      required={required}
      disabled={disabled}
      minValue={0}
      maxValue={MAX_DISPERSION_MEASURE}
      step={1}
      requiredMessage={t(FIELD + '.error.integer')}
      rangeMessage={t(FIELD + '.range.error', { min: 0, max: MAX_DISPERSION_MEASURE })}
      unitOptions={[{ label: t(FIELD + '.units'), value: DISPERSION_MEASURE_UNIT_VALUE }]}
      units={DISPERSION_MEASURE_UNIT_VALUE}
      setUnits={() => {}}
      unitsTestId={FIELD + 'Units'}
      unitsDisabled
      topPadding={1}
      label={t(FIELD + '.label')}
      onFocus={() => setHelp(FIELD)}
      onUnitsFocus={() => setHelp(FIELD)}
    />
  );
}
