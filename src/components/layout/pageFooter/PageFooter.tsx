import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Grid, Paper } from '@mui/material';
import NextPageButton from '../../button/NextPage/NextPageButton';
import PreviousPageButton from '../../button/PreviousPage/PreviousPageButton';
import { NAV, PAGES } from '../../../utils/constants';

interface PageFooterProps {
  pageNo: number;
  buttonDisabled?: boolean;
  buttonFunc?: Function;
}

export default function PageFooter({
  pageNo,
  buttonDisabled = false,
  buttonFunc = null
}: PageFooterProps) {
  const navigate = useNavigate();

  const nextLabel = () => {
    if (pageNo === -2) {
      return 'Add';
    }
    if (pageNo === -1) {
      return 'Create';
    }
    return PAGES[pageNo + 1];
  };

  const prevLabel = () => PAGES[pageNo - 1];

  const prevPageNav = () => (pageNo > 0 ? navigate(NAV[pageNo - 1]) : '');

  const nextPageNav = () => (pageNo < NAV.length ? navigate(NAV[pageNo + 1]) : '');

  const nextPageClicked = () => {
    if (buttonFunc) {
      buttonFunc();
    }
    nextPageNav();
  };

  return (
    <Paper
      sx={{ bgcolor: 'transparent', position: 'fixed', bottom: 40, left: 0, right: 0 }}
      elevation={0}
    >
      <Grid
        p={1}
        container
        direction="row"
        alignItems="space-between"
        justifyContent="space-between"
      >
        <Grid item>
          {pageNo > 0 && (
            <PreviousPageButton label={prevLabel()} page={pageNo} func={prevPageNav} />
          )}
        </Grid>
        <Grid item />
        <Grid item>
          {pageNo < 7 && (
            <NextPageButton
              disabled={buttonDisabled}
              label={nextLabel()}
              page={pageNo}
              func={nextPageClicked}
            />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
