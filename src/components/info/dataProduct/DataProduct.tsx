import { Box, Grid } from '@mui/material';
import { IW_BRIGGS, TYPE_CONTINUUM, TYPE_ZOOM, WRAPPER_HEIGHT } from '@/utils/constants';
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
  SDPFlowthroughPSTData,
  SDPImageContinuumData,
  SDPSpectralData,
  SDPVisibilitiesContinuumData
} from '@/utils/types/dataProduct';

const LABEL_WIDTH = 3;

interface DataProductProps {
  t: any; // useScopedTranslation
  sdp: DataProductSDPNew;
  observation: Observation;
}

export default function DataProduct({ t, sdp, observation }: DataProductProps) {
  const isDetectedFilterbank = () => observation.pstMode === DETECTED_FILTER_BANK_VALUE;
  const isContinuum = () => observation?.type === TYPE_CONTINUUM;
  const isSpectral = () => observation?.type === TYPE_ZOOM;
  const isPST = () => observation?.type === TYPE_PST;
  const isDataTypeOne = () => (sdp?.data as any)?.dataProductType === 1;

  const sdpData = sdp?.data;

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const imageSizeField = () =>
    fieldWrapper(
      <ImageSizeField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.imageSizeValue}
        disabled
      />
    );
  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.robust}
        disabled
      />
    );

  const pixelSizeField = () =>
    fieldWrapper(
      <PixelSizeField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.pixelSizeValue}
        disabled
      />
    );

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPFlowthroughPSTData)?.dataProductType}
        disabled
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(
      <ImageWeightingField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.weighting}
        disabled
      />
    );
  const channelsOutField = () =>
    fieldWrapper(
      <ChannelsOutField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.channelsOut}
        disabled
      />
    );

  const taperField = () =>
    fieldWrapper(
      <TaperField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPImageContinuumData | SDPSpectralData)?.taperValue}
        disabled
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

  const timeAveragingField = () =>
    fieldWrapper(
      <>        
        <TimeAveragingField
          labelWidth={LABEL_WIDTH}
          value={(sdpData as SDPVisibilitiesContinuumData)?.timeAveraging}
          disabled
        />
      </>
    );

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField
        labelWidth={LABEL_WIDTH}
        value={(sdpData as SDPVisibilitiesContinuumData)?.frequencyAveraging}
        disabled
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
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{dataProductTypeField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}></Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{imageSizeField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{pixelSizeField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{imageWeightingField()}</Grid>}
          {isDataTypeOne() && (
            <Grid size={{ md: 5 }}>
              {(sdpData as SDPImageContinuumData).weighting === IW_BRIGGS && robustField()}
            </Grid>
          )}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{taperField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{channelsOutField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}>{polarisationField()}</Grid>}
          {isDataTypeOne() && <Grid size={{ md: 5 }}></Grid>}

          {!isDataTypeOne() && <Grid size={{ md: 5 }}>{timeAveragingField()}</Grid>}
          {!isDataTypeOne() && <Grid size={{ md: 5 }}>{frequencyAveragingField()}</Grid>}
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
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{timeAveragingField()}</Grid>}
          {isDetectedFilterbank() && <Grid size={{ md: 5 }}>{frequencyAveragingField()}</Grid>}
          {!isDetectedFilterbank() && <Grid size={{ md: 5 }}>{bitDepthField()}</Grid>}
          {!isDetectedFilterbank() && <Grid size={{ md: 5 }}></Grid>}
          {<Grid size={{ md: 5 }}>{polarisationField()}</Grid>}
          {<Grid size={{ md: 5 }}></Grid>}
        </Grid>
      )}
    </>
  );
}
