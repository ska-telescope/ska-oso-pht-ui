import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { BIT_DEPTH } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface BitDepthFieldProps {
  disabled?: boolean;
  required?: boolean;
  onFocus?: Function;
  setValue?: Function;
  value: number;
  options?: Array<{ label?: string | number; lookup?: string | number; value: string | number }>;
}

export default function BitDepthField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  value,
  options
}: BitDepthFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'bitDepth';

  const resolvedOptions =
    options ??
    BIT_DEPTH.map((el) => ({
      label: String(el.value),
      lookup: String(el.value),
      value: Number(el.value)
    }));

  const resolvedValue = typeof value === 'string' ? Number(value) : value;

  return (
    <Box pt={1}>
      <DropDown
        disabled={disabled}
        disabledUnderline={disabled}
        value={resolvedValue}
        label={t('bitDepth.label')}
        onFocus={onFocus}
        options={resolvedOptions}
        required={required}
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
