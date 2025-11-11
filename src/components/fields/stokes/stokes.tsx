import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/system';
import { LAB_IS_BOLD, LAB_POSITION, STOKES } from '@utils/constants.ts';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface StokesFieldProps {
  disabled?: boolean;
  labelWidth?: number;
  onFocus?: Function;
  setValue?: Function;
  value: string;
}

export default function StokesField({
  disabled = false,
  labelWidth = 5,
  onFocus,
  setValue,
  value
}: StokesFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'stokes';

  const options = () =>
    STOKES.map(el => {
      return { label: t('stokes.' + el.value), value: el.value };
    });

  return (
    <Box pt={1} sx={{ maxWidth: '800px' }}>
      <DropDown
        disabled={disabled}
        disabledUnderline={disabled}
        value={value}
        label={t(FIELD + '.label')}
        labelBold={LAB_IS_BOLD}
        labelPosition={LAB_POSITION}
        labelWidth={labelWidth}
        onFocus={onFocus}
        options={options()}
        required
        setValue={setValue}
        testId={FIELD}
      />
    </Box>
  );
}
