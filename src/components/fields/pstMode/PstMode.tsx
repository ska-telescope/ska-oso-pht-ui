import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION, PST_MODES } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface PstModeFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  value: number;
  widthLabel?: number;
}

export default function PstModeField({
  disabled = false,
  required = false,
  setValue,
  value,
  widthLabel = 6
}: PstModeFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'pstMode';

  const getOptions = () => {
    const options = PST_MODES;
    return options?.map((e: any) => {
      return {
        label: t(FIELD + '.options.' + e.value),
        value: e.value
      };
    });
  };

  return (
    <Box pt={1}>
      {getOptions() && (
        <DropDown
          disabled={disabled || getOptions()?.length < 2}
          options={getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={widthLabel}
          onFocus={() => setHelp(t(FIELD + '.help'))}
          required={required}
        />
      )}
    </Box>
  );
}
