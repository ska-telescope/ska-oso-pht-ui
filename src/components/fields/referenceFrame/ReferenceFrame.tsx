import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ReferenceFrameFieldProps {
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

export default function ReferenceFrameField({
  onFocus,
  setValue,
  value
}: ReferenceFrameFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'referenceFrame';

  const OPTIONS = [0, 1];

  const getOptions = () => {
    return OPTIONS.map(e => ({ label: t(FIELD + '.' + e), value: e }));
  };

  return (
    <Box sx={{ width: '100%' }}>
      <DropDown
        options={getOptions()}
        testId={FIELD}
        value={value}
        setValue={setValue}
        label={t(FIELD + '.label')}
        onFocus={onFocus}
      />
    </Box>
  );
}
