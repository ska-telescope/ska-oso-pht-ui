import React from 'react';
import { z } from 'zod';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import QuantityField from '@/components/fields/quantity/quantity';

interface RobustFieldProps {
  disabled?: boolean;
  onFocus?: () => void;
  label: string;
  setValue: (nextValue: number) => void;
  value: number;
}

export const ROBUST_RANGE = { min: -2, max: 2 };
export const robustSchema = z.number().min(ROBUST_RANGE.min).max(ROBUST_RANGE.max);

export default function RobustField({
  disabled = false,
  onFocus = undefined,
  label,
  setValue,
  value
}: RobustFieldProps) {
  const { t } = useScopedTranslation();
  const robustErrorMessage = t('robust.error');
  const validateRobust = React.useCallback(
    (num: number) => (robustSchema.safeParse(num).success ? '' : robustErrorMessage),
    [robustErrorMessage]
  );

  return (
    <QuantityField
      value={value}
      setValue={setValue}
      label={label}
      required={false}
      disabled={disabled}
      requiredMessage={robustErrorMessage}
      rangeMessage={robustErrorMessage}
      validate={validateRobust}
      onFocus={onFocus}
      topPadding={1}
    />
  );
}
