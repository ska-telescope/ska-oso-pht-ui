import React from 'react';
import { Grid, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import { useFormContext, useFormState, useWatch } from 'react-hook-form';
import { BorderedSection, Spacer, SPACER_VERTICAL } from '@ska-telescope/ska-gui-components';
import {
  ControlledCheckbox,
  ControlledCheckboxGroup,
  ControlledNumberField,
  ControlledSelect
} from '@ska-telescope/ska-gui-components/controlled';
import { Box } from '@mui/system';
import { useTheme } from '@mui/material/styles';
import TickIcon from '@components/icon/tickIcon/tickIcon.tsx';
import {
  ANGLE_UNIT,
  DATA_PRODUCT_KIND,
  DataProductInput,
  DataProductKind,
  isImageDataProduct,
  STEPPED_FIELD
} from '@/models/proposals/dataProducts';
import {
  BAND_LOW_STR,
  CHANNELS_OUT_MAX,
  CHANNELS_OUT_MAX_COMBINED,
  CHANNELS_OUT_MIN_CONTINUUM,
  CHANNELS_OUT_MIN_SPECTRAL,
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FREQUENCY_GHZ,
  IMAGE_WEIGHTING,
  PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES,
  PST_FLOW_THROUGH_BIT_DEPTH_VALUES,
  TYPE_CONTINUUM
} from '@/utils/constants';
import { useScopedTranslation } from '@/services/i18n/useScopedTranslation';
import Observation from '@/utils/types/observation';
import GridObservation from '@/components/grid/observation/GridObservation';
import { useOSDAccessors } from '@/utils/osd/useOSDAccessors/useOSDAccessors';
import { useHelp } from '@/utils/help/useHelp';
import { frequencyConversion } from '@/utils/helpers';

const GAP = 5;
// The space between the fields of a section, across and down
const FIELD_SPACING = 5;

// The form the view edits: the proposal form, or an entry form holding the one data product
export type DataProductsForm = { dataProducts: DataProductInput[] };

// TODO The data product type, weighting and unit translations are still keyed by the legacy codes

export const legacyWeighting = (weighting: string) =>
  IMAGE_WEIGHTING.find((item) => item.label === weighting)?.value;

// The unit translations are keyed by their position in this list
const ANGLE_UNITS = [ANGLE_UNIT.DEG, ANGLE_UNIT.ARCMIN, ANGLE_UNIT.ARCSEC];

// The polarisations a data product of each kind can have
const POLARISATION_OPTIONS: Partial<Record<DataProductKind, string[]>> = {
  [DATA_PRODUCT_KIND.CONTINUUM_IMAGE]: ['I', 'Q', 'U', 'V', 'XX', 'XY', 'YX', 'YY'],
  [DATA_PRODUCT_KIND.SPECTRAL_IMAGE]: ['I', 'Q', 'U', 'V', 'XX', 'XY', 'YX', 'YY'],
  [DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE]: ['I', 'Q', 'U', 'V', 'XX', 'XY', 'YX', 'YY'],
  [DATA_PRODUCT_KIND.PST_FLOW_THROUGH]: ['X', 'Y'],
  [DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK]: ['I', 'Q', 'U', 'V']
};

interface DataProductViewProps {
  index: number;
  observation: Observation;
  observations: Observation[];
  onSelectObservation?: (observation: Observation) => void;
  // Called with the kind the user switches a continuum data product to (images or visibilities)
  onContinuumKindChange: (kind: DataProductKind) => void;
  sensitivityPanel?: React.JSX.Element;
  footer?: React.JSX.Element;
}

/**
 * The fields of one data product, the one at `index` in the dataProducts of the form in context.
 * The form is the proposal form when the data product is edited in place (DataProductInPlace), or
 * an entry form of its own when it is added or updated (the DataProduct entry page).
 */
export default function DataProductView({
  index,
  observation,
  observations,
  onSelectObservation,
  onContinuumKindChange,
  sensitivityPanel,
  footer
}: DataProductViewProps) {
  const { t } = useScopedTranslation();
  const theme = useTheme();
  const { osdCyclePolicy } = useOSDAccessors();
  const { setHelp } = useHelp();
  const form = useFormContext<DataProductsForm>();
  const dp = useWatch({ control: form.control, name: `dataProducts.${index}` });
  const polarisationsName = `dataProducts.${index}.polarisations` as const;
  const formState = useFormState({ control: form.control, name: polarisationsName });
  const polarisationsError = form.getFieldState(polarisationsName, formState).error;

  React.useEffect(() => {
    setHelp('observations.dp');
  }, []);

  if (!dp) {
    return null;
  }

  const path = `dataProducts.${index}` as const;
  const isContinuumKind =
    dp.kind === DATA_PRODUCT_KIND.CONTINUUM_IMAGE ||
    dp.kind === DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES;
  const isPstKind =
    dp.kind === DATA_PRODUCT_KIND.PST_FLOW_THROUGH ||
    dp.kind === DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK ||
    dp.kind === DATA_PRODUCT_KIND.PST_TIMING;
  const isLow = observation.observingBand === BAND_LOW_STR;

  const unitAdornment = (unit: string) => ({
    input: { endAdornment: <InputAdornment position="end">{unit}</InputAdornment> }
  });

  // A value with its unit chosen from a list beside it, as the velocity on the target entry page
  const angleField = (field: 'imageSize' | 'pixelSize') => (
    <Grid container spacing={0.5}>
      <Grid size={8}>
        <ControlledNumberField
          name={`${path}.${field}.value`}
          label={t(field + '.label')}
          required
          onFocus={() => setHelp(field)}
        />
      </Grid>
      <Grid size={4}>
        <ControlledSelect
          name={`${path}.${field}.unit`}
          options={ANGLE_UNITS.map((unit, i) => ({ label: t(field + '.' + i), value: unit }))}
          onFocus={() => setHelp(field)}
        />
      </Grid>
    </Grid>
  );

  // The MID tapers, labelled with their size in arcseconds at the observation's central frequency
  const taperOptions = () => {
    const centralFrequencyGhz = frequencyConversion(
      observation.centralFrequency,
      observation.centralFrequencyUnits,
      FREQUENCY_GHZ
    );
    const sizes = centralFrequencyGhz
      ? [0.25, 1, 4, 16, 64, 256, 1024].map((taper) => ({
          label: (taper * (1.4 / centralFrequencyGhz)).toFixed(3) + '"',
          value: taper
        }))
      : [];
    return [{ label: t('tapering.0'), value: 0 }, ...sizes];
  };

  const imageFields = () => {
    if (!isImageDataProduct(dp)) {
      return null;
    }
    const isSpectral = dp.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE;
    const channelsOutMin =
      dp.kind === DATA_PRODUCT_KIND.CONTINUUM_IMAGE
        ? CHANNELS_OUT_MIN_CONTINUUM
        : CHANNELS_OUT_MIN_SPECTRAL;
    const channelsOutMax =
      dp.kind === DATA_PRODUCT_KIND.CONTINUUM_IMAGE ? CHANNELS_OUT_MAX : CHANNELS_OUT_MAX_COMBINED;
    const channelsOutHelp = () =>
      setHelp('channelsOut', { min: channelsOutMin, max: channelsOutMax });
    // Spectral mirrors the observation's zoom channels, so there is nothing to show without them
    const zoomChannels = observation.zoomChannels;
    return (
      <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
        <Grid size={6}>{angleField('imageSize')}</Grid>
        <Grid size={6}>{angleField('pixelSize')}</Grid>
        <Grid size={6}>
          <ControlledSelect
            name={`${path}.weighting`}
            label={t('imageWeighting.label')}
            options={IMAGE_WEIGHTING.map(({ label, value }) => ({
              label: t('imageWeighting.' + value),
              value: label
            }))}
            required
            onFocus={() => setHelp('imageWeighting')}
          />
        </Grid>
        <Grid size={6}>
          {dp.weighting === 'briggs' && (
            <ControlledNumberField
              name={`${path}.robust`}
              label={t('robust.label')}
              min={-2}
              max={2}
              onFocus={() => setHelp('robust')}
            />
          )}
        </Grid>
        <Grid size={6}>
          {isLow ? (
            <ControlledNumberField
              name={`${path}.taper`}
              label={t('taper.label')}
              disabled
              slotProps={unitAdornment(t('taper.units'))}
              onFocus={() => setHelp('taper')}
            />
          ) : (
            <ControlledSelect
              name={`${path}.taper`}
              label={t('taper.label')}
              options={taperOptions()}
              required
              onFocus={() => setHelp('taper')}
            />
          )}
        </Grid>
        <Grid size={6}>
          {isSpectral ? (
            zoomChannels !== undefined && (
              <TextField
                variant="standard"
                fullWidth
                disabled
                label={t('channelsOut.label')}
                value={zoomChannels}
                onFocus={channelsOutHelp}
              />
            )
          ) : (
            <ControlledNumberField
              name={`${path}.channelsOut`}
              label={t('channelsOut.label')}
              min={channelsOutMin}
              max={channelsOutMax}
              required
              onFocus={channelsOutHelp}
            />
          )}
        </Grid>
        {isSpectral && (
          <Grid size={6}>
            <ControlledCheckbox
              name={`${path}.continuumSubtraction`}
              label={t('continuumSubtraction.label')}
            />
          </Grid>
        )}
      </Grid>
    );
  };

  const visibilitiesFields = () =>
    dp.kind === DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES && (
      <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
        <Grid size={6}>
          <ControlledNumberField
            name={`${path}.timeAveragingS`}
            label={t('timeAveraging.label')}
            stepSize={STEPPED_FIELD.TIME_AVERAGING_S.step}
            decimalPlaces={STEPPED_FIELD.TIME_AVERAGING_S.decimalPlaces}
            showArrows
            min={STEPPED_FIELD.TIME_AVERAGING_S.minSteps * STEPPED_FIELD.TIME_AVERAGING_S.step}
            max={STEPPED_FIELD.TIME_AVERAGING_S.maxSteps * STEPPED_FIELD.TIME_AVERAGING_S.step}
            required
            slotProps={unitAdornment(t('timeAveraging.0'))}
            onFocus={() => setHelp('timeAveraging')}
          />
        </Grid>
        <Grid size={6}>
          <ControlledNumberField
            name={`${path}.frequencyAveragingKhz`}
            label={t('frequencyAveraging.label')}
            stepSize={STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.step}
            decimalPlaces={STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.decimalPlaces}
            showArrows
            min={
              STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.minSteps *
              STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.step
            }
            max={
              STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.maxSteps *
              STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.step
            }
            required
            slotProps={unitAdornment(t('frequencyAveraging.0'))}
            onFocus={() => setHelp('frequencyAveraging')}
          />
        </Grid>
      </Grid>
    );

  const bitDepthField = (values: number[]) => (
    <ControlledSelect
      name={`${path}.bitDepth`}
      label={t('bitDepth.label')}
      options={values.map((value) => ({ label: String(value), value }))}
      required
      onFocus={() => setHelp('bitDepth')}
    />
  );

  const pstFields = () => {
    switch (dp.kind) {
      case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
        return (
          <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
            <Grid size={6}>{bitDepthField(PST_FLOW_THROUGH_BIT_DEPTH_VALUES)}</Grid>
          </Grid>
        );
      case DATA_PRODUCT_KIND.PST_TIMING:
        return (
          <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
            <Grid size={6}>
              <TickIcon onClick={() => {}} />
              All set!
            </Grid>
          </Grid>
        );
      case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
        return (
          <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
            <Grid size={6}>
              <ControlledNumberField
                name={`${path}.outputFrequencyResolutionKhz`}
                label={t('outputFrequencyResolution.label')}
                stepSize={STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ.step}
                showArrows
                min={
                  STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ.minSteps *
                  STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ.step
                }
                required
                slotProps={unitAdornment(t('outputFrequencyResolution.units'))}
              />
            </Grid>
            <Grid size={6}>
              <ControlledNumberField
                name={`${path}.outputSamplingIntervalMs`}
                label={t('outputSamplingInterval.label')}
                stepSize={STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS.step}
                showArrows
                min={
                  STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS.minSteps *
                  STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS.step
                }
                required
                slotProps={unitAdornment(t('outputSamplingInterval.units'))}
              />
            </Grid>
            <Grid size={6}>{bitDepthField(PST_DEDICATED_FILTERBANK_BIT_DEPTH_VALUES)}</Grid>
            <Grid size={6}>
              <ControlledNumberField
                name={`${path}.dispersionMeasure`}
                label={t('dispersionMeasure.label')}
                required
                slotProps={unitAdornment(t('dispersionMeasure.units'))}
              />
            </Grid>
            <Grid size={6}>
              <ControlledNumberField
                name={`${path}.rotationMeasure`}
                label={t('rotationMeasure.label')}
                required
                slotProps={unitAdornment(t('rotationMeasure.units'))}
              />
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  const polarisationsField = () => {
    const options = POLARISATION_OPTIONS[dp.kind];
    return (
      options && (
        <BorderedSection
          borderColor={polarisationsError ? theme.palette.error.main : 'text.disabled'}
          title={t('polarisations.label')}
        >
          <ControlledCheckboxGroup
            name={polarisationsName}
            columns={4}
            options={options.map((value) => ({ label: t('polarisations.' + value), value }))}
            onFocus={() => setHelp('polarisations')}
          />
        </BorderedSection>
      )
    );
  };

  const maxObservationsReached = observations.length >= (osdCyclePolicy?.maxObservations ?? 0);

  return (
    <Box
      sx={{
        flexGrow: 1,
        width: '100%',
        overflow: 'auto',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}
    >
      <Grid
        container
        spacing={GAP}
        sx={{
          justifyContent: 'space-between',
          m: GAP,
          mt: 1,
          flexGrow: 1
        }}
      >
        <Grid size={{ md: 4, lg: 2 }} sx={{ display: 'flex', flexDirection: 'column' }}>
          <BorderedSection title={t('page.7.obsTitle')}>
            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                border: '1px solid',
                borderColor: '#ccc',
                borderRadius: '8px',
                minHeight: 0,
                maxHeight: 'calc(100vh - 260px)',
                overflowY: 'auto',
                overflowX: 'hidden'
              }}
            >
              <GridObservation
                data={observations}
                autoSelectId={observation.id}
                rowClick={(e: { row: Observation }) => onSelectObservation?.(e.row)}
                disabled={maxObservationsReached}
              />
            </Box>
          </BorderedSection>
        </Grid>
        <Grid size={{ md: 7, lg: 7 }}>
          <Stack spacing={GAP}>
            {observation.type === TYPE_CONTINUUM && (
              <Grid container spacing={FIELD_SPACING} sx={{ py: 1 }}>
                <Grid size={6}>
                  <ControlledSelect
                    name={`${path}.kind`}
                    label={t('dataProductType.label')}
                    options={[
                      {
                        label: t('dataProductType.options.continuum.' + DP_TYPE_IMAGES),
                        value: DATA_PRODUCT_KIND.CONTINUUM_IMAGE
                      },
                      {
                        label: t('dataProductType.options.continuum.' + DP_TYPE_VISIBLE),
                        value: DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES
                      }
                    ]}
                    withFormUpdate={false}
                    onChange={(event) =>
                      onContinuumKindChange(event.target.value as DataProductKind)
                    }
                    onFocus={() => setHelp('dataProductType')}
                  />
                </Grid>
              </Grid>
            )}

            {isContinuumKind && (
              <BorderedSection title={t('page.7.group.' + dp.kind)}>
                {imageFields()}
                {visibilitiesFields()}
              </BorderedSection>
            )}

            {(dp.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE ||
              dp.kind === DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE) && (
              <BorderedSection title={t('page.7.group.' + dp.kind)}>
                {imageFields()}
              </BorderedSection>
            )}

            {isPstKind && (
              <BorderedSection title={t('page.7.group.' + dp.kind)}>{pstFields()}</BorderedSection>
            )}

            {polarisationsField()}
          </Stack>
        </Grid>

        <Grid size={{ md: 11, lg: 3 }}>
          <BorderedSection borderColor={theme.palette.info.main} title={t('page.7.descTitle')}>
            <Typography variant="subtitle1" sx={{ whiteSpace: 'pre-line' }}>
              {t('page.7.descContent.' + dp.kind)}
            </Typography>
          </BorderedSection>
          {sensitivityPanel && <Spacer size={GAP * 2} axis={SPACER_VERTICAL} />}
          {sensitivityPanel}
        </Grid>
      </Grid>
      {footer}
    </Box>
  );
}
