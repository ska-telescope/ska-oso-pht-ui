import { Grid } from '@mui/material';
import { TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constantsSensCalc';
import { TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';

interface ObservationProps {
  t: any;
  observation: Observation;
}

// TODO : Fill in the observation details

export default function ObservationInfo({ observation }: ObservationProps) {
  const isContinuum = () => observation?.type === TYPE_CONTINUUM;
  const isSpectral = () => observation?.type === TYPE_ZOOM;
  const isPST = () => observation?.type === TYPE_PST;

  return (
    <>
      {isContinuum() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        ></Grid>
      )}
      {isSpectral() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        ></Grid>
      )}
      {isPST() && (
        <Grid
          container
          direction="row"
          justifyContent="space-around"
          alignItems="center"
          minHeight={100}
        ></Grid>
      )}
    </>
  );
}
