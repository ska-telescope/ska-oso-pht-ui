import { DropDown } from '@ska-telescope/ska-gui-components';
import { Box } from '@mui/material';
import { VELOCITY_TYPE } from '../../../utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';

interface VelocityTypeFieldProps {
  setVelType?: Function;
  velType: number;
  velTypeFocus?: Function;
}

export default function VelocityTypeField({
  setVelType,
  velType,
  velTypeFocus
}: VelocityTypeFieldProps) {
  const { t } = useScopedTranslation();

  const VelocityTypeTypeField = () => {
    const getOptions = () => {
      return [VELOCITY_TYPE.VELOCITY, VELOCITY_TYPE.REDSHIFT].map(e => ({
        label: t('velocity.' + e),
        value: e
      }));
    };

    return (
      <Box pt={1}>
        <DropDown
          options={getOptions()}
          testId="velocityType"
          value={velType}
          setValue={setVelType}
          disabled={getOptions().length < 2}
          label=""
          onFocus={velTypeFocus}
          required
        />
      </Box>
    );
  };

  return (
    <Box sx={{ height: '100%', width: '100%' }}>{velType !== null && VelocityTypeTypeField()}</Box>
  );
}
