import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import QuantityField from '@/components/fields/quantity/quantity';

interface RotationMeasureFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
}

export default function RotationMeasureField({
  disabled = false,
  required = false,
  setValue,
  value
}: RotationMeasureFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'rotationMeasure';
  const ROTATION_MEASURE_UNIT_VALUE = 0;
  const rangeErrorMessage = t(FIELD + '.range.error');

  return (
    <QuantityField
      value={value}
      setValue={(nextValue) => setValue?.(nextValue)}
      required={required}
      disabled={disabled}
      step={1}
      requiredMessage={rangeErrorMessage}
      rangeMessage={rangeErrorMessage}
      unitOptions={[{ label: t(FIELD + '.units'), value: ROTATION_MEASURE_UNIT_VALUE }]}
      units={ROTATION_MEASURE_UNIT_VALUE}
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
