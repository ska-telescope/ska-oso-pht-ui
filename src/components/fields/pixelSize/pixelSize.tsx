import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_POSITION } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface PixelSizeFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  labelWidth?: number;
}
export default function PixelSizeField({
  disabled = false,
  required = false,
  labelWidth = 5,
  onFocus,
  setValue,
  suffix,
  value
}: PixelSizeFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'pixelSize';

  const errorText = () => (Number(value) ? '' : t(FIELD + '.error'));
  const setTheNumber = (inNum: number) => {
    const str = Math.abs(inNum).toString();
    const num = Number(str);
    if (setValue) {
      setValue(num);
    }
  };

  return (
    <Box pt={1}>
      <NumberEntry
        label={t(FIELD + '.label')}
        labelBold
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        testId={FIELD}
        value={value}
        setValue={(e: number) => setTheNumber(e)}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        suffix={suffix}
        errorText={errorText()}
      />
    </Box>
  );
}
