import React from 'react';
import { Grid, Paper } from '@mui/material';
import NextPageButton from '../../button/NextPage/NextPageButton';
import PreviousPageButton from '../../button/PreviousPage/PreviousPageButton';
import { PAGES } from '../../../utils/constants';

interface PageFooterProps {
  pageNo: number;
  buttonFunc?: Function;
}

export default function PageFooter({ pageNo, buttonFunc = null }: PageFooterProps) {
  const nextLabel = () => (pageNo === -1 ? 'Create' : PAGES[pageNo + 1].title);

  const prevLabel = () => PAGES[pageNo - 1].title;

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
          {pageNo > 0 && <PreviousPageButton label={prevLabel()} page={pageNo} func={buttonFunc} />}
        </Grid>
        <Grid item />
        <Grid item>
          {pageNo < PAGES.length - 1 && (
            <NextPageButton label={nextLabel()} page={pageNo} func={buttonFunc} />
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
