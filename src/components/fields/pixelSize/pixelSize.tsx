import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION } from '@utils/constants.ts';

interface PixelSizeFieldProps {
  disabled?: boolean;
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  label?: string;
  suffix?: any;
  testId: string;
  value: number;
  widthButton?: number;
  widthLabel?: number;
}
export default function PixelSizeField({
  disabled = false,
  onFocus = undefined,
  label = '',
  required = false,
  setValue,
  testId,
  value,
  widthLabel = 5,
  suffix
}: PixelSizeFieldProps) {
  return (
    <Box pt={1} sx={{ maxWidth: '800px' }}>
      <NumberEntry
        disabled={disabled}
        label={label}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        required={required}
        testId={testId}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
        suffix={suffix}
      />
    </Box>
  );
}
