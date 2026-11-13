import { Grid, Typography } from '@mui/material';
import { ImageWeighting } from '@/generated/models';
import {
  ANGLE_UNITS,
  DATA_PRODUCT_KIND,
  DataProductInput,
  STEPPED_FIELD
} from '@/models/proposals/dataProducts';
import { DP_TYPE_IMAGES, DP_TYPE_VISIBLE, IMAGE_WEIGHTING } from '@/utils/constants';
import FieldWrapper from '@/components/wrappers/fieldWrapper/FieldWrapper';

const LABEL_WIDTH = 5;

interface DataProductDisplayProps {
  t: (key: string) => string; // useScopedTranslation
  dataProduct: DataProductInput;
}

export default function DataProductDisplay({ t, dataProduct: dp }: DataProductDisplayProps) {
  // A label with its value, in one of two columns
  const field = (label: string, value: string, testId: string) => (
    <Grid size={{ xs: 12, md: 6 }}>
      <FieldWrapper label={label} labelWidth={LABEL_WIDTH}>
        <Typography variant="body1" data-testid={testId}>
          {value}
        </Typography>
      </FieldWrapper>
    </Grid>
  );

  const withUnit = (value: number | null, unit: string) =>
    value == null ? '' : `${value} ${unit}`;

  // The unit translations are keyed by the unit's position, as in the unit dropdowns
  const angle = (
    fieldName: 'imageSize' | 'pixelSize',
    size: { value: number; unit: (typeof ANGLE_UNITS)[number] | null }
  ) =>
    withUnit(
      size.value,
      size.unit == null ? '' : t(`${fieldName}.${ANGLE_UNITS.indexOf(size.unit)}`)
    );

  // A value the backend stores as a number of steps, shown rounded as the page that edits it does
  const stepped = (value: number, decimalPlaces: number, unit: string) =>
    `${value.toFixed(decimalPlaces)} ${unit}`;

  const polarisations = (values: string[]) =>
    field(
      t('polarisations.label'),
      values.map((value) => t('polarisations.' + value)).join(', '),
      'polarisations'
    );

  const fields = () => {
    switch (dp.kind) {
      case DATA_PRODUCT_KIND.CONTINUUM_IMAGE:
      case DATA_PRODUCT_KIND.SPECTRAL_IMAGE:
      case DATA_PRODUCT_KIND.CONTINUUM_SPECTRAL_IMAGE: {
        // The weighting translations are keyed by the legacy weighting codes
        const weighting = IMAGE_WEIGHTING.find((item) => item.label === dp.weighting.type)?.value;
        return (
          <>
            {dp.kind === DATA_PRODUCT_KIND.CONTINUUM_IMAGE &&
              field(
                t('dataProductType.label'),
                t('dataProductType.options.continuum.' + DP_TYPE_IMAGES),
                'dataProductType'
              )}
            {field(t('imageSize.label'), angle('imageSize', dp.imageSize), 'imageSize')}
            {field(t('pixelSize.label'), angle('pixelSize', dp.pixelSize), 'pixelSize')}
            {field(t('imageWeighting.label'), t('imageWeighting.' + weighting), 'imageWeighting')}
            {dp.weighting.type === ImageWeighting.Briggs &&
              field(t('robust.label'), String(dp.weighting.robust ?? ''), 'robust')}
            {field(t('taper.label'), withUnit(dp.taper, t('taper.units')), 'taper')}
            {field(t('channelsOut.label'), String(dp.channelsOut), 'channelsOut')}
            {dp.kind === DATA_PRODUCT_KIND.SPECTRAL_IMAGE &&
              field(
                t('continuumSubtraction.label'),
                t(dp.continuumSubtraction ? 'yes' : 'no'),
                'continuumSubtraction'
              )}
            {polarisations(dp.polarisations)}
          </>
        );
      }
      case DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES:
        return (
          <>
            {field(
              t('dataProductType.label'),
              t('dataProductType.options.continuum.' + DP_TYPE_VISIBLE),
              'dataProductType'
            )}
            {field(
              t('timeAveraging.label'),
              stepped(
                dp.timeAveragingS,
                STEPPED_FIELD.TIME_AVERAGING_S.decimalPlaces,
                t('timeAveraging.0')
              ),
              'timeAveraging'
            )}
            {field(
              t('frequencyAveraging.label'),
              stepped(
                dp.frequencyAveragingKhz,
                STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ.decimalPlaces,
                t('frequencyAveraging.0')
              ),
              'frequencyAveraging'
            )}
          </>
        );
      case DATA_PRODUCT_KIND.PST_FLOW_THROUGH:
        return (
          <>
            {field(t('bitDepth.label'), String(dp.bitDepth), 'bitDepth')}
            {polarisations(dp.polarisations)}
          </>
        );
      case DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK:
        return (
          <>
            {field(
              t('outputFrequencyResolution.label'),
              stepped(
                dp.outputFrequencyResolutionKhz,
                STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ.decimalPlaces,
                t('outputFrequencyResolution.units')
              ),
              'outputFrequencyResolution'
            )}
            {field(
              t('outputSamplingInterval.label'),
              stepped(
                dp.outputSamplingIntervalMs,
                STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS.decimalPlaces,
                t('outputSamplingInterval.units')
              ),
              'outputSamplingInterval'
            )}
            {field(t('bitDepth.label'), String(dp.bitDepth), 'bitDepth')}
            {field(
              t('dispersionMeasure.label'),
              withUnit(dp.dispersionMeasure, t('dispersionMeasure.units')),
              'dispersionMeasure'
            )}
            {field(
              t('rotationMeasure.label'),
              withUnit(dp.rotationMeasure, t('rotationMeasure.units')),
              'rotationMeasure'
            )}
            {polarisations(dp.polarisations)}
          </>
        );
      case DATA_PRODUCT_KIND.PST_TIMING:
        return (
          <Grid size={12}>
            <Typography data-testid="pulsarTimingValue">{t('page.7.group.pstTiming')}</Typography>
          </Grid>
        );
    }
  };

  return (
    <Grid container spacing={1} sx={{ p: 2 }}>
      {fields()}
    </Grid>
  );
}
