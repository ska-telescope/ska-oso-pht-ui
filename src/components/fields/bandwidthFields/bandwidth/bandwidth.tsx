import React from 'react';
import { Grid, Typography } from '@mui/material';
import { DropDown } from '@ska-telescope/ska-gui-components';
import {
  BANDWIDTH_LABEL_SELECTOR,
  FREQUENCY_HZ,
  FREQUENCY_KHZ,
  FREQUENCY_MHZ,
  TELESCOPE_LOW_NUM
} from '@utils/constants.ts';
import { useOSDAccessors } from '@utils/osd/useOSDAccessors/useOSDAccessors.tsx';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { calculateVelocity, frequencyConversion } from '@/utils/helpers';
import { bandwidthHzToChannels, channelsToBandwidthHz, stepChannels } from '@/utils/zoomWindow';
import SelectField from '@/components/wrappers/selectField/SelectField';
import SteppedNumberField from '@/components/wrappers/steppedNumberField/SteppedNumberField';

interface BandwidthFieldProps {
  centralFrequencyHz?: number;
  disabled?: boolean;
  maxZoomChannels?: number;
  required?: boolean;
  resolutionHz?: number;
  setValue?: Function;
  setZoomChannels?: (value: number) => void;
  suffix?: any;
  telescope: number;
  value: number;
  widthButton?: number;
  zoomChannels?: number;
}

const BANDWIDTH_UNIT_OPTIONS = [
  { label: 'kHz', value: FREQUENCY_KHZ },
  { label: 'MHz', value: FREQUENCY_MHZ }
];

// Displayed bandwidth is always precise to the nearest centi-Hz (0.01 Hz), regardless of unit -
// so the decimal places shown must grow with the unit's scale relative to Hz.
const BANDWIDTH_DECIMAL_PLACES: Record<number, number> = {
  [FREQUENCY_KHZ]: 5,
  [FREQUENCY_MHZ]: 8
};

export default function BandwidthField({
  centralFrequencyHz = 0,
  disabled = false,
  maxZoomChannels = 0,
  required = false,
  resolutionHz = 0,
  setValue,
  setZoomChannels,
  suffix = null,
  value,
  telescope,
  widthButton = 50,
  zoomChannels = 0
}: BandwidthFieldProps) {
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { observatoryConstants } = useOSDAccessors();
  const FIELD = 'bandwidth';

  const isLow = () => telescope === TELESCOPE_LOW_NUM;

  const getOptions = () => {
    return observatoryConstants?.array[telescope - 1]?.bandWidth ?? [];
  };

  // Channel count and bandwidth-in-frequency are two views of the same underlying value -
  // stepping either by one channel is exactly the same operation.
  const [bandwidthUnits, setBandwidthUnits] = React.useState(FREQUENCY_KHZ);
  const bandwidthHz = channelsToBandwidthHz(zoomChannels, resolutionHz);
  const bandwidthDisplayValue = frequencyConversion(bandwidthHz, FREQUENCY_HZ, bandwidthUnits);

  const commitChannels = (raw: number) => {
    setZoomChannels?.(Math.min(Math.max(Math.round(raw), 1), maxZoomChannels || 1));
  };

  const commitBandwidth = (raw: number) => {
    const hz = frequencyConversion(raw, bandwidthUnits, FREQUENCY_HZ);
    setZoomChannels?.(bandwidthHzToChannels(hz, resolutionHz, maxZoomChannels));
  };

  const stepChannelsValue = (currentChannels: number, direction: 1 | -1) =>
    stepChannels(currentChannels, direction, maxZoomChannels);

  const stepBandwidthValue = (_currentDisplayValue: number, direction: 1 | -1) => {
    const nextChannels = stepChannels(zoomChannels, direction, maxZoomChannels);
    const nextHz = channelsToBandwidthHz(nextChannels, resolutionHz);
    return frequencyConversion(nextHz, FREQUENCY_HZ, bandwidthUnits);
  };

  if (isLow()) {
    return (
      <Grid pt={1} spacing={2} container justifyContent="space-between" direction="row">
        <Grid size={{ xs: 8 }}>
          <SteppedNumberField
            testId={FIELD}
            label={t(FIELD + '.label.' + BANDWIDTH_LABEL_SELECTOR)}
            value={bandwidthDisplayValue}
            format={(v) => v.toFixed(BANDWIDTH_DECIMAL_PLACES[bandwidthUnits] ?? 2)}
            onCommit={commitBandwidth}
            onStep={stepBandwidthValue}
            onFocus={() => setHelp(FIELD)}
            incrementDisabled={disabled || zoomChannels >= maxZoomChannels}
            decrementDisabled={disabled || zoomChannels <= 1}
            disabled={disabled}
            required={required}
            suffix={
              <>
                <SelectField
                  testId={FIELD + 'Units'}
                  options={BANDWIDTH_UNIT_OPTIONS}
                  value={bandwidthUnits}
                  setValue={setBandwidthUnits}
                />
                <Typography
                  variant="body1"
                  whiteSpace="nowrap"
                  pl={1}
                  data-testid={FIELD + 'Velocity'}
                >
                  ({calculateVelocity(bandwidthHz, centralFrequencyHz)})
                </Typography>
              </>
            }
          />
        </Grid>
        <Grid size={{ xs: 4 }}>
          <SteppedNumberField
            testId="zoomChannels"
            label={t('zoomChannels.label')}
            value={zoomChannels}
            digitsOnly
            onCommit={commitChannels}
            onStep={stepChannelsValue}
            onFocus={() => setHelp('zoomChannels')}
            incrementDisabled={disabled || zoomChannels >= maxZoomChannels}
            decrementDisabled={disabled || zoomChannels <= 1}
            disabled={disabled}
            required={required}
          />
        </Grid>
      </Grid>
    );
  }

  return (
    <Grid pt={1} spacing={0} container justifyContent="space-between" direction="row">
      <Grid pl={suffix ? 1 : 0} size={{ xs: suffix ? 12 - widthButton : 12 }}>
        <DropDown
          disabled={disabled}
          options={getOptions()}
          testId={FIELD}
          value={value}
          setValue={setValue}
          label={t(FIELD + '.label.' + BANDWIDTH_LABEL_SELECTOR)}
          onFocus={() => setHelp(FIELD)}
          required={required}
        />
      </Grid>
      <Grid size={{ xs: suffix ? widthButton : 0 }}>{suffix}</Grid>
    </Grid>
  );
}
