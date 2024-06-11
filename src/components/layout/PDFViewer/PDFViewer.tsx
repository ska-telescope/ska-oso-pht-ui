import React from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, Grid, Typography } from '@mui/material';
import { Document, Page } from 'react-pdf/dist/esm/entry.webpack';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';

import PreviousPageButton from '../../button/PreviousPage/PreviousPage';
import NextPageButton from '../../button/NextPage/NextPage';

interface PDFViewerProps {
  open: boolean;
  onClose: Function;
  url: string;
}

export default function PDFViewer({ open = false, onClose, url }: PDFViewerProps) {
  const { t } = useTranslation('pht');
  const [numPages, setNumPages] = React.useState(null);
  const [pageNumber, setPageNumber] = React.useState(1);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
  };

  const goToPrevPage = () => setPageNumber(pageNumber - 1 <= 1 ? 1 : pageNumber - 1);

  const goToNextPage = () => setPageNumber(pageNumber + 1 >= numPages ? numPages : pageNumber + 1);

  const displayPages = () => (
    <Typography p={2} variant="body1">
      {numPages > 1 ? t('page.pageOf', { current: pageNumber, max: numPages }) : ''}
    </Typography>
  );

  const handleClose = () => {
    onClose();
  };

  const displayNavigation = () => (
    <Grid container direction="row" alignItems="center" justifyContent="space-between" spacing={1}>
      <Grid item>
        {numPages > 1 && (
          <PreviousPageButton
            disabled={pageNumber === 1}
            label={t('page.previous')}
            action={goToPrevPage}
          />
        )}
      </Grid>
      <Grid item>
        {numPages > 1 && (
          <NextPageButton
            disabled={pageNumber === numPages}
            label={t('page.next')}
            action={goToNextPage}
          />
        )}
      </Grid>
    </Grid>
  );

  return (
    <Dialog
      fullWidth
      maxWidth="md"
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
      id="alert-dialog-proposal-change"
    >
      <Grid
        spacing={1}
        pl={1}
        pr={1}
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>{displayNavigation()}</Grid>
        <Grid item>{displayPages()}</Grid>
      </Grid>

      <Grid container direction="row" justifyContent="center" alignItems="center">
        <Grid item>
          {url?.length > 0 && (
            <Document file={url} onLoadSuccess={onDocumentLoadSuccess}>
              <Page pageNumber={pageNumber} />
            </Document>
          )}
        </Grid>
      </Grid>
    </Dialog>
  );
}
