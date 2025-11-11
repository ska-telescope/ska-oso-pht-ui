import { Grid, Typography } from '@mui/material';
import { DataProductSDP } from '@/utils/types/dataProduct';
import { presentUnits } from '@/utils/present/present';
import { IW_BRIGGS } from '@/utils/constantsSensCalc';
import { getRobustMapping } from '@/utils/helpersSensCalc';

interface DataProductProps {
  t: any;
  data: DataProductSDP;
}

const displayElement = (t: any, label: string, content: string) => (
  <Grid container direction="row" justifyContent="space-around" alignItems="center">
    <Grid size={{ md: 6 }}>
      <Typography variant="subtitle1">{t(label)}</Typography>
    </Grid>
    <Grid size={{ md: 6 }}>
      <Typography variant="subtitle2">{content}</Typography>
    </Grid>
  </Grid>
);

const getODPString = (t: any, inArr: boolean[]) => {
  let str = '';
  for (let i = 0; i < inArr?.length; i++) {
    if (inArr[i]) {
      if (str?.length > 0) {
        str += ', ';
      }
      const res = i + 1;
      const tmp = t('observatoryDataProduct.options.' + res);
      str += tmp;
    }
  }
  return str;
};

export default function DataProduct({ t, data }: DataProductProps) {
  return (
    <Grid container direction="row" justifyContent="space-around" alignItems="center">
      <Grid size={{ md: 6 }}>
        {displayElement(
          t,
          'observatoryDataProduct.label',
          getODPString(t, data.observatoryDataProduct)
        )}
      </Grid>
      <Grid size={{ md: 6 }}>
        {displayElement(
          t,
          'imageSize.label',
          data.imageSizeValue + ' ' + presentUnits(t('imageSize.' + data.imageSizeUnits))
        )}
      </Grid>
      <Grid size={{ md: 6 }}>
        {displayElement(
          t,
          'pixelSize.label',
          data.pixelSizeValue + ' ' + presentUnits(t('pixelSize.' + data.pixelSizeUnits))
        )}
      </Grid>
      <Grid size={{ md: 6 }}>
        {displayElement(t, 'imageWeighting.label', t('imageWeighting.' + data.weighting))}
      </Grid>
      <Grid size={{ md: 6 }}>
        {displayElement(t, 'channelsOut.label', data?.channelsOut.toString())}
      </Grid>
      <Grid size={{ md: 6 }}>
        {data.weighting === IW_BRIGGS &&
          displayElement(t, 'robust.label', String(getRobustMapping(data.robust)))}
      </Grid>
      <Grid size={{ md: 6 }}>
        {displayElement(t, 'fitSpectralPol.label', data?.fitSpectralPol.toString())}
      </Grid>
      <Grid size={{ md: 6 }}>{displayElement(t, 'stokes.label', data?.polarisations)}</Grid>
    </Grid>
  );
}
