import { TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

// NOTE : DISABLED AT THIS TIME UNTIL GALACTIC IS IMPLEMENTED FULLY

interface ReferenceCoordinatesFieldProps {
  setValue?: Function;
  value: String;
  valueFocus?: Function;
}

export default function ReferenceCoordinatesField({
  setValue,
  value,
  valueFocus
}: ReferenceCoordinatesFieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'referenceCoordinates';

  const ReferenceCoordinatesValueField = () => {
    const OPTIONS = [0]; // NOTE , 1];

    const getOptions = () => {
      return OPTIONS.map(e => ({ label: t(FIELD + '.' + e), value: e }));
    };

    return (
      <Box pt={1}>
        <TextEntry
          disabled={OPTIONS.length < 2}
          options={getOptions()}
          required
          label={t(FIELD + '.label')}
          testId={FIELD + 'Type'}
          value={value}
          setValue={setValue}
          onFocus={valueFocus}
          toolTip={t(FIELD + '.tooltip')}
        />
      </Box>
    );
  };

  return (
    <Box pb={0} pt={0} sx={{ width: '100%' }}>
      {ReferenceCoordinatesValueField()}
    </Box>
  );
}
