import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

// TODO : DISABLED AT THIS TIME UNTIL GALACTIC IS IMPLEMENTED FULLY

interface ReferenceCoordinatesFieldProps {
  labelWidth?: number;
  setValue?: Function;
  value: number;
  valueFocus?: Function;
}

export default function ReferenceCoordinatesField({
  labelWidth = 5,
  setValue,
  value,
  valueFocus
}: ReferenceCoordinatesFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'referenceCoordinates';

  const ReferenceCoordinatesValueField = () => {
    const OPTIONS = [0]; // TODO , 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t(FIELD + '.' + e), value: e }));
    };

    return (
      <Box pt={1}>
        <DropDown
          disabled={OPTIONS.length < 2}
          options={getOptions()}
          testId={FIELD + 'Type'}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={labelWidth}
          onFocus={valueFocus}
          required
          toolTip={t(FIELD + '.tooltip')}
        />
      </Box>
    );
  };

  return (
    <Box p={1} pb={0} pt={0} sx={{ width: '100%' }}>
      {ReferenceCoordinatesValueField()}
    </Box>
  );
}
