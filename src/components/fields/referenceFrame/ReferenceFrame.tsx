import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface ReferenceFrameFieldProps {
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: number;
}

export default function ReferenceFrameField({
  labelWidth = 5,
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
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
      />
    </Box>
  );
}
