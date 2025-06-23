import { Box, Grid2, Typography } from '@mui/material';

interface PageBannerPMTProps {
  backBtn?: JSX.Element;
  title: string;
}

export default function PageBannerPMT({ backBtn, title }: PageBannerPMTProps) {
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
      justifyContent="flex-start"
      pl={2}
    >
      <Grid2>{backBtn}</Grid2>
    </Grid2>
  );

  const buttonsRight = () => <></>;

  const row1 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      <Grid2 size={{ xs: 3 }}>{buttonsLeft()}</Grid2>
      <Grid2>{pageTitle()}</Grid2>
      <Grid2 size={{ xs: 3 }}>{buttonsRight()}</Grid2>
    </Grid2>
  );

  return <Box p={2}>{row1()}</Box>;
}
