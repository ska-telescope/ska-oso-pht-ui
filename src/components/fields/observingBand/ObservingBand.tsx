import { DropDown } from '@ska-telescope/ska-gui-components';
import { Grid } from '@mui/material';
import { useMemo } from 'react';
import {
  BAND_LOW_STR,
  FREQUENCY_GHZ,
  FREQUENCY_HZ,
  TEL_UNITS,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  FREQUENCY_MHZ,
  TEL
} from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useHelp } from '@/utils/help/useHelp';
import { frequencyConversion } from '@/utils/helpers';

interface ObservingBandFieldProps {
  disabled?: boolean;
  required?: boolean;
  setValue?: Function;
  suffix?: any;
  value: number | string;
  widthButton?: number;
}

export default function ObservingBandField({
  disabled = false,
  required = false,
  setValue,
  suffix = null,
  value,
  widthButton = 2
}: ObservingBandFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const FIELD = 'observingBand';
  const { osdLOW, osdMID, osdCyclePolicy, selectedPolicy } = useOSDAccessors();

  const options = useMemo(() => {
    const filteredOptions: { label: string; value: string }[] = [];
    const bands = selectedPolicy?.cyclePolicies?.bands || [];
    for (const band of bands) {
      if (band === BAND_LOW_STR && osdLOW?.basicCapabilities) {
        filteredOptions.push({
          label:
            TEL[TELESCOPE_LOW_NUM] +
            ' (' +
            // minFrequencyHz/maxFrequencyHz are the exact half-channel-inset band edges (e.g.
            // 49,609,375 Hz), not a clean MHz boundary - shown here to the nearest Hz (6 d.p. in
            // MHz) rather than rounded away to a whole MHz, and rounded only here for display
            // rather than at the source (see getOSDCycles.tsx), which would shift the actual grid.
            Number(
              frequencyConversion(
                osdLOW.basicCapabilities.minFrequencyHz,
                FREQUENCY_HZ,
                FREQUENCY_MHZ
              ).toFixed(6)
            ) +
            ' - ' +
            Number(
              frequencyConversion(
                osdLOW.basicCapabilities.maxFrequencyHz,
                FREQUENCY_HZ,
                FREQUENCY_MHZ
              ).toFixed(6)
            ) +
            ' ' +
            TEL_UNITS[TELESCOPE_LOW_NUM] +
            ')',
          value: BAND_LOW_STR
        });
      } else {
        const rec = osdMID?.basicCapabilities.receiverInformation.find((r: any) => r.rxId === band);
        if (rec) {
          filteredOptions.push({
            label:
              TEL[TELESCOPE_MID_NUM] +
              ' ' +
              rec.rxId +
              ' (' +
              frequencyConversion(rec.minFrequencyHz, FREQUENCY_HZ, FREQUENCY_GHZ) +
              ' - ' +
              frequencyConversion(rec.maxFrequencyHz, FREQUENCY_HZ, FREQUENCY_GHZ) +
              ' ' +
              TEL_UNITS[TELESCOPE_MID_NUM] +
              ')',
            value: rec.rxId
          });
        }
      }
    }
    return filteredOptions;
  }, [osdLOW, osdMID, osdCyclePolicy]);

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled || options.length < 2}
          options={options}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label')}
          onFocus={() => setHelp(FIELD + '.help')}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
