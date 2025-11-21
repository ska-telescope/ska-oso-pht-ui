import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface NumStationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  widthLabel?: number;
  rangeLower?: number;
  rangeUpper?: number;
}

export default function NumStationsField({
  disabled = false,
  setValue,
  value,
  widthLabel = 6,
  rangeLower = 0,
  rangeUpper = 1
}: NumStationsFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'numStations';

  const validate = (e: number) => {
    const str = Math.abs(e).toString();
    const num = Number(str);
    if (num >= rangeLower && num <= rangeUpper) {
      if (setValue) {
        setValue(num?.toString());
      }
    }
  };

  return (
    <Box>
      <NumberEntry
        disabled={disabled}
        disabledUnderline={disabled}
        label={t(FIELD + '.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={widthLabel}
        testId={FIELD}
        value={value}
        setValue={validate}
        onFocus={() => setHelp(t(FIELD + '.help'))}
      />
    </Box>
  );
}
