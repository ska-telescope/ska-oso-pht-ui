import { useFormContext, useWatch } from 'react-hook-form';
import { Box, Grid, InputAdornment, Stack, Typography } from '@mui/material';
import {
  BorderedSection,
  FrequencySpectrum,
  getColors,
  TextEntry
} from '@ska-telescope/ska-gui-components';
import {
  ControlledNumberField,
  ControlledSelect
} from '@ska-telescope/ska-gui-components/controlled';
import {
  PST_MODES,
  SA_AA2,
  SA_CUSTOM,
  TEL,
  TELESCOPE_LOW_NUM,
  TELESCOPE_MID_NUM,
  type FrequencyUnit
} from '@/utils/constants';
import { calculateVelocity, convertFrequency, generateId } from '@/utils/helpers';
import { isFineZoomRestricted } from '@/utils/zoomWindow';
import {
  bandRange,
  spectrumOf,
  centralFrequencyGridHz,
  bandwidthStepHz,
  LOW_ZOOM_RESOLUTIONS,
  MID_ZOOM_RESOLUTIONS,
  ObservationInput,
  ObservingBand,
  ObservingMode,
  observationForBand,
  observationForMode,
  observationForSubarray,
  OBSERVING_MODE,
  OBSERVING_MODE_TRANSLATION_KEY,
  observingModesFor,
  spectralBandwidth,
  spectralResolutionText,
  Subarray,
  subarrayCapabilities,
  TELESCOPE,
  telescopeOfBand,
  widestBandwidthHz,
  zoomChannelsForBandwidth,
  zoomChannelWidthHz
} from '@/models/proposals/observations';
import type { ProposalFormAccess } from '@/models/proposals/proposal';
import {
  calibratorInputsChanged,
  refreshCalibrators,
  replacePstDataProduct,
  resizeImageDataProducts,
  setSpectralChannelsOut
} from '@/models/proposals/observationUpdates';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import { useHelp } from '@/utils/help/useHelp';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { FIRST_COARSE_ZOOM } from '@/utils/constants';
import lowAA2Image from '@assets/low_aa2.png';

/** A form with observations: the proposal form, or the entry form of one observation. */
export type ObservationsForm = { observations: ObservationInput[] };

const GAP = 3;
const NEW_GROUP = 'new';

const INTEGRATION_TIME_UNITS = [
  { label: 'h', value: 'h' },
  { label: 'min', value: 'min' }
];
// The units offered for a spectral line bandwidth, which is much narrower than the others
const SPECTRAL_BANDWIDTH_UNITS = [
  { label: 'kHz', value: 'kHz' },
  { label: 'MHz', value: 'MHz' }
];

type SpectralObservationInput = Extract<
  ObservationInput,
  { observingMode: typeof OBSERVING_MODE.SPECTRAL }
>;

interface ObservationViewProps {
  index: number;
  // The groups of the proposal's other observations, which this one can join
  groupIds: string[];
  // The proposal form, when the observation is edited in it in place, as an SV proposal's one
  // observation is: the proposal's data products and calibration then follow each change of a field
  // they depend on. An entry form's observation changes them when it is added or updated instead.
  proposalForm?: ProposalFormAccess;
}

/**
 * The fields of one observation, the one at `index` in the observations of the form in context.
 * The form is the proposal form when the observation is edited in place (ObservationInPlace), or
 * an entry form of its own when it is added or updated (the ObservationEntry page). Changing the
 * band, subarray or observing mode replaces the observation with one that fits the change.
 */
export default function ObservationView({ index, groupIds, proposalForm }: ObservationViewProps) {
  // Only an SV proposal's observation is edited in place. It has its observing mode set on the
  // Details page, and fewer fields.
  const isSV = proposalForm !== undefined;
  const { t } = useScopedTranslation();
  const { setHelp } = useHelp();
  const { osdLOW, osdMID, selectedPolicy, isCustomAllowed } = useOSDAccessors();
  const osd = { low: osdLOW, mid: osdMID };
  const form = useFormContext<ObservationsForm>();
  const path = `observations.${index}` as const;
  const observation = useWatch({ control: form.control, name: path });

  if (!observation) {
    return null;
  }

  const isLow = observation.telescope === TELESCOPE.LOW;

  const setObservation = (next: ObservationInput) =>
    form.setValue(path, next, { shouldValidate: true });

  // In place, applies the updates the changed observation needs in the rest of the proposal
  const updateProposal = (
    ...updates: ((proposal: ProposalFormAccess, changed: ObservationInput) => void)[]
  ) => {
    if (proposalForm) {
      const changed = form.getValues(path);
      updates.forEach((update) => update(proposalForm, changed));
    }
  };

  const refreshCalibratorsInPlace = () => {
    if (proposalForm) {
      void refreshCalibrators(proposalForm, observation.id);
    }
  };

  // The observing modes the subarray has
  const modeOptions = (subarray: Subarray | null) =>
    observingModesFor(
      subarrayCapabilities(osd, observation.telescope, subarray)?.cbfModes ?? []
    ).map((mode) => ({
      label: t(`observationType.${OBSERVING_MODE_TRANSLATION_KEY[mode]}`),
      value: mode
    }));

  const changeBand = (band: ObservingBand) => {
    const next = observationForBand(observation, band, osd);
    setObservation(next);
    updateProposal(resizeImageDataProducts, setSpectralChannelsOut);
    if (calibratorInputsChanged(observation, next)) {
      refreshCalibratorsInPlace();
    }
  };

  // A mode the new subarray doesn't have becomes its first one
  const changeSubarray = (subarray: Subarray) => {
    const next = observationForSubarray(observation, subarray, osd);
    const modes = modeOptions(subarray).map((option) => option.value);
    setObservation(
      modes.length > 0 && !modes.includes(next.observingMode)
        ? observationForMode(next, modes[0], osd)
        : next
    );
    // The subarray can have fewer zoom channels
    updateProposal(setSpectralChannelsOut);
  };

  const changeMode = (observingMode: ObservingMode) =>
    setObservation(observationForMode(observation, observingMode, osd));

  const changeGroup = (value: string) =>
    form.setValue(
      `${path}.groupId`,
      value === '' ? null : value === NEW_GROUP ? generateId('group-') : value
    );

  /*********************************************************** frequencies ***********************************************************/

  const centralFrequency = observation.centralFrequency;
  const centralHz =
    centralFrequency.value !== null && centralFrequency.unit !== null
      ? convertFrequency(centralFrequency.value, centralFrequency.unit)
      : null;
  const bandwidthHz =
    observation.bandwidth.value !== null && observation.bandwidth.unit !== null
      ? convertFrequency(observation.bandwidth.value, observation.bandwidth.unit)
      : null;
  const spectral = observation.observingMode === OBSERVING_MODE.SPECTRAL ? observation : null;
  const maxZoomChannels = subarrayCapabilities(
    osd,
    observation.telescope,
    observation.subarray
  )?.numberZoomChannels;

  // The LOW channel grid of a spectral line central frequency moves with the channel width and an
  // odd or even number of channels. A field is validated only when it changes itself, so changes
  // that move the grid validate the central frequency again, to show it is off the new grid.
  const revalidateCentralFrequency = () => void form.trigger(`${path}.centralFrequency.value`);

  // A spectral line observation's bandwidth is its channels times their width, so it is set again
  // when the zoom factor, the channels or its unit change
  const setSpectralBandwidth = (
    spectralObservation: SpectralObservationInput,
    zoomFactor: number | null,
    zoomChannels: number | null,
    unit: FrequencyUnit
  ) =>
    form.setValue(
      `${path}.bandwidth`,
      spectralBandwidth(spectralObservation.telescope, zoomFactor, zoomChannels, unit),
      { shouldValidate: true }
    );

  const spectrumField = () => {
    // The telescope's colour, as on the Linking page, in the user's colour-blindness palette
    const [bandColor] =
      getColors({
        type: 'telescope',
        colors: isLow ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM,
        content: 'bg',
        asArray: true,
        paletteIndex: Number(localStorage.getItem('skao_accessibility_mode'))
      }) ?? [];
    return (
      <FrequencySpectrum {...spectrumOf(observation, osd)} bandColor={bandColor} boxWidth="100%" />
    );
  };

  // On LOW, the arrows step along the central frequency's channel grid
  const centralFrequencyField = () => {
    const grid = centralFrequencyGridHz(observation, osd);
    return (
      <ControlledNumberField
        name={`${path}.centralFrequency.value`}
        label={t('centralFrequency.label')}
        required
        // To the Hz
        decimalPlaces={6}
        onChange={() => updateProposal(resizeImageDataProducts)}
        showArrows={grid !== null}
        stepSize={grid ? convertFrequency(grid.stepHz, 'Hz', 'MHz') : undefined}
        min={grid ? convertFrequency(grid.minHz, 'Hz', 'MHz') : undefined}
        // In MHz on both telescopes
        slotProps={{
          input: { endAdornment: <InputAdornment position="end">MHz</InputAdornment> }
        }}
        onFocus={() => setHelp('centralFrequency')}
      />
    );
  };

  // The arrows step by a whole step of channels. A spectral line bandwidth steps by a channel, from
  // two up to what the subarray has, and changing it changes the channels.
  const bandwidthField = () => {
    const unit = observation.bandwidth.unit;
    const stepHz = spectral
      ? spectral.zoomFactor === null
        ? null
        : zoomChannelWidthHz(spectral.telescope, spectral.zoomFactor)
      : bandwidthStepHz(observation.telescope, osd);
    const step =
      stepHz !== null && unit !== null ? convertFrequency(stepHz, 'Hz', unit) : undefined;
    // From two channels to what the subarray has for spectral line, or from one step to the widest
    // bandwidth of whole steps for the others
    const widestHz = widestBandwidthHz(
      observation.telescope,
      observation.observingBand,
      observation.subarray,
      osd
    );
    const min = step !== undefined && spectral ? 2 * step : step;
    const max =
      step === undefined || unit === null
        ? undefined
        : spectral
          ? maxZoomChannels === undefined
            ? undefined
            : maxZoomChannels * step
          : widestHz === null
            ? undefined
            : convertFrequency(widestHz, 'Hz', unit);
    const unitField = spectral ? (
      <ControlledSelect
        name={`${path}.bandwidth.unit`}
        options={SPECTRAL_BANDWIDTH_UNITS}
        withFormUpdate={false}
        onChange={(event) =>
          setSpectralBandwidth(
            spectral,
            spectral.zoomFactor,
            spectral.zoomChannels,
            event.target.value as FrequencyUnit
          )
        }
        // Overwrite default formatting for label space
        sx={{ '& .MuiInputBase-root': { mt: 0 } }}
        data-testid="bandwidthUnits"
      />
    ) : (
      'MHz'
    );
    return (
      <ControlledNumberField
        name={`${path}.bandwidth.value`}
        label={t('bandwidth.label')}
        required
        decimalPlaces={unit === 'kHz' ? 3 : 6}
        disabled={spectral !== null && step === undefined}
        showArrows={step !== undefined}
        stepSize={step}
        min={min}
        max={max}
        onChange={
          spectral
            ? () => {
                form.setValue(
                  `${path}.zoomChannels`,
                  zoomChannelsForBandwidth(
                    spectral.telescope,
                    spectral.zoomFactor,
                    form.getValues(`${path}.bandwidth`)
                  ),
                  { shouldValidate: true }
                );
                // The bandwidth was validated before its channels changed, and shows their errors
                void form.trigger(`${path}.bandwidth.value`);
                revalidateCentralFrequency();
                updateProposal(setSpectralChannelsOut);
              }
            : undefined
        }
        slotProps={{
          input: {
            endAdornment: (
              <InputAdornment position="end">
                {unitField}
                {spectral && bandwidthHz !== null && centralHz !== null && (
                  <Typography variant="body1" data-testid="bandwidthVelocity" sx={{ pl: 1 }}>
                    ({calculateVelocity(bandwidthHz, centralHz)})
                  </Typography>
                )}
              </InputAdornment>
            )
          }
        }}
        onFocus={() => setHelp(spectral ? 'bandwidth' : 'continuumBandwidth')}
      />
    );
  };

  // A new zoom factor keeps the channels and changes the bandwidth
  const zoomFactorField = (spectralObservation: SpectralObservationInput) => {
    const factors = isLow ? LOW_ZOOM_RESOLUTIONS : MID_ZOOM_RESOLUTIONS;
    const restricted = isLow && isFineZoomRestricted(spectralObservation.subarray ?? undefined);
    return (
      <ControlledSelect
        name={`${path}.zoomFactor`}
        label={t('spectralResolution.label')}
        options={factors
          .filter((factor) => !restricted || factor >= FIRST_COARSE_ZOOM)
          .map((factor) => ({
            label: spectralResolutionText(spectralObservation.telescope, factor, centralFrequency),
            value: factor
          }))}
        withFormUpdate={false}
        onChange={(event) => {
          const zoomFactor = Number(event.target.value) as SpectralObservationInput['zoomFactor'];
          form.setValue(`${path}.zoomFactor`, zoomFactor, { shouldValidate: true });
          setSpectralBandwidth(
            spectralObservation,
            zoomFactor,
            spectralObservation.zoomChannels,
            spectralObservation.bandwidth.unit ?? 'MHz'
          );
          revalidateCentralFrequency();
        }}
        required
        data-testid="spectralResolution"
        onFocus={() => setHelp('spectralResolution')}
      />
    );
  };

  const zoomChannelsField = (spectralObservation: SpectralObservationInput) => (
    <ControlledNumberField
      name={`${path}.zoomChannels`}
      label={t('zoomChannels.label')}
      required
      showArrows
      stepSize={1}
      min={2}
      max={maxZoomChannels}
      onChange={() => {
        setSpectralBandwidth(
          spectralObservation,
          spectralObservation.zoomFactor,
          form.getValues(`${path}.zoomChannels`),
          spectralObservation.bandwidth.unit ?? 'MHz'
        );
        revalidateCentralFrequency();
        updateProposal(setSpectralChannelsOut);
      }}
      onFocus={() => setHelp('zoomChannels', { max: maxZoomChannels })}
    />
  );

  const pstModeField = () => (
    <ControlledSelect
      name={`${path}.pstMode`}
      label={t('pstMode.label')}
      options={PST_MODES.map((mode) => ({
        label: t('pstMode.options.' + mode.value),
        value: mode.mapping
      }))}
      required
      onChange={() => updateProposal(replacePstDataProduct)}
      data-testid="pstMode"
      onFocus={() => setHelp('pstMode.help')}
    />
  );

  const subBandsField = () => (
    <ControlledNumberField
      name={`${path}.numberOfSubBands`}
      label={t('subBands.label')}
      disabled
      onFocus={() => setHelp('subBands')}
    />
  );

  // Every mode has a central frequency and a bandwidth, with the fields of its own. A spectral line
  // observation has all four of its fields in one row, with the zoom factor before the bandwidth it
  // sets, and room for the bandwidth's unit and velocity.
  const frequencyFields = () => (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { md: '1fr', lg: spectral ? '1fr 1fr 1.5fr 1fr' : '1fr 1fr' },
        columnGap: 6,
        rowGap: GAP,
        // At the top of their row, so an error under one field doesn't move the others down
        alignItems: 'start'
      }}
    >
      <Box sx={{ gridColumn: '1 / -1', p: 2 }}>{spectrumField()}</Box>
      {centralFrequencyField()}
      {spectral && zoomFactorField(spectral)}
      {bandwidthField()}
      {spectral && zoomChannelsField(spectral)}
      {observation.observingMode === OBSERVING_MODE.PST && pstModeField()}
      {!isSV &&
        !isLow &&
        (observation.observingMode === OBSERVING_MODE.CONTINUUM ||
          observation.observingMode === OBSERVING_MODE.CONTINUUM_SPECTRAL) &&
        subBandsField()}
    </Box>
  );

  const arrayFields = () =>
    isLow ? (
      <ControlledNumberField
        name={`${path}.numberOfStations`}
        label={t('numStations.label')}
        disabled={observation.subarray !== SA_CUSTOM}
        onFocus={() => setHelp('numStations')}
      />
    ) : (
      <Grid container direction="row" spacing={GAP}>
        <Grid size={{ xs: 6 }}>
          <ControlledNumberField
            name={`${path}.number15mAntennas`}
            label={t('numOf15mAntennas.label')}
            disabled={observation.subarray !== SA_CUSTOM}
            onFocus={() => setHelp('numOf15mAntennas')}
          />
        </Grid>
        <Grid size={{ xs: 6 }}>
          <ControlledNumberField
            name={`${path}.number13mAntennas`}
            label={t('numOf13mAntennas.label')}
            disabled={observation.subarray !== SA_CUSTOM}
            onFocus={() => setHelp('numOf13mAntennas')}
          />
        </Grid>
      </Grid>
    );

  const integrationTimeField = () => (
    <Grid container spacing={0.5} sx={{ pt: 1 }}>
      <Grid size={8}>
        <ControlledNumberField
          name={`${path}.integrationTime.value`}
          label={t('sensitivityCalculatorResults.integrationTime')}
          required
          onChange={refreshCalibratorsInPlace}
          onFocus={() => setHelp('suppliedValue')}
        />
      </Grid>
      <Grid size={4}>
        <ControlledSelect
          name={`${path}.integrationTime.unit`}
          options={INTEGRATION_TIME_UNITS}
          disabled={isLow}
          onChange={refreshCalibratorsInPlace}
          data-testid="suppliedUnits"
          onFocus={() => setHelp('suppliedUnits')}
        />
      </Grid>
    </Grid>
  );

  // The cycle's bands, with their frequency ranges from the OSD
  const bandOptions = (selectedPolicy?.cyclePolicies?.bands ?? []).flatMap((value) => {
    const telescope = telescopeOfBand(value as ObservingBand);
    const range = bandRange(osd, telescope, value as ObservingBand);
    if (!range) {
      return [];
    }
    const unit = telescope === TELESCOPE.LOW ? 'MHz' : 'GHz';
    const name =
      telescope === TELESCOPE.LOW ? TEL[TELESCOPE_LOW_NUM] : `${TEL[TELESCOPE_MID_NUM]} ${value}`;
    // The LOW edges are half a channel in from a whole MHz, so they are shown to the Hz
    const edge = (hz: number) => Number(convertFrequency(hz, 'Hz', unit).toFixed(6));
    return [
      {
        label: `${name} (${edge(range.minFrequencyHz)} - ${edge(range.maxFrequencyHz)} ${unit})`,
        value
      }
    ];
  });

  // The cycle's subarrays for the telescope, and a custom one where the cycle allows it
  const telescopeNumber = isLow ? TELESCOPE_LOW_NUM : TELESCOPE_MID_NUM;
  const subarrayOptions = (
    (isLow ? selectedPolicy?.cyclePolicies?.low : selectedPolicy?.cyclePolicies?.mid) ?? []
  )
    .map((key) => ({ label: key.toUpperCase(), value: key.toLowerCase() }))
    .filter((option) => option.value !== SA_CUSTOM || isCustomAllowed(telescopeNumber));

  const observingBandField = () => (
    <ControlledSelect
      name={`${path}.observingBand`}
      label={t('observingBand.label')}
      options={bandOptions}
      withFormUpdate={false}
      onChange={(event) => changeBand(event.target.value as ObservingBand)}
      disabled={bandOptions.length < 2}
      required
      data-testid="observingBand"
      onFocus={() => setHelp('observingBand.help')}
    />
  );

  const subarrayField = () => (
    <ControlledSelect
      name={`${path}.subarray`}
      label={t('subArrayConfiguration.label')}
      options={subarrayOptions}
      withFormUpdate={false}
      onChange={(event) => changeSubarray(event.target.value as Subarray)}
      disabled={subarrayOptions.length < 2}
      required
      data-testid="subArrayConfiguration"
      onFocus={() => setHelp('subArrayConfiguration.help')}
    />
  );

  const observingModeField = () => (
    <ControlledSelect
      name={`${path}.observingMode`}
      label={t('observationType.label')}
      options={modeOptions(observation.subarray)}
      withFormUpdate={false}
      onChange={(event) => changeMode(event.target.value as ObservingMode)}
      // SV proposals set their observing mode on the Details page
      disabled={isSV}
      required
      data-testid="observationType"
      onFocus={() => setHelp('observationType.help')}
    />
  );

  const groupField = () => (
    <ControlledSelect
      name={`${path}.groupId`}
      label={t('groupObservations.label')}
      options={[
        { label: t('groupObservations.none'), value: '' },
        ...[...new Set([...groupIds, ...(observation.groupId ? [observation.groupId] : [])])].map(
          (groupId) => ({ label: groupId, value: groupId })
        ),
        { label: t('groupObservations.new'), value: NEW_GROUP }
      ]}
      withFormUpdate={false}
      onChange={(event) => changeGroup(event.target.value)}
      data-testid="groupObservations"
      onFocus={() => setHelp('groupObservations')}
    />
  );

  const elevationField = () => (
    <ControlledNumberField
      name={isLow ? `${path}.minElevation` : `${path}.elevation`}
      label={t('elevation.label')}
      required
      onFocus={() => setHelp('elevation')}
    />
  );

  const weatherField = () => (
    <ControlledNumberField
      name={`${path}.weather`}
      label={t('weather.label')}
      required
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="end">{t('weather.units')}</InputAdornment>
        }
      }}
      onFocus={() => setHelp('weather')}
    />
  );

  return (
    <Grid
      container
      direction="row"
      spacing={1}
      sx={{ pl: 4, pr: 4, justifyContent: 'space-between' }}
    >
      <Grid size={{ md: 12, lg: 9 }}>
        <Grid
          container
          direction="row"
          spacing={2}
          sx={{ pb: 2, alignItems: 'stretch', justifyContent: 'flex-start' }}
        >
          <Grid size={{ md: 6 }}>
            <BorderedSection title={t('observationSections.arraySetUp')} sx={{ height: '100%' }}>
              <Stack spacing={GAP}>
                {observingBandField()}
                {subarrayField()}
                {!isSV && arrayFields()}
                {integrationTimeField()}
              </Stack>
            </BorderedSection>
          </Grid>
          <Grid size={{ md: 12, lg: 6 }}>
            <BorderedSection title={t('observationSections.identifiers')} sx={{ height: '100%' }}>
              <Stack>
                {!isSV && (
                  <TextEntry
                    disabled
                    label={t('observationId.label')}
                    testId="observationId"
                    value={observation.id}
                    setValue={() => {}}
                  />
                )}
                {observingModeField()}
                {!isSV && groupField()}
                {!isSV && elevationField()}
                {!isSV && !isLow && weatherField()}
              </Stack>
            </BorderedSection>
          </Grid>
        </Grid>
        <BorderedSection title={t('observationSections.frequencySetUp')}>
          {frequencyFields()}
        </BorderedSection>
      </Grid>
      {/* TODO: Fetch array layout from OSD instead of hardcoded image here */}
      {isLow && observation.subarray === SA_AA2 && (
        <Grid size={{ md: 12, lg: 3 }}>
          <img src={lowAA2Image} alt="Low AA2" width="100%" />
        </Grid>
      )}
    </Grid>
  );
}
