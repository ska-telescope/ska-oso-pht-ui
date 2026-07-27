import { Box, Grid, Typography } from '@mui/material';
import { HEADER_HEIGHT } from '@/utils/constants';

interface PageBannerPMTProps {
  backBtn?: JSX.Element;
  fwdBtn?: JSX.Element;
  title: string;
}

export default function PageBannerPMT({ backBtn, fwdBtn, title }: PageBannerPMTProps) {
  const pageTitle = () => (
    <Typography data-testid="pageTitle" id="pageTitle" variant="h6" m={2}>
      {title?.toUpperCase()}
    </Typography>
  );

  const buttonsLeft = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      pr={2}
    >
      <Grid>{backBtn}</Grid>
    </Grid>
  );

  const buttonsRight = () => (
    <Grid
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pr={2}
    >
      <Grid>{fwdBtn}</Grid>
    </Grid>
  );

  const row1 = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between">
      <Grid size={{ xs: 3 }}>
        <Grid container direction="row" alignItems="center" justifyContent="flex-start">
          <Grid>{buttonsLeft()}</Grid>
        </Grid>
      </Grid>
      <Grid>{pageTitle()}</Grid>
      <Grid size={{ xs: 3 }}>
        <Grid container direction="row" alignItems="center" justifyContent="flex-end">
          <Grid>{buttonsRight()}</Grid>
        </Grid>
      </Grid>
    </Grid>
  );

  return (
    <Box
      pl={2}
      pr={2}
      sx={{
        backgroundColor: theme => theme.palette.background.paper,
        zIndex: theme => theme.zIndex.appBar + 1,
        position: 'fixed',
        top: HEADER_HEIGHT,
        left: 0,
        width: '100%'
      }}
    >
      {row1()}
    </Box>
  );
}
