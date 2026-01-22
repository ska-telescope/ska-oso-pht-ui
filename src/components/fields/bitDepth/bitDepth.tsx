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
}

export default function BitDepthField({
  disabled = false,
  required = false,
  onFocus,
  setValue,
  value
}: BitDepthFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'bitDepth';

  const options = () =>
    BIT_DEPTH.map(el => {
      return { label: el.value, lookup: el.value, value: el.value };
    });

  return (
    <Box pt={1}>
      <DropDown
        disabled={disabled}
        disabledUnderline={disabled}
        value={value}
        label={t('bitDepth.label')}
        onFocus={onFocus}
        options={options()}
        required={required}
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
