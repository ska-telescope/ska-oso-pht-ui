import { NumberEntry, TextEntry } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { LAB_POSITION } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface SkyDirection2FieldProps {
  labelWidth?: number;
  setValue?: Function;
  skyUnits: number;
  value: string;
  valueFocus?: Function;
  valueTypeFocus?: Function;
}

export default function SkyDirection2Field({
  labelWidth = 5,
  setValue,
  skyUnits,
  value,
  valueFocus
}: SkyDirection2FieldProps) {
  const { t } = useScopedTranslation();
  const FIELD = 'skyDirection';

  const SkyDirectionValueText = () => (
    <TextEntry
      label={t(FIELD + '.label.2.' + skyUnits.toString())}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
      testId={FIELD + 'Value2'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      required
    />
  );

  const SkyDirectionValueNumber = () => (
    <NumberEntry
      label={t(FIELD + '.label.2.' + skyUnits.toString())}
      labelBold
      labelPosition={LAB_POSITION}
      labelWidth={labelWidth}
      suffix={t(FIELD + '.units.2.' + skyUnits.toString())}
      testId={FIELD + 'Value'}
      value={value}
      setValue={setValue}
      onFocus={valueFocus}
      required
    />
  );

  return (
    <Box sx={{ width: '100%' }}>
      {skyUnits.toString() === '0' && SkyDirectionValueText()}
      {skyUnits.toString() === '1' && SkyDirectionValueNumber()}
    </Box>
  );
}
