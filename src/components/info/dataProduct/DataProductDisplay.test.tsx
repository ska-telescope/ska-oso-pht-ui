import '@testing-library/jest-dom';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DATA_PRODUCT_KIND,
  DataProductInput,
  newDataProduct,
  STEPPED_FIELD,
  steppedFromPdm
} from '@/models/proposals/dataProducts';
import DataProductDisplay from './DataProductDisplay';

// The translation keys are shown as they are
const t = (key: string) => key;

const show = (dataProduct: DataProductInput) =>
  render(<DataProductDisplay t={t} dataProduct={dataProduct} />);

const value = (testId: string) => screen.getByTestId(testId);

describe('DataProductDisplay', () => {
  it('shows the fields of a continuum image', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'),
      imageSize: { value: 2.2, unit: 'deg' },
      pixelSize: { value: 1.3, unit: 'arcsec' },
      weighting: { type: 'briggs', robust: 0.5 },
      polarisations: ['I', 'XX']
    } as DataProductInput);

    expect(value('dataProductType')).toHaveTextContent('dataProductType.options.continuum.1');
    // The unit translations are keyed by the unit's position
    expect(value('imageSize')).toHaveTextContent('2.2 imageSize.0');
    expect(value('pixelSize')).toHaveTextContent('1.3 pixelSize.2');
    // The weighting translations are keyed by the legacy weighting codes
    expect(value('imageWeighting')).toHaveTextContent('imageWeighting.2');
    expect(value('robust')).toHaveTextContent('0.5');
    expect(value('polarisations')).toHaveTextContent('polarisations.I, polarisations.XX');
    expect(screen.queryByTestId('continuumSubtraction')).not.toBeInTheDocument();
  });

  it('leaves out the robust for a weighting other than briggs', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_IMAGE, 'obs-1'),
      weighting: { type: 'natural' }
    } as DataProductInput);

    expect(value('imageWeighting')).toHaveTextContent('imageWeighting.0');
    expect(screen.queryByTestId('robust')).not.toBeInTheDocument();
  });

  it('shows whether a spectral image has continuum subtraction, and no product type', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.SPECTRAL_IMAGE, 'obs-1'),
      continuumSubtraction: true
    } as DataProductInput);

    expect(value('continuumSubtraction')).toHaveTextContent('yes');
    expect(screen.queryByTestId('dataProductType')).not.toBeInTheDocument();
  });

  it('shows the averaging of continuum visibilities, rounded as on the page that edits them', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.CONTINUUM_VISIBILITIES, 'obs-1'),
      timeAveragingS: steppedFromPdm(4, STEPPED_FIELD.TIME_AVERAGING_S),
      frequencyAveragingKhz: steppedFromPdm(4, STEPPED_FIELD.FREQUENCY_AVERAGING_KHZ)
    } as DataProductInput);

    expect(value('dataProductType')).toHaveTextContent('dataProductType.options.continuum.2');
    expect(value('timeAveraging')).toHaveTextContent('3.397 timeAveraging.0');
    expect(value('frequencyAveraging')).toHaveTextContent('21.70 frequencyAveraging.0');
    expect(screen.queryByTestId('imageSize')).not.toBeInTheDocument();
  });

  it('shows the fields of a PST detected filterbank', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.PST_DETECTED_FILTERBANK, 'obs-1'),
      outputFrequencyResolutionKhz: steppedFromPdm(
        1,
        STEPPED_FIELD.OUTPUT_FREQUENCY_RESOLUTION_KHZ
      ),
      outputSamplingIntervalMs: steppedFromPdm(1, STEPPED_FIELD.OUTPUT_SAMPLING_INTERVAL_MS),
      bitDepth: 4,
      dispersionMeasure: 12,
      rotationMeasure: 7,
      polarisations: ['I']
    } as DataProductInput);

    expect(value('outputFrequencyResolution')).toHaveTextContent(
      '3.62 outputFrequencyResolution.units'
    );
    expect(value('outputSamplingInterval')).toHaveTextContent('0.207 outputSamplingInterval.units');
    expect(value('bitDepth')).toHaveTextContent('4');
    expect(value('dispersionMeasure')).toHaveTextContent('12 dispersionMeasure.units');
    expect(value('rotationMeasure')).toHaveTextContent('7 rotationMeasure.units');
    expect(value('polarisations')).toHaveTextContent('polarisations.I');
  });

  it('shows the bit depth and polarisations of a PST flow through', () => {
    show({
      ...newDataProduct(DATA_PRODUCT_KIND.PST_FLOW_THROUGH, 'obs-1'),
      bitDepth: 16,
      polarisations: ['X', 'Y']
    } as DataProductInput);

    expect(value('bitDepth')).toHaveTextContent('16');
    expect(value('polarisations')).toHaveTextContent('polarisations.X, polarisations.Y');
  });

  it('describes a PST timing data product, which has no fields', () => {
    show(newDataProduct(DATA_PRODUCT_KIND.PST_TIMING, 'obs-1'));

    expect(value('pulsarTimingValue')).toHaveTextContent('page.7.group.pstTiming');
  });
});
