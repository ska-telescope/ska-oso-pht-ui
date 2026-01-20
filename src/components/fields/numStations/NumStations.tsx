import { NumberEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface NumStationsFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number;
  widthButton?: number;
  rangeLower?: number;
  rangeUpper?: number;
}

export default function NumStationsField({
  disabled = false,
  setValue,
  value,
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
    <Box pt={1}>
      <NumberEntry
        disabled={disabled}
        label={t(FIELD + '.label')}
        testId={FIELD}
        value={value}
        setValue={validate}
        onFocus={() => setHelp(FIELD + '.help')}
      />
    </Box>
  );
}
