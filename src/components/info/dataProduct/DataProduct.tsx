import { Box, Grid, Typography } from '@mui/material';
import {
  DP_TYPE_IMAGES,
  DP_TYPE_VISIBLE,
  FLOW_THROUGH_VALUE,
  IW_BRIGGS,
  PULSAR_TIMING_VALUE,
  TYPE_CONTINUUM,
  TYPE_ZOOM,
  WRAPPER_HEIGHT
} from '@/utils/constants';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import ImageSizeField from '@/components/fields/imageSize/imageSize';
import PolarisationsField from '@/components/fields/polarisations/polarisations';
import ChannelsOutField from '@/components/fields/channelsOut/channelsOut';
import PixelSizeField from '@/components/fields/pixelSize/pixelSize';
import RobustField from '@/components/fields/robust/Robust';
import DataProductTypeField from '@/components/fields/dataProductType/dataProductType';
import TaperField from '@/components/fields/taper/taper';
import { DETECTED_FILTER_BANK_VALUE, TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';
import TimeAveragingField from '@/components/fields/timeAveraging/timeAveraging';
import FrequencyAveragingField from '@/components/fields/frequencyAveraging/frequencyAveraging';
import ContinuumSubtractionField from '@/components/fields/continuumSubtraction/continuumSubtraction';
import BitDepthField from '@/components/fields/bitDepth/bitDepth';
import {
  DataProductSDPNew,
  SDPFilterbankPSTData,
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '@/utils/types/dataProduct';
import OutputFrequencyResolutionField from '@/components/fields/outputFrequencyResolution/outputFrequencyResolution';
import OutputSamplingIntervalField from '@/components/fields/outputSamplingInterval/outputSamplingInterval';
import DispersionMeasureField from '@/components/fields/dispersionMeasure/dispersionMeasure';
import RotationMeasureField from '@/components/fields/rotationMeasure/rotationMeasure';

const LABEL_WIDTH = 3;
const GAP = 2;

interface DataProductProps {
  t: any; // useScopedTranslation
  sdp: DataProductSDPNew;
  observation: Observation;
}

export default function DataProduct({ t, sdp, observation }: DataProductProps) {
  const isDetectedFilterbank = () => observation.pstMode === DETECTED_FILTER_BANK_VALUE;
  const isPulsarTimingValue = () => observation.pstMode === PULSAR_TIMING_VALUE;
  const isFlowThroughValue = () => observation.pstMode === FLOW_THROUGH_VALUE;
  const isContinuum = () => observation?.type === TYPE_CONTINUUM;
  const isSpectral = () => observation?.type === TYPE_ZOOM;
  const isPST = () => observation?.type === TYPE_PST;
  const isImages = () => (sdp?.data as any)?.dataProductType === DP_TYPE_IMAGES;
  const isVisibilities = () => (sdp?.data as any)?.dataProductType === DP_TYPE_VISIBLE;
  const sdpData = sdp?.data;

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const imageSizeField = () =>
    fieldWrapper(
      <ImageSizeField
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.imageSizeValue}
        disabled
      />
    );
  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.robust}
        disabled
      />
    );

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.pixelSizeValue}
        disabled
      />
    );

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField
        value={(sdpData as SDPImageContinuumData | SDPFlowthroughPSTData)?.dataProductType}
        disabled
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.weighting}
        disabled
      />
    );
  const channelsOutField = () =>
    fieldWrapper(
      <ChannelsOutField
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.channelsOut}
        disabled
      />
    );

  const taperField = () =>
    fieldWrapper(
      <TaperField
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.taperValue}
        disabled={true}
      />
    );

  const polarisationField = () =>
    fieldWrapper(
      <PolarisationsField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData)?.polarisations}
        disabled
        displayOnly
      />
    );

  const polarisationFieldPST = () =>
    fieldWrapper(
      <PolarisationsField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPFlowthroughPSTData)?.polarisations}
        disabled
        displayOnly
      />
    );

  const applySubtractionField = () =>
    fieldWrapper(
      <ContinuumSubtractionField
        value={(sdpData as SDPSpectralData)?.continuumSubtraction}
        disabled
        displayOnly
      />
    );

  const bitDepthField = () =>
    fieldWrapper(<BitDepthField value={(sdpData as SDPFlowthroughPSTData)?.bitDepth} disabled />);

  const pulsarTimingValueField = () =>
    fieldWrapper(<Typography p={GAP}>{t('page.7.group.pst.2')}</Typography>);

  const timeAveragingField = () =>
    fieldWrapper(
      <>
        <TimeAveragingField
          value={(sdpData as SDPVisibilitiesContinuumData)?.timeAveraging}
          disabled
        />
      </>
    );

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField
        value={(sdpData as SDPVisibilitiesContinuumData)?.frequencyAveraging}
        disabled
      />
    );

  const outputFrequencyResolutionField = () =>
    fieldWrapper(
      <OutputFrequencyResolutionField
        disabled
        value={(sdpData as SDPFilterbankPSTData)?.outputFrequencyResolution}
      />
    );

  const outputSamplingIntervalField = () =>
    fieldWrapper(
      <OutputSamplingIntervalField
        disabled
        value={(sdpData as SDPFilterbankPSTData)?.outputSamplingInterval}
      />
    );

  const bitDepthFieldFilterBank = () =>
    fieldWrapper(<BitDepthField value={(sdpData as SDPFilterbankPSTData)?.bitDepth} disabled />);

  const dispersionMeasureField = () =>
    fieldWrapper(
      <DispersionMeasureField
        disabled
        value={(sdpData as SDPFilterbankPSTData)?.dispersionMeasure}
      />
    );

  const rotationMeasureField = () =>
    fieldWrapper(
      <RotationMeasureField disabled value={(sdpData as SDPFilterbankPSTData)?.rotationMeasure} />
    );

  const polarisationFieldFilterBank = () =>
    fieldWrapper(
      <PolarisationsField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPFilterbankPSTData)?.polarisations}
        disabled
        displayOnly
      />
    );

  return (
    <>
      {isContinuum() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        >
          {isImages() && <Grid size={{ md: 5 }}>{dataProductTypeField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}></Grid>}
          {isImages() && <Grid size={{ md: 5 }}>{imageSizeField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}>{pixelSizeField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}>{imageWeightingField()}</Grid>}
          {isImages() && (
            <Grid size={{ md: 5 }}>
              {(sdpData as SDPImageContinuumData).weighting === IW_BRIGGS && robustField()}
            </Grid>
          )}
          {isImages() && <Grid size={{ md: 5 }}>{taperField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}>{channelsOutField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}>{polarisationField()}</Grid>}
          {isImages() && <Grid size={{ md: 5 }}></Grid>}

          {isVisibilities() && <Grid size={{ md: 5 }}>{timeAveragingField()}</Grid>}
          {isVisibilities() && <Grid size={{ md: 5 }}>{frequencyAveragingField()}</Grid>}
        </Grid>
      )}
      {isSpectral() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        >
          <Grid size={{ md: 5 }}>{imageSizeField()}</Grid>
          <Grid size={{ md: 5 }}>{pixelSizeField()}</Grid>
          <Grid size={{ md: 5 }}>{imageWeightingField()}</Grid>
          <Grid size={{ md: 5 }}>
            {(sdpData as SDPImageContinuumData).weighting === IW_BRIGGS && robustField()}
          </Grid>
          <Grid size={{ md: 5 }}>{taperField()}</Grid>
          <Grid size={{ md: 5 }}>{channelsOutField()}</Grid>
          <Grid size={{ md: 5 }}>{polarisationField()}</Grid>
          <Grid size={{ md: 5 }}>{applySubtractionField()}</Grid>
        </Grid>
      )}
      {isPST() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        >
          {isPulsarTimingValue() && <Grid size={{ md: 5 }}>{pulsarTimingValueField()}</Grid>}

          {isDetectedFilterbank() && (
            <Grid size={{ md: 5 }}>{outputFrequencyResolutionField()}</Grid>
          )}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{outputSamplingIntervalField()}</Grid>}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{bitDepthFieldFilterBank()}</Grid>}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{dispersionMeasureField()}</Grid>}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{rotationMeasureField()}</Grid>}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{polarisationFieldFilterBank()}</Grid>}

          {isFlowThroughValue() && <Grid size={{ md: 5 }}>{bitDepthField()}</Grid>}
          {isFlowThroughValue() && <Grid size={{ md: 5 }}>{polarisationFieldPST()}</Grid>}
        </Grid>
      )}
    </>
  );
}
