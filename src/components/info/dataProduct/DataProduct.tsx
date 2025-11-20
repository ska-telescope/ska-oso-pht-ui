import { Box, FormControlLabel, Grid, Radio, RadioGroup, Typography } from '@mui/material';
import { DataProductSDP } from '@/utils/types/dataProduct';
import { presentUnits } from '@/utils/present/present';
import { IW_BRIGGS, WRAPPER_HEIGHT } from '@/utils/constantsSensCalc';
import ImageWeightingField from '@/components/fields/imageWeighting/imageWeighting';
import ImageSizeField from '@/components/fields/imageSize/imageSize';
import PolarisationsField from '@/components/fields/polarisations/polarisations';
import ChannelsOutField from '@/components/fields/channelsOut/channelsOut';
import PixelSizeField from '@/components/fields/pixelSize/pixelSize';
import RobustField from '@/components/fields/robust/Robust';

const LABEL_WIDTH = 6;

interface DataProductProps {
  t: any;
  data: DataProductSDP;
}

const displayRadio = (
  t: any,
  label: string,
  content: string,
  options: string[],
  prefix: string
) => (
  <Grid container direction="row" justifyContent="space-around" alignItems="center">
    <Grid size={{ md: 6 }}>
      <Typography variant="subtitle1" color="text.disabled">
        {t(label)}
      </Typography>
    </Grid>
    <Grid size={{ md: 6 }}>
      <RadioGroup row value={content}>
        {options.map(option => (
          <FormControlLabel
            key={option}
            value={option}
            control={<Radio disabled />}
            label={t(prefix + option)}
          />
        ))}
      </RadioGroup>
    </Grid>
  </Grid>
);

const getODPString = (inArr: boolean[]) => {
  let str = '';
  for (let i = 0; i < inArr?.length; i++) {
    if (inArr[i]) {
      if (str?.length > 0) {
        str += ', ';
      }
      const res = i + 1;
      // const tmp = t('observatoryDataProduct.options.' + res);
      str += res;
    }
  }
  return str;
};

export default function DataProduct({ t, data }: DataProductProps) {
  const fieldWrapper = (children?: React.JSX.Element, height = WRAPPER_HEIGHT) => (
    <Box p={0} pt={1} sx={{ height: height }}>
      {children}
    </Box>
  );

  const imageSizeField = () =>
    fieldWrapper(<ImageSizeField labelWidth={LABEL_WIDTH} value={data.imageSizeValue} disabled />);

  const pixelSizeUnitsField = () => {
    return (
      <Typography variant="subtitle1" color="text.disabled">
        {data.pixelSizeUnits === 0 ? '' : presentUnits(t('pixelSize.' + data.pixelSizeUnits))}
      </Typography>
    );
  };

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
    fieldWrapper(
      <PixelSizeField
        disabled
        labelWidth={LABEL_WIDTH}
        value={data.pixelSizeValue}
        suffix={pixelSizeUnitsField()}
      />
    );

  const imageWeightingField = () =>
    fieldWrapper(<ImageWeightingField labelWidth={LABEL_WIDTH} value={data.weighting} disabled />);

  const channelsOutField = () =>
    fieldWrapper(<ChannelsOutField labelWidth={LABEL_WIDTH} value={data.channelsOut} disabled />);

  const polarisationField = () =>
    fieldWrapper(
      <PolarisationsField labelWidth={LABEL_WIDTH} value={data.polarisations} disabled />
    );

  return (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid size={{ md: 6 }}>
        {displayRadio(
          t,
          'dataProductType.label',
          getODPString(data.observatoryDataProduct),
          ['1', '2'],
          'observatoryDataProduct.options.'
        )}
      </Grid>
      <Grid size={{ md: 6 }}>{imageSizeField()}</Grid>
      <Grid size={{ md: 6 }}>{pixelSizeField()}</Grid>
      <Grid size={{ md: 6 }}>{imageWeightingField()}</Grid>
      <Grid size={{ md: 6 }}>{channelsOutField()}</Grid>
      <Grid size={{ md: 6 }}>{data.weighting === IW_BRIGGS && robustField()}</Grid>
      <Grid size={{ md: 6 }}></Grid>
      <Grid size={{ md: 12 }}>{polarisationField()}</Grid>
    </Grid>
  );
}
