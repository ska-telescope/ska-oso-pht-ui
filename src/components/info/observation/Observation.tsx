import { Grid } from '@mui/material';
import { OBSERVING_MODE, type ObservationInput } from '@/models/proposals/observations';

interface ObservationProps {
  t: any;
  observation: ObservationInput;
}

// This is a placeholder component for Observation Info.
// Currently it is empty pending instruction from SciOps as to content that they wish to see here.
// It is already split by type of observation (Continuum, Spectral, PST) for future expansion.
// Recommend to look at the DataProduct component for an implementation as a guide

export default function ObservationInfo({ observation }: ObservationProps) {
  const isContinuum = () => observation.observingMode === OBSERVING_MODE.CONTINUUM;
  const isSpectral = () => observation.observingMode === OBSERVING_MODE.SPECTRAL;
  const isPST = () => observation.observingMode === OBSERVING_MODE.PST;

  return (
    <>
      {isContinuum() && (
        <Grid
          container
          data-testid="continuum-grid"
          direction="row"
          sx={{
            justifyContent: 'space-around',
            alignItems: 'center',
            minHeight: 100
          }}
        ></Grid>
      )}
      {isSpectral() && (
        <Grid
          container
          data-testid="spectral-grid"
          direction="row"
          sx={{
            justifyContent: 'space-around',
            alignItems: 'center',
            minHeight: 100
          }}
        ></Grid>
      )}
      {isPST() && (
        <Grid
          container
          data-testid="pst-grid"
          direction="row"
          sx={{
            justifyContent: 'space-around',
            alignItems: 'center',
            minHeight: 100
          }}
        ></Grid>
      )}
    </>
  );
}
