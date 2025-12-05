import { Box, Grid } from '@mui/material';
import { DataProductSDP } from '@/utils/types/dataProduct';
import { IW_BRIGGS, TYPE_CONTINUUM, TYPE_ZOOM, WRAPPER_HEIGHT } from '@/utils/constantsSensCalc';
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

const LABEL_WIDTH = 3;

interface DataProductProps {
  t: any;
  data: DataProductSDP;
  observation: Observation;
}

export default function DataProduct({ t, data, observation }: DataProductProps) {
  const isDetectedFilterbank = () => observation.pstMode === DETECTED_FILTER_BANK_VALUE;
  const isContinuum = () => observation?.type === TYPE_CONTINUUM;
  const isSpectral = () => observation?.type === TYPE_ZOOM;
  const isPST = () => observation?.type === TYPE_PST;
  const isDataTypeOne = () => data.dataProductType === 1;

  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const imageSizeField = () =>
    fieldWrapper(<ImageSizeField labelWidth={LABEL_WIDTH} value={data.imageSizeValue} disabled />);

  const robustField = () =>
    fieldWrapper(
      <RobustField
        label={t('robust.label')}
        labelWidth={LABEL_WIDTH}
        value={data.robust}
        disabled
      />
    );

  const pixelSizeField = () =>
    fieldWrapper(<PixelSizeField labelWidth={LABEL_WIDTH} value={data.pixelSizeValue} disabled />);

  const dataProductTypeField = () =>
    fieldWrapper(
      <DataProductTypeField labelWidth={LABEL_WIDTH} value={data.dataProductType} disabled />
    );

  const imageWeightingField = () =>
    fieldWrapper(<ImageWeightingField labelWidth={LABEL_WIDTH} value={data.weighting} disabled />);

  const channelsOutField = () =>
    fieldWrapper(<ChannelsOutField labelWidth={LABEL_WIDTH} value={data.channelsOut} disabled />);

  const taperField = () =>
    fieldWrapper(<TaperField labelWidth={LABEL_WIDTH} value={data.taperValue} disabled />);

  const polarisationField = () =>
    fieldWrapper(
      <PolarisationsField
        labelWidth={LABEL_WIDTH}
        value={data.polarisations}
        disabled
        displayOnly
      />
    );

  const applySubtractionField = () =>
    fieldWrapper(
      <ContinuumSubtractionField value={data.continuumSubtraction} disabled displayOnly />
    );

  const bitDepthField = () => fieldWrapper(<BitDepthField value={data.bitDepth} disabled />);

  const timeAveragingField = () =>
    fieldWrapper(
      <TimeAveragingField labelWidth={LABEL_WIDTH} value={data.timeAveraging} disabled />
    );

  const frequencyAveragingField = () =>
    fieldWrapper(
      <FrequencyAveragingField labelWidth={LABEL_WIDTH} value={data.frequencyAveraging} disabled />
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
            <Grid size={{ md: 5 }}>{data.weighting === IW_BRIGGS && robustField()}</Grid>
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
          <Grid size={{ md: 5 }}>{data.weighting === IW_BRIGGS && robustField()}</Grid>
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
