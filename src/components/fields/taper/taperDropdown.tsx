import { useScopedTranslation } from '@services/i18n/useScopedTranslation.tsx';
import { TAPERING } from '@utils/constants.ts';
import { Box } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';

interface TaperDropdownFieldProps {
  required?: boolean;
  setValue?: Function;
  value: number;
  onFocus?: Function;
  suffix?: any;
}

export default function TaperDropdownField({
  required = true,
  setValue,
  value,
  onFocus,
  suffix
}: TaperDropdownFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'taper';

  const getOptions = () => {
    return TAPERING?.map((e: any) => {
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
          options={getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          onFocus={onFocus}
          required={required}
          suffix={suffix}
        />
      )}
    </Box>
  );
}
