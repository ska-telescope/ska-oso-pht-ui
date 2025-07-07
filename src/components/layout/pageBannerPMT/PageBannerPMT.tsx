import { Box, Grid2, Typography } from '@mui/material';
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
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-end"
      pr={2}
    >
      <Grid2>{backBtn}</Grid2>
    </Grid2>
  );

  const buttonsRight = () => (
    <Grid2
      container
      spacing={1}
      direction="row"
      alignItems="center"
      justifyContent="flex-start"
      pr={2}
    >
      <Grid2>{fwdBtn}</Grid2>
    </Grid2>
  );

  // TODO : Remove the pt=(3) once the mock login tick-box has been removed, as it is upsetting the layout.
  const row1 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      <Grid2 size={{ xs: 3 }}>
        <Grid2 container direction="row" alignItems="center" justifyContent="flex-start">
          <Grid2>{buttonsLeft()}</Grid2>
        </Grid2>
      </Grid2>
      <Grid2>{pageTitle()}</Grid2>
      <Grid2 size={{ xs: 3 }}>
        <Grid2 container direction="row" alignItems="center" justifyContent="flex-end">
          <Grid2>{buttonsRight()}</Grid2>
        </Grid2>
      </Grid2>
    </Grid2>
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
