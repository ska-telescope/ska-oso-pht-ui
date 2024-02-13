import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Grid, Paper } from '@mui/material';
import NextPageButton from '../../button/NextPage/NextPageButton';
import PreviousPageButton from '../../button/PreviousPage/PreviousPageButton';
import { LAST_PAGE, NAV } from '../../../utils/constants';
import { env } from '../../../env';

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
  const { t } = useTranslation('pht');
  const navigate = useNavigate();

  const nextLabel = () => {
    if (pageNo === -2) {
      return 'Add';
    }
    if (pageNo === -1) {
      return 'Create';
    }
    return t(`page.${pageNo + 1}.title`);
  };

  const prevLabel = () => t(`page.${pageNo - 1}.title`);

  const prevPageNav = () =>
    pageNo > 0 ? navigate(env.REACT_APP_SKA_PHT_BASE_URL + NAV[pageNo - 1]) : '';

  const nextPageNav = () =>
    pageNo < NAV.length ? navigate(env.REACT_APP_SKA_PHT_BASE_URL + NAV[pageNo + 1]) : '';

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
          {pageNo < LAST_PAGE - 1 && (
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
