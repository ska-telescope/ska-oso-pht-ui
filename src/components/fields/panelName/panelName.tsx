import { TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';

interface PanelNameFieldProps {
  onFocus?: Function;
  required?: boolean;
  setValue?: Function;
  label?: string;
  testId: string;
  value: string;
  widthButton?: number;
  widthLabel?: number;
}

export default function PanelNameField({
  onFocus,
  label = '',
  required = true,
  setValue,
  testId,
  value
}: PanelNameFieldProps) {
  return (
    <Box pt={1}>
      <TextEntry
        label={label}
        required={required}
        testId={testId}
        value={value}
        setValue={setValue}
        onFocus={onFocus}
      />
    </Box>
  );
}
