import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { BIT_DEPTH, LAB_IS_BOLD, LAB_POSITION } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface BitDepthFieldProps {
  disabled?: boolean;
  required?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

export default function BitDepthField({
  disabled = false,
  required = false,
  labelWidth = 5,
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
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
        options={options()}
        required={required}
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
