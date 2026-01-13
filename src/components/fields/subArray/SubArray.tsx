import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
import { LAB_IS_BOLD, LAB_POSITION, SA_CUSTOM, TELESCOPE_LOW_NUM } from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useMemo } from 'react';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';

interface SubArrayFieldProps {
  observingBand: string;
  telescope: number;
  disabled?: boolean;
  required?: boolean;
  setValue?: (v: string) => void;
  suffix?: React.ReactNode;
  value: string;
  widthButton?: number;
  widthLabel?: number;
}

export default function SubArrayField({
  observingBand,
  telescope,
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2,
  widthLabel = 6
}: SubArrayFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'subArrayConfiguration';

  const { osdCapabilities, isCustomAllowed, selectedPolicy, telescopeBand } = useOSDAccessors();

  const options = useMemo(() => {
    if (telescope <= 0) return [];

    const telBand = telescopeBand(observingBand);
    const policy = selectedPolicy?.cyclePolicies;
    const arr = telBand === TELESCOPE_LOW_NUM ? policy?.low : policy?.mid;
    if (!arr) return [];

    const merged = arr.map(key => ({
      value: key.toLowerCase(),
      label: key.toUpperCase()
    }));

    return isCustomAllowed(telescope) ? merged : merged.filter(o => o.value !== SA_CUSTOM);
  }, [telescope, observingBand, selectedPolicy, osdCapabilities, isCustomAllowed]);

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled || options.length < 2}
          options={options}
          testId={FIELD}
          value={value ?? ''}
          setValue={setValue}
          label={t(`${FIELD}.label`)}
          labelBold={LAB_IS_BOLD}
          labelPosition={LAB_POSITION}
          labelWidth={suffix ? widthLabel + 1 : widthLabel}
          onFocus={() => setHelp(`${FIELD}.help`)}
          required={required}
        />
      </Grid>

      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
