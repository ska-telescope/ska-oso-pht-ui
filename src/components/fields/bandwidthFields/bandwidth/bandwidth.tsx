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

  // The selected unit is local UI state, not part of the saved observation - only the
  // underlying channel count is persisted. Re-mounting (e.g. leaving and reopening this
  // observation) always starts from the kHz default, discarding whatever unit was showing
  // before. Pick a sensible default once real data is available, based on its magnitude, rather
  // than always defaulting to kHz - guarded to fire only once so it doesn't override a later
  // manual unit change.
  const hasSetInitialUnits = React.useRef(false);
  React.useEffect(() => {
    if (hasSetInitialUnits.current || zoomChannels <= 0 || resolutionHz <= 0) return;
    hasSetInitialUnits.current = true;
    setBandwidthUnits(bandwidthHz >= 1_000_000 ? FREQUENCY_MHZ : FREQUENCY_KHZ);
  }, [zoomChannels, resolutionHz, bandwidthHz]);

  // Both fields always commit a clamped value, so a requested value outside [1, maxZoomChannels]
  // is flagged here rather than by validating the (already-clamped) committed value itself.
  // Tracked per-field rather than as one shared flag - they're two views of the same underlying
  // channel count, but only the field the user actually typed an out-of-range value into should
  // show an error; the other field's own displayed value is derived fresh from the clamped result
  // and is therefore always in range, so flagging it too would be wrong.
  const [channelsRangeError, setChannelsRangeError] = React.useState(false);
  const [bandwidthRangeError, setBandwidthRangeError] = React.useState(false);

  const zoomChannelsRangeErrorMessage = channelsRangeError
    ? t('zoomChannels.range.error', { min: 1, max: maxZoomChannels })
    : '';

  const commitChannels = (raw: number) => {
    const requested = Math.round(raw);
    setChannelsRangeError(requested < 1 || requested > maxZoomChannels);
    setBandwidthRangeError(false);
    setZoomChannels?.(Math.min(Math.max(requested, 1), maxZoomChannels || 1));
  };

  const commitBandwidth = (raw: number) => {
    // resolutionHz isn't available yet (e.g. still loading from OSD) - bandwidthHzToChannels
    // itself returns 0 (not a valid channel count) in this case, so there's nothing meaningful
    // to commit or range-check yet.
    if (resolutionHz <= 0) return;
    const hz = frequencyConversion(raw, bandwidthUnits, FREQUENCY_HZ);
    const requested = Math.round(hz / resolutionHz);
    setBandwidthRangeError(requested < 1 || requested > maxZoomChannels);
    setChannelsRangeError(false);
    setZoomChannels?.(bandwidthHzToChannels(hz, resolutionHz, maxZoomChannels));
  };

  const stepChannelsValue = (currentChannels: number, direction: 1 | -1) =>
    stepChannels(currentChannels, direction, maxZoomChannels);

  const stepBandwidthValue = (_currentDisplayValue: number, direction: 1 | -1) => {
    const nextChannels = stepChannels(zoomChannels, direction, maxZoomChannels);
    const nextHz = channelsToBandwidthHz(nextChannels, resolutionHz);
    return frequencyConversion(nextHz, FREQUENCY_HZ, bandwidthUnits);
  };

  // Native <input type="number"> min/max/step attributes - purely a browser-level hint. The
  // actual stepping always goes through onStep/stepChannels, called directly on ArrowUp/ArrowDown.
  const channelStepDisplayValue = frequencyConversion(resolutionHz, FREQUENCY_HZ, bandwidthUnits);
  const maxBandwidthDisplayValue = frequencyConversion(
    channelsToBandwidthHz(maxZoomChannels, resolutionHz),
    FREQUENCY_HZ,
    bandwidthUnits
  );

  // Same underlying channel-count range as zoomChannelsRangeErrorMessage above, but expressed in
  // this field's own displayed unit/bounds (channelStepDisplayValue/maxBandwidthDisplayValue,
  // the same values already passed as this field's min/max) rather than a raw channel count.
  const bandwidthUnitLabel =
    BANDWIDTH_UNIT_OPTIONS.find((option) => option.value === bandwidthUnits)?.label ?? '';
  const bandwidthDecimalPlaces = BANDWIDTH_DECIMAL_PLACES[bandwidthUnits] ?? 2;
  const bandwidthRangeErrorMessage = bandwidthRangeError
    ? t('bandwidth.range.channelRangeError', {
        min: channelStepDisplayValue.toFixed(bandwidthDecimalPlaces),
        max: maxBandwidthDisplayValue.toFixed(bandwidthDecimalPlaces),
        unit: bandwidthUnitLabel
      })
    : '';

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
            errorText={bandwidthRangeErrorMessage}
            requiredText={t(FIELD + '.required')}
            min={channelStepDisplayValue}
            max={maxBandwidthDisplayValue}
            step={channelStepDisplayValue}
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
            errorText={zoomChannelsRangeErrorMessage}
            requiredText={t('zoomChannels.required')}
            min={1}
            max={maxZoomChannels}
            step={1}
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
