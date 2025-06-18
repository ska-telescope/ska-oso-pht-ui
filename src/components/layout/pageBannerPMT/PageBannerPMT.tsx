import { Box, Grid2, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import OverviewButton from '@/components/button/Overview/Overview';
import { PATH } from '@/utils/constants';

interface PageBannerPMTProps {
  hideOverviewButton?: boolean;
  title: string;
}

export default function PageBannerPMT({ hideOverviewButton = false, title }: PageBannerPMTProps) {
  const navigate = useNavigate();

  const pageTitle = () => (
    <Typography id="pageTitle" variant="h6" m={2}>
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
      <Grid2>
        {!hideOverviewButton && (
          <OverviewButton
            action={() => navigate(PATH[1])}
            testId="overviewButton"
            title={'overview.label'}
            toolTip="overview.toolTip"
          />
        )}
      </Grid2>
    </Grid2>
  );

  const buttonsRight = () => <></>;

  const row1 = () => (
    <Grid2 container direction="row" alignItems="center" justifyContent="space-between">
      <Grid2>{buttonsLeft()}</Grid2>
      <Grid2>{pageTitle()}</Grid2>
      <Grid2>{buttonsRight()}</Grid2>
    </Grid2>
  );

  return <Box p={2}>{row1()}</Box>;
}
