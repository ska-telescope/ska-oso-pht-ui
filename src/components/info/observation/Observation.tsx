import { Grid } from '@mui/material';
import { TYPE_CONTINUUM, TYPE_ZOOM } from '@/utils/constantsSensCalc';
import { TYPE_PST } from '@/utils/constants';
import Observation from '@/utils/types/observation';

interface ObservationProps {
  t: any;
  observation: Observation;
}

// This is a placeholder component for Observation Info.
// Currently it is empty pending instruction from SciOps as to content that they wish to see here.
// It is already split by type of observation (Continuum, Spectral, PST) for future expansion.
// Recommend to look at the DataProduct component for an implementation as a guide

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
